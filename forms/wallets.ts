import { z } from "zod"

export const walletFormSchema = z.object({
  code: z.string().min(1, "Kasa/Cüzdan kodu zorunludur").max(50),
  name: z.string().min(1, "Kasa/Cüzdan adı zorunludur").max(100),
  currency: z.string().min(1, "Para birimi zorunludur").max(10).default("TRY"),
  balance: z.coerce.number().default(0).transform((val) => Math.round(val * 100)),
})
