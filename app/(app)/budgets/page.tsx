import { BudgetList } from "@/components/budgets/budget-list"
import { getCurrentUser } from "@/lib/auth"
import { getBudgets } from "@/models/budgets"
import { getCategories } from "@/models/categories"
import { getTransactions } from "@/models/transactions"
import { getSettings } from "@/models/settings"

export default async function BudgetsPage() {
  const user = await getCurrentUser()
  const budgets = await getBudgets(user.id)
  const categories = await getCategories(user.id)
  
  // Sadece grafikte kıyaslama yapmak için bu seneki işlemleri çeksek yeter, veya hepsini çekebiliriz (performans sınırı).
  // Sistem modeli getTransactions'ın filtreleme destekliyor.
  const transactions = await getTransactions(user.id, {})
  const settings = await getSettings(user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BudgetList 
        budgets={budgets} 
        categories={categories} 
        transactions={transactions.data} 
        defaultCurrency={settings.defaultCurrency} 
      />
    </div>
  )
}
