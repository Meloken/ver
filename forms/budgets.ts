import { z } from "zod"

export const budgetFormSchema = z.object({
  categoryCode: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  period: z.enum(["monthly", "yearly"]).default("monthly"),
  startDate: z.coerce.date(),
})
