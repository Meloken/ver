"use client"

import { createTransactionAction } from "@/app/(app)/transactions/actions"
import { FormError } from "@/components/forms/error"
import { FormSelectCategory } from "@/components/forms/select-category"
import { FormSelectCurrency } from "@/components/forms/select-currency"
import { FormSelectProject } from "@/components/forms/select-project"
import { FormSelectType } from "@/components/forms/select-type"
import { FormInput, FormTextarea } from "@/components/forms/simple"
import { Button } from "@/components/ui/button"
import { Category, Currency, Project } from "@/prisma/client"
import { format } from "date-fns"
import { Import, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { useTranslations } from "next-intl"

export default function TransactionCreateForm({
  categories,
  projects,
  currencies,
  settings,
}: {
  categories: Category[]
  projects: Project[]
  currencies: Currency[]
  settings: Record<string, string>
}) {
  const router = useRouter()
  const [createState, createAction, isCreating] = useActionState(createTransactionAction, null)
  const t = useTranslations("CreateTransaction")
  const [formData, setFormData] = useState({
    name: "",
    merchant: "",
    description: "",
    total: 0.0,
    convertedTotal: 0.0,
    currencyCode: settings.default_currency,
    convertedCurrencyCode: settings.default_currency,
    type: settings.default_type,
    categoryCode: settings.default_category,
    projectCode: settings.default_project,
    issuedAt: format(new Date(), "yyyy-MM-dd"),
    note: "",
  })

  useEffect(() => {
    if (createState?.success && createState.data) {
      router.push(`/transactions/${createState.data.id}`)
    }
  }, [createState, router])

  return (
    <form action={createAction} className="space-y-4">
      <FormInput title={t("name")} name="name" defaultValue={formData.name} />

      <FormInput title={t("merchant")} name="merchant" defaultValue={formData.merchant} />

      <FormInput title={t("description")} name="description" defaultValue={formData.description} />

      <div className="flex flex-row gap-4">
        <FormInput title={t("total")} type="number" step="0.01" name="total" defaultValue={formData.total.toFixed(2)} />

        <FormSelectCurrency
          title={t("currency")}
          name="currencyCode"
          currencies={currencies}
          placeholder={t("selectCurrency")}
          value={formData.currencyCode}
          onValueChange={(value) => {
            setFormData({ ...formData, currencyCode: value })
          }}
        />

        <FormSelectType title={t("type")} name="type" defaultValue={formData.type} />
      </div>

      {formData.currencyCode !== settings.default_currency ? (
        <div className="flex flex-row gap-4">
          <FormInput
            title={t("convertedTo", { currency: settings.default_currency })}
            type="number"
            step="0.01"
            name="convertedTotal"
            defaultValue={formData.convertedTotal.toFixed(2)}
          />
        </div>
      ) : (
        <></>
      )}

      <div className="flex flex-row flex-grow gap-4">
        <FormInput title={t("issuedAt")} type="date" name="issuedAt" defaultValue={formData.issuedAt} />
      </div>

      <div className="flex flex-row gap-4">
        <FormSelectCategory
          title={t("category")}
          categories={categories}
          name="categoryCode"
          defaultValue={formData.categoryCode}
          placeholder={t("selectCategory")}
        />

        <FormSelectProject
          title={t("project")}
          projects={projects}
          name="projectCode"
          defaultValue={formData.projectCode}
          placeholder={t("selectProject")}
        />
      </div>

      <FormTextarea title={t("note")} name="note" defaultValue={formData.note} />

      <div className="flex justify-between space-x-4 pt-6">
        <Button type="button" variant="outline" className="aspect-square">
          <Link href="/import/csv">
            <Import className="h-4 w-4" />
          </Link>
        </Button>

        <Button type="submit" disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("creating")}
            </>
          ) : (
            t("createAndAddFiles")
          )}
        </Button>
      </div>

      {createState?.error && <FormError>{createState.error}</FormError>}
    </form>
  )
}
