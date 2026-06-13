import apiClient from './client';
import { ChatResponse } from '../types';

export const aiApi = {
  chat: async (message: string, childId?: string, conversationId?: string): Promise<ChatResponse> => {
    const { data } = await apiClient.post('/ai/chat', {
      message,
      child_id: childId,
      conversation_id: conversationId,
    });
    return data;
  },

  conversations: async () => {
    const { data } = await apiClient.get('/ai/conversations');
    return data;
  },
};
