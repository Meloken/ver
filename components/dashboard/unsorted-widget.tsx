"use client"

import { useTranslations } from "next-intl"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File } from "@/prisma/client"
import { Cake, FilePlus } from "lucide-react"
import Link from "next/link"

export default function DashboardUnsortedWidget({ files }: { files: File[] }) {
  const t = useTranslations("Dashboard")
  return (
    <Card className="w-full sm:max-w-xs bg-accent flex flex-col">
      <CardHeader>
        <CardTitle>
          <Link href="/unsorted">
            {files.length > 0 ? `${files.length} ${t("unsortedFiles")}` : t("noUnsortedFiles")} &rarr;
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex flex-col gap-2 flex-1">
          {files.slice(0, 3).map((file) => (
            <Link
              href={`/unsorted/#${file.id}`}
              key={file.id}
              className="rounded-md p-2 bg-background hover:bg-black hover:text-white"
            >
              <div className="flex flex-row gap-2">
                <FilePlus className="w-8 h-8" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-xs font-semibold">{file.filename}</span>
                  <span className="truncate text-xs">{file.mimetype}</span>
                </div>
              </div>
            </Link>
          ))}
          {files.length === 0 && (
            <div className="flex flex-col flex-1 items-center justify-center gap-2 text-sm min-h-[100px] opacity-30">
              <Cake className="w-8 h-8" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
