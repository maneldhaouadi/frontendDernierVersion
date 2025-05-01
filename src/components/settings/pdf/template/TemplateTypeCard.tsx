'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { CreateTemplateDialog } from './CreateTemplateDialog'
import { TemplateType } from "@/types/template"

interface TemplateTypeCardProps {
  type: TemplateType // Modifié pour utiliser TemplateType au lieu de string
  title: string
  icon: React.ReactNode
  description: string
}

export function TemplateTypeCard({ type, title, icon, description }: TemplateTypeCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow hover:border-primary">
        <div className="flex flex-col items-center text-center h-full">
          <div className="p-3 mb-4 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6 flex-grow">
            {description}
          </p>
          <Button 
            className="w-full" 
            onClick={() => setDialogOpen(true)}
          >
            Créer un modèle
          </Button>
        </div>
      </Card>

      <CreateTemplateDialog 
        open={dialogOpen}
        type={type}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}