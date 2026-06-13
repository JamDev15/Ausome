import apiClient from './client';

export interface ActivityProgressData {
  completed_stages: number[];
  total_sessions: number;
  high_scores: Record<string, number>;
  last_played_at: string | null;
}

export type AllActivityProgress = Record<string, ActivityProgressData>;

export const activitiesApi = {
  getProgress: async (childId: string): Promise<AllActivityProgress> => {
    const { data } = await apiClient.get(`/activities/${childId}/progress`);
    return data;
  },

  completeStage: async (
    childId: string,
    activityType: string,
    stage: number,
    score?: number,
  ) => {
    const { data } = await apiClient.post('/activities/progress/complete', {
      child_id: childId,
      activity_type: activityType,
      stage,
      score,
    });
    return data as { ok: boolean; completed_stages: number[] };
  },
};
