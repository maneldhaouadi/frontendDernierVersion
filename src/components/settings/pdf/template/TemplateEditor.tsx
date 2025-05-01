'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { FaTrash, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaListOl, FaLink, FaTable, FaCode, FaSave, FaUndo, FaRedo, FaPalette, FaFont } from 'react-icons/fa';
import { BiUndo, BiRedo } from 'react-icons/bi';
import { TemplateFieldsPanel } from './TemplateFielsPanel';
import { ChevronDown } from 'lucide-react';


const lowlight = createLowlight(common);

interface TiptapEditorProps {
  value: string;
  onChange: (content: string) => void;
  templateId?: number;
  templateData?: any;
  onSaveComplete?: () => void;
  onLoad?: () => void;
}

export default function TiptapEditor({
  value,
  onChange,
  templateId,
  templateData,
  onSaveComplete,
  onLoad,
}: TiptapEditorProps) {
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [tableSize, setTableSize] = useState({
    rows: 1,
    cols: 1,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-800 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: '',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-400 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-800 bg-gray-100 font-bold p-2',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleEditorChange(html);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor p-4 min-h-[700px] border rounded bg-white",
      },
    },
  });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [colorType, setColorType] = useState<'text'|'background'>('text');
  const colorPalette = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#c0c0c0', '#808080',
    '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
  ];

// Dans votre composant TiptapEditor


  const applyColor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().setColor(currentColor).run();
    setShowColorPicker(false);
  }, [editor, currentColor]);
  const handleHoverTableSize = (rows: number, cols: number) => {
    setTableSize({
      rows,
      cols,
    });
  };

  const handleTableInsert = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ 
        rows: tableSize.rows, 
        cols: tableSize.cols,
        withHeaderRow: true 
      })
      .run();
    setShowTablePopup(false);
  }, [editor, tableSize]);

  const handleEditorChange = useCallback(
    (content: string) => {
      if (content !== value) {
        onChange(content);
      }
    },
    [onChange, value]
  );

  const handleSave = useCallback(() => {
    if (editor) {
      const content = editor.getHTML();
      onChange(content);
      onSaveComplete?.();
    }
  }, [editor, onChange, onSaveComplete]);

 // Dans votre composant TiptapEditor
 const insertDynamicField = useCallback((fieldPath: string) => {
  if (!editor) return;
  
  // Crée un span avec un attribut data-dynamic pour identifier les champs variables
  const html = `<span class="dynamic-field" data-dynamic="${fieldPath}">{{${fieldPath}}}</span>`;
  
  // Insère le contenu à la position actuelle du curseur
  editor.commands.insertContent(html);
  
  // Ferme le menu des variables
  setShowVariableMenu(false);
}, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkMenu(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const dynamicFields = [
    { label: 'Document Number', field: 'meta.type' },
    { label: 'Client Name', field: 'quotation.firm.name' },
    { label: 'Company Name', field: 'quotation.cabinet.enterpriseName' },
    { label: 'Total Amount', field: 'quotation.total' },
    { label: 'Invoice Date', field: 'quotation.date' },
  ];

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  if (!editor) {
    return <div className="p-4 text-center">Loading editor...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
     <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      {/* Boutons Undo/Redo style Word - Nouveaux éléments ajoutés en premier */}
      
      </div>
            <style jsx>{`
        .tiptap-editor {
          padding: 1rem;
          min-height: 700px;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }

        .tiptap-editor table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
          table-layout: fixed;
          border: 1px solid #1e293b;
        }

        .tiptap-editor th,
        .tiptap-editor td {
          border: 1px solid #94a3b8;
          padding: 0.5rem;
          min-width: 50px;
          position: relative;
        }

        .tiptap-editor th {
          background-color: #f1f5f9;
          font-weight: bold;
          text-align: left;
        }

        .tiptap-editor .tableWrapper {
          margin: 1rem 0;
          overflow-x: auto;
        }
      `}</style>   
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      <div className="flex items-center border-r border-gray-200 pr-2 mr-1">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className={`p-1 rounded ${
            !editor?.can().undo() 
              ? 'opacity-30 cursor-not-allowed text-gray-400' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Annuler (Ctrl+Z)"
        >
          <BiUndo className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className={`p-1 rounded ${
            !editor?.can().redo() 
              ? 'opacity-30 cursor-not-allowed text-gray-400' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Rétablir (Ctrl+Y)"
        >
          <BiRedo className="w-5 h-5" />
        </button>
      </div>
      <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded ${
              editor?.isActive('textStyle', { color: currentColor }) 
                ? 'bg-gray-200' 
                : 'hover:bg-gray-100'
            }`}
            title="Couleur du texte"
          >
            <FaFont />
          </button>

          {showColorPicker && (
            <div className="absolute z-50 left-0 top-full mt-1 p-3 bg-white rounded-md shadow-lg border w-64">
              <div className="grid grid-cols-8 gap-1 mb-3">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCurrentColor(color);
                      applyColor();
                    }}
                    title={color}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-6 h-6 rounded border border-gray-300" 
                  style={{ backgroundColor: currentColor }}
                />
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="flex-1 p-1 text-sm border rounded"
                  placeholder="#RRGGBB"
                />
              </div>
              
              <button
                onClick={applyColor}
                className="w-full py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>
        {/* Menu Publipostage */}
       {/* Menu Publipostage */}
       <div className="relative">
  <button 
    onClick={() => setShowVariableMenu(!showVariableMenu)}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border bg-white hover:bg-gray-50"
  >
    <span>Publipostage</span>
    <ChevronDown 
      size={16} 
      className={`transition-transform ${showVariableMenu ? 'rotate-180' : ''}`}
    />
  </button>
  
  {showVariableMenu && (
  <div className="absolute z-20 left-0 mt-1 w-[28rem] bg-white rounded-md shadow-lg border border-gray-200">
    <div className="p-3 border-b bg-gray-50 sticky top-0">
      <h3 className="text-sm font-medium text-gray-700">
        Champs disponibles - {templateData?.type ? templateData.type.toUpperCase() : 'DEVIS'}
      </h3>
    </div>
    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
      <TemplateFieldsPanel
        key={templateData?.type || 'quotation'} // Utilisez une clé unique basée sur le type
        onInsertField={insertDynamicField}
        type={templateData?.type || 'quotation'} // Fallback explicite à 'quotation'
        compact={false}
      />
    </div>
  </div>
)}
</div>

        {/* Menu Affichage */}
        <div className="relative">
          <button 
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            Affichage
            <span>▼</span>
          </button>
        </div>

        {/* Menu Paragraphe */}
        <div className="relative">
          <button 
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            Paragraphe
            <span>▼</span>
          </button>
        </div>

        <div className="border-l h-6 mx-2"></div>

        {/* Titres */}
        <select
  onChange={(e) => {
    const value = e.target.value;
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  }}
  value={
    editor.isActive('paragraph') 
      ? 'paragraph' 
      : editor.isActive('heading', { level: 1 }) 
        ? 'h1' 
        : editor.isActive('heading', { level: 2 }) 
          ? 'h2' 
          : editor.isActive('heading', { level: 3 }) 
            ? 'h3' 
            : 'paragraph'
  }
  className="p-1 text-sm border rounded hover:bg-gray-100"
>
  <option value="paragraph">Normal</option>
  <option value="h1">Titre 1</option>
  <option value="h2">Titre 2</option>
  <option value="h3">Titre 3</option>
</select>

        <div className="border-l h-6 mx-2"></div>

        {/* Formatage de texte */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Gras"
        >
          <FaBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Italique"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Souligné"
        >
          <FaUnderline />
        </button>

        <div className="border-l h-6 mx-2"></div>

        {/* Listes */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Liste à puces"
        >
          <FaListUl />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Liste numérotée"
        >
          <FaListOl />
        </button>

        <div className="border-l h-6 mx-2"></div>

        {/* Alignement */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Aligner à gauche"
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Centrer"
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Aligner à droite"
        >
          <FaAlignRight />
        </button>

        <div className="border-l h-6 mx-2"></div>

        {/* Liens */}
        <div className="relative">
          <button
            onClick={() => setShowLinkMenu(!showLinkMenu)}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Lien"
          >
            <FaLink />
          </button>
          {showLinkMenu && (
            <div className="absolute z-10 mt-1 p-2 bg-white rounded-md shadow-lg border flex gap-2">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="p-1 text-sm border rounded"
              />
              <button
                onClick={setLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Tableaux */}
        <div className="relative">
          <button 
            onClick={() => setShowTablePopup(true)}
            className="p-2 rounded hover:bg-gray-100"
            title="Tableau"
          >
            <FaTable />
          </button>
          <button
    onClick={() => editor.chain().focus().deleteTable().run()}
    disabled={!editor?.isActive('table')}
    className={`p-2 rounded ${!editor?.isActive('table') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-red-500'}`}
    title="Supprimer le tableau"
  >
    <FaTrash />
  </button>
          {showTablePopup && (
            <div className="absolute z-50 left-0 mt-2 w-64 bg-white rounded-md shadow-lg border">
              <div className="p-3 border-b">
                <h3 className="text-sm font-medium">Insérer un tableau</h3>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-6 gap-1 mb-2">
                  {[...Array(6)].map((_, i) =>
                    [...Array(6)].map((_, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`w-6 h-6 border cursor-pointer ${
                          i < tableSize.rows && j < tableSize.cols
                            ? 'bg-blue-500'
                            : 'bg-gray-100'
                        }`}
                        onMouseEnter={() => handleHoverTableSize(i + 1, j + 1)}
                        onClick={handleTableInsert}
                      />
                    ))
                  )}
                </div>
                <div className="text-center text-xs text-gray-500">
                  {tableSize.rows} × {tableSize.cols}
                </div>
                <button
                  onClick={handleTableInsert}
                  className="mt-2 w-full py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Insérer
                </button>
              </div>
            </div>
          )}
        </div>

</div>
      {/* Bubble Menu */}
      {editor && (
  <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
    <div className="flex bg-white shadow-lg rounded-md overflow-hidden border divide-x">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 ${editor.isActive('bold') ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 ${editor.isActive('italic') ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 ${editor.isActive('underline') ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      >
        <FaUnderline />
      </button>
      <button
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          setLinkUrl(previousUrl || '');
          setShowLinkMenu(true);
        }}
        className={`p-2 ${editor.isActive('link') ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
      >
        <FaLink />
      </button>
      {editor.isActive('table') && (
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="p-2 hover:bg-red-50 text-red-500"
          title="Supprimer le tableau"
        >
          <FaTrash />
        </button>
      )}
    </div>
  </BubbleMenu>
)}

      <EditorContent editor={editor} />
    </div>
  );
}