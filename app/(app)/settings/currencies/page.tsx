import { addCurrencyAction, deleteCurrencyAction, editCurrencyAction } from "@/app/(app)/settings/actions"
import { CrudTable } from "@/components/settings/crud"
import { getCurrentUser } from "@/lib/auth"
import { getCurrencies } from "@/models/currencies"

export default async function CurrenciesSettingsPage() {
  const user = await getCurrentUser()
  const currencies = await getCurrencies(user.id)
  const currenciesWithActions = currencies.map((currency) => ({
    ...currency,
    isEditable: true,
    isDeletable: true,
  }))

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-2">Para Birimleri</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-prose">
        Yapay zeka tarafından çevrimi desteklenmeyen yerel/özel para birimlerini veya kripto paraları (Örn: ADA, Kuruş) buraya ekleyerek işlemlerinizde kolayca kullanabilirsiniz.
      </p>
      <CrudTable
        items={currenciesWithActions}
        columns={[
          { key: "code", label: "Kod (Örn: USD)", editable: true },
          { key: "name", label: "İsim / Temsil", editable: true },
        ]}
        onDelete={async (code) => {
          "use server"
          return await deleteCurrencyAction(user.id, code)
        }}
        onAdd={async (data) => {
          "use server"
          return await addCurrencyAction(user.id, data as { code: string; name: string })
        }}
        onEdit={async (code, data) => {
          "use server"
          return await editCurrencyAction(user.id, code, data as { name: string })
        }}
      />
    </div>
  )
}
