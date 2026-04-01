import { z } from "zod"

export const vendorFormSchema = z.object({
  code: z.string().min(1, "Firma/Cari kodu zorunludur").max(50),
  name: z.string().min(1, "Firma/Cari adı zorunludur").max(150),
  type: z.enum(["supplier", "customer"]).default("supplier"),
  balance: z.coerce.number().default(0),
})
