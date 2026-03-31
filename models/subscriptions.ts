import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/client"
import { cache } from "react"

export const getSubscriptions = cache(async (userId: string) => {
  return await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
})

export const getSubscriptionById = cache(async (userId: string, id: string) => {
  return await prisma.subscription.findFirst({
    where: { id, userId },
  })
})

export async function createSubscription(userId: string, data: Omit<Prisma.SubscriptionCreateInput, "user">) {
  return await prisma.subscription.create({
    data: {
      ...data,
      user: { connect: { id: userId } },
    },
  })
}

export async function updateSubscription(userId: string, id: string, data: Prisma.SubscriptionUpdateInput) {
  return await prisma.subscription.update({
    where: { id, userId },
    data,
  })
}

export async function deleteSubscription(userId: string, id: string) {
  return await prisma.subscription.delete({
    where: { id, userId },
  })
}
