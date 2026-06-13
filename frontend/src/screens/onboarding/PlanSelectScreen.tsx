import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Linking, AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../types';
import { subscriptionApi } from '../../api/subscription';
import { useAuthStore } from '../../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OctopusMascot } from '../../components/common/OctopusMascot';
import { colors, spacing, radius } from '../../theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'PlanSelect'>;

type Plan = 'trial' | 'family' | 'family_annual';

interface PlanCard {
  id: Plan;
  badge?: string;
  title: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const PLANS: PlanCard[] = [
  {
    id: 'trial',
    title: 'Free Trial',
    price: '₱0',
    priceNote: '3 days full access',
    features: [
      'All premium features',
      'Personalized routine',
      'AAC board',
      'Behavior tracking',
      'No credit card needed',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    id: 'family',
    badge: 'Most Popular',
    title: 'Family',
    price: '₱199',
    priceNote: 'per month',
    features: [
      'Unlimited access',
      'Up to 3 child profiles',
      'AI assistant',
      'Medicine reminders',
      'Goal tracking',
    ],
    cta: 'Subscribe Monthly',
    highlighted: true,
  },
  {
    id: 'family_annual',
    badge: 'Best Value',
    title: 'Family Annual',
    price: '₱1,499',
    priceNote: 'per year · save 37%',
    features: [
      'Everything in Family',
      'Priority support',
      'New features first',
      'Offline mode (coming soon)',
    ],
    cta: 'Subscribe Yearly',
    highlighted: false,
  },
];

export const PlanSelectScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const setUser = useAuthStore((s) => s.setUser);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  };

  const startPolling = () => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const status = await subscriptionApi.getStatus();
        if (status.is_full_access) {
          stopPolling();
          setLoading(null);
          setUser({
            plan_chosen: true,
            subscription_plan: status.subscription_plan,
            subscription_status: status.subscription_status,
            subscription_ends_at: status.subscription_ends_at,
            is_full_access: true,
          } as any);
          navigation.replace('LanguageSelect');
        }
      } catch {
        // silently retry
      }
    }, 3000);
  };

  const handleAppStateChange = (nextState: string) => {
    if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
      // App came to foreground — user may have completed payment
      if (polling) {
        subscriptionApi.getStatus().then((status) => {
          if (status.is_full_access) {
            stopPolling();
            setLoading(null);
            setUser({
              plan_chosen: true,
              subscription_plan: status.subscription_plan,
              subscription_status: status.subscription_status,
              subscription_ends_at: status.subscription_ends_at,
              is_full_access: true,
            } as any);
            navigation.replace('LanguageSelect');
          }
        }).catch(() => {});
      }
    }
    appStateRef.current = nextState as any;
  };

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
      stopPolling();
    };
  }, [polling]);

  const handleSelect = async (plan: Plan) => {
    if (loading) return;
    setLoading(plan);

    try {
      if (plan === 'trial') {
        const status = await subscriptionApi.startTrial();
        setUser({
          plan_chosen: true,
          subscription_plan: status.subscription_plan,
          subscription_status: status.subscription_status,
          trial_ends_at: status.trial_ends_at,
          is_full_access: true,
        } as any);
        navigation.replace('LanguageSelect');
      } else {
        const { checkout_url } = await subscriptionApi.createCheckout(plan as 'family' | 'family_annual');
        await Linking.openURL(checkout_url);
        startPolling();
      }
    } catch (err) {
      setLoading(null);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <OctopusMascot size={100} />
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>
          Support your child's journey with tools built for autism caregivers.
        </Text>
      </View>

      {polling && (
        <View style={styles.waitingBanner}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.waitingText}>
            Waiting for payment confirmation…
          </Text>
        </View>
      )}

      {PLANS.map((plan) => (
        <PlanCardView
          key={plan.id}
          plan={plan}
          loading={loading === plan.id}
          disabled={!!loading}
          onSelect={() => handleSelect(plan.id)}
        />
      ))}

      <Text style={styles.legal}>
        Subscriptions auto-renew. Cancel anytime. Prices in Philippine Peso (₱).
      </Text>
    </ScrollView>
  );
};

interface PlanCardViewProps {
  plan: PlanCard;
  loading: boolean;
  disabled: boolean;
  onSelect: () => void;
}

const PlanCardView: React.FC<PlanCardViewProps> = ({ plan, loading, disabled, onSelect }) => (
  <TouchableOpacity
    style={[styles.card, plan.highlighted && styles.cardHighlighted]}
    onPress={onSelect}
    disabled={disabled}
    activeOpacity={0.8}
  >
    {plan.badge && (
      <View style={[styles.badge, plan.id === 'family_annual' && styles.badgeGreen]}>
        <Text style={styles.badgeText}>{plan.badge}</Text>
      </View>
    )}

    <View style={styles.cardHeader}>
      <Text style={[styles.planTitle, plan.highlighted && styles.planTitleHighlighted]}>
        {plan.title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, plan.highlighted && styles.priceHighlighted]}>
          {plan.price}
        </Text>
        <Text style={styles.priceNote}>{plan.priceNote}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    {plan.features.map((f) => (
      <View key={f} style={styles.featureRow}>
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={plan.highlighted ? colors.primary : colors.secondary}
        />
        <Text style={styles.featureText}>{f}</Text>
      </View>
    ))}

    <TouchableOpacity
      style={[styles.ctaBtn, plan.highlighted && styles.ctaBtnHighlighted, disabled && styles.ctaBtnDisabled]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={plan.highlighted ? colors.white : colors.primary} size="small" />
      ) : (
        <Text style={[styles.ctaText, plan.highlighted && styles.ctaTextHighlighted]}>
          {plan.cta}
        </Text>
      )}
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.xl,
    paddingTop: 0,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  waitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  waitingText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHighlighted: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeGreen: {
    backgroundColor: colors.secondary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeader: { marginBottom: spacing.xs },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  planTitleHighlighted: { color: colors.primaryDark },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  priceHighlighted: { color: colors.primary },
  priceNote: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  ctaBtn: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ctaBtnHighlighted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  ctaTextHighlighted: { color: colors.white },
  legal: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.xs,
  },
});
