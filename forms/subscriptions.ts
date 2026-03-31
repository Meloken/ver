import { z } from "zod"

export const subscriptionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currencyCode: z.string().min(1, "Currency is required"),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  categoryCode: z.string().optional(),
  startDate: z.coerce.date(),
  status: z.enum(["active", "cancelled"]).default("active"),
})
