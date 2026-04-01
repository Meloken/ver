"use client"

import { deleteTransactionAction, saveTransactionAction } from "@/app/(app)/transactions/actions"
import { ItemsDetectTool } from "@/components/agents/items-detect"
import ToolWindow from "@/components/agents/tool-window"
import { FormError } from "@/components/forms/error"
import { FormSelectCategory } from "@/components/forms/select-category"
import { FormSelectCurrency } from "@/components/forms/select-currency"
import { FormSelectProject } from "@/components/forms/select-project"
import { FormSelectType } from "@/components/forms/select-type"
import { FormInput, FormTextarea } from "@/components/forms/simple"
import { Button } from "@/components/ui/button"
import { TransactionData } from "@/models/transactions"
import { Category, Currency, Field, Project, Transaction } from "@/prisma/client"
import { format } from "date-fns"
import { Loader2, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

export default function TransactionEditForm({
  transaction,
  categories,
  projects,
  currencies,
  fields,
  settings,
}: {
  transaction: Transaction
  categories: Category[]
  projects: Project[]
  currencies: Currency[]
  fields: Field[]
  settings: Record<string, string>
}) {
  const router = useRouter()
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteTransactionAction, null)
  const [saveState, saveAction, isSaving] = useActionState(saveTransactionAction, null)
  const t = useTranslations("Transactions")
  const tCommon = useTranslations("Common")
  const tFields = useTranslations("Fields")
  const tCreate = useTranslations("CreateTransaction")

  const extraFields = fields.filter((field) => field.isExtra)
  const [formData, setFormData] = useState({
    name: transaction.name || "",
    merchant: transaction.merchant || "",
    description: transaction.description || "",
    total: transaction.total ? transaction.total / 100 : 0.0,
    currencyCode: transaction.currencyCode || settings.default_currency,
    convertedTotal: transaction.convertedTotal ? transaction.convertedTotal / 100 : 0.0,
    convertedCurrencyCode: transaction.convertedCurrencyCode,
    type: transaction.type || "expense",
    categoryCode: transaction.categoryCode || settings.default_category,
    projectCode: transaction.projectCode || settings.default_project,
    issuedAt: transaction.issuedAt ? format(transaction.issuedAt, "yyyy-MM-dd") : "",
    note: transaction.note || "",
    items: transaction.items || [],
    ...extraFields.reduce(
      (acc, field) => {
        acc[field.code] = transaction.extra?.[field.code as keyof typeof transaction.extra] || ""
        return acc
      },
      {} as Record<string, string>
    ),
  })

  const fieldMap = useMemo(() => {
    return fields.reduce(
      (acc, field) => {
        acc[field.code] = field
        return acc
      },
      {} as Record<string, Field>
    )
  }, [fields])

  const handleDelete = async () => {
    if (confirm(t("confirmDelete"))) {
      startTransition(async () => {
        await deleteAction(transaction.id)
        router.back()
      })
    }
  }

  useEffect(() => {
    if (saveState?.success) {
      router.back()
    }
  }, [saveState, router])

  return (
    <form action={saveAction} className="space-y-4">
      <input type="hidden" name="transactionId" value={transaction.id} />

      <FormInput
        title={tFields("name")}
        name="name"
        defaultValue={formData.name}
        isRequired={fieldMap.name.isRequired}
      />

      <FormInput
        title={tFields("merchant")}
        name="merchant"
        defaultValue={formData.merchant}
        isRequired={fieldMap.merchant.isRequired}
      />

      <FormInput
        title={tFields("description")}
        name="description"
        defaultValue={formData.description}
        isRequired={fieldMap.description.isRequired}
      />

      <div className="flex flex-row gap-4">
        <FormInput
          title={tFields("total")}
          type="number"
          step="0.01"
          name="total"
          defaultValue={formData.total.toFixed(2)}
          className="w-32"
          isRequired={fieldMap.total.isRequired}
        />

        <FormSelectCurrency
          title={tFields("currencyCode")}
          name="currencyCode"
          value={formData.currencyCode}
          onValueChange={(value) => {
            setFormData({ ...formData, currencyCode: value })
          }}
          currencies={currencies}
          isRequired={fieldMap.currencyCode.isRequired}
        />

        <FormSelectType
          title={tFields("type")}
          name="type"
          defaultValue={formData.type}
          isRequired={fieldMap.type.isRequired}
        />
      </div>

      <div className="flex flex-row flex-grow gap-4">
        <FormInput
          title={tFields("issuedAt")}
          type="date"
          name="issuedAt"
          defaultValue={formData.issuedAt}
          isRequired={fieldMap.issuedAt.isRequired}
        />
        {formData.currencyCode !== settings.default_currency || formData.convertedTotal !== 0 ? (
          <>
            {formData.convertedTotal !== null && (
              <FormInput
                title={tCreate("convertedTo", { currency: formData.convertedCurrencyCode || "UNKNOWN CURRENCY" })}
                type="number"
                step="0.01"
                name="convertedTotal"
                defaultValue={formData.convertedTotal.toFixed(2)}
                isRequired={fieldMap.convertedTotal.isRequired}
                className="max-w-36"
              />
            )}
            {(!formData.convertedCurrencyCode || formData.convertedCurrencyCode !== settings.default_currency) && (
              <FormSelectCurrency
                title={tCommon("convertTo")}
                name="convertedCurrencyCode"
                defaultValue={formData.convertedCurrencyCode || settings.default_currency}
                currencies={currencies}
                isRequired={fieldMap.convertedCurrencyCode.isRequired}
              />
            )}
          </>
        ) : (
          <></>
        )}
      </div>

      <div className="flex flex-row gap-4">
        <FormSelectCategory
          title={tFields("categoryCode")}
          categories={categories}
          name="categoryCode"
          defaultValue={formData.categoryCode}
          isRequired={fieldMap.categoryCode.isRequired}
        />

        <FormSelectProject
          title={tFields("projectCode")}
          projects={projects}
          name="projectCode"
          defaultValue={formData.projectCode}
          isRequired={fieldMap.projectCode.isRequired}
        />
      </div>

      <FormTextarea
        title={tFields("note")}
        name="note"
        defaultValue={formData.note}
        className="h-24"
        isRequired={fieldMap.note.isRequired}
      />

      <div className="flex flex-wrap gap-4">
        {extraFields.map((field) => (
          <FormInput
            key={field.code}
            type="text"
            title={field.code === "vatRate" || field.code === "vatAmount" ? tFields(field.code as any) : field.name}
            name={field.code}
            defaultValue={(formData[field.code as keyof typeof formData] as string) || ""}
            isRequired={field.isRequired}
            className={field.type === "number" ? "max-w-36" : "max-w-full"}
          />
        ))}
      </div>

      {formData.items && Array.isArray(formData.items) && formData.items.length > 0 && (
        <ToolWindow title={t("detectedItems")}>
          <ItemsDetectTool data={formData as TransactionData} />
        </ToolWindow>
      )}

      <div className="flex justify-between space-x-4 pt-6">
        <Button type="button" onClick={handleDelete} variant="destructive" disabled={isDeleting}>
          <>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? t("deleting") : t("deleteTransaction")}
          </>
        </Button>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("saveTransaction")}
            </>
          )}
        </Button>
      </div>

      <div>
        {deleteState?.error && <FormError>{deleteState.error}</FormError>}
        {saveState?.error && <FormError>{saveState.error}</FormError>}
      </div>
    </form>
  )
}
