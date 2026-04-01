import { VendorList } from "@/components/vendors/vendor-list"
import { getCurrentUser } from "@/lib/auth"
import { getVendors } from "@/models/vendors"

export default async function VendorsPage() {
  const user = await getCurrentUser()
  const vendors = await getVendors(user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <VendorList vendors={vendors} />
    </div>
  )
}
