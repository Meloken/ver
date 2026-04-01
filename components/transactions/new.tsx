import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getCurrentUser } from "@/lib/auth"
import { getCategories } from "@/models/categories"
import { getCurrencies } from "@/models/currencies"
import { getProjects } from "@/models/projects"
import { getSettings } from "@/models/settings"
import { getWallets } from "@/models/wallets"
import { getVendors } from "@/models/vendors"
import { Button } from "../ui/button"
import TransactionCreateForm from "./create"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export async function NewTransactionDialog({ 
  children,
  asChild,
}: { 
  children: React.ReactNode
  asChild?: boolean
}) {
  const user = await getCurrentUser()
  const categories = await getCategories(user.id)
  const currencies = await getCurrencies(user.id)
  const settings = await getSettings(user.id)
  const projects = await getProjects(user.id)
  const wallets = await getWallets(user.id)
  const vendors = await getVendors(user.id)
  
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "Transactions" })

  return (
    <Dialog>
      <DialogTrigger asChild>
        {asChild ? children : <Button>{children}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t("title")}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <TransactionCreateForm
          categories={categories}
          currencies={currencies}
          settings={settings}
          projects={projects}
          wallets={wallets}
          vendors={vendors}
        />
      </DialogContent>
    </Dialog>
  )
}

