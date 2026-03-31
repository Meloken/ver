import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/client"
import { cache } from "react"

export const getBudgets = cache(async (userId: string) => {
  return await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
})

export const getBudgetById = cache(async (userId: string, id: string) => {
  return await prisma.budget.findFirst({
    where: { id, userId },
  })
})

export async function createBudget(userId: string, data: Omit<Prisma.BudgetCreateInput, "user">) {
  return await prisma.budget.create({
    data: {
      ...data,
      user: { connect: { id: userId } },
    },
  })
}

export async function updateBudget(userId: string, id: string, data: Prisma.BudgetUpdateInput) {
  return await prisma.budget.update({
    where: { id, userId },
    data,
  })
}

export async function deleteBudget(userId: string, id: string) {
  return await prisma.budget.delete({
    where: { id, userId },
  })
}
