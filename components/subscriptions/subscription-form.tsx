"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionState, useEffect, useState } from "react"
import { createSubscriptionAction, updateSubscriptionAction } from "@/app/(app)/subscriptions/actions"
import { Subscription, Category, Currency } from "@/prisma/client"
import { FormError } from "@/components/forms/error"

interface SubscriptionFormProps {
  subscription?: Subscription | null
  categories: Category[]
  currencies: Currency[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionForm({
  subscription,
  categories,
  currencies,
  open,
  onOpenChange,
}: SubscriptionFormProps) {
  const isEditing = !!subscription
  const action = isEditing ? updateSubscriptionAction : createSubscriptionAction
  const [state, formAction, pending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false)
    }
  }, [state, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Aboneliği Düzenle" : "Yeni Abonelik"}</DialogTitle>
            <DialogDescription>
              Düzenli giderlerinizi takip etmek için abonelik ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={subscription.id} />}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Abonelik Adı</Label>
              <Input id="name" name="name" defaultValue={subscription?.name || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Tutar</Label>
              <Input id="amount" name="amount" type="number" step="0.01" defaultValue={subscription ? (subscription.amount / 100).toString() : ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currencyCode" className="text-right">Birim</Label>
              <Select name="currencyCode" defaultValue={subscription?.currencyCode || currencies[0]?.code || "USD"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Para Birimi Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingCycle" className="text-right">Döngü</Label>
              <Select name="billingCycle" defaultValue={subscription?.billingCycle || "monthly"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Döngü Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="yearly">Yıllık</SelectItem>
                  <SelectItem value="weekly">Haftalık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryCode" className="text-right">Kategori</Label>
              <Select name="categoryCode" defaultValue={subscription?.categoryCode || "none"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategori Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kategori Yok</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Başlangıç</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={subscription?.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="col-span-3" required />
            </div>
          </div>
          {state?.error && <FormError>{state.error}</FormError>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Kaydediliyor..." : "Kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
