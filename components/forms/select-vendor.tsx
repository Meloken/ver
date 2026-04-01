"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vendor } from "@/prisma/client"

export function FormSelectVendor({
  title,
  name,
  vendors,
  defaultValue,
  placeholder,
}: {
  title: string
  name: string
  vendors: Vendor[]
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <div className="flex w-full flex-col gap-1.5 space-y-2">
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {title}
      </label>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.code} value={vendor.code}>
              {vendor.name}
            </SelectItem>
          ))}
          <SelectItem value={"none"} className="text-muted-foreground italic">Hiçbiri / Diğer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
