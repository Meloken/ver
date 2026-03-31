"use server"

import { budgetFormSchema } from "@/forms/budgets"
import { ActionState } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import {
  createBudget,
  deleteBudget,
  getBudgetById,
  updateBudget,
} from "@/models/budgets"
import { Budget } from "@/prisma/client"
import { revalidatePath } from "next/cache"

export async function createBudgetAction(
  _prevState: ActionState<Budget> | null,
  formData: FormData
): Promise<ActionState<Budget>> {
  try {
    const user = await getCurrentUser()
    const validatedForm = budgetFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const budget = await createBudget(user.id, validatedForm.data)

    revalidatePath("/budgets")
    return { success: true, data: budget }
  } catch (error: any) {
    if (error.code === 'P2002') {
        return { success: false, error: "Bu kategori için zaten aynı tipte bir bütçe var." }
    }
    console.error("Failed to create budget:", error)
    return { success: false, error: "Failed to create budget" }
  }
}

export async function updateBudgetAction(
  _prevState: ActionState<Budget> | null,
  formData: FormData
): Promise<ActionState<Budget>> {
  try {
    const user = await getCurrentUser()
    const id = formData.get("id") as string
    const validatedForm = budgetFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const budget = await updateBudget(user.id, id, validatedForm.data)

    revalidatePath("/budgets")
    return { success: true, data: budget }
  } catch (error: any) {
    if (error.code === 'P2002') {
        return { success: false, error: "Bu kategori için zaten aynı tipte bir bütçe var." }
    }
    console.error("Failed to update budget:", error)
    return { success: false, error: "Failed to update budget" }
  }
}

export async function deleteBudgetAction(
  _prevState: ActionState<Budget> | null,
  id: string
): Promise<ActionState<Budget>> {
  try {
    const user = await getCurrentUser()
    const budget = await getBudgetById(user.id, id)
    if (!budget) throw new Error("Budget not found")

    await deleteBudget(user.id, id)

    revalidatePath("/budgets")
    return { success: true, data: budget }
  } catch (error) {
    console.error("Failed to delete budget:", error)
    return { success: false, error: "Failed to delete budget" }
  }
}
