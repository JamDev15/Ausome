import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from './Button';
import { colors, spacing, radius } from '../../theme';

interface PaywallGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({
  children,
  fallback,
  featureName,
}) => {
  const { isFullAccess } = useSubscription();

  if (isFullAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <View style={styles.container}>
      <Text style={styles.lock}>🔒</Text>
      <Text style={styles.title}>
        {featureName ? `${featureName} is a premium feature` : 'Premium Feature'}
      </Text>
      <Text style={styles.subtitle}>
        Upgrade to unlock full access to all Ausome features.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    backgroundColor: colors.background,
  },
  lock: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
