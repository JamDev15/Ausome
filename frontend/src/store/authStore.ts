import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenResponse, User, UserRole } from '../types';
import { useChildStore } from './childStore';
import { subscriptionApi } from '../api/subscription';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: Partial<User> | null;
  role: UserRole | null;

  setAuth: (response: TokenResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: Partial<User>) => void;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,

      setAuth: (response: TokenResponse) => {
        set({
          isAuthenticated: true,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          role: response.role,
          user: {
            id: response.user_id,
            full_name: response.full_name,
            role: response.role,
            child_profile_id: response.child_profile_id,
            preferred_language: response.preferred_language ?? 'en',
            onboarding_completed: response.onboarding_completed ?? false,
            plan_chosen: response.plan_chosen ?? false,
            subscription_plan: response.subscription_plan ?? 'free_trial',
            subscription_status: response.subscription_status ?? 'inactive',
            trial_ends_at: response.trial_ends_at ?? null,
            subscription_ends_at: response.subscription_ends_at ?? null,
            is_full_access: response.is_full_access ?? false,
          } as any,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUser: (user) => {
        set((state) => ({ user: { ...state.user, ...user } }));
      },

      logout: () => {
        useChildStore.getState().clearAll();
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        });
      },

      refreshSubscription: async () => {
        try {
          const status = await subscriptionApi.getStatus();
          set((state) => ({
            user: {
              ...state.user,
              plan_chosen: status.plan_chosen,
              subscription_plan: status.subscription_plan,
              subscription_status: status.subscription_status,
              trial_ends_at: status.trial_ends_at,
              subscription_ends_at: status.subscription_ends_at,
              is_full_access: status.is_full_access,
            } as any,
          }));
        } catch {
          // network errors silently ignored — cached value stays
        }
      },
    }),
    {
      name: 'ausome-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
      }),
    }
  )
);
