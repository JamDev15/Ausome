import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'ausome_offline_queue';

export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: any;
  createdAt: number;
}

export const offlineQueue = {
  async add(mutation: Omit<QueuedMutation, 'id' | 'createdAt'>): Promise<void> {
    const queue = await offlineQueue.getAll();
    queue.push({
      ...mutation,
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async getAll(): Promise<QueuedMutation[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  async remove(id: string): Promise<void> {
    const queue = await offlineQueue.getAll();
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(q => q.id !== id)));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
