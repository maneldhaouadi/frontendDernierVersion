'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { TemplateEditorPage } from "@/components/settings/pdf/template/TemplateEditorPage"
import { getEmptyTemplate } from '@/lib/template-utils'
import { notFound } from 'next/navigation'
import { TemplateTypeSelection } from '../template/TemplateTypeSelection'
import { toast } from 'sonner'
import { TemplateType, TemplateTypeValues } from '@/types/template'

export default function NewTemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const name = searchParams.get('name') || 'Nouveau modèle'

  const validTypes: TemplateTypeValues[] = ['invoice', 'quotation', 'payment']
  const normalizedType = type?.toLowerCase() as TemplateTypeValues

  // Si le type est spécifié mais invalide
  if (type && (!normalizedType || !validTypes.includes(normalizedType))) {
    return notFound()
  }

  // Si aucun type n'est spécifié, afficher la sélection
  if (!normalizedType) {
    return (
      <div className="p-8">
        <TemplateTypeSelection />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <TemplateEditorPage
        type={normalizedType}
        initialName={name}
        initialContent={getEmptyTemplate(normalizedType)}
      />
    </div>
  )
}