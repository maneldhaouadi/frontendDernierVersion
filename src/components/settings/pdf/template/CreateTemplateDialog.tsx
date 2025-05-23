'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TemplateType } from "@/types/template"

interface CreateTemplateDialogProps {
  open: boolean
  type: TemplateType
  onOpenChange: (open: boolean) => void
}

export function CreateTemplateDialog({ open, type, onOpenChange }: CreateTemplateDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    if (!name.trim()) return
    
    setIsCreating(true)
    // Redirige vers la page d'édition avec le nom pré-rempli
    router.push(`/settings/pdf/new-template?type=${type}&name=${encodeURIComponent(name)}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau modèle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du modèle"
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Type
            </Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {type}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
          >
            {isCreating ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}