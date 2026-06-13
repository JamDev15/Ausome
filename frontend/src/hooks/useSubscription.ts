import { useAuthStore } from '../store/authStore';

export function useSubscription() {
  const user = useAuthStore((s) => s.user) as any;

  const isFullAccess: boolean = user?.is_full_access ?? false;
  const subscriptionStatus: string = user?.subscription_status ?? 'inactive';
  const subscriptionPlan: string = user?.subscription_plan ?? 'free_trial';
  const planChosen: boolean = user?.plan_chosen ?? false;

  const isTrial = subscriptionStatus === 'trial';
  const isActive = subscriptionStatus === 'active';
  const isExpired = subscriptionStatus === 'expired';

  return {
    isFullAccess,
    isActive,
    isTrial,
    isExpired,
    planChosen,
    subscriptionPlan,
    subscriptionStatus,
  };
}
