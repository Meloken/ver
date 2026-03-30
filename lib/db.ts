import { PrismaClient } from "@/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaLogLevel = process.env.NODE_ENV === "production"
  ? ["warn" as const, "error" as const]
  : ["query" as const, "info" as const, "warn" as const, "error" as const]

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: prismaLogLevel })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
