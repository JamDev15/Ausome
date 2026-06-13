import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import { ScheduleTemplate, MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'VisualSchedule'>;
  route: RouteProp<MainStackParamList, 'VisualSchedule'>;
};

const ROUTINE_TYPES = [
  { key: 'morning',   label: 'Morning',   emoji: '☀️',  color: '#F7A44A' },
  { key: 'afternoon', label: 'Afternoon', emoji: '🌤️', color: '#5B8DEF' },
  { key: 'evening',   label: 'Evening',   emoji: '🌙',  color: '#9B59B6' },
  { key: 'custom',    label: 'Custom',    emoji: '📋',  color: '#4CAF82' },
] as const;

type RoutineKey = typeof ROUTINE_TYPES[number]['key'];

const ROUTINE_EMOJIS: Record<string, string> = {
  morning: '☀️', afternoon: '🌤️', evening: '🌙', custom: '📋',
};

interface StepDraft {
  title: string;
  duration_minutes: string;
}

const DEFAULT_STEP: StepDraft = { title: '', duration_minutes: '' };

export const VisualScheduleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ScheduleTemplate | null>(null);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [routineType, setRoutineType] = useState<RoutineKey>('morning');
  const [steps, setSteps] = useState<StepDraft[]>([{ ...DEFAULT_STEP }]);

  const { data: schedules = [], isLoading } = useQuery<ScheduleTemplate[]>({
    queryKey: ['schedules', childId],
    queryFn: async () => {
      const { data } = await apiClient.get('/schedules/', { params: { child_id: childId } });
      return data as ScheduleTemplate[];
    },
  } as any);

  // Keep selectedTemplate in sync when list refreshes
  React.useEffect(() => {
    if (schedules.length > 0 && !selectedTemplate) setSelectedTemplate(schedules[0]);
  }, [schedules]);

  const toggleMutation = useMutation({
    mutationFn: async ({ templateId, itemIndex, completed }: { templateId: string; itemIndex: number; completed: boolean }) => {
      const { data } = await apiClient.patch(`/schedules/items/${templateId}/${itemIndex}`, {
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
      });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules', childId] }),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post('/schedules/', payload);
      return data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['schedules', childId] });
      setShowCreate(false);
      resetForm();
      setSelectedTemplate(created);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      await apiClient.delete(`/schedules/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', childId] });
      setSelectedTemplate(null);
    },
  });

  const resetForm = () => {
    setTitle('');
    setRoutineType('morning');
    setSteps([{ ...DEFAULT_STEP }]);
  };

  const addStep = () => setSteps(prev => [...prev, { ...DEFAULT_STEP }]);

  const removeStep = (idx: number) =>
    setSteps(prev => prev.filter((_, i) => i !== idx));

  const updateStep = (idx: number, field: keyof StepDraft, value: string) =>
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  const submitCreate = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a schedule name.');
      return;
    }
    const validSteps = steps.filter(s => s.title.trim());
    if (validSteps.length === 0) {
      Alert.alert('No steps', 'Add at least one step to the routine.');
      return;
    }
    createMutation.mutate({
      child_id: childId,
      title: title.trim(),
      routine_type: routineType,
      items: validSteps.map((s, idx) => ({
        title: s.title.trim(),
        position: idx,
        duration_minutes: s.duration_minutes ? parseInt(s.duration_minutes) : null,
      })),
    });
  }, [title, routineType, steps, childId]);

  const confirmDelete = (template: ScheduleTemplate) => {
    Alert.alert('Delete Schedule', `Delete "${template.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(template.id) },
    ]);
  };

  if (isLoading) return <Loading fullScreen />;

  const completedCount = selectedTemplate?.items.filter(i => i.is_completed).length ?? 0;
  const totalCount = selectedTemplate?.items.length ?? 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Daily Schedule" onBack={() => navigation.goBack()} />

      {schedules.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="calendar-outline"
            title="No schedules yet"
            message="Create a visual routine to help structure the day."
          />
          <TouchableOpacity style={styles.emptyCreateBtn} onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.emptyCreateText}>Create Schedule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Routine selector */}
          <View style={styles.routineTabsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routineTabs}>
              {schedules.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.routineTab, selectedTemplate?.id === s.id && styles.routineTabActive]}
                  onPress={() => setSelectedTemplate(s)}
                  onLongPress={() => confirmDelete(s)}
                >
                  <Text style={styles.routineEmoji}>{ROUTINE_EMOJIS[s.routine_type] ?? '📋'}</Text>
                  <Text style={[styles.routineTabText, selectedTemplate?.id === s.id && styles.routineTabTextActive]}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.routineAddTab} onPress={() => setShowCreate(true)}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {selectedTemplate && (
            <>
              {/* Progress */}
              <View style={styles.progress}>
                <Text style={styles.progressText}>{completedCount} of {totalCount} steps done</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }]} />
                </View>
              </View>

              <FlatList
                data={selectedTemplate.items}
                keyExtractor={(item, idx) => `${item.id ?? idx}`}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                  <Card style={item.is_completed ? { ...styles.stepCard, ...styles.stepCompleted } : styles.stepCard}>
                    <View style={styles.stepRow}>
                      <View style={[styles.stepNumber, item.is_completed && styles.stepNumberDone]}>
                        {item.is_completed
                          ? <Ionicons name="checkmark" size={18} color={colors.white} />
                          : <Text style={styles.stepNumberText}>{index + 1}</Text>
                        }
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepTitle, item.is_completed && styles.stepTitleDone]}>
                          {item.title}
                        </Text>
                        {item.description ? <Text style={styles.stepDesc}>{item.description}</Text> : null}
                        {item.duration_minutes ? (
                          <Text style={styles.stepDuration}>⏱ {item.duration_minutes} min</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        style={styles.checkBtn}
                        onPress={() => toggleMutation.mutate({
                          templateId: selectedTemplate.id,
                          itemIndex: index,
                          completed: !item.is_completed,
                        })}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: item.is_completed }}
                        accessibilityLabel={`${item.title} — ${item.is_completed ? 'completed' : 'tap to complete'}`}
                      >
                        <Ionicons
                          name={item.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                          size={32}
                          color={item.is_completed ? colors.success : colors.border}
                        />
                      </TouchableOpacity>
                    </View>
                  </Card>
                )}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              />

              {completedCount === totalCount && totalCount > 0 && (
                <View style={styles.allDone}>
                  <Text style={styles.allDoneText}>🎉 All done! Amazing work! 🎉</Text>
                </View>
              )}
            </>
          )}
        </>
      )}

      {/* FAB */}
      {schedules.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── Create Schedule Modal ── */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalRoot, { paddingTop: insets.top + spacing.md }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Schedule</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetForm(); }}>
                <Ionicons name="close" size={24} color="#1A2340" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <Text style={styles.fieldLabel}>Schedule Name *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Routine, Bedtime..."
                placeholderTextColor="#C0C8D8"
              />

              {/* Routine type */}
              <Text style={styles.fieldLabel}>Routine Type</Text>
              <View style={styles.typeRow}>
                {ROUTINE_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.key}
                    style={[styles.typeChip, routineType === rt.key && { backgroundColor: rt.color, borderColor: rt.color }]}
                    onPress={() => setRoutineType(rt.key)}
                  >
                    <Text style={styles.typeEmoji}>{rt.emoji}</Text>
                    <Text style={[styles.typeLabel, routineType === rt.key && styles.typeLabelActive]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Steps */}
              <Text style={styles.fieldLabel}>Steps</Text>
              {steps.map((step, idx) => (
                <View key={idx} style={styles.stepRow2}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <TextInput
                      style={styles.input}
                      value={step.title}
                      onChangeText={(v) => updateStep(idx, 'title', v)}
                      placeholder={`Step ${idx + 1} name...`}
                      placeholderTextColor="#C0C8D8"
                    />
                    <TextInput
                      style={[styles.input, styles.durationInput]}
                      value={step.duration_minutes}
                      onChangeText={(v) => updateStep(idx, 'duration_minutes', v.replace(/[^0-9]/g, ''))}
                      placeholder="Duration (mins, optional)"
                      placeholderTextColor="#C0C8D8"
                      keyboardType="numeric"
                    />
                  </View>
                  {steps.length > 1 && (
                    <TouchableOpacity style={styles.removeStepBtn} onPress={() => removeStep(idx)}>
                      <Ionicons name="close-circle" size={22} color="#E74C3C" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addStepText}>Add Step</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, createMutation.isPending && styles.submitBtnDisabled]}
                onPress={submitCreate}
                disabled={createMutation.isPending}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.submitText}>
                  {createMutation.isPending ? 'Saving...' : 'Create Schedule'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  emptyCreateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: radius.full, paddingVertical: 14, paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.xl, marginBottom: 40,
  },
  emptyCreateText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },

  routineTabsWrap: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  routineTabs: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  routineTab: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.border,
  },
  routineTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  routineEmoji: { fontSize: 16 },
  routineTabText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary },
  routineTabTextActive: { color: colors.white },
  routineAddTab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },

  progress: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  progressText: { fontSize: fontSizes.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },

  list: { padding: spacing.lg, paddingBottom: 100 },
  stepCard: {},
  stepCompleted: { opacity: 0.7 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepNumber: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  stepNumberDone: { backgroundColor: colors.success },
  stepNumberText: { color: colors.white, fontWeight: '700', fontSize: fontSizes.md },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  stepTitleDone: { textDecorationLine: 'line-through', color: colors.textTertiary },
  stepDesc: { fontSize: fontSizes.sm, color: colors.textTertiary, marginTop: 2 },
  stepDuration: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  checkBtn: { padding: spacing.sm },

  allDone: {
    margin: spacing.lg, padding: spacing.lg,
    backgroundColor: colors.successLight, borderRadius: radius.xl, alignItems: 'center',
  },
  allDoneText: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.success },

  fab: {
    position: 'absolute', right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },

  // Modal
  modalRoot: { flex: 1, backgroundColor: '#F6F9FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  modalTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  modalBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },

  fieldLabel: {
    fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: -4,
  },
  input: {
    backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontSize: fontSizes.md, color: '#1A2340',
  },
  durationInput: { paddingVertical: 10, fontSize: fontSizes.sm },

  typeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radius.full, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#E2E8F4',
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: '#4A5578' },
  typeLabelActive: { color: '#fff' },

  stepRow2: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  stepNumBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 13,
  },
  stepNumText: { color: '#fff', fontSize: fontSizes.xs, fontWeight: '800' },
  removeStepBtn: { marginTop: 10 },

  addStepBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: 12, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.primary,
    borderStyle: 'dashed', justifyContent: 'center',
  },
  addStepText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: radius.full, paddingVertical: 16, marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
});
