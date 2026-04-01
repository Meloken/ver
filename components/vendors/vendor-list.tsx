"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vendor } from "@/prisma/client"
import { PlusCircle, Edit, Trash2, Building2, Contact, Factory } from "lucide-react"
import { useState } from "react"
import { VendorForm } from "./vendor-form"
import { deleteVendorAction } from "@/app/(app)/vendors/actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function VendorList({ vendors }: { vendors: Vendor[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu firmayı rehberden tamamen silmek istediğinize emin misiniz?")) {
      const result = await deleteVendorAction(null, id)
      if (result.success) toast.success("Firma silindi")
      else toast.error(result.error || "Firma silinirken hata oluştu")
    }
  }

  const handleCreate = () => {
    setEditingVendor(null)
    setFormOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cari Hesaplar & Firmalar</h2>
          <p className="text-muted-foreground">Ticari ilişkiniz olan Müşteri ve Tedarikçi rehberiniz.</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Firma Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => {
          const isCustomer = vendor.type === "customer"
          return (
            <Card key={vendor.id} className="relative overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
                <div className="flex items-center gap-2">
                  {isCustomer ? <Contact className="w-5 h-5 text-indigo-500" /> : <Factory className="w-5 h-5 text-orange-500" />}
                  <CardTitle className="text-lg font-medium">{vendor.name}</CardTitle>
                </div>
                <div className="flex gap-2 text-muted-foreground z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => handleEdit(vendor)} />
                  <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" onClick={() => handleDelete(vendor.id)} />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground mb-1 uppercase font-semibold">
                  {isCustomer ? "Müşteri (Alacak)" : "Tedarikçi (Borç)"}
                </div>
                <div className={`text-2xl font-bold ${vendor.balance < 0 ? 'text-red-500' : 'text-primary'}`}>
                  {formatCurrency(vendor.balance, "TRY")}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {vendors.length === 0 && (
          <div className="col-span-full border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            Henüz sisteme eklenmiş bir ticari ortak/firma bulunmuyor.
            <Button variant="outline" onClick={handleCreate}>İlk Firmayı Kaydet</Button>
          </div>
        )}
      </div>

      <VendorForm 
        vendor={editingVendor}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  )
}
