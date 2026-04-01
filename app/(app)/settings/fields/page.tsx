import { addFieldAction, deleteFieldAction, editFieldAction } from "@/app/(app)/settings/actions"
import { CrudTable } from "@/components/settings/crud"
import { getCurrentUser } from "@/lib/auth"
import { getFields } from "@/models/fields"
import { Prisma } from "@/prisma/client"

export default async function FieldsSettingsPage() {
  const user = await getCurrentUser()
  const fields = await getFields(user.id)
  const fieldsWithActions = fields.map((field) => ({
    ...field,
    isEditable: true,
    isDeletable: field.isExtra,
  }))

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-2">Özel Alanlar</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-prose">
        İşlemlerinize yeni alanlar ekleyebilirsiniz. Standart alanlar kaldırılamaz ancak yapay zeka komutlarını düzenleyebilir veya gizleyebilirsiniz. 
        Eğer bir alanın yapay zeka tarafından analiz edilmesini istemiyor ve elle doldurmayı tercih ediyorsanız, &quot;LLM Komutu&quot; kısmını boş bırakın.
      </p>
      <CrudTable
        items={fieldsWithActions}
        columns={[
          { key: "name", label: "İsim (Name)", editable: true },
          {
            key: "type",
            label: "Veri Tipi",
            type: "select",
            options: ["string", "number", "boolean"],
            defaultValue: "string",
            editable: true,
          },
          { key: "llm_prompt", label: "LLM Komutu (Prompt)", editable: true },
          {
            key: "isVisibleInList",
            label: "Tabloda Göster",
            type: "checkbox",
            defaultValue: false,
            editable: true,
          },
          {
            key: "isVisibleInAnalysis",
            label: "Analiz Formunda Göster",
            type: "checkbox",
            defaultValue: false,
            editable: true,
          },
          {
            key: "isRequired",
            label: "Zorunlu",
            type: "checkbox",
            defaultValue: false,
            editable: true,
          },
        ]}
        onDelete={async (code) => {
          "use server"
          return await deleteFieldAction(user.id, code)
        }}
        onAdd={async (data) => {
          "use server"
          return await addFieldAction(user.id, data as Prisma.FieldCreateInput)
        }}
        onEdit={async (code, data) => {
          "use server"
          return await editFieldAction(user.id, code, data as Prisma.FieldUpdateInput)
        }}
      />
    </div>
  )
}
