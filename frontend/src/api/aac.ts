import apiClient from './client';
import { AACCategory, AACItem } from '../types';

export const aacApi = {
  getCategories: async (childId?: string): Promise<AACCategory[]> => {
    const { data } = await apiClient.get('/aac/categories', {
      params: childId ? { child_id: childId } : {},
    });
    return data;
  },

  createCategory: async (payload: Partial<AACCategory>): Promise<AACCategory> => {
    const { data } = await apiClient.post('/aac/categories', payload);
    return data;
  },

  getItems: async (params: {
    category_id?: string;
    child_id?: string;
    favorites_only?: boolean;
  }): Promise<AACItem[]> => {
    const { data } = await apiClient.get('/aac/items', { params });
    return data;
  },

  createItem: async (payload: Partial<AACItem>): Promise<AACItem> => {
    const { data } = await apiClient.post('/aac/items', payload);
    return data;
  },

  recordUsage: async (itemId: string) => {
    await apiClient.post('/aac/items/use', { item_id: itemId });
  },

  toggleFavorite: async (itemId: string): Promise<{ is_favorite: boolean }> => {
    const { data } = await apiClient.patch(`/aac/items/${itemId}/favorite`);
    return data;
  },
};
