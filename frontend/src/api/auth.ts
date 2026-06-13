import apiClient from './client';
import { TokenResponse } from '../types';

export const authApi = {
  login: async (login: string, password: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/login', { login, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    full_name: string,
    role: string = 'parent'
  ): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/register', {
      email, password, full_name, role,
    });
    return data;
  },

  refresh: async (refresh_token: string): Promise<TokenResponse> => {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token });
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (email: string, code: string, new_password: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { email, code, new_password });
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  updateProfile: async (payload: { full_name?: string; phone?: string }) => {
    const { data } = await apiClient.patch('/auth/me', payload);
    return data;
  },

  changePassword: async (current_password: string, new_password: string) => {
    const { data } = await apiClient.post('/auth/change-password', { current_password, new_password });
    return data;
  },
};
