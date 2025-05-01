// components/editor/Toolbar.tsx
'use client'

import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Save,
  Plus,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ToolbarProps {
  editor: Editor
  onSave: () => void
  onInsertDynamicField: (field: string) => void
  onInsertTable: (rows: number, cols: number) => void
  templateData?: any
}

export function Toolbar({ 
  editor, 
  onSave,
  onInsertDynamicField,
  onInsertTable,
  templateData
}: ToolbarProps) {
  if (!editor) return null

  const dynamicFields = [
    { name: 'Client Name', path: 'client_name' },
    { name: 'Invoice Date', path: 'invoice_date' },
    { name: 'Total Amount', path: 'total_amount' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b">
      <Button variant="ghost" size="sm" onClick={onSave}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Insert Variable
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {dynamicFields.map((field) => (
            <DropdownMenuItem
              key={field.path}
              onClick={() => onInsertDynamicField(field.path)}
            >
              {field.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      {/* Ajoutez d'autres boutons de formatage ici */}
    </div>
  )
}