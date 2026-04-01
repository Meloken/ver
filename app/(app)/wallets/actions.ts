"use server"

import { walletFormSchema } from "@/forms/wallets"
import { ActionState } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import { createWallet, deleteWallet, getWalletById, updateWallet } from "@/models/wallets"
import { Wallet } from "@/prisma/client"
import { revalidatePath } from "next/cache"

export async function createWalletAction(
  _prevState: ActionState<Wallet> | null,
  formData: FormData
): Promise<ActionState<Wallet>> {
  try {
    const user = await getCurrentUser()
    const validatedForm = walletFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const wallet = await createWallet(user.id, validatedForm.data)
    revalidatePath("/wallets")
    return { success: true, data: wallet }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Bu kodla zaten bir kasa bulunuyor." }
    }
    return { success: false, error: "Kasa oluşturulamadı" }
  }
}

export async function updateWalletAction(
  _prevState: ActionState<Wallet> | null,
  formData: FormData
): Promise<ActionState<Wallet>> {
  try {
    const user = await getCurrentUser()
    const id = formData.get("id") as string
    const validatedForm = walletFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const wallet = await updateWallet(user.id, id, validatedForm.data)
    revalidatePath("/wallets")
    return { success: true, data: wallet }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Bu kodla zaten bir kasa bulunuyor." }
    }
    return { success: false, error: "Kasa güncellenemedi" }
  }
}

export async function deleteWalletAction(
  _prevState: ActionState<Wallet> | null,
  id: string
): Promise<ActionState<Wallet>> {
  try {
    const user = await getCurrentUser()
    const wallet = await deleteWallet(user.id, id)
    revalidatePath("/wallets")
    return { success: true, data: wallet }
  } catch (error) {
    return { success: false, error: "Kasa silinemedi" }
  }
}
