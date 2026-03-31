"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Budget, Category, Transaction } from "@/prisma/client"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { BudgetForm } from "./budget-form"
import { deleteBudgetAction } from "@/app/(app)/budgets/actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface BudgetListProps {
  budgets: Budget[]
  categories: Category[]
  transactions: Transaction[]
  defaultCurrency: string
}

export function BudgetList({ budgets, categories, transactions, defaultCurrency }: BudgetListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu bütçe hedefini silmek istediğinize emin misiniz?")) {
      const result = await deleteBudgetAction(null, id)
      if (result.success) toast.success("Bütçe silindi")
      else toast.error(result.error || "Bütçe silinirken hata oluştu")
    }
  }

  const handleCreate = () => {
    setEditingBudget(null)
    setFormOpen(true)
  }

  // Calculate progress
  const getSpentAmount = (budget: Budget) => {
    const now = new Date()
    const isMonthly = budget.period === "monthly"
    
    // Filter transactions by category and period
    const applicableTransactions = transactions.filter(t => {
      // Sadece çıkışları hesapla (Gider)
      if (t.type && t.type !== "expense" && t.total > 0) return false;
      if (t.categoryCode !== budget.categoryCode) return false;
      
      const tDate = t.issuedAt ? new Date(t.issuedAt) : null
      if (!tDate) return false;

      // Start date check
      if (tDate < new Date(budget.startDate)) return false;

      if (isMonthly) {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
      } else {
        return tDate.getFullYear() === now.getFullYear()
      }
    })

    // Sum convertedTotals (assume they are converted to user's default currency if set, else total)
    // t.convertedTotal is preferable.
    return applicableTransactions.reduce((acc, t) => {
      const val = Math.abs(t.convertedTotal || t.total || 0)
      return acc + val
    }, 0)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kategori Bütçeleri</h2>
          <p className="text-muted-foreground">Gruplara aylık veya yıllık harcama hedefleri koyun.</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Bütçe Ata
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const spent = getSpentAmount(budget)
          const percentage = Math.min((spent / budget.amount) * 100, 100)
          const isDanger = percentage >= 90
          const isWarning = percentage >= 75 && percentage < 90
          
          return (
            <Card key={budget.id} className="relative overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{categories.find(c => c.code === budget.categoryCode)?.name || "Silinmiş Kategori"}</CardTitle>
                <div className="flex gap-2 text-muted-foreground z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => handleEdit(budget)} />
                  <Trash2 className="h-4 w-4 cursor-pointer hover:text-red-500" onClick={() => handleDelete(budget.id)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm mb-1 mt-2">
                  <div>
                    <span className="font-semibold text-lg">{formatCurrency(spent, defaultCurrency)}</span>
                    <span className="text-muted-foreground ml-1">/ {formatCurrency(budget.amount, defaultCurrency)}</span>
                    <span className="text-xs ml-2 text-muted-foreground">({budget.period === "monthly" ? "Aylık" : "Yıllık"})</span>
                  </div>
                </div>
                
                <div className="w-full bg-secondary h-2.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  %{percentage.toFixed(1)} Dolu
                </div>
              </CardContent>
            </Card>
          )
        })}
        {budgets.length === 0 && (
          <div className="col-span-full border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            Henüz hiçbir kategoriye bütçe limiti atamamışsınız.
            <Button variant="outline" onClick={handleCreate}>İlk Bütçe Limitini Koy</Button>
          </div>
        )}
      </div>

      <BudgetForm 
        budget={editingBudget}
        categories={categories}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  )
}
