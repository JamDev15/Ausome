import apiClient from './client';
import { Reward, TokenBalance } from '../types';

export const rewardsApi = {
  list: async (childId: string): Promise<Reward[]> => {
    const { data } = await apiClient.get('/rewards/', { params: { child_id: childId } });
    return data;
  },

  create: async (payload: Partial<Reward>): Promise<Reward> => {
    const { data } = await apiClient.post('/rewards/', payload);
    return data;
  },

  addTransaction: async (payload: {
    child_id: string;
    reward_id?: string;
    token_delta: number;
    reason?: string;
    source?: string;
  }) => {
    const { data } = await apiClient.post('/rewards/transactions', payload);
    return data;
  },

  getBalance: async (childId: string): Promise<TokenBalance> => {
    const { data } = await apiClient.get('/rewards/balance', {
      params: { child_id: childId },
    });
    return data;
  },
};
