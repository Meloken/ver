"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState, useEffect } from "react"
import { createWalletAction, updateWalletAction } from "@/app/(app)/wallets/actions"
import { Wallet } from "@/prisma/client"
import { FormError } from "@/components/forms/error"
import slugify from "slugify"

interface WalletFormProps {
  wallet?: Wallet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletForm({ wallet, open, onOpenChange }: WalletFormProps) {
  const isEditing = !!wallet
  const action = isEditing ? updateWalletAction : createWalletAction
  const [state, formAction, pending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Kasayı Düzenle" : "Yeni Kasa / Cüzdan"}</DialogTitle>
            <DialogDescription>
              Fiziksel nakit, banka hesapları veya şirket kredi kartlarınızı tanımlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={wallet.id} />}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Adı</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={wallet?.name || ""} 
                placeholder="Örn: Ziraat Şirket" 
                className="col-span-3"
                onChange={(e) => {
                  const codeInput = document.getElementById("code") as HTMLInputElement
                  if (!isEditing && codeInput && e.target.value) {
                    codeInput.value = slugify(e.target.value, { lower: true, strict: true })
                  }
                }}
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">Sistem Kodu</Label>
              <Input id="code" name="code" defaultValue={wallet?.code || ""} placeholder="ziraat-sirket" className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">Birim</Label>
              <Input id="currency" name="currency" defaultValue={wallet?.currency || "TRY"} className="col-span-3 text-uppercase" placeholder="TRY, USD, EUR" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Açılış Bakiyesi</Label>
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue={wallet ? (wallet.balance / 100).toString() : "0"} className="col-span-3" required />
            </div>
          </div>
          {state?.error && <FormError>{state.error}</FormError>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor..." : "Kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
