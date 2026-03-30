import { SideNav } from "@/components/settings/side-nav"
import { Separator } from "@/components/ui/separator"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Settings",
  description: "Customize your settings here",
}

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  const t = await getTranslations({ locale, namespace: "Settings" })

  const settingsCategories = [
    { title: t("general"), href: "/settings" },
    { title: t("profilePlan"), href: "/settings/profile" },
    { title: t("businessDetails"), href: "/settings/business" },
    { title: t("llmSettings"), href: "/settings/llm" },
    { title: t("fields"), href: "/settings/fields" },
    { title: t("categories"), href: "/settings/categories" },
    { title: t("projects"), href: "/settings/projects" },
    { title: t("currencies"), href: "/settings/currencies" },
    { title: t("backups"), href: "/settings/backups" },
    { title: t("dangerZone"), href: "/settings/danger" },
  ]

  return (
    <>
      <div className="space-y-6 p-10 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SideNav items={settingsCategories} />
          </aside>
          <div className="flex w-full">{children}</div>
        </div>
      </div>
    </>
  )
}
