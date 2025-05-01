import { CreateTemplateDto, Template, TemplateType, UpdateTemplateDto } from '@/types/template';
import axios from './axios';
import { isAlphabeticOrSpace } from '@/utils/validations/string.validations';
import { ToastValidation } from '@/types';
import { AxiosError } from 'axios';


const create = async (template: CreateTemplateDto): Promise<Template> => {
  const response = await axios.post<Template>('public/templates', template);
  return response.data;
};

const factory = (): CreateTemplateDto => {
  return {
    name: '',
    content: '',
    type: TemplateType.INVOICE,
    isDefault: false,
    sequentialNumber: ''
  };
};

const getAll = async (): Promise<Template[]> => {
  const response = await axios.get<Template[]>('public/templates');
  return response.data;
};

const findByType = async (type: TemplateType): Promise<Template[]> => {
  try {
    console.log(`Fetching templates for type: ${type}`); // Debug
    const response = await axios.get<Template[]>('public/templates/by-type', {
      params: { type },
      paramsSerializer: { indexes: null } // Pour les paramètres arrays si besoin
    });
    console.log('Received templates:', response.data); // Debug
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw new Error(
      `Failed to fetch templates for type ${type}`
    );
  }
};

const getDefault = async (type: TemplateType): Promise<Template> => {
    try {
      const response = await axios.get<Template>('public/templates/default', {
        params: { type }
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error(`Aucun template par défaut trouvé pour le type ${type}`);
        }
      }
      throw error;
    }
  };

const validate = (template: Partial<CreateTemplateDto>): ToastValidation => {
  if (!template.name) return { message: 'Le nom est obligatoire' };
  if (!isAlphabeticOrSpace(template.name))
    return { message: 'Le nom du template doit être alphabétique' };
  if (!template.content) return { message: 'Le contenu est obligatoire' };
  if (!template.type) return { message: 'Le type est obligatoire' };
  return { message: '' };
};

const update = async (id: number, template: UpdateTemplateDto): Promise<Template> => {
  const response = await axios.put<Template>(`public/templates/${id}`, template);
  return response.data;
};

const remove = async (id: number): Promise<void> => {
    try {
      await axios.delete(`public/templates/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          throw new Error('Suppression interdite (isDeletionRestricted)');
        }
      }
      throw error;
    }
  };

  const getById = async (id: number): Promise<Template> => {
    try {
      const response = await axios.get<Template>(`public/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error(`Template avec l'ID ${id} non trouvé`);
        }
      }
      throw new Error('Erreur lors de la récupération du template');
    }
  };
  const exportTemplate = async (
    id: number, 
    format: 'pdf' | 'png' | 'docx' | 'jpeg',
    data?: Record<string, any> // Ajout du paramètre optionnel pour les données dynamiques
  ): Promise<Blob> => {
    try {
      const response = await axios({
        method: 'post', // Changement en POST pour envoyer les données
        url: `public/templates/${id}/export/${format}`,
        data: data || {}, // Envoi des données dynamiques
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.data) {
        throw new Error('Aucune donnée reçue lors de l\'export');
      }
  
      return response.data;
    } catch (error) {
      console.error('Export error:', error);
      
      let errorMessage = 'Échec de l\'export';
      if (error instanceof AxiosError) {
        if (error.response?.data instanceof Blob) {
          // Si le serveur renvoie une erreur sous forme de Blob (comme un PDF d'erreur)
          const errorText = await error.response.data.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } else {
          errorMessage = error.response?.data?.message || error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      throw new Error(errorMessage);
    }
  };
  
export const templateApi = {
  create,
  factory,
  getAll,
  findByType,
  getDefault,
  update,
  remove,
  validate,
  getById,
  exportTemplate,
};