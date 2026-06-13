import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { onboardingApi } from '../../api/onboarding';
import { MainStackParamList, RoutineBlock, ParentGoalData } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'PersonalizedPlan'>;
  route: RouteProp<MainStackParamList, 'PersonalizedPlan'>;
};

const CATEGORY_COLORS: Record<string, string> = {
  morning: '#F7A44A',
  midday: '#5B8DEF',
  afternoon: '#4CAF82',
  evening: '#C3AED6',
};

const RoutineCard: React.FC<{ block: RoutineBlock }> = ({ block }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLORS[block.category] ?? colors.primary;

  return (
    <TouchableOpacity
      style={styles.routineCard}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.routineCardRow}>
        <View style={[styles.routineIconBg, { backgroundColor: color + '20' }]}>
          <Ionicons name={block.icon_key as any} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.routineTime}>{block.time_range}</Text>
          <Text style={styles.routineActivity}>{t(block.activity_key)}</Text>
        </View>
        {block.duration_minutes > 0 && (
          <Text style={styles.routineDuration}>{block.duration_minutes}min</Text>
        )}
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
      </View>
      {expanded && (
        <View style={styles.routineExpanded}>
          <View style={styles.routineExpandedSection}>
            <Text style={styles.routineExpandedLabel}>Why this matters</Text>
            <Text style={styles.routineExpandedText}>{t(block.why_key)}</Text>
          </View>
          <View style={[styles.routineExpandedSection, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
            <Text style={styles.routineExpandedLabel}>Tip</Text>
            <Text style={styles.routineExpandedText}>{t(block.tip_key)}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const GoalCard: React.FC<{ goal: ParentGoalData; index: number }> = ({ goal, index }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const goalColors = ['#5B8DEF', '#F7A44A', '#4CAF82'];
  const color = goalColors[index] ?? colors.primary;

  return (
    <TouchableOpacity style={styles.goalCard} onPress={() => setExpanded(e => !e)} activeOpacity={0.85}>
      <View style={styles.goalCardRow}>
        <View style={[styles.goalNumber, { backgroundColor: color }]}>
          <Text style={styles.goalNumberText}>{goal.order}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalTitle}>{t(`goal.${goal.goal_key}.title`)}</Text>
          <Text style={styles.goalFreq}>{goal.frequency}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
      </View>
      {expanded && (
        <View style={styles.goalExpanded}>
          <View style={styles.goalExpandedBlock}>
            <Text style={styles.goalExpandedLabel}>Why</Text>
            <Text style={styles.goalExpandedText}>{t(`goal.${goal.goal_key}.why`)}</Text>
          </View>
          <View style={styles.goalExpandedBlock}>
            <Text style={styles.goalExpandedLabel}>How</Text>
            <Text style={styles.goalExpandedText}>{t(`goal.${goal.goal_key}.how`)}</Text>
          </View>
          <View style={styles.milestoneRow}>
            {(['week1', 'week2', 'week4'] as const).map(w => (
              <View key={w} style={styles.milestone}>
                <Text style={[styles.milestoneWeek, { color }]}>
                  {w === 'week1' ? 'Week 1' : w === 'week2' ? 'Week 2' : 'Week 4'}
                </Text>
                <Text style={styles.milestoneText}>{t(`goal.${goal.goal_key}.${w}`)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EmptyPlan: React.FC = () => (
  <View style={styles.empty}>
    <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
    <Text style={styles.emptyTitle}>No personalized plan yet</Text>
    <Text style={styles.emptyText}>
      Complete the onboarding survey to generate a daily routine and parent goals for this child.
    </Text>
  </View>
);

export const PersonalizedPlanScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId, childName } = route.params;
  const [activeTab, setActiveTab] = useState<'routine' | 'goals'>('routine');

  const { data: routine = [], isLoading: loadingRoutine } = useQuery({
    queryKey: ['onboarding-routine', childId],
    queryFn: () => onboardingApi.getRoutine(childId),
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['onboarding-goals', childId],
    queryFn: () => onboardingApi.getGoals(childId),
  });

  const isLoading = loadingRoutine || loadingGoals;

  const grouped: Record<string, RoutineBlock[]> = {};
  for (const b of routine) {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  }

  const hasData = routine.length > 0 || goals.length > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Personalized Plan"
        subtitle={childName}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <Loading fullScreen />
      ) : !hasData ? (
        <EmptyPlan />
      ) : (
        <>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'routine' && styles.tabActive]}
              onPress={() => setActiveTab('routine')}
            >
              <Text style={[styles.tabText, activeTab === 'routine' && styles.tabTextActive]}>
                Daily Routine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
              onPress={() => setActiveTab('goals')}
            >
              <Text style={[styles.tabText, activeTab === 'goals' && styles.tabTextActive]}>
                Parent Goals
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'routine' ? (
              <>
                {(['morning', 'midday', 'afternoon', 'evening'] as const).map(cat => {
                  const blocks = grouped[cat];
                  if (!blocks?.length) return null;
                  return (
                    <View key={cat} style={styles.routineSection}>
                      <View style={[styles.routineSectionHeader, { backgroundColor: CATEGORY_COLORS[cat] + '20' }]}>
                        <Text style={[styles.routineSectionTitle, { color: CATEGORY_COLORS[cat] }]}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                      </View>
                      {blocks.map((b, i) => <RoutineCard key={i} block={b} />)}
                    </View>
                  );
                })}
                {routine.length === 0 && <EmptyPlan />}
                <Text style={styles.tapHint}>Tap any block to see why it matters and a practical tip.</Text>
              </>
            ) : (
              <>
                {goals.map((g, i) => <GoalCard key={g.goal_key} goal={g} index={i} />)}
                {goals.length === 0 && <EmptyPlan />}
                <Text style={styles.tapHint}>Tap any goal to see the full plan and weekly milestones.</Text>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  tabs: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
  tabTextActive: { color: colors.primary },

  content: { padding: spacing.lg },

  routineSection: { marginBottom: spacing.lg },
  routineSectionHeader: {
    borderRadius: radius.md, paddingVertical: 6,
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  routineSectionTitle: { fontSize: fontSizes.sm, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

  routineCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
    overflow: 'hidden', ...shadow.sm,
  },
  routineCardRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  routineIconBg: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  routineTime: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600', marginBottom: 2 },
  routineActivity: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  routineDuration: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600' },
  routineExpanded: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  routineExpandedSection: {},
  routineExpandedLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  routineExpandedText: { fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },

  goalCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
    overflow: 'hidden', ...shadow.sm,
  },
  goalCardRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  goalNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  goalNumberText: { color: '#fff', fontWeight: '900', fontSize: fontSizes.md },
  goalTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  goalFreq: { fontSize: fontSizes.xs, color: colors.textTertiary },
  goalExpanded: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md },
  goalExpandedBlock: {},
  goalExpandedLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  goalExpandedText: { fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
  milestoneRow: { flexDirection: 'row', gap: spacing.sm },
  milestone: { flex: 1, backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.sm },
  milestoneWeek: { fontSize: fontSizes.xs, fontWeight: '800', marginBottom: 4 },
  milestoneText: { fontSize: fontSizes.xs, color: colors.textSecondary, lineHeight: 16 },

  tapHint: { fontSize: fontSizes.xs, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.md, fontStyle: 'italic' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['3xl'] },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'center' },
  emptyText: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
