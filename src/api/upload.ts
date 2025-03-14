import { Upload } from '@/types';
import axios from './axios';

const findAll = async (): Promise<Upload[]> => {
  const response = await axios.get(`public/storage/all`);
  return response.data;
};

const findOne = async (id: number): Promise<Upload> => {
  const response = await axios.get(`public/storage/${id}`);
  return response.data;
};

const uploadFile = async (file: File): Promise<{ id?: number; error?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('public/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('File uploaded successfully:', response.data);

    // Assurez-vous que la réponse contient un ID
    if (response.data && response.data.id) {
      return { id: response.data.id };
    } else {
      return { error: 'No ID returned from server' };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error: 'Failed to upload file' };
  }
};

const uploadFiles = async (files: File[]): Promise<number[]> => {
  const uploadIds: number[] = [];

  for (const file of files) {
    const result = await uploadFile(file);

    if (result.id) {
      uploadIds.push(result.id); // Ajoutez l'ID si l'upload a réussi
    } else {
      console.error(`Failed to upload file: ${file.name}`); // Log l'erreur
    }
  }

  return uploadIds;
};

const fetchBlobBySlug = async (slug?: string): Promise<Blob | null> => {
  try {
    const response = await axios.get(`public/storage/file/slug/${slug}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

const fetchBlobById = async (id?: number): Promise<Blob | null> => {
  try {
    const response = await axios.get(`public/storage/file/id/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

const downloadFile = async (slug: string): Promise<void> => {
  const response = await axios.get(`public/storage/file/${slug}`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', slug);
  document.body.appendChild(link);
  link.click();
};

export const upload = {
  findAll,
  findOne,
  uploadFile,
  uploadFiles,
  fetchBlobBySlug,
  fetchBlobById,
  downloadFile
};
