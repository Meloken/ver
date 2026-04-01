import { getCurrentUser } from "@/lib/auth"
import { getTransactionById } from "@/models/transactions"
import { notFound } from "next/navigation"

import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export default async function TransactionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ transactionId: string }>
}) {
  const { transactionId } = await params
  const user = await getCurrentUser()
  const transaction = await getTransactionById(transactionId, user.id)
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "Transactions" })

  if (!transaction) {
    notFound()
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("detailsTitle")}</h2>
      </header>
      <main>
        <div className="flex flex-1 flex-col gap-4 pt-0">{children}</div>
      </main>
    </>
  )
}
