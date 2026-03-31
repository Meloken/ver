"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Subscription, Category, Currency } from "@/prisma/client"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { SubscriptionForm } from "./subscription-form"
import { deleteSubscriptionAction } from "@/app/(app)/subscriptions/actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface SubscriptionListProps {
  subscriptions: Subscription[]
  categories: Category[]
  currencies: Currency[]
}

export function SubscriptionList({ subscriptions, categories, currencies }: SubscriptionListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu aboneliği silmek istediğinize emin misiniz?")) {
      const result = await deleteSubscriptionAction(null, id)
      if (result.success) toast.success("Abonelik silindi")
      else toast.error(result.error || "Abonelik silinirken hata oluştu")
    }
  }

  const handleCreate = () => {
    setEditingSub(null)
    setFormOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abonelikler</h2>
          <p className="text-muted-foreground">Düzenli ve sabit giderlerinizi takip edin.</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Abonelik Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="relative overflow-hidden group">
            {sub.status === "cancelled" && <div className="absolute inset-0 bg-background/50 z-10 pointer-events-none" />}
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{sub.name}</CardTitle>
              <div className="flex gap-2 text-muted-foreground z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => handleEdit(sub)} />
                <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" onClick={() => handleDelete(sub.id)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sub.amount, sub.currencyCode)} <span className="text-sm font-normal text-muted-foreground">/{sub.billingCycle === "monthly" ? "ay" : sub.billingCycle === "yearly" ? "yıl" : "hafta"}</span></div>
              <div className="text-sm text-muted-foreground mt-2">
                Kategori: {categories.find(c => c.code === sub.categoryCode)?.name || "Kategori Yok"}
              </div>
            </CardContent>
          </Card>
        ))}
        {subscriptions.length === 0 && (
          <div className="col-span-full border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            Henüz hiçbir düzenli gideriniz sisteme işlenmemiş.
            <Button variant="outline" onClick={handleCreate}>İlk Aboneliği Ekle</Button>
          </div>
        )}
      </div>

      <SubscriptionForm 
        subscription={editingSub}
        categories={categories}
        currencies={currencies}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  )
}
