import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { ColoredText } from "@/components/ui/colored-text"
import { getCurrentUser } from "@/lib/auth"
import { getSettings, updateSettings } from "@/models/settings"
import { Banknote, ChartBarStacked, FolderOpenDot, Key, TextCursorInput, X } from "lucide-react"
import { revalidatePath } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export async function WelcomeWidget() {
  const user = await getCurrentUser()
  const settings = await getSettings(user.id)
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "Welcome" })

  return (
    <Card className="flex flex-col lg:flex-row items-start gap-10 p-10 w-full">
      <div className="flex flex-col w-full">
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            <ColoredText>{t("greeting")}</ColoredText>
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              "use server"
              await updateSettings(user.id, "is_welcome_message_hidden", "true")
              revalidatePath("/")
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="mt-5">
          <p className="mb-3">{t("description")}</p>
          <ul className="mb-5 list-disc pl-5 space-y-1">
            <li><strong>{t("feature1")}</strong></li>
            <li>{t("feature2")}</li>
            <li>{t("feature3")}</li>
            <li>{t("feature4")}</li>
            <li>{t("feature5")}</li>
            <li>{t("feature6")}</li>
            <li><strong>{t("feature7")}</strong></li>
          </ul>
          <p className="mb-3">{t("recommendation")}</p>
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          {settings.openai_api_key === "" && (
            <Link href="/settings/llm">
              <Button>
                <Key className="h-4 w-4" />
                {t("setApiKey")}
              </Button>
            </Link>
          )}
          <Link href="/settings">
            <Button variant="outline">
              <Banknote className="h-4 w-4" />
              {t("defaultCurrency")}: {settings.default_currency}
            </Button>
          </Link>
          <Link href="/settings/categories">
            <Button variant="outline">
              <ChartBarStacked className="h-4 w-4" />
              {t("categories")}
            </Button>
          </Link>
          <Link href="/settings/projects">
            <Button variant="outline">
              <FolderOpenDot className="h-4 w-4" />
              {t("projects")}
            </Button>
          </Link>
          <Link href="/settings/fields">
            <Button variant="outline">
              <TextCursorInput className="h-4 w-4" />
              {t("customFields")}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
