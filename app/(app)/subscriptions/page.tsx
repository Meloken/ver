import { SubscriptionList } from "@/components/subscriptions/subscription-list"
import { getCurrentUser } from "@/lib/auth"
import { getSubscriptions } from "@/models/subscriptions"
import { getCategories } from "@/models/categories"
import { getCurrencies } from "@/models/currencies"

export default async function SubscriptionsPage() {
  const user = await getCurrentUser()
  const subscriptions = await getSubscriptions(user.id)
  const categories = await getCategories(user.id)
  const currencies = await getCurrencies(user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SubscriptionList subscriptions={subscriptions} categories={categories} currencies={currencies} />
    </div>
  )
}
