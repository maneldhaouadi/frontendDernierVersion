'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { TemplateEditorHeader } from './TemplateEditorHeader'
import { useState } from 'react'
import TiptapEditor from './TemplateEditor'
import { templateApi } from '@/api/template'
import { TemplateType, TemplateTypeValues } from '@/types/template'
import { toast } from 'sonner'

interface TemplateEditorPageProps {
  type: TemplateTypeValues
  initialContent?: string
  initialName?: string
  templateId?: number
}

export function TemplateEditorPage({ 
  type, 
  initialContent = '', 
  initialName = '', 
  templateId 
}: TemplateEditorPageProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [name, setName] = useState(initialName)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      if (!name.trim()) {
        toast.error('Le nom du modèle est requis')
        return
      }
      
      if (!content.trim()) {
        toast.error('Le contenu du modèle ne peut pas être vide')
        return
      }

      const templateData = {
        name,
        content,
        type: type as TemplateType,
        isDefault: false
      }

      if (templateId) {
        await templateApi.update(templateId, templateData)
        toast.success('Modèle mis à jour avec succès')
        router.push(`/settings/pdf/templates?updated=true`)
      } else {
        await templateApi.create(templateData)
        toast.success('Modèle créé avec succès')
        router.push('/settings/pdf/templates?created=true')
      }
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <TemplateEditorHeader 
        type={type} 
        onBack={() => router.push('/settings/pdf/templates')} // Redirection cohérente
        name={name}
        onNameChange={setName}
      />
      
      <div className="bg-white rounded-lg shadow border mt-6">
        <TiptapEditor
          value={content}
          onChange={setContent}
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push('/settings/pdf/templates')}
          disabled={isSaving}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder le modèle'}
        </Button>
      </div>
    </div>
  )
}