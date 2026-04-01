import { WalletList } from "@/components/wallets/wallet-list"
import { getCurrentUser } from "@/lib/auth"
import { getWallets } from "@/models/wallets"

export default async function WalletsPage() {
  const user = await getCurrentUser()
  const wallets = await getWallets(user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <WalletList wallets={wallets} />
    </div>
  )
}
