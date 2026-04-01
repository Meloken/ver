import { addProjectAction, deleteProjectAction, editProjectAction } from "@/app/(app)/settings/actions"
import { CrudTable } from "@/components/settings/crud"
import { getCurrentUser } from "@/lib/auth"
import { randomHexColor } from "@/lib/utils"
import { getProjects } from "@/models/projects"
import { Prisma } from "@/prisma/client"

export default async function ProjectsSettingsPage() {
  const user = await getCurrentUser()
  const projects = await getProjects(user.id)
  const projectsWithActions = projects.map((project) => ({
    ...project,
    isEditable: true,
    isDeletable: true,
  }))

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-2">Projeler / Şubeler</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-prose">
        Projeler ekranını firmanızdaki farklı iş kolları veya şubeler (Örn: Şirinevler Şubesi, YouTube Gelirleri, E-Ticaret, Nakliye Pazarı vb.) için kullanarak fiş istatistiklerini birbirinden bağımsız ayırabilirsiniz. 
      </p>
      <CrudTable
        items={projectsWithActions}
        columns={[
          { key: "name", label: "İsim", editable: true },
          { key: "llm_prompt", label: "LLM Komutu (Prompt)", editable: true },
          { key: "color", label: "Renk Seç", type: "color", defaultValue: randomHexColor(), editable: true },
        ]}
        onDelete={async (code) => {
          "use server"
          return await deleteProjectAction(user.id, code)
        }}
        onAdd={async (data) => {
          "use server"
          return await addProjectAction(user.id, data as Prisma.ProjectCreateInput)
        }}
        onEdit={async (code, data) => {
          "use server"
          return await editProjectAction(user.id, code, data as Prisma.ProjectUpdateInput)
        }}
      />
    </div>
  )
}
