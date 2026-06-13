import apiClient from './client';

export interface SubscriptionStatus {
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  is_full_access: boolean;
  plan_chosen: boolean;
}

export const subscriptionApi = {
  startTrial: async (): Promise<SubscriptionStatus> => {
    const { data } = await apiClient.post('/subscription/trial');
    return data;
  },

  createCheckout: async (plan: 'family' | 'family_annual'): Promise<{ checkout_url: string; session_id: string }> => {
    const { data } = await apiClient.post('/subscription/checkout', { plan });
    return data;
  },

  getStatus: async (): Promise<SubscriptionStatus> => {
    const { data } = await apiClient.get('/subscription/status');
    return data;
  },
};
