"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet } from "@/prisma/client"
import { PlusCircle, Edit, Trash2, Landmark, CreditCard, Wallet3 } from "lucide-react"
import { useState } from "react"
import { WalletForm } from "./wallet-form"
import { deleteWalletAction } from "@/app/(app)/wallets/actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function WalletList({ wallets }: { wallets: Wallet[] }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu kasayı silmek istediğinize emin misiniz?")) {
      const result = await deleteWalletAction(null, id)
      if (result.success) toast.success("Kasa silindi")
      else toast.error(result.error || "Kasa silinirken hata oluştu")
    }
  }

  const handleCreate = () => {
    setEditingWallet(null)
    setFormOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kasalar & Bankalar</h2>
          <p className="text-muted-foreground">İşlem yaparken kullanacağınız fiziki nakit ve banka cüzdanları.</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Kasa Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/50">
              <div className="flex items-center gap-2">
                {wallet.name.toLowerCase().includes("kredi") ? <CreditCard className="w-5 h-5 text-indigo-500" /> : 
                 wallet.name.toLowerCase().includes("bank") ? <Landmark className="w-5 h-5 text-emerald-500" /> : 
                 <Wallet3 className="w-5 h-5 text-amber-600" />}
                <CardTitle className="text-lg font-medium">{wallet.name}</CardTitle>
              </div>
              <div className="flex gap-2 text-muted-foreground z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => handleEdit(wallet)} />
                <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" onClick={() => handleDelete(wallet.id)} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-uppercase">Birim: {wallet.currency}</p>
            </CardContent>
          </Card>
        ))}
        {wallets.length === 0 && (
          <div className="col-span-full border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            Sistemde hiç cüzdanınız/kasanız bulunmuyor.
            <Button variant="outline" onClick={handleCreate}>İlk Hesabı Aç</Button>
          </div>
        )}
      </div>

      <WalletForm 
        wallet={editingWallet}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  )
}
