import apiClient from './client';
import { CaregiverNote } from '../types';

export const notesApi = {
  list: async (childId: string, category?: string): Promise<CaregiverNote[]> => {
    const { data } = await apiClient.get('/notes/', {
      params: { child_id: childId, category },
    });
    return data;
  },

  create: async (payload: Partial<CaregiverNote>): Promise<CaregiverNote> => {
    const { data } = await apiClient.post('/notes/', payload);
    return data;
  },

  update: async (noteId: string, payload: Partial<CaregiverNote>): Promise<CaregiverNote> => {
    const { data } = await apiClient.patch(`/notes/${noteId}`, payload);
    return data;
  },

  delete: async (noteId: string) => {
    await apiClient.delete(`/notes/${noteId}`);
  },
};
