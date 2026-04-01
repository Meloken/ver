"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet } from "@/prisma/client"

export function FormSelectWallet({
  title,
  name,
  wallets,
  defaultValue,
  placeholder,
}: {
  title: string
  name: string
  wallets: Wallet[]
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
          {wallets.map((wallet) => (
            <SelectItem key={wallet.code} value={wallet.code}>
              {wallet.name} ({wallet.currency})
            </SelectItem>
          ))}
          <SelectItem value={"none"} className="text-muted-foreground italic">Hiçbiri (Nakit vs)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
