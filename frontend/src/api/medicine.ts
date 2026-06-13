import apiClient from './client';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  color: string | null;
  notes: string | null;
  taken_today: boolean;
  created_at: string;
}

export interface DoseHistory {
  id: string;
  medicine_name: string;
  taken_at: string;
  notes: string | null;
}

export const medicineApi = {
  list: async (childId: string): Promise<Medicine[]> => {
    const { data } = await apiClient.get(`/medicine/${childId}`);
    return data;
  },

  create: async (payload: {
    child_id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    color?: string;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/medicine/', payload);
    return data;
  },

  update: async (medicineId: string, payload: Partial<{
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    color: string;
    notes: string;
    is_active: boolean;
  }>) => {
    const { data } = await apiClient.patch(`/medicine/${medicineId}`, payload);
    return data;
  },

  remove: async (medicineId: string) => {
    const { data } = await apiClient.delete(`/medicine/${medicineId}`);
    return data;
  },

  markTaken: async (childId: string, medicineId: string, notes?: string) => {
    const { data } = await apiClient.post('/medicine/dose/mark-taken', {
      child_id: childId,
      medicine_id: medicineId,
      notes,
    });
    return data;
  },

  doseHistory: async (childId: string): Promise<DoseHistory[]> => {
    const { data } = await apiClient.get(`/medicine/${childId}/doses/history`);
    return data;
  },
};
