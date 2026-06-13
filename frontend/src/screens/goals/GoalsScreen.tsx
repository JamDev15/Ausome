import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { goalsApi } from '../../api/goals';
import { Goal, GoalDomain, MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Goals'>;
  route: RouteProp<MainStackParamList, 'Goals'>;
};

const DOMAIN_CONFIG: Record<GoalDomain, { color: string; icon: string }> = {
  speech:        { color: '#5B8DEF', icon: 'mic-outline' },
  ot:            { color: '#6EC6A1', icon: 'hand-left-outline' },
  behavior:      { color: '#F7A44A', icon: 'flash-outline' },
  sensory:       { color: '#C3AED6', icon: 'ear-outline' },
  toileting:     { color: '#87CEEB', icon: 'medical-outline' },
  life_skills:   { color: '#FFD700', icon: 'home-outline' },
  social:        { color: '#FF8B94', icon: 'people-outline' },
  academic:      { color: '#4ECDC4', icon: 'library-outline' },
  communication: { color: '#6495ED', icon: 'chatbubble-outline' },
  motor:         { color: '#FFA500', icon: 'walk-outline' },
  custom:        { color: '#B0C4DE', icon: 'options-outline' },
};

export const GoalsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState<GoalDomain>('communication');
  const [newBaseline, setNewBaseline] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', childId],
    queryFn: () => goalsApi.list(childId),
  });

  const createMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', childId] });
      setShowAdd(false);
      setNewTitle(''); setNewBaseline(''); setNewTarget('');
    },
    onError: () => Alert.alert('Error', 'Could not create goal.'),
  });

  const progressMutation = useMutation({
    mutationFn: goalsApi.addProgress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals', childId] }),
  });

  const handleAddProgress = (goal: Goal) => {
    const newPct = Math.min(100, (goal.current_percentage || 0) + 10);
    progressMutation.mutate({
      goal_id: goal.id,
      child_id: childId,
      percentage: newPct,
      notes: 'Progress update',
    });
  };

  if (isLoading) return <Loading fullScreen />;

  const activeGoals = goals.filter(g => g.status === 'active');
  const masteredGoals = goals.filter(g => g.status === 'mastered');

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Goals & Progress"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {goals.length === 0 ? (
        <EmptyState icon="trending-up-outline" title="No goals yet" message="Add therapy and learning goals to track progress." actionLabel="Add First Goal" onAction={() => setShowAdd(true)} />
      ) : (
        <FlatList
          data={[...activeGoals, ...masteredGoals]}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{activeGoals.length}</Text>
                <Text style={styles.summaryLabel}>Active Goals</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { color: colors.success }]}>{masteredGoals.length}</Text>
                <Text style={styles.summaryLabel}>Mastered</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>
                  {activeGoals.length > 0
                    ? Math.round(activeGoals.reduce((a, g) => a + g.current_percentage, 0) / activeGoals.length)
                    : 0}%
                </Text>
                <Text style={styles.summaryLabel}>Avg Progress</Text>
              </View>
            </View>
          }
          renderItem={({ item: goal }) => {
            const config = DOMAIN_CONFIG[goal.domain] ?? DOMAIN_CONFIG.custom;
            return (
              <Card style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIconCircle, { backgroundColor: config.color + '22' }]}>
                    <Ionicons name={config.icon as any} size={22} color={config.color} />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle} numberOfLines={2}>{goal.title}</Text>
                    <Badge label={goal.domain.replace('_', ' ')} variant="neutral" small />
                  </View>
                  {goal.status === 'mastered' && (
                    <View style={styles.masteredBadge}>
                      <Ionicons name="trophy" size={14} color={colors.success} />
                      <Text style={styles.masteredText}>Mastered</Text>
                    </View>
                  )}
                </View>

                {/* Progress bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, {
                      width: `${goal.current_percentage}%`,
                      backgroundColor: goal.status === 'mastered' ? colors.success : config.color,
                    }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: config.color }]}>
                    {Math.round(goal.current_percentage)}%
                  </Text>
                </View>

                {goal.baseline && (
                  <View style={styles.goalTextRow}>
                    <Ionicons name="flag-outline" size={13} color={colors.textTertiary} />
                    <Text style={styles.goalText}>Baseline: {goal.baseline}</Text>
                  </View>
                )}
                {goal.target && (
                  <View style={styles.goalTextRow}>
                    <Ionicons name="navigate-outline" size={13} color={colors.textTertiary} />
                    <Text style={styles.goalText}>Target: {goal.target}</Text>
                  </View>
                )}

                {goal.status === 'active' && (
                  <TouchableOpacity
                    style={[styles.progressBtn, { backgroundColor: config.color + '20', borderColor: config.color }]}
                    onPress={() => handleAddProgress(goal)}
                  >
                    <Ionicons name="arrow-up" size={16} color={config.color} />
                    <Text style={[styles.progressBtnText, { color: config.color }]}>+10% Progress</Text>
                  </TouchableOpacity>
                )}
              </Card>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}

      {/* Add Goal Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add New Goal</Text>
          <Text style={styles.label}>Goal Title</Text>
          <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="e.g. Use AAC to request 3 items independently" placeholderTextColor={colors.textTertiary} multiline />
          <Text style={styles.label}>Domain</Text>
          <View style={styles.domainGrid}>
            {(Object.keys(DOMAIN_CONFIG) as GoalDomain[]).map(d => (
              <TouchableOpacity key={d} style={[styles.domainChip, newDomain === d && styles.domainChipActive]} onPress={() => setNewDomain(d)}>
                <Ionicons name={DOMAIN_CONFIG[d].icon as any} size={14} color={newDomain === d ? colors.primary : colors.textTertiary} />
                <Text style={[styles.domainChipText, newDomain === d && { color: colors.primary }]}>{d.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Baseline (current level)</Text>
          <TextInput style={styles.input} value={newBaseline} onChangeText={setNewBaseline} placeholder="Where is the child starting from?" placeholderTextColor={colors.textTertiary} />
          <Text style={styles.label}>Target</Text>
          <TextInput style={styles.input} value={newTarget} onChangeText={setNewTarget} placeholder="What does success look like?" placeholderTextColor={colors.textTertiary} />
          <View style={styles.modalActions}>
            <Button label="Cancel" onPress={() => setShowAdd(false)} variant="outline" style={{ flex: 1 }} />
            <Button label="Add Goal" onPress={() => {
              if (!newTitle.trim()) { Alert.alert('Missing', 'Enter a goal title'); return; }
              createMutation.mutate({ child_id: childId, title: newTitle, domain: newDomain, baseline: newBaseline, target: newTarget });
            }} loading={createMutation.isPending} style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  summary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  goalCard: { },
  goalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  goalIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  goalInfo: { flex: 1, gap: spacing.xs },
  goalTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  masteredBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.successLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  masteredText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.success },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  progressBar: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginRight: spacing.sm },
  progressFill: { height: '100%', borderRadius: radius.full },
  progressPct: { fontSize: fontSizes.sm, fontWeight: '700', minWidth: 40, textAlign: 'right' },
  goalTextRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  goalText: { fontSize: fontSizes.sm, color: colors.textSecondary, flex: 1 },
  progressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: radius.lg, paddingVertical: spacing.sm, gap: spacing.xs, marginTop: spacing.sm },
  progressBtnText: { fontWeight: '700', fontSize: fontSizes.sm },
  modal: { flex: 1, padding: spacing['2xl'], backgroundColor: colors.background },
  modalTitle: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xl },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  domainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  domainChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  domainChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  domainChipText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textSecondary },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
});
