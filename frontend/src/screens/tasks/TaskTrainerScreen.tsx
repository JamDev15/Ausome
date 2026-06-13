import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { speak } from '../../utils/speak';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import apiClient from '../../api/client';
import { MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'TaskTrainer'>;
  route: RouteProp<MainStackParamList, 'TaskTrainer'>;
};

const DOMAINS = [
  { value: 'hygiene',       label: 'Hygiene',       icon: 'water-outline',            color: '#5B8DEF' },
  { value: 'dressing',      label: 'Dressing',      icon: 'shirt-outline',            color: '#C3AED6' },
  { value: 'eating',        label: 'Eating',        icon: 'restaurant-outline',       color: '#F7A44A' },
  { value: 'toileting',     label: 'Toileting',     icon: 'medical-outline',          color: '#87CEEB' },
  { value: 'cleaning',      label: 'Cleaning',      icon: 'trash-outline',            color: '#6EC6A1' },
  { value: 'communication', label: 'Communication', icon: 'chatbubble-outline',       color: '#6495ED' },
  { value: 'social',        label: 'Social',        icon: 'people-outline',           color: '#FF8B94' },
  { value: 'academic',      label: 'Academic',      icon: 'library-outline',          color: '#4ECDC4' },
  { value: 'leisure',       label: 'Leisure',       icon: 'game-controller-outline',  color: '#A78BFA' },
  { value: 'safety',        label: 'Safety',        icon: 'shield-checkmark-outline', color: '#34D399' },
  { value: 'custom',        label: 'Custom',        icon: 'clipboard-outline',        color: '#8894B0' },
];

type Step = { title: string; instruction: string };

export const TaskTrainerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('custom');
  const [tokenReward, setTokenReward] = useState('1');
  const [steps, setSteps] = useState<Step[]>([{ title: '', instruction: '' }]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['task-programs', childId],
    queryFn: async () => {
      const { data } = await apiClient.get('/tasks/', { params: { child_id: childId } });
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const validSteps = steps.filter(s => s.title.trim());
      const { data } = await apiClient.post('/tasks/', {
        child_id: childId,
        title: title.trim(),
        domain,
        token_reward: parseInt(tokenReward) || 1,
        steps: validSteps.map((s, i) => ({
          title: s.title.trim(),
          instruction: s.instruction.trim() || undefined,
          position: i,
        })),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-programs', childId] });
      resetForm();
      setShowAdd(false);
    },
    onError: () => Alert.alert('Error', 'Could not save task. Please try again.'),
  });

  const resetForm = () => {
    setTitle('');
    setDomain('custom');
    setTokenReward('1');
    setSteps([{ title: '', instruction: '' }]);
  };

  const addStep = () => setSteps(prev => [...prev, { title: '', instruction: '' }]);
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i));
  const updateStep = (i: number, field: keyof Step, value: string) =>
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter a task title.'); return; }
    if (steps.every(s => !s.title.trim())) { Alert.alert('Required', 'Add at least one step.'); return; }
    createMutation.mutate();
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId); else next.add(stepId);
      return next;
    });
  };

  const domainInfo = (d: string) => DOMAINS.find(x => x.value === d) ?? DOMAINS[DOMAINS.length - 1];

  if (isLoading) return <Loading fullScreen />;

  // ── Step-by-step view ──────────────────────────────────────────────────────
  if (selectedTask) {
    const stepList = selectedTask.steps ?? [];
    const doneCount = stepList.filter((s: any) => completedSteps.has(s.id)).length;
    return (
      <View style={styles.container}>
        <ScreenHeader
          title={selectedTask.title}
          subtitle={`${doneCount}/${stepList.length} steps`}
          onBack={() => { setSelectedTask(null); setCompletedSteps(new Set()); }}
        />
        <ScrollView contentContainerStyle={styles.stepsContent}>
          {stepList.map((step: any, idx: number) => {
            const done = completedSteps.has(step.id);
            return (
              <Card key={step.id} style={done ? styles.stepDone : styles.stepCard}>
                <View style={styles.stepRow}>
                  <View style={[styles.stepNum, done && styles.stepNumDone]}>
                    {done
                      ? <Ionicons name="checkmark" size={16} color={colors.white} />
                      : <Text style={styles.stepNumText}>{idx + 1}</Text>}
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepTitle, done && styles.stepTitleDone]}>{step.title}</Text>
                    {step.instruction ? <Text style={styles.stepInstruction}>{step.instruction}</Text> : null}
                  </View>
                  <View style={styles.stepActions}>
                    {step.instruction ? (
                      <TouchableOpacity onPress={() => speak(step.instruction, { rate: 0.8 })} style={styles.speakBtn}>
                        <Ionicons name="volume-medium" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => toggleStep(step.id)} style={styles.checkBtn}>
                      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={32} color={done ? colors.success : colors.border} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })}
          {doneCount === stepList.length && stepList.length > 0 && (
            <View style={styles.complete}>
              <Ionicons name="star" size={40} color="#F7A44A" style={{ marginBottom: spacing.sm }} />
              <Text style={styles.completeText}>Great job! All done! 🎉</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── Task list ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScreenHeader title="Task Trainer" subtitle="Step-by-step life skills" onBack={() => navigation.goBack()} />

      {tasks.length === 0 ? (
        <EmptyState icon="list-outline" title="No tasks yet" message="Tap + to create your first task." />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {tasks.map((task: any) => {
            const info = domainInfo(task.domain);
            return (
              <Card key={task.id} style={styles.taskCard} onPress={() => setSelectedTask(task)} elevated>
                <View style={styles.taskRow}>
                  <View style={[styles.taskIconCircle, { backgroundColor: info.color + '22' }]}>
                    <Ionicons name={info.icon as any} size={26} color={info.color} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>{task.steps?.length ?? 0} steps · {task.domain}</Text>
                  </View>
                  <View style={styles.tokenBadge}>
                    <Ionicons name="star" size={12} color={colors.accent} />
                    <Text style={styles.tokenBadgeText}>{task.token_reward}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { resetForm(); setShowAdd(false); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={handleSave} disabled={createMutation.isPending}>
              <Text style={[styles.modalSave, createMutation.isPending && { opacity: 0.4 }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Brush Teeth"
              placeholderTextColor={colors.textTertiary}
            />

            {/* Domain */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg }}>
                {DOMAINS.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.domainChip, domain === d.value && { backgroundColor: d.color, borderColor: d.color }]}
                    onPress={() => setDomain(d.value)}
                  >
                    <Ionicons name={d.icon as any} size={14} color={domain === d.value ? '#fff' : d.color} />
                    <Text style={[styles.domainChipLabel, domain === d.value && { color: '#fff' }]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Token Reward */}
            <Text style={styles.label}>Star Reward</Text>
            <View style={styles.tokenRow}>
              {['1','2','3','5','10'].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.tokenChip, tokenReward === v && styles.tokenChipActive]}
                  onPress={() => setTokenReward(v)}
                >
                  <Ionicons name="star" size={14} color={tokenReward === v ? '#fff' : colors.accent} />
                  <Text style={[styles.tokenChipLabel, tokenReward === v && { color: '#fff' }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Steps */}
            <Text style={styles.label}>Steps *</Text>
            {steps.map((step, i) => (
              <View key={i} style={styles.stepFormCard}>
                <View style={styles.stepFormHeader}>
                  <Text style={styles.stepFormNum}>Step {i + 1}</Text>
                  {steps.length > 1 && (
                    <TouchableOpacity onPress={() => removeStep(i)}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  value={step.title}
                  onChangeText={v => updateStep(i, 'title', v)}
                  placeholder="Step title (e.g. Wet your toothbrush)"
                  placeholderTextColor={colors.textTertiary}
                />
                <TextInput
                  style={[styles.input, { marginTop: -spacing.xs }]}
                  value={step.instruction}
                  onChangeText={v => updateStep(i, 'instruction', v)}
                  placeholder="Instruction spoken aloud (optional)"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addStepBtn} onPress={addStep}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addStepLabel}>Add Step</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },

  taskCard: {},
  taskRow: { flexDirection: 'row', alignItems: 'center' },
  taskIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  taskMeta: { fontSize: fontSizes.sm, color: colors.textTertiary, marginTop: 2 },
  tokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FFF4E3', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  tokenBadgeText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent },

  fab: { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadow.lg },

  stepsContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
  stepCard: {},
  stepDone: { opacity: 0.65 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  stepNumDone: { backgroundColor: colors.success },
  stepNumText: { color: colors.white, fontWeight: '700', fontSize: fontSizes.md },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  stepTitleDone: { textDecorationLine: 'line-through', color: colors.textTertiary },
  stepInstruction: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  stepActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  speakBtn: { padding: spacing.xs },
  checkBtn: { padding: spacing.xs },
  complete: { padding: spacing.xl, backgroundColor: '#F0FDF4', borderRadius: radius['2xl'], alignItems: 'center', borderWidth: 1, borderColor: '#86EFAC' },
  completeText: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.success, marginTop: spacing.sm },

  // Modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: spacing['2xl'] },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  modalCancel: { fontSize: fontSizes.md, color: colors.textTertiary },
  modalSave: { fontSize: fontSizes.md, fontWeight: '700', color: colors.primary },
  modalBody: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  label: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F1F5F9', borderRadius: radius.lg, padding: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },

  domainChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  domainChipLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },

  tokenRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  tokenChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: '#FFF4E3', borderWidth: 1.5, borderColor: colors.accent + '40' },
  tokenChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tokenChipLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent },

  stepFormCard: { backgroundColor: '#F8FAFF', borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  stepFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  stepFormNum: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },

  addStepBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', justifyContent: 'center', marginBottom: spacing.lg },
  addStepLabel: { fontSize: fontSizes.md, fontWeight: '600', color: colors.primary },
});
