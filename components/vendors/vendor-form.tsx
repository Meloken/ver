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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionState, useEffect } from "react"
import { createVendorAction, updateVendorAction } from "@/app/(app)/vendors/actions"
import { Vendor } from "@/prisma/client"
import { FormError } from "@/components/forms/error"
import slugify from "slugify"

export function VendorForm({ vendor, open, onOpenChange }: {
  vendor?: Vendor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEditing = !!vendor
  const action = isEditing ? updateVendorAction : createVendorAction
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
            <DialogTitle>{isEditing ? "Cariyi Düzenle" : "Yeni Cari/Firma Ekle"}</DialogTitle>
            <DialogDescription>
              Size fatura kesen tedarikçileri veya sizin fatura kestiğiniz müşterileri kaydedin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={vendor.id} />}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Firma Unvanı</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={vendor?.name || ""} 
                placeholder="Örn: Ahmet Lojistik AŞ" 
                className="col-span-3"
                onChange={(e) => {
                  const codeInput = document.getElementById("v_code") as HTMLInputElement
                  if (!isEditing && codeInput && e.target.value) {
                    codeInput.value = slugify(e.target.value, { lower: true, strict: true })
                  }
                }}
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="v_code" className="text-right">Cari Kod</Label>
              <Input id="v_code" name="code" defaultValue={vendor?.code || ""} placeholder="ahmet-lojistik" className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Hesap Tipi</Label>
              <Select name="type" defaultValue={vendor?.type || "supplier"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">Tedarikçi (Bize Mal Satan)</SelectItem>
                  <SelectItem value="customer">Müşteri (Bizim Mal Sattığımız)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Açılış Bakiyesi</Label>
              <Input id="balance" name="balance" type="number" step="0.01" defaultValue={vendor ? (vendor.balance / 100).toString() : "0"} className="col-span-3" required />
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
