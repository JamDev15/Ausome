import apiClient from './client';
import { AdminOverview, User, AuditLog } from '../types';

export const adminApi = {
  overview: async (): Promise<AdminOverview> => {
    const { data } = await apiClient.get('/admin/overview');
    return data;
  },

  listUsers: async (limit = 100): Promise<User[]> => {
    const { data } = await apiClient.get('/admin/users', { params: { limit } });
    return data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean) => {
    const { data } = await apiClient.patch(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    });
    return data;
  },

  loginEvents: async (limit = 100) => {
    const { data } = await apiClient.get('/admin/login-events', { params: { limit } });
    return data;
  },

  auditLogs: async (limit = 100): Promise<AuditLog[]> => {
    const { data } = await apiClient.get('/admin/audit-logs', { params: { limit } });
    return data;
  },

  reports: async () => {
    const { data } = await apiClient.get('/admin/reports');
    return data;
  },
};
