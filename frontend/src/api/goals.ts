import apiClient from './client';
import { Goal, ProgressEntry } from '../types';

export const goalsApi = {
  list: async (childId: string): Promise<Goal[]> => {
    const { data } = await apiClient.get('/goals/', { params: { child_id: childId } });
    return data;
  },

  create: async (payload: Partial<Goal>): Promise<Goal> => {
    const { data } = await apiClient.post('/goals/', payload);
    return data;
  },

  update: async (goalId: string, payload: Partial<Goal>): Promise<Goal> => {
    const { data } = await apiClient.patch(`/goals/${goalId}`, payload);
    return data;
  },

  addProgress: async (payload: Partial<ProgressEntry>): Promise<ProgressEntry> => {
    const { data } = await apiClient.post('/goals/progress', payload);
    return data;
  },
};
