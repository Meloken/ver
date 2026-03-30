import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { resetFieldsAndCategories, resetLLMSettings } from "./actions"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export default async function DangerSettingsPage() {
  const user = await getCurrentUser()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "DangerZone" })

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-2 text-red-500">{t("title")}</h1>
      <p className="text-sm text-red-400 mb-8 max-w-prose">
        {t("description")}
      </p>
      <div className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-lg font-bold">{t("llmTitle")}</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-prose">
            {t("llmDescription")}
          </p>
          <form
            action={async () => {
              "use server"
              await resetLLMSettings(user)
            }}
          >
            <Button variant="destructive" type="submit">
              {t("resetLLM")}
            </Button>
          </form>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold">{t("fieldsTitle")}</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-prose">
            {t("fieldsDescription")}
          </p>
          <form
            action={async () => {
              "use server"
              await resetFieldsAndCategories(user)
            }}
          >
            <Button variant="destructive" type="submit">
              {t("resetFields")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
