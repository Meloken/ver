import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"
import { getUserUploadsDirectory, safePathJoin } from "@/lib/files"
import { createFile } from "@/models/files"

const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "taxhacker_secure_token"
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID

// WhatsApp Cloud API Verification endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode && token) {
    if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 })
    } else {
      return new NextResponse("Forbidden", { status: 403 })
    }
  }

  return new NextResponse("Bad Request", { status: 400 })
}

// WhatsApp Cloud API Message Endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.object !== "whatsapp_business_account") {
      return new NextResponse("Not Found", { status: 404 })
    }

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const messages = value?.messages

    if (!messages || messages.length === 0) {
      return new NextResponse("OK", { status: 200 })
    }

    const message = messages[0]
    const waId = message.from // User's phone number
    const messageId = message.id

    // Only process images and documents
    if (message.type !== "image" && message.type !== "document") {
      return new NextResponse("OK", { status: 200 })
    }

    const mediaId = message.type === "image" ? message.image.id : message.document.id
    const mimeType = message.type === "image" ? message.image.mime_type : message.document.mime_type
    const fileNameFallback = message.type === "image" ? `wa_upload_${Date.now()}.jpg` : `wa_upload_${Date.now()}.pdf`
    const fileName = message.document?.filename || fileNameFallback

    if (!WA_TOKEN || !WA_PHONE_ID) {
      console.warn("WhatsApp API Tokens missing in .env")
      return new NextResponse("OK", { status: 200 })
    }

    // 1. Authenticate the User using WhatsApp Number
    // Numbers sent by WhatsApp contain country code but no '+'
    const cleanNum = String(waId).replace(/\D/g, "")
    const user = await prisma.user.findFirst({
      where: { whatsappNumber: { endsWith: cleanNum } }
    })

    if (!user) {
      // Send fallback instruction via WhatsApp
      await sendWhatsAppMessage(waId, `❌ Sistem hatası. Bu WhatsApp numarası platformdaki hiçbir şirkete/kullanıcıya bağlı değil.\n\nLütfen platformdaki 'Ayarlar' sayfanıza girin ve WhatsApp Numaranızı sisteme kaydedin: +${waId}`)
      return new NextResponse("User not matched", { status: 200 })
    }

    // 2. Fetch Media URL from Meta
    const mediaUrlRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` }
    })
    const mediaData = await mediaUrlRes.json()
    if (!mediaData.url) {
      console.error("Failed to fetch WhatsApp media metadata", mediaData)
      return new NextResponse("OK", { status: 200 })
    }

    // 3. Download Media Bytes
    const downloadRes = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${WA_TOKEN}` }
    })
    const buffer = await downloadRes.arrayBuffer()

    // 4. Save to Disk
    const userDir = getUserUploadsDirectory(user)
    const localRelativePath = `unsorted/${randomUUID()}_${fileName}`
    const fullPhysicalPath = safePathJoin(userDir, localRelativePath)

    await fs.mkdir(path.dirname(fullPhysicalPath), { recursive: true })
    await fs.writeFile(fullPhysicalPath, Buffer.from(buffer))

    // 5. Create File in Database
    await createFile(user.id, {
      id: randomUUID(),
      filename: fileName,
      mimetype: mimeType || "application/octet-stream",
      path: localRelativePath,
    })

    // 6. Notify User of Success
    await sendWhatsAppMessage(waId, `✅ Fiş başarıyla Finans Asistanım'a eklendi!\nSıralanmamış faturalar (Unsorted) kutusuna düştü. Sisteme girip yapay zeka ile okutabilirsiniz.\n\n📄 Dosya: ${fileName}`)

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  if (!WA_TOKEN || !WA_PHONE_ID) return;
  
  await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      text: { body: text }
    })
  }).catch(e => console.error("Failed to send WA reply", e))
}
