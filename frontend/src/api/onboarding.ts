import apiClient from './client';
import { RoutineBlock, ParentGoalData } from '../types';

export interface SurveyPayload {
  child_name?: string;
  child_age?: number;
  diagnosis_year?: number;
  communication_level?: string;
  challenges?: string[];
  strengths?: string[];
  strengths_freetext?: string;
  wake_time?: string;
  school_start?: string;
  school_end?: string;
  bedtime?: string;
  screen_time?: string;
  parent_goals?: string[];
  support_system?: string[];
  current_step?: number;
}

export const onboardingApi = {
  setLanguage: async (language: 'en' | 'tl') => {
    const { data } = await apiClient.post('/onboarding/language', { language });
    return data;
  },

  saveSurvey: async (payload: SurveyPayload) => {
    const { data } = await apiClient.post('/onboarding/survey', payload);
    return data;
  },

  getSurvey: async (): Promise<SurveyPayload> => {
    const { data } = await apiClient.get('/onboarding/survey');
    return data;
  },

  complete: async (): Promise<{
    routine: RoutineBlock[];
    goals: ParentGoalData[];
    child_id?: string;
  }> => {
    const { data } = await apiClient.post('/onboarding/complete');
    return data;
  },

  getRoutine: async (childId?: string): Promise<RoutineBlock[]> => {
    const { data } = await apiClient.get('/onboarding/routine', {
      params: childId ? { child_id: childId } : undefined,
    });
    return data;
  },

  getGoals: async (childId?: string): Promise<ParentGoalData[]> => {
    const { data } = await apiClient.get('/onboarding/goals', {
      params: childId ? { child_id: childId } : undefined,
    });
    return data;
  },
};
