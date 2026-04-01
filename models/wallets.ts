import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/client"
import { cache } from "react"

export const getWallets = cache(async (userId: string) => {
  return await prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
})

export const getWalletById = cache(async (userId: string, id: string) => {
  return await prisma.wallet.findFirst({
    where: { id, userId },
  })
})

export async function createWallet(userId: string, data: Omit<Prisma.WalletCreateInput, "user">) {
  return await prisma.wallet.create({
    data: {
      ...data,
      user: { connect: { id: userId } },
    },
  })
}

export async function updateWallet(userId: string, id: string, data: Prisma.WalletUpdateInput) {
  return await prisma.wallet.update({
    where: { id, userId },
    data,
  })
}

export async function deleteWallet(userId: string, id: string) {
  return await prisma.wallet.delete({
    where: { id, userId },
  })
}
