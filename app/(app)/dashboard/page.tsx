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

