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
import { createBudgetAction, updateBudgetAction } from "@/app/(app)/budgets/actions"
import { Budget, Category } from "@/prisma/client"
import { FormError } from "@/components/forms/error"

interface BudgetFormProps {
  budget?: Budget | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetForm({
  budget,
  categories,
  open,
  onOpenChange,
}: BudgetFormProps) {
  const isEditing = !!budget
  const action = isEditing ? updateBudgetAction : createBudgetAction
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
            <DialogTitle>{isEditing ? "Bütçeyi Düzenle" : "Yeni Bütçe Hedefi"}</DialogTitle>
            <DialogDescription>
              Kategori bazında aylık veya yıllık harcama üst limitleri belirleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isEditing && <input type="hidden" name="id" value={budget.id} />}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryCode" className="text-right">Kategori</Label>
              <Select name="categoryCode" defaultValue={budget?.categoryCode || categories[0]?.code || "none"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategori Seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Hedef Limit</Label>
              <Input id="amount" name="amount" type="number" step="0.01" defaultValue={budget?.amount || ""} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">Periyot</Label>
              <Select name="period" defaultValue={budget?.period || "monthly"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Döngü Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="yearly">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">Tarihten İtibaren</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={budget?.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="col-span-3" required />
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
