import apiClient from './client';
import { BehaviorLog, BehaviorSummary } from '../types';

export const behaviorApi = {
  list: async (childId: string, limit = 50): Promise<BehaviorLog[]> => {
    const { data } = await apiClient.get('/behavior-logs/', {
      params: { child_id: childId, limit },
    });
    return data;
  },

  create: async (payload: Partial<BehaviorLog>): Promise<BehaviorLog> => {
    const { data } = await apiClient.post('/behavior-logs/', payload);
    return data;
  },

  summary: async (childId: string): Promise<BehaviorSummary> => {
    const { data } = await apiClient.get('/behavior-logs/summary', {
      params: { child_id: childId },
    });
    return data;
  },
};
