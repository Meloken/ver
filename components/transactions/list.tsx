"use client"

import { BulkActionsMenu } from "@/components/transactions/bulk-actions"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calcNetTotalPerCurrency, calcTotalPerCurrency, isTransactionIncomplete } from "@/lib/stats"
import { cn, formatCurrency } from "@/lib/utils"
import { Category, Field, Project, Transaction } from "@/prisma/client"
import { formatDate } from "date-fns"
import { ArrowDownIcon, ArrowUpIcon, File } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

type FieldRenderer = {
  name: string
  code: string
  classes?: string
  sortable: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatValue?: (transaction: Transaction & any) => React.ReactNode
  footerValue?: (transactions: Transaction[], tList?: any) => React.ReactNode
}

type FieldWithRenderer = Field & {
  renderer: FieldRenderer
}

export const standardFieldRenderers: Record<string, FieldRenderer> = {
  name: {
    name: "Name",
    code: "name",
    classes: "font-medium min-w-[120px] max-w-[300px] overflow-hidden",
    sortable: true,
  },
  merchant: {
    name: "Merchant",
    code: "merchant",
    classes: "min-w-[120px] max-w-[250px] overflow-hidden",
    sortable: true,
  },
  issuedAt: {
    name: "Date",
    code: "issuedAt",
    classes: "min-w-[100px]",
    sortable: true,
    formatValue: (transaction: Transaction) =>
      transaction.issuedAt ? formatDate(transaction.issuedAt, "yyyy-MM-dd") : "",
  },
  projectCode: {
    name: "Project",
    code: "projectCode",
    sortable: true,
    formatValue: (transaction: Transaction & { project: Project }) =>
      transaction.projectCode ? (
        <Badge className="whitespace-nowrap" style={{ backgroundColor: transaction.project?.color }}>
          {transaction.project?.name || ""}
        </Badge>
      ) : (
        "-"
      ),
  },
  categoryCode: {
    name: "Category",
    code: "categoryCode",
    sortable: true,
    formatValue: (transaction: Transaction & { category: Category }) =>
      transaction.categoryCode ? (
        <Badge className="whitespace-nowrap" style={{ backgroundColor: transaction.category?.color }}>
          {transaction.category?.name || ""}
        </Badge>
      ) : (
        "-"
      ),
  },
  files: {
    name: "Files",
    code: "files",
    sortable: false,
    formatValue: (transaction: Transaction) => (
      <div className="flex items-center gap-2 text-sm">
        <File className="w-4 h-4" />
        {(transaction.files as string[]).length}
      </div>
    ),
  },
  total: {
    name: "Total",
    code: "total",
    classes: "text-right",
    sortable: true,
    formatValue: (transaction: Transaction) => (
      <div className="text-right text-lg">
        <div
          className={cn(
            { income: "text-green-500", expense: "text-red-500", other: "text-black" }[transaction.type || "other"],
            "flex flex-col justify-end"
          )}
        >
          <span>
            {transaction.total && transaction.currencyCode
              ? formatCurrency(transaction.total, transaction.currencyCode)
              : transaction.total}
          </span>
          {transaction.convertedTotal &&
            transaction.convertedCurrencyCode &&
            transaction.convertedCurrencyCode !== transaction.currencyCode && (
              <span className="text-sm -mt-1">
                ({formatCurrency(transaction.convertedTotal, transaction.convertedCurrencyCode)})
              </span>
            )}
        </div>
      </div>
    ),
    footerValue: (transactions: Transaction[], tList?: any) => {
      const netTotalPerCurrency = calcNetTotalPerCurrency(transactions)
      const turnoverPerCurrency = calcTotalPerCurrency(transactions)

      return (
        <div className="flex flex-col gap-3 text-right">
          <dl className="space-y-1">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {tList ? tList("netTotal") : "Net Total"}
            </dt>
            {Object.entries(netTotalPerCurrency).map(([currency, total]) => (
              <dd
                key={`net-${currency}`}
                className={cn("text-sm first:text-base font-medium", total >= 0 ? "text-green-600" : "text-red-600")}
              >
                {formatCurrency(total, currency)}
              </dd>
            ))}
          </dl>
          <dl className="space-y-1">
            <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {tList ? tList("turnover") : "Turnover"}
            </dt>
            {Object.entries(turnoverPerCurrency).map(([currency, total]) => (
              <dd key={`turnover-${currency}`} className="text-sm text-muted-foreground">
                {formatCurrency(total, currency)}
              </dd>
            ))}
          </dl>
        </div>
      )
    },
  },
  convertedTotal: {
    name: "Converted Total",
    code: "convertedTotal",
    classes: "text-right",
    sortable: true,
    formatValue: (transaction: Transaction) => (
      <div
        className={cn(
          { income: "text-green-500", expense: "text-red-500", other: "text-black" }[transaction.type || "other"],
          "flex flex-col justify-end text-right text-lg"
        )}
      >
        {transaction.convertedTotal && transaction.convertedCurrencyCode
          ? formatCurrency(transaction.convertedTotal, transaction.convertedCurrencyCode)
          : transaction.convertedTotal}
      </div>
    ),
  },
  currencyCode: {
    name: "Currency",
    code: "currencyCode",
    classes: "text-right",
    sortable: true,
  },
}

const getFieldRenderer = (field: Field): FieldRenderer => {
  if (standardFieldRenderers[field.code as keyof typeof standardFieldRenderers]) {
    return standardFieldRenderers[field.code as keyof typeof standardFieldRenderers]
  } else {
    return {
      name: field.name,
      code: field.code,
      classes: "",
      sortable: false,
    }
  }
}

export function TransactionList({ transactions, fields = [] }: { transactions: Transaction[]; fields?: Field[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const tList = useTranslations("TransactionList")
  const standardFields = ["name", "merchant", "issuedAt", "projectCode", "categoryCode", "files", "total", "convertedTotal", "currencyCode"]

  const [sorting, setSorting] = useState<{ field: string | null; direction: "asc" | "desc" | null }>(() => {
    const ordering = searchParams.get("ordering")
    if (!ordering) return { field: null, direction: null }
    const isDesc = ordering.startsWith("-")
    return {
      field: isDesc ? ordering.slice(1) : ordering,
      direction: isDesc ? "desc" : "asc",
    }
  })

  const visibleFields = useMemo(
    (): FieldWithRenderer[] =>
      fields
        .filter((field) => field.isVisibleInList)
        .map((field) => ({
          ...field,
          renderer: getFieldRenderer(field),
        })),
    [fields]
  )

  const toggleAllRows = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(transactions.map((transaction) => transaction.id))
    }
  }

  const toggleOneRow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleRowClick = (id: string) => {
    router.push(`/transactions/${id}`)
  }

  const handleSort = (field: string) => {
    let newDirection: "asc" | "desc" | null = "asc"

    if (sorting.field === field) {
      if (sorting.direction === "asc") newDirection = "desc"
      else if (sorting.direction === "desc") newDirection = null
    }

    setSorting({
      field: newDirection ? field : null,
      direction: newDirection,
    })
  }

  const renderFieldInTable = (transaction: Transaction, field: FieldWithRenderer): string | React.ReactNode => {
    if (field.isExtra) {
      return transaction.extra?.[field.code as keyof typeof transaction.extra] ?? ""
    } else if (field.renderer.formatValue) {
      return field.renderer.formatValue(transaction)
    } else {
      return String(transaction[field.code as keyof Transaction])
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (sorting.field && sorting.direction) {
      const ordering = sorting.direction === "desc" ? `-${sorting.field}` : sorting.field
      params.set("ordering", ordering)
    } else {
      params.delete("ordering")
    }
    router.push(`/transactions?${params.toString()}`)
  }, [sorting, router, searchParams])

  const getSortIcon = (field: string) => {
    if (sorting.field !== field) return null
    return sorting.direction === "asc" ? (
      <ArrowUpIcon className="w-4 h-4 ml-1 inline" />
    ) : sorting.direction === "desc" ? (
      <ArrowDownIcon className="w-4 h-4 ml-1 inline" />
    ) : null
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[30px] select-none">
                <Checkbox checked={selectedIds.length === transactions.length && transactions.length > 0} onCheckedChange={toggleAllRows} />
              </TableHead>
              {visibleFields.map((field) => (
                <TableHead
                  key={field.code}
                  className={cn(
                    field.renderer.classes,
                    field.renderer.sortable && "hover:cursor-pointer hover:bg-accent select-none"
                  )}
                  onClick={() => field.renderer.sortable && handleSort(field.code)}
                >
                  {standardFields.includes(field.code) ? tList(field.code as any) : (field.name || field.renderer.name)}
                  {field.renderer.sortable && getSortIcon(field.code)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className={cn(
                  isTransactionIncomplete(fields, transaction) && "bg-yellow-50 dark:bg-yellow-950/20",
                  selectedIds.includes(transaction.id) && "bg-muted",
                  "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => handleRowClick(transaction.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={(checked) => {
                      if (checked !== "indeterminate") {
                        toggleOneRow({ stopPropagation: () => {} } as React.MouseEvent, transaction.id)
                      }
                    }}
                  />
                </TableCell>
                {visibleFields.map((field) => (
                  <TableCell key={field.code} className={field.renderer.classes} suppressHydrationWarning>
                    {renderFieldInTable(transaction, field)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell></TableCell>
              {visibleFields.map((field) => (
                <TableCell key={field.code} className={field.renderer.classes}>
                  {field.renderer.footerValue ? field.renderer.footerValue(transactions, tList) : ""}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="flex flex-col gap-3 md:hidden p-3 bg-muted/10">
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-border">
          <div className="flex items-center gap-2">
            <Checkbox checked={selectedIds.length === transactions.length && transactions.length > 0} onCheckedChange={toggleAllRows} />
            <span className="text-sm font-medium select-none">Tümünü Seç</span>
          </div>
          <span className="text-sm text-muted-foreground">{transactions.length} İşlem</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {transactions.map((transaction) => {
            const nameField = visibleFields.find(f => f.code === 'name')
            const merchantField = visibleFields.find(f => f.code === 'merchant')
            const categoryField = visibleFields.find(f => f.code === 'categoryCode')
            const totalField = visibleFields.find(f => f.code === 'total')
            const dateField = visibleFields.find(f => f.code === 'issuedAt')
            
            return (
              <div
                key={transaction.id}
                onClick={() => handleRowClick(transaction.id)}
                className={cn(
                  "relative border rounded-lg p-4 flex flex-col gap-2 cursor-pointer shadow-sm bg-background transition-colors",
                  isTransactionIncomplete(fields, transaction) && "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20",
                  selectedIds.includes(transaction.id) && "ring-2 ring-primary border-primary",
                  !selectedIds.includes(transaction.id) && "hover:border-primary/50"
                )}
              >
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={(checked) => {
                      if (checked !== "indeterminate") {
                        toggleOneRow({ stopPropagation: () => {} } as React.MouseEvent, transaction.id)
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col pr-8">
                   <span className="font-semibold text-base line-clamp-1">{nameField ? renderFieldInTable(transaction, nameField) : (transaction.name || "-")}</span>
                   <span className="text-sm text-muted-foreground line-clamp-1">{merchantField ? renderFieldInTable(transaction, merchantField) : (transaction.merchant || "-")}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                   <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded text-muted-foreground">
                      {categoryField ? renderFieldInTable(transaction, categoryField) : (transaction.categoryCode || "Bilinmiyor")}
                   </div>
                   <div className="font-medium text-lg text-right">{totalField ? renderFieldInTable(transaction, totalField) : transaction.total}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1"><File className="w-3 h-3"/> {(transaction.files as string[])?.length || 0}</span>
                  <span className="flex items-center gap-1">{dateField ? renderFieldInTable(transaction, dateField) : (transaction.issuedAt?.toString() || "-")}</span>
                </div>
              </div>
            )
          })}
        </div>
        
        {transactions.length > 0 && (
          <div className="mt-2 pt-4 border-t border-border flex flex-col items-end gap-2 pr-2">
            {visibleFields.find(f => f.code === 'total')?.renderer.footerValue?.(transactions, tList)}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <BulkActionsMenu selectedIds={selectedIds} onActionComplete={() => setSelectedIds([])} />
      )}
    </div>
  )
}
