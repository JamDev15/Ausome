import apiClient from './client';
import { ChildProfile } from '../types';

export const childrenApi = {
  list: async (): Promise<ChildProfile[]> => {
    const { data } = await apiClient.get('/children/');
    return data;
  },

  get: async (id: string): Promise<ChildProfile> => {
    const { data } = await apiClient.get(`/children/${id}`);
    return data;
  },

  create: async (payload: Partial<ChildProfile>): Promise<ChildProfile> => {
    const { data } = await apiClient.post('/children/', payload);
    return data;
  },

  update: async (id: string, payload: Partial<ChildProfile>): Promise<ChildProfile> => {
    const { data } = await apiClient.patch(`/children/${id}`, payload);
    return data;
  },

  updateSensory: async (id: string, payload: Record<string, string>) => {
    const { data } = await apiClient.put(`/children/${id}/sensory`, payload);
    return data;
  },

  inviteTeamMember: async (childId: string, payload: {
    email: string;
    full_name: string;
    role: 'caregiver' | 'therapist';
  }) => {
    const { data } = await apiClient.post(`/children/${childId}/team`, payload);
    return data;
  },

  removeTeamMember: async (childId: string, memberId: string) => {
    await apiClient.delete(`/children/${childId}/team/${memberId}`);
  },
};
