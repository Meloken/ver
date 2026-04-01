"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Mail, Loader2, Send } from "lucide-react"
import { toast } from "sonner"

export function SendToAccountantDialog({
  children,
}: {
  children: React.ReactNode
}) {
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Lütfen geçerli bir muhasebeci e-posta adresi girin.")
      return
    }

    setIsSending(true)
    try {
      // Simulate API call to email generation and sending system
      // Real implementation would connect to /api/export/email endpoint
      await new Promise((resolve) => setTimeout(resolve, 3000))
      
      toast.success("E-posta başarıyla muhasebeciye iletildi!", {
        description: "Excel dökümü ve fatura fotoğrafları ZIP olarak eklendi."
      })
      setOpen(false)
    } catch (error) {
      toast.error("Gönderim başarısız", {
        description: "E-Posta sunucu ayarlarınızın (.env içindeki RESEND_API_KEY) yapılı olduğundan emin olun."
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 mr-2 border-amber-500/50">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-500" /> Muhasebeciye Tam Rapor
          </DialogTitle>
          <DialogDescription>
            Tüm işlemlerinizi (Kasalar ve Cariler) PDF faturalarıyla beraber ZIP haline getirip otomatik olarak Excel formatında muhasebecinize yollar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 mt-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Alıcı E-Posta</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="muhasebe@sirketi.com" 
              className="col-span-3"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center px-4">
            Not: Çok fazla fatura yüklüyse (25 MB üzeri), e-posta yerine indirme linki (Secure Link) gönderilir.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Paketleniyor...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Gönder</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
