import apiClient from './client';

export type EpisodeType = 'seizure' | 'absence' | 'epilepsy' | 'meltdown' | 'panic' | 'fever' | 'injury' | 'other';
export type EpisodeSeverity = 'mild' | 'moderate' | 'severe';

export interface Episode {
  id: string;
  episode_type: EpisodeType;
  started_at: string;
  duration_minutes: number | null;
  severity: EpisodeSeverity | null;
  triggers: string | null;
  symptoms: string | null;
  intervention: string | null;
  outcome: string | null;
  emergency_called: boolean;
  notes: string | null;
  created_at: string;
}

export const episodesApi = {
  list: async (childId: string): Promise<Episode[]> => {
    const { data } = await apiClient.get(`/episodes/${childId}`);
    return data;
  },

  log: async (payload: {
    child_id: string;
    episode_type: EpisodeType;
    started_at?: string;
    duration_minutes?: number;
    severity?: EpisodeSeverity;
    triggers?: string;
    symptoms?: string;
    intervention?: string;
    outcome?: string;
    emergency_called?: boolean;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/episodes/', payload);
    return data;
  },

  update: async (episodeId: string, payload: Partial<Omit<Episode, 'id' | 'created_at'>>) => {
    const { data } = await apiClient.patch(`/episodes/${episodeId}`, payload);
    return data;
  },

  remove: async (episodeId: string) => {
    const { data } = await apiClient.delete(`/episodes/${episodeId}`);
    return data;
  },
};
