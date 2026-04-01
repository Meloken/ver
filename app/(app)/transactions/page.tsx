import { ExportTransactionsDialog } from "@/components/export/transactions"
import { SendToAccountantDialog } from "@/components/export/send-to-accountant"
import { UploadButton } from "@/components/files/upload-button"
import { TransactionSearchAndFilters } from "@/components/transactions/filters"
import { TransactionList } from "@/components/transactions/list"
import { NewTransactionDialog } from "@/components/transactions/new"
import { Pagination } from "@/components/transactions/pagination"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getCategories } from "@/models/categories"
import { getFields } from "@/models/fields"
import { getProjects } from "@/models/projects"
import { getTransactions, TransactionFilters } from "@/models/transactions"
import { Download, Plus, Upload, Mail } from "lucide-react"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Transactions",
  description: "Manage your transactions",
}

import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

const TRANSACTIONS_PER_PAGE = 500

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<TransactionFilters> }) {
  const { page, ...filters } = await searchParams
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "Transactions" })

  const [{ transactions, total }, categories, projects, fields] = await Promise.all([
    getTransactions(user.id, filters, {
      limit: TRANSACTIONS_PER_PAGE,
      offset: ((page ?? 1) - 1) * TRANSACTIONS_PER_PAGE,
    }),
    getCategories(user.id),
    getProjects(user.id),
    getFields(user.id),
  ])

  // Reset page if user clicks a filter and no transactions are found
  if (page && page > 1 && transactions.length === 0) {
    const params = new URLSearchParams(filters as Record<string, string>)
    redirect(`?${params.toString()}`)
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2 mb-8">
        <h2 className="flex flex-row gap-3 md:gap-5">
          <span className="text-3xl font-bold tracking-tight">{t("title")}</span>
          <span className="text-3xl tracking-tight opacity-20">{total}</span>
        </h2>
        <div className="flex gap-2">
          <SendToAccountantDialog>
            <Mail className="w-4 h-4" /> <span className="hidden md:block">Müşavire Paketle</span>
          </SendToAccountantDialog>
          <ExportTransactionsDialog fields={fields} categories={categories} projects={projects} total={total}>
            <Download className="w-4 h-4" /> <span className="hidden md:block">{t("export")}</span>
          </ExportTransactionsDialog>
          <NewTransactionDialog>
            <Plus /> <span className="hidden md:block">{t("addTransaction")}</span>
          </NewTransactionDialog>
        </div>
      </header>

      <TransactionSearchAndFilters categories={categories} projects={projects} fields={fields} />

      <main>
        <TransactionList transactions={transactions} fields={fields} />

        {total > TRANSACTIONS_PER_PAGE && <Pagination totalItems={total} itemsPerPage={TRANSACTIONS_PER_PAGE} />}

        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[400px]">
            <p className="text-muted-foreground">{t("emptyState")}</p>
            <div className="flex flex-row gap-5 mt-8">
              <UploadButton>
                <Upload /> {t("analyzeInvoice")}
              </UploadButton>
              <NewTransactionDialog asChild>
                <Button variant="outline">
                  <Plus />
                  {t("addManually")}
                </Button>
              </NewTransactionDialog>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
