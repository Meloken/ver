"use client"

import { SelectProps } from "@radix-ui/react-select"
import { useTranslations } from "next-intl"
import { FormSelect } from "./simple"

export const FormSelectType = ({
  title,
  emptyValue,
  placeholder,
  hideIfEmpty = false,
  isRequired = false,
  ...props
}: {
  title: string
  emptyValue?: string
  placeholder?: string
  hideIfEmpty?: boolean
  isRequired?: boolean
} & SelectProps) => {
  const t = useTranslations("Common")
  const items = [
    { code: "expense", name: t("expense", { fallback: "Gider" }), badge: "↓" },
    { code: "income", name: t("income", { fallback: "Gelir" }), badge: "↑" },
    { code: "pending", name: t("pending", { fallback: "Bekliyor" }), badge: "⏲︎" },
    { code: "other", name: t("other", { fallback: "Diğer" }), badge: "?" },
  ]

  return (
    <FormSelect
      title={title}
      items={items}
      emptyValue={emptyValue}
      placeholder={placeholder}
      hideIfEmpty={hideIfEmpty}
      isRequired={isRequired}
      {...props}
    />
  )
}
