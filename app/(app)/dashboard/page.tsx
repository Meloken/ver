import DashboardDropZoneWidget from "@/components/dashboard/drop-zone-widget"
import { StatsWidget } from "@/components/dashboard/stats-widget"
import { ChartsWidget } from "@/components/dashboard/charts-widget"
import DashboardUnsortedWidget from "@/components/dashboard/unsorted-widget"
import { WelcomeWidget } from "@/components/dashboard/welcome-widget"
import { ProjectionWidget } from "@/components/dashboard/projection-widget"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth"
import config from "@/lib/config"
import { getUnsortedFiles } from "@/models/files"
import { getSettings } from "@/models/settings"
import { getWallets } from "@/models/wallets"
import { getSubscriptions } from "@/models/subscriptions"
import { getBudgets } from "@/models/budgets"
import { TransactionFilters, getTransactions } from "@/models/transactions"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: config.app.description,
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<TransactionFilters> }) {
  const filters = await searchParams
  const user = await getCurrentUser()
  const [unsortedFiles, settings, transactionsData, wallets, subscriptions, budgets] = await Promise.all([
    getUnsortedFiles(user.id),
    getSettings(user.id),
    getTransactions(user.id, filters),
    getWallets(user.id),
    getSubscriptions(user.id),
    getBudgets(user.id)
  ])

  const isFirstTimeUser = transactionsData.total === 0 && unsortedFiles.length === 0

  if (isFirstTimeUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-10 w-full max-w-4xl self-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">TaxHacker'a Hoş Geldiniz! 🚀</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Yapay Zeka'nın (AI) sihrini görmek ve nasıl çalıştığını keşfetmek için vakit kaybetmeyelim. Ayarları sonra yaparsınız!
        </p>
        <div className="w-full mt-8 p-8 border-4 border-dashed border-primary/50 rounded-3xl bg-primary/5 hover:bg-primary/10 transition">
          <DashboardDropZoneWidget />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-5 w-full max-w-7xl self-center">
      <div className="flex flex-col sm:flex-row gap-5 items-stretch">
        <DashboardDropZoneWidget />

        <DashboardUnsortedWidget files={unsortedFiles} />
      </div>

      {settings.is_welcome_message_hidden !== "true" && <WelcomeWidget />}

      <Separator />

      <ProjectionWidget wallets={wallets} budgets={budgets} subscriptions={subscriptions} />

      <Separator />

      <StatsWidget filters={filters} />
      
      {/* Gelir ve Gider Grafikleri */}
      <ChartsWidget transactions={transactionsData.transactions} />
    </div>
  )
}


