"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, Subscription, Budget } from "@/prisma/client"
import { AlertTriangle, TrendingUp, TrendingDown, Wallet2 } from "lucide-react"

export function ProjectionWidget({ wallets, subscriptions, budgets }: { wallets: Wallet[], subscriptions: Subscription[], budgets: Budget[] }) {
  // 1. Kasa (Cüzdan) Bakiyeleri Toplamı
  const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0)
  
  // 2. Gelecek Ay Sabit Giderler (Abonelikler)
  const monthlySubscriptions = subscriptions.reduce((acc, sub) => acc + sub.amount, 0)

  // 3. Gelecek Ay Bütçelenmiş Max Giderler
  const totalBudgeted = budgets.reduce((acc, budget) => acc + budget.limit, 0)

  // Projeksiyon Hesaplaması: Şu anki para - Sabit Giderler - Diğer Bütçe İhtiyaçları
  const projectedFreeCash = totalBalance - monthlySubscriptions - totalBudgeted
  
  // AI Uyarı Mantığı
  const isDanger = projectedFreeCash < 0
  const isWarning = projectedFreeCash < totalBalance * 0.1 && !isDanger // Total kasanın %10'u altındaysa uyarı

  return (
    <Card className="col-span-1 border-emerald-500/20 bg-emerald-500/5 shadow-md shadow-emerald-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Yapay Zeka Erken Uyarı & Projeksiyon
          </CardTitle>
          <Wallet2 className="w-6 h-6 text-muted-foreground opacity-50" />
        </div>
        <CardDescription>Yaklaşan abonelikler ve bütçenize göre gelecek ayın nakit tahmini.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Şu Anki Toplam Kasa</span>
            <span className="text-2xl font-bold text-primary">{totalBalance.toLocaleString("tr-TR")} ₺</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Gelecek Ay Zorunlu Çıkış</span>
            <span className="text-2xl font-bold text-red-500">
              -{(monthlySubscriptions + totalBudgeted).toLocaleString("tr-TR")} ₺
            </span>
            <span className="text-xs text-muted-foreground">Sabitler + Ayrılan Bütçe</span>
          </div>

          <div className={`flex flex-col p-3 rounded-lg border ${isDanger ? 'bg-red-500/10 border-red-500/20' : isWarning ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            <span className={`text-sm font-semibold mb-1 ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              Gelecek Ay Sonu Net Nakit
            </span>
            <span className={`text-2xl font-black ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
              {projectedFreeCash.toLocaleString("tr-TR")} ₺
            </span>
          </div>
        </div>

        {isDanger && (
          <div className="mt-6 flex items-start gap-3 text-red-500 bg-red-500/10 p-3 rounded-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong>Dikkat!</strong> Sistemdeki cüzdan bakiyeleriniz gelecek ayın sabit abonelikleri ve hedeflenen yaşam bütçenizi karşılamıyor. Gelecek ayı eksi (-) bakiye ile kapatma riskiniz çok yüksek. Ek nakit yaratmalısınız.
            </p>
          </div>
        )}

        {!isDanger && isWarning && (
          <div className="mt-6 flex items-start gap-3 text-amber-500 bg-amber-500/10 p-3 rounded-md">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong>Uyarı!</strong> Gelecek ay tüm sabit giderler çıkıldığında elinizde toplam kasanızın %10'undan daha az bir para serbest kalacak. Gevşek bütçeleme yapmamanız tavsiye edilir.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
