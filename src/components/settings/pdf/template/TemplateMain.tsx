'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CreditCard, FileSearch, FileText } from 'lucide-react'
import { TemplateList } from './TemplateList'
import { TemplateTypeCard } from './TemplateTypeCard'
import { TemplateType } from '@/types/template'

export function TemplateMain() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold">Modèles de documents</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez un type de document pour créer ou gérer vos modèles
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Vos modèles existants</h2>
        <Tabs defaultValue={TemplateType.INVOICE}>
          <TabsList>
            <TabsTrigger value={TemplateType.INVOICE}>Factures</TabsTrigger>
            <TabsTrigger value={TemplateType.QUOTATION}>Devis</TabsTrigger>
            <TabsTrigger value={TemplateType.PAYMENT}>Paiements</TabsTrigger>
          </TabsList>
          <TabsContent value={TemplateType.INVOICE} className="pt-4">
            <TemplateList type={TemplateType.INVOICE} />
          </TabsContent>
          <TabsContent value={TemplateType.QUOTATION} className="pt-4">
            <TemplateList type={TemplateType.QUOTATION} />
          </TabsContent>
          <TabsContent value={TemplateType.PAYMENT} className="pt-4">
            <TemplateList type={TemplateType.PAYMENT} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TemplateTypeCard
          type={TemplateType.QUOTATION}
          title="Devis"
          icon={<FileSearch className="w-6 h-6" />}
          description="Créer des modèles de devis personnalisés"
        />
        <TemplateTypeCard
          type={TemplateType.INVOICE}
          title="Factures"
          icon={<FileText className="w-6 h-6" />}
          description="Créer des modèles de factures professionnelles"
        />
        <TemplateTypeCard
          type={TemplateType.PAYMENT}
          title="Paiements"
          icon={<CreditCard className="w-6 h-6" />}
          description="Créer des reçus et confirmations de paiement"
        />
      </div>
    </div>
  )
}