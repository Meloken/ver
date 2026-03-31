"use server"

import { subscriptionFormSchema } from "@/forms/subscriptions"
import { ActionState } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import {
  createSubscription,
  deleteSubscription,
  getSubscriptionById,
  updateSubscription,
} from "@/models/subscriptions"
import { Subscription } from "@/prisma/client"
import { revalidatePath } from "next/cache"

export async function createSubscriptionAction(
  _prevState: ActionState<Subscription> | null,
  formData: FormData
): Promise<ActionState<Subscription>> {
  try {
    const user = await getCurrentUser()
    const validatedForm = subscriptionFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const subscription = await createSubscription(user.id, validatedForm.data)

    revalidatePath("/subscriptions")
    return { success: true, data: subscription }
  } catch (error) {
    console.error("Failed to create subscription:", error)
    return { success: false, error: "Failed to create subscription" }
  }
}

export async function updateSubscriptionAction(
  _prevState: ActionState<Subscription> | null,
  formData: FormData
): Promise<ActionState<Subscription>> {
  try {
    const user = await getCurrentUser()
    const id = formData.get("id") as string
    const validatedForm = subscriptionFormSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedForm.success) {
      return { success: false, error: validatedForm.error.message }
    }

    const subscription = await updateSubscription(user.id, id, validatedForm.data)

    revalidatePath("/subscriptions")
    return { success: true, data: subscription }
  } catch (error) {
    console.error("Failed to update subscription:", error)
    return { success: false, error: "Failed to update subscription" }
  }
}

export async function deleteSubscriptionAction(
  _prevState: ActionState<Subscription> | null,
  id: string
): Promise<ActionState<Subscription>> {
  try {
    const user = await getCurrentUser()
    const subscription = await getSubscriptionById(user.id, id)
    if (!subscription) throw new Error("Subscription not found")

    await deleteSubscription(user.id, id)

    revalidatePath("/subscriptions")
    return { success: true, data: subscription }
  } catch (error) {
    console.error("Failed to delete subscription:", error)
    return { success: false, error: "Failed to delete subscription" }
  }
}
