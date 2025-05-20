import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '@/api';
import { CreateArticleDto, ArticleExtractedData } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Spinner } from '@/components/common/Spinner';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { FileUploader } from '@/components/ui/file-uploader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PackagePlus, ImageIcon, FileTextIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const CreateArticlePage = () => {
  const { t } = useTranslation('article');
  const router = useRouter();
  const { setRoutes } = useBreadcrumb();

  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    description: '',
    reference: 'REF-',
    unitPrice: 0,
    quantityInStock: 0,
    status: 'draft',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<ArticleExtractedData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('form');

  // Set breadcrumb routes
  useEffect(() => {
    setRoutes([
      { title: t('Gestion des stocks'), href: '/articles' },
      { title: t('Liste des articles'), href: '/article/article-Lists' },
      { title: t('Nouvel article') },
    ]);
  }, [t, setRoutes]);

  // Format reference number with REF- prefix
  const handleReferenceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.length < 4 && !value.startsWith('REF-')) {
      return;
    }
    
    const baseValue = value.startsWith('REF-') ? value : `REF-${value}`;
    const numbersOnly = baseValue.replace(/[^0-9-]/g, '');
    
    let formattedValue = 'REF-';
    const cleanValue = numbersOnly.replace('REF-', '').replace(/-/g, '');
    
    if (cleanValue.length > 0) {
      formattedValue += cleanValue.substring(0, 6);
      if (cleanValue.length > 6) {
        formattedValue += '-' + cleanValue.substring(6, 9);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      reference: formattedValue
    }));
  }, []);

  // Handle form field changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: ['unitPrice', 'quantityInStock'].includes(name) 
          ? Number(value) 
          : value
      }));
    },
    []
  );

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const numericReference = formData.reference.replace('REF-', '').replace('-', '');
      const formDataToSend = {
        ...formData,
        reference: numericReference,
        justificatifFile: justificatifFile || undefined
      };

      const result = await api.article.create(formDataToSend);
      if (result) {
        toast.success(t('Article créé avec succès'));
        router.push('/article/article-Lists');
      }
    } catch (error) {
      console.error('Create article error:', error);
      toast.error(t('Erreur lors de la création de l\'article'));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to initial state
  const handleReset = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      reference: 'REF-',
      unitPrice: 0,
      quantityInStock: 0,
      status: 'draft',
      notes: '',
    });
    setJustificatifFile(null);
    setOcrResult(null);
    setOcrError(null);
    setActiveTab('form');
  }, []);

  // Extract data from file (image or PDF)
  const handleExtractFromFile = useCallback(async (file: File, isPdf: boolean = false) => {
    setOcrLoading(true);
    setOcrError(null);
    
    try {
      const result = await api.article.extractFromImage(file);
      
      // Format reference to include REF- prefix if not already present
      const formattedReference = result.reference 
        ? `REF-${result.reference.replace(/^REF-/, '')}`
        : formData.reference;

      setOcrResult(result);
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        reference: formattedReference,
        unitPrice: result.unitPrice || prev.unitPrice,
        description: result.description || prev.description,
        quantityInStock: result.quantityInStock || prev.quantityInStock,
        status: result.status || prev.status,
        notes: result.notes || prev.notes,
      }));
      
      setActiveTab('review');
      toast.success(t('Informations extraites avec succès'));
    } catch (error) {
      console.error('Extraction Error:', error);
      setOcrError(
        isPdf 
          ? t('Erreur lors de l\'extraction des données PDF. Veuillez vérifier la qualité du document.')
          : t('Erreur lors de l\'extraction des données. Veuillez vérifier la qualité de l\'image.')
      );
      toast.error(t('Erreur lors de l\'extraction des données'));
    } finally {
      setOcrLoading(false);
    }
  }, [formData.reference, t]);

  // Apply OCR results to form
  const applyOcrResult = useCallback(() => {
    if (!ocrResult) return;
    
    setFormData(prev => ({
      ...prev,
      title: ocrResult.title || prev.title,
      reference: ocrResult.reference 
        ? `REF-${ocrResult.reference.replace(/^REF-/, '')}` 
        : prev.reference,
      unitPrice: ocrResult.unitPrice || prev.unitPrice,
      description: ocrResult.description || prev.description,
      quantityInStock: ocrResult.quantityInStock || prev.quantityInStock,
      status: ocrResult.status || prev.status,
      notes: ocrResult.notes || prev.notes,
    }));
    
    setActiveTab('form');
    toast.success(t('Informations appliquées avec succès'));
  }, [ocrResult, t]);

  // File input handlers
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleExtractFromFile(e.target.files[0], false);
      }
    },
    [handleExtractFromFile]
  );

  const handlePdfUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleExtractFromFile(e.target.files[0], true);
      }
    },
    [handleExtractFromFile]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackagePlus className="h-5 w-5" />
          {t('Nouvel article')}
        </CardTitle>
        <CardDescription>
          {t('Remplissez les champs ci-dessous pour créer un nouvel article')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex flex-col h-[calc(100vh-180px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-2 w-[400px] mb-4">
            <TabsTrigger value="form">{t('Formulaire')}</TabsTrigger>
            <TabsTrigger value="review" disabled={!ocrResult}>
              {t('Revue OCR')}
              {ocrResult && <Badge className="ml-2" variant="secondary">Nouveau</Badge>}
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={ocrLoading}
              className="flex items-center gap-2"
            >
              {ocrLoading ? (
                <Spinner className="mr-2" size="small" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {t('Extraire depuis image')}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              disabled={ocrLoading}
              className="flex items-center gap-2"
            >
              {ocrLoading ? (
                <Spinner className="mr-2" size="small" />
              ) : (
                <FileTextIcon className="h-4 w-4" />
              )}
              {t('Extraire depuis PDF')}
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </Button>
          </div>

          {ocrError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {ocrError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <TabsContent value="form" className="flex-1">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('Informations générales')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">{t('Titre')}</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={t('Nom de l\'article')}
                            className="text-sm h-9"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">{t('Description')}</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder={t('Description détaillée de l\'article')}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reference">{t('Référence')}</Label>
                          <Input
                            id="reference"
                            name="reference"
                            value={formData.reference}
                            onChange={handleReferenceChange}
                            placeholder="REF-123456-789"
                            className="text-sm h-9"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('Format: REF-123456-789')}
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="status">{t('Statut')}</Label>
                          <Select
                            name="status"
                            value={formData.status}
                            onValueChange={(value) => setFormData({...formData, status: value})}
                          >
                            <SelectTrigger className="text-sm h-9">
                              <SelectValue placeholder={t('Sélectionner un statut')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">{t('Brouillon')}</SelectItem>
                              <SelectItem value="active">{t('Actif')}</SelectItem>
                              <SelectItem value="inactive">{t('Inactif')}</SelectItem>
                              <SelectItem value="archived">{t('Archivé')}</SelectItem>
                              <SelectItem value="out_of_stock">{t('En rupture')}</SelectItem>
                              <SelectItem value="pending_review">{t('En revue')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('Tarification et stock')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="unitPrice">{t('Prix unitaire')}</Label>
                        <Input
                          id="unitPrice"
                          name="unitPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={handleChange}
                          placeholder={t('Prix en euros')}
                          className="text-sm h-9"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="quantityInStock">{t('Quantité en stock')}</Label>
                        <Input
                          id="quantityInStock"
                          name="quantityInStock"
                          type="number"
                          min="0"
                          value={formData.quantityInStock}
                          onChange={handleChange}
                          placeholder={t('Nombre disponible')}
                          className="text-sm h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('Informations complémentaires')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="notes">{t('Notes internes')}</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          placeholder={t('Informations supplémentaires pour votre équipe')}
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label>{t('Justificatif')}</Label>
                        <FileUploader
                          accept={{
                            'image/*': [],
                            'application/pdf': [],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
                            'application/msword': [],
                          }}
                          maxFileCount={1}
                          value={justificatifFile ? [justificatifFile] : []}
                          onValueChange={(files) => {
                            setJustificatifFile(files.length > 0 ? files[0] : null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="review" className="flex-1">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('Résultats de l\'extraction OCR')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>{t('Titre extrait')}</Label>
                          <div className="p-3 border rounded-md bg-gray-50 text-sm">
                            {ocrResult?.title || t('Aucun titre détecté')}
                          </div>
                        </div>
                        
                        <div>
                          <Label>{t('Description extraite')}</Label>
                          <div className="p-3 border rounded-md bg-gray-50 text-sm min-h-[100px]">
                            {ocrResult?.description || t('Aucune description détectée')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>{t('Référence extraite')}</Label>
                          <div className="p-3 border rounded-md bg-gray-50 text-sm">
                            {ocrResult?.reference || t('Aucune référence détectée')}
                          </div>
                        </div>
                        
                        <div>
                          <Label>{t('Prix unitaire extrait')}</Label>
                          <div className="p-3 border rounded-md bg-gray-50 text-sm">
                            {ocrResult?.unitPrice ? `${ocrResult.unitPrice.toFixed(2)} €` : t('Aucun prix détecté')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('form')}
                        className="h-8 px-4 text-sm"
                      >
                        {t('Ignorer les résultats')}
                      </Button>
                      <Button
                        type="button"
                        onClick={applyOcrResult}
                        className="h-8 px-4 text-sm"
                      >
                        {t('Appliquer les modifications')}
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  className="h-8 px-4 text-sm"
                >
                  {t('Réinitialiser')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-8 px-4 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" size="small" />
                      {t('Enregistrement...')}
                    </>
                  ) : t('Enregistrer l\'article')}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreateArticlePage;