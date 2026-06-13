import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminReports'> };

const BarItem: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <View style={barStyles.row}>
    <Text style={barStyles.label} numberOfLines={1}>{label}</Text>
    <View style={barStyles.barWrapper}>
      <View style={[barStyles.bar, { width: max > 0 ? `${(value / max) * 100}%` : '0%', backgroundColor: color }]} />
    </View>
    <Text style={barStyles.value}>{value}</Text>
  </View>
);

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  label: { width: 100, fontSize: fontSizes.xs, color: colors.textSecondary },
  barWrapper: { flex: 1, height: 12, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginHorizontal: spacing.sm },
  bar: { height: '100%', borderRadius: radius.full },
  value: { fontSize: fontSizes.xs, color: colors.textTertiary, minWidth: 24, textAlign: 'right' },
});

export const AdminReportsScreen: React.FC<Props> = ({ navigation }) => {
  const { data: reports, isLoading } = useQuery({ queryKey: ['admin-reports'], queryFn: adminApi.reports });
  if (isLoading) return <Loading fullScreen />;

  const maxBehavior = Math.max(...(reports?.behavior_trends?.map((r: any) => r.value) ?? [1]));
  const maxAAC = Math.max(...(reports?.top_aac_items?.map((r: any) => r.value) ?? [1]));
  const maxGoal = Math.max(...(reports?.active_goals_by_domain?.map((r: any) => r.value) ?? [1]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Reports & Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['4xl'] }}>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={styles.cardTitle}>Routine Completion Rate</Text>
          <Text style={styles.bigStat}>{reports?.routine_completion_rate ?? 0}%</Text>
          <Text style={styles.cardSub}>of scheduled routines completed</Text>
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={styles.cardTitle}>Behavior Log Trends</Text>
          {(reports?.behavior_trends ?? []).map((r: any) => (
            <BarItem key={r.label} label={r.label.replace('_', ' ')} value={r.value} max={maxBehavior} color={colors.warning} />
          ))}
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={styles.cardTitle}>Top AAC Items Used</Text>
          {(reports?.top_aac_items ?? []).map((r: any) => (
            <BarItem key={r.label} label={r.label} value={r.value} max={maxAAC} color={colors.primary} />
          ))}
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={styles.cardTitle}>Active Goals by Domain</Text>
          {(reports?.active_goals_by_domain ?? []).map((r: any) => (
            <BarItem key={r.label} label={r.label.replace('_', ' ')} value={r.value} max={maxGoal} color={colors.secondary} />
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  bigStat: { fontSize: fontSizes['4xl'], fontWeight: '900', color: colors.primary },
  cardSub: { fontSize: fontSizes.sm, color: colors.textTertiary },
});
