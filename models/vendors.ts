import { prisma } from "@/lib/db"
import { Prisma } from "@/prisma/client"
import { cache } from "react"

export const getVendors = cache(async (userId: string) => {
  return await prisma.vendor.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
})

export const getVendorById = cache(async (userId: string, id: string) => {
  return await prisma.vendor.findFirst({
    where: { id, userId },
  })
})

export async function createVendor(userId: string, data: Omit<Prisma.VendorCreateInput, "user">) {
  return await prisma.vendor.create({
    data: {
      ...data,
      user: { connect: { id: userId } },
    },
  })
}

export async function updateVendor(userId: string, id: string, data: Prisma.VendorUpdateInput) {
  return await prisma.vendor.update({
    where: { id, userId },
    data,
  })
}

export async function deleteVendor(userId: string, id: string) {
  return await prisma.vendor.delete({
    where: { id, userId },
  })
}
