import { prisma } from "./lib/db"
import { createUserDefaults } from "./models/defaults"

async function main() {
  console.log("Kullanıcıların kategori, proje ve field tanımlarını Türkçe olarak güncelliyoruz...")
  const users = await prisma.user.findMany()
  for (const user of users) {
    if (user.email) {
      console.log(`- ${user.email} için ayarlar güncelleniyor...`)
      await createUserDefaults(user.id)
    }
  }
  console.log("İşlem tamamlandı!")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
