import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"
import { getUserUploadsDirectory, safePathJoin } from "@/lib/files"
import { createFile } from "@/models/files"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ALLOWED_CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body.message

    // Ignore if there is no message or sender doesn't match the allowed admin
    if (!message || !message.chat) return new NextResponse("OK")
    if (ALLOWED_CHAT_ID && String(message.chat.id) !== ALLOWED_CHAT_ID) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // We only care about photos or documents (PDFs)
    let fileId: string | null = null
    let fileName = `telegram_upload_${new Date().getTime()}`
    let mimeType = "image/jpeg"

    if (message.photo && message.photo.length > 0) {
      // Get the highest resolution photo (the last one in the array)
      fileId = message.photo[message.photo.length - 1].file_id
      fileName += ".jpg"
    } else if (message.document) {
      fileId = message.document.file_id
      fileName = message.document.file_name || `${fileName}.pdf`
      mimeType = message.document.mime_type || "application/pdf"
    } else {
      // Text messages or other media are ignored
      return new NextResponse("OK")
    }

    if (!fileId) return new NextResponse("OK")
    if (!BOT_TOKEN) {
      console.warn("TELEGRAM_BOT_TOKEN is not set in .env")
      return new NextResponse("OK")
    }

    // 1. Fetch file path from Telegram API
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`)
    const fileData = await fileRes.json()
    if (!fileData.ok) {
      console.error("Failed to get file info from Telegram:", fileData)
      return new NextResponse("OK")
    }

    const tgFilePath = fileData.result.file_path
    
    // 2. Download the actual file bytes
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${tgFilePath}`)
    const buffer = await downloadRes.arrayBuffer()

    // 3. Find the primary user of the system
    const user = await prisma.user.findFirst()
    if (!user) return new NextResponse("No user in database", { status: 500 })

    // 4. Save to local Unsorted folder
    const userDir = getUserUploadsDirectory(user)
    const localRelativePath = `unsorted/${randomUUID()}_${fileName}`
    const fullPhysicalPath = safePathJoin(userDir, localRelativePath)

    // Ensure unsorted directory exists
    await fs.mkdir(path.dirname(fullPhysicalPath), { recursive: true })
    
    // Write buffer to disk
    await fs.writeFile(fullPhysicalPath, Buffer.from(buffer))

    // 5. Create database record
    await createFile(user.id, {
      id: randomUUID(),
      filename: fileName,
      mimetype: mimeType,
      path: localRelativePath,
    })

    // Send a success message back to the user on Telegram!
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: `✅ Fiş başarıyla Finans Asistanım'a eklendi!\nSıralanmamış faturalar (Unsorted) kutusuna düştü. Sisteme girip yapay zeka ile okutabilirsiniz. \n\n📄 Dosya: ${fileName}`,
        reply_to_message_id: message.message_id
      })
    })

    return new NextResponse("OK")
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
