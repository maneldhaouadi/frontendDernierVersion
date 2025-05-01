// components/settings/pdf/template/TemplateTypeSelection.tsx
'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export function TemplateTypeSelection() {
  const router = useRouter()

  const templateTypes = [
    {
      type: 'invoice',
      title: 'Facture',
      description: 'Créer un modèle de facture',
      icon: '📄' // Remplacez par votre composant d'icône
    },
    {
      type: 'quotation',
      title: 'Devis',
      description: 'Créer un modèle de devis',
      icon: '✏️'
    },
    {
      type: 'payment',
      title: 'Paiement',
      description: 'Créer un modèle de paiement',
      icon: '💰'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {templateTypes.map((template) => (
        <Card key={template.type} className="p-6 hover:shadow-md transition-shadow hover:border-primary">
          <div className="flex flex-col items-center text-center h-full">
            <div className="p-3 mb-4 rounded-full bg-primary/10 text-primary">
              {template.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
            <p className="text-muted-foreground mb-6 flex-grow">
              {template.description}
            </p>
            <Button 
              className="w-full" 
              onClick={() => router.push(`/settings/pdf/new-template?type=${template.type}`)}
            >
              Créer un modèle
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}