"use server"

import { vendorFormSchema } from "@/forms/vendors"
import { ActionState } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import { createVendor, deleteVendor, getVendorById, updateVendor } from "@/models/vendors"
import { Vendor } from "@/prisma/client"
import { revalidatePath } from "next/cache"

export async function createVendorAction(
  _prevState: ActionState<Vendor> | null,
  formData: FormData
): Promise<ActionState<Vendor>> {
  try {
    const user = await getCurrentUser()
    const validatedForm = vendorFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const vendor = await createVendor(user.id, validatedForm.data)
    revalidatePath("/vendors")
    return { success: true, data: vendor }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Bu kodla zaten bir firma bulunuyor." }
    }
    return { success: false, error: "Firma oluşturulamadı" }
  }
}

export async function updateVendorAction(
  _prevState: ActionState<Vendor> | null,
  formData: FormData
): Promise<ActionState<Vendor>> {
  try {
    const user = await getCurrentUser()
    const id = formData.get("id") as string
    const validatedForm = vendorFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const vendor = await updateVendor(user.id, id, validatedForm.data)
    revalidatePath("/vendors")
    return { success: true, data: vendor }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Bu kodla zaten bir firma bulunuyor." }
    }
    return { success: false, error: "Firma güncellenemedi" }
  }
}

export async function deleteVendorAction(
  _prevState: ActionState<Vendor> | null,
  id: string
): Promise<ActionState<Vendor>> {
  try {
    const user = await getCurrentUser()
    const vendor = await deleteVendor(user.id, id)
    revalidatePath("/vendors")
    return { success: true, data: vendor }
  } catch (error) {
    return { success: false, error: "Firma silinemedi" }
  }
}
