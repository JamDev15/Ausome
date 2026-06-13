import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, fontSizes, spacing } from '../../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  small?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  small = false,
}) => (
  <View style={[styles.badge, styles[variant], small && styles.small, style]}>
    <Text style={[styles.text, styles[`text_${variant}`], small && styles.smallText]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  smallText: {
    fontSize: fontSizes.xs,
  },

  primary: { backgroundColor: colors.primaryLight },
  success: { backgroundColor: colors.successLight },
  warning: { backgroundColor: colors.warningLight },
  error: { backgroundColor: colors.errorLight },
  info: { backgroundColor: colors.infoLight },
  neutral: { backgroundColor: colors.surfaceElevated },

  text_primary: { color: colors.primary },
  text_success: { color: colors.success },
  text_warning: { color: colors.warning },
  text_error: { color: colors.error },
  text_info: { color: colors.info },
  text_neutral: { color: colors.textSecondary },
});
