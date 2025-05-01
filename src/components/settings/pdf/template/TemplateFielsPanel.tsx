'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TemplateFieldsPanelProps {
  onInsertField: (fieldPath: string) => void
  type: 'invoice' | 'quotation' | 'payment'
  compact?: boolean
}

type SectionKey = 'header' | 'client' | 'totals' | 'details' | 'articles' | 'taxes' | 'company' | 'bank' | 'delivery' | 'invoicing';

interface Field {
  name: string
  path: string
  template?: string
  description?: string
}

interface Section {
  title: string
  fields: Field[]
}


export function TemplateFieldsPanel({
  onInsertField,
  type = 'invoice',
  compact = false
}: TemplateFieldsPanelProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    header: true,
    client: true,
    totals: true,
    details: true,
    articles: true,
    taxes: true,
    company: true,
    bank: true,
    delivery: true,
    invoicing: true
  });

  useEffect(() => {
    console.log("Type reçu dans TemplateFieldsPanel:", type);
  }, [type]);
  
  const SECTION_ORDER: SectionKey[] = [
    'header',
    'company',
    'client',
    'delivery',
    'invoicing',
    'bank',
    'articles',
    'taxes',
    'totals',
    'details'
  ];

  const toggleSection = (section: SectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getTemplateFields = (): Record<SectionKey, Section> => {
    const commonFields = {
      header: {
        title: 'En-tête',
        fields: [
          { name: 'Type de document', path: 'meta.type' },
          { name: 'Numéro', path: 'sequential' },
          { name: 'Date', path: 'date' },
          { name: 'Date d\'échéance', path: 'dueDate' },
          { name: 'Objet', path: 'object' },
          { name: 'Statut', path: 'status' }
        ]
      },
      company: {
        title: 'Société',
        fields: [
          { name: 'Nom', path: 'cabinet.enterpriseName' },
          { 
            name: 'Adresse complète', 
            path: 'cabinet.address.full', 
            template: '{{cabinet.address.address}}, {{cabinet.address.zipcode}} {{cabinet.address.region}}, {{cabinet.address.country}}'
          },
          { name: 'Adresse', path: 'cabinet.address.address' },
          { name: 'Code postal', path: 'cabinet.address.zipcode' },
          { name: 'Région', path: 'cabinet.address.region' },
          { name: 'Pays', path: 'cabinet.address.country' },
          { name: 'Téléphone', path: 'cabinet.phone' },
          { name: 'Email', path: 'cabinet.email' },
          { name: 'Matricule fiscal', path: 'cabinet.taxIdentificationNumber' },
          { name: 'Logo', path: 'logo', template: '<img src="{{logo}}" style="max-width: 200px; max-height: 100px;">' }
        ]
      },
      client: {
        title: 'Client',
        fields: [
          { name: 'Nom', path: 'firm.name' },
          { name: 'Contact', path: 'interlocutor.name' },
          { name: 'Téléphone', path: 'firm.phone' },
          { name: 'Email', path: 'firm.email' },
          { name: 'Matricule fiscal', path: 'firm.taxIdentificationNumber' }
        ]
      },
      delivery: {
        title: 'Adresse de livraison',
        fields: [
          { 
            name: 'Adresse complète', 
            path: 'firm.deliveryAddress.full',
            template: '{{firm.deliveryAddress.address}}, {{firm.deliveryAddress.zipcode}} {{firm.deliveryAddress.region}}, {{firm.deliveryAddress.country}}'
          },
          { name: 'Adresse', path: 'firm.deliveryAddress.address' },
          { name: 'Code postal', path: 'firm.deliveryAddress.zipcode' },
          { name: 'Région', path: 'firm.deliveryAddress.region' },
          { name: 'Pays', path: 'firm.deliveryAddress.country' }
        ]
      },
      invoicing: {
        title: 'Adresse de facturation',
        fields: [
          { 
            name: 'Adresse complète', 
            path: 'firm.invoicingAddress.full',
            template: '{{firm.invoicingAddress.address}}, {{firm.invoicingAddress.zipcode}} {{firm.invoicingAddress.region}}, {{firm.invoicingAddress.country}}'
          },
          { name: 'Adresse', path: 'firm.invoicingAddress.address' },
          { name: 'Code postal', path: 'firm.invoicingAddress.zipcode' },
          { name: 'Région', path: 'firm.invoicingAddress.region' },
          { name: 'Pays', path: 'firm.invoicingAddress.country' }
        ]
      },
      bank: {
        title: 'Banque',
        fields: [
          { name: 'Nom de la banque', path: 'bankAccount.bankName' },
          { name: 'Code banque', path: 'bankAccount.bankCode' },
          { name: 'Code agence', path: 'bankAccount.branchCode' },
          { name: 'Numéro de compte', path: 'bankAccount.accountNumber' },
          { name: 'Clé RIB', path: 'bankAccount.ribKey' },
          { name: 'IBAN', path: 'bankAccount.iban' },
          { name: 'BIC/SWIFT', path: 'bankAccount.bic' }
        ]
      }
    }

    const typeSpecificFields: Record<SectionKey, Section> = {
      header: { title: '', fields: [] },
      client: { title: '', fields: [] },
      company: { title: '', fields: [] },
      bank: { title: '', fields: [] },
      delivery: { title: '', fields: [] },
      invoicing: { title: '', fields: [] },
      articles: { title: 'Articles', fields: [] },
      taxes: { title: 'Taxes', fields: [] },
      totals: { title: 'Totaux', fields: [] },
      details: { title: 'Détails', fields: [] }
    }

    switch (type) {
      case 'invoice':
        typeSpecificFields.articles = {
          title: 'Lignes de facture',
          fields: [
            { 
              name: 'Ligne complète', 
              path: 'articleExpenseEntries[]', 
              template: '{{article.title}} | {{quantity}} x {{unit_price}} {{currency.symbol}} = {{total}} {{currency.symbol}}'
            },
            { name: 'Référence', path: 'articleExpenseEntries[].article.reference' },
            { name: 'Désignation', path: 'articleExpenseEntries[].article.title' },
            { name: 'Description', path: 'articleExpenseEntries[].article.description' },
            { name: 'Quantité', path: 'articleExpenseEntries[].quantity' },
            { name: 'Prix unitaire', path: 'articleExpenseEntries[].unit_price' },
            { name: 'Unité', path: 'articleExpenseEntries[].unit' },
            { name: 'Remise', path: 'articleExpenseEntries[].discount' },
            { name: 'Type remise', path: 'articleExpenseEntries[].discount_type' },
            { name: 'Sous-total', path: 'articleExpenseEntries[].subTotal' }
          ]
        }
        typeSpecificFields.taxes = {
          title: 'Taxes',
          fields: [
            { 
              name: 'Ligne taxe', 
              path: 'articleExpenseEntries[].expenseArticleInvoiceEntryTaxes[]',
              template: '{{tax.label}} ({{tax.rate}}%) = {{amount}} {{currency.symbol}}'
            },
            { name: 'Timbre fiscal', path: 'taxStamp' }
          ]
        }
        typeSpecificFields.totals = {
          title: 'Totaux',
          fields: [
            { name: 'Sous-total HT', path: 'subTotal' },
            { name: 'Remise globale', path: 'discount' },
            { name: 'Total HT', path: 'totalHT' },
            { name: 'Total TVA', path: 'totalVAT' },
            { name: 'Total TTC', path: 'total' },
            { name: 'Montant payé', path: 'amountPaid' },
            { name: 'Reste à payer', path: 'remainingAmount' },
            { name: 'Devise', path: 'currency.symbol' }
          ]
        }
        break

      case 'quotation':
        typeSpecificFields.articles = {
          title: 'Lignes de devis',
          fields: [
            { 
              name: 'Ligne complète', 
              path: 'articleQuotationEntries[]', 
              template: '{{article.title}} | {{quantity}} x {{unit_price}} {{currency.symbol}} = {{total}} {{currency.symbol}}'
            },
            { name: 'Référence', path: 'articleQuotationEntries[].article.reference' },
            { name: 'Désignation', path: 'articleQuotationEntries[].article.title' },
            { name: 'Description', path: 'articleQuotationEntries[].article.description' },
            { name: 'Quantité', path: 'articleQuotationEntries[].quantity' },
            { name: 'Prix unitaire', path: 'articleQuotationEntries[].unit_price' },
            { name: 'Unité', path: 'articleQuotationEntries[].unit' },
            { name: 'Remise', path: 'articleQuotationEntries[].discount' },
            { name: 'Type remise', path: 'articleQuotationEntries[].discount_type' },
            { name: 'Sous-total', path: 'articleQuotationEntries[].subTotal' }
          ]
        }
        typeSpecificFields.taxes = {
          title: 'Taxes',
          fields: [
            { 
              name: 'Ligne taxe', 
              path: 'articleQuotationEntries[].articleQuotationEntryTaxes[]',
              template: '{{tax.label}} ({{tax.rate}}%) = {{amount}} {{currency.symbol}}'
            }
          ]
        }
        typeSpecificFields.totals = {
          title: 'Totaux',
          fields: [
            { name: 'Sous-total HT', path: 'subTotal' },
            { name: 'Remise globale', path: 'discount' },
            { name: 'Total HT', path: 'totalHT' },
            { name: 'Total TVA', path: 'totalVAT' },
            { name: 'Total TTC', path: 'total' },
            { name: 'Devise', path: 'currency.symbol' }
          ]
        }
        typeSpecificFields.details = {
          title: 'Détails',
          fields: [
            { name: 'Conditions générales', path: 'generalConditions' },
            { name: 'Validité', path: 'validityPeriod' },
            { name: 'Notes', path: 'notes' }
          ]
        }
        break

      case 'payment':
        typeSpecificFields.details = {
          title: 'Détails paiement',
          fields: [
            { name: 'Méthode de paiement', path: 'paymentMethod' },
            { name: 'Référence', path: 'reference' },
            { name: 'Date paiement', path: 'paymentDate' },
            { name: 'Facture associée', path: 'linkedInvoice.number' },
            { name: 'Statut', path: 'status' }
          ]
        }
        typeSpecificFields.totals = {
          title: 'Montants',
          fields: [
            { name: 'Montant', path: 'amount' },
            { name: 'Frais', path: 'fees' },
            { name: 'Total', path: 'total' },
            { name: 'Devise', path: 'currency.symbol' }
          ]
        }
        break
    }

    return {
      ...commonFields,
      ...typeSpecificFields
    }
  }

  const templateFields = getTemplateFields()

  const renderSection = (sectionKey: SectionKey) => {
    const section = templateFields[sectionKey]
    if (!section || !section.fields?.length) return null

    return (
      <Collapsible 
        key={sectionKey}
        open={openSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 font-medium">
          <span>{section.title}</span>
          {openSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {section.fields.map((field) => (
            <Button
              key={field.path}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left h-8 px-2"
              onClick={() => onInsertField(field.template || field.path)}
              title={field.description}
            >
              {field.name}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={compact ? "w-64" : "w-full lg:w-64 bg-gray-50 p-4 rounded-lg border"}>
      <div className="space-y-2">
        {SECTION_ORDER.map(sectionKey => 
          renderSection(sectionKey)
        )}
      </div>
    </div>
  );
}