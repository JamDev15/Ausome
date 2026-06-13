import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { behaviorApi } from '../../api/behavior';
import { EmotionType, BehaviorSeverity, MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { Badge } from '../../components/common/Badge';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'BehaviorLog'>;
  route: RouteProp<MainStackParamList, 'BehaviorLog'>;
};

const EMOTIONS: Array<{ key: EmotionType; label: string; emoji: string; color: string }> = [
  { key: 'calm', label: 'Calm', emoji: '😌', color: '#87CEEB' },
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#FFD700' },
  { key: 'excited', label: 'Excited', emoji: '🤩', color: '#FF69B4' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', color: '#DDA0DD' },
  { key: 'overwhelmed', label: 'Overwhelmed', emoji: '😤', color: '#FF8C69' },
  { key: 'frustrated', label: 'Frustrated', emoji: '😠', color: '#CD853F' },
  { key: 'crying', label: 'Crying', emoji: '😢', color: '#6495ED' },
  { key: 'meltdown', label: 'Meltdown', emoji: '🌋', color: '#DC143C' },
  { key: 'dysregulated', label: 'Dysregulated', emoji: '⚡', color: '#FF4500' },
  { key: 'energetic', label: 'Energetic', emoji: '⚡', color: '#FFA500' },
  { key: 'sleepy', label: 'Sleepy', emoji: '😴', color: '#708090' },
  { key: 'repetitive_behavior', label: 'Repetitive', emoji: '🔄', color: '#9370DB' },
  { key: 'refusing_food', label: 'Refusing Food', emoji: '🚫', color: '#FF6347' },
  { key: 'confused', label: 'Confused', emoji: '😕', color: '#B0C4DE' },
];

const SEVERITY_OPTIONS: Array<{ key: BehaviorSeverity; label: string; color: string }> = [
  { key: 'mild', label: 'Mild', color: colors.success },
  { key: 'moderate', label: 'Moderate', color: colors.warning },
  { key: 'severe', label: 'Severe', color: colors.error },
];

const COMMON_TRIGGERS = [
  'Loud noise', 'Routine change', 'Transition', 'Hunger', 'Tiredness',
  'Crowd', 'Bright lights', 'Social demand', 'Sensory overload', 'Medical discomfort',
];

const COMMON_INTERVENTIONS = [
  'Quiet space', 'Deep pressure', 'Noise-canceling headphones', 'Visual timer',
  'Preferred activity', 'Verbal reassurance', 'Weighted blanket', 'Movement break',
];

type TabType = 'log' | 'history';

export const BehaviorLogScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabType>('log');
  const [emotion, setEmotion] = useState<EmotionType | null>(null);
  const [severity, setSeverity] = useState<BehaviorSeverity | null>(null);
  const [location, setLocation] = useState('');
  const [trigger, setTrigger] = useState('');
  const [intervention, setIntervention] = useState('');
  const [notes, setNotes] = useState('');

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['behavior-logs', childId],
    queryFn: () => behaviorApi.list(childId),
    enabled: tab === 'history',
  });

  const { data: summary } = useQuery({
    queryKey: ['behavior-summary', childId],
    queryFn: () => behaviorApi.summary(childId),
    enabled: tab === 'history',
  });

  const createMutation = useMutation({
    mutationFn: behaviorApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-logs', childId] });
      queryClient.invalidateQueries({ queryKey: ['behavior-summary', childId] });
      Alert.alert('Logged!', 'Emotion log saved successfully.', [{ text: 'OK' }]);
      // Reset form
      setEmotion(null);
      setSeverity(null);
      setLocation('');
      setTrigger('');
      setIntervention('');
      setNotes('');
    },
    onError: () => Alert.alert('Error', 'Could not save the log. Please try again.'),
  });

  const handleSubmit = () => {
    if (!emotion) {
      Alert.alert('Select Emotion', 'Please select how your child is feeling.');
      return;
    }
    createMutation.mutate({
      child_id: childId,
      emotion,
      severity: severity ?? undefined,
      location: location || undefined,
      trigger: trigger || undefined,
      intervention_used: intervention || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Emotion & Behavior"
        onBack={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'log' && styles.tabActive]}
          onPress={() => setTab('log')}
        >
          <Text style={[styles.tabText, tab === 'log' && styles.tabTextActive]}>Log Emotion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {tab === 'log' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Emotion grid */}
          <Text style={styles.sectionTitle}>How is your child feeling right now?</Text>
          <View style={styles.emotionGrid}>
            {EMOTIONS.map((e) => (
              <TouchableOpacity
                key={e.key}
                style={[
                  styles.emotionBtn,
                  { backgroundColor: e.color + '20', borderColor: e.color + '60' },
                  emotion === e.key && { backgroundColor: e.color + '40', borderColor: e.color, borderWidth: 3 },
                ]}
                onPress={() => setEmotion(e.key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: emotion === e.key }}
                accessibilityLabel={e.label}
              >
                <Text style={styles.emotionEmoji}>{e.emoji}</Text>
                <Text style={[styles.emotionLabel, { color: e.color }]}>{e.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Severity */}
          {emotion && !['calm', 'happy', 'excited'].includes(emotion) && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Severity</Text>
              <View style={styles.severityRow}>
                {SEVERITY_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.severityBtn,
                      { borderColor: s.color },
                      severity === s.key && { backgroundColor: s.color + '20' },
                    ]}
                    onPress={() => setSeverity(s.key)}
                  >
                    <Text style={[styles.severityText, { color: s.color }]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Location */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Where? (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. School cafeteria, Home kitchen..."
              placeholderTextColor={colors.textTertiary}
            />
          </Card>

          {/* Trigger */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trigger? (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {COMMON_TRIGGERS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, trigger === t && styles.chipSelected]}
                  onPress={() => setTrigger(trigger === t ? '' : t)}
                >
                  <Text style={[styles.chipText, trigger === t && styles.chipTextSelected]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.textInput, { marginTop: spacing.sm }]}
              value={trigger}
              onChangeText={setTrigger}
              placeholder="Or type your own..."
              placeholderTextColor={colors.textTertiary}
            />
          </Card>

          {/* Intervention */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What helped? (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {COMMON_INTERVENTIONS.map((i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.chip, intervention === i && styles.chipSelected]}
                  onPress={() => setIntervention(intervention === i ? '' : i)}
                >
                  <Text style={[styles.chipText, intervention === i && styles.chipTextSelected]}>{i}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Notes */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional observations..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          <Button
            label="Save Emotion Log"
            onPress={handleSubmit}
            loading={createMutation.isPending}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />
        </ScrollView>
      ) : (
        // History tab
        <ScrollView contentContainerStyle={styles.content}>
          {/* Summary bar */}
          {summary && (
            <Card style={styles.summaryCard} elevated>
              <Text style={styles.summaryTitle}>Last 30 Days Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNum}>{summary.total_logs}</Text>
                  <Text style={styles.summaryLabel}>Total Logs</Text>
                </View>
                {summary.most_common_emotion && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryEmoji}>
                      {EMOTIONS.find(e => e.key === summary.most_common_emotion)?.emoji ?? '📊'}
                    </Text>
                    <Text style={styles.summaryLabel}>Most Frequent</Text>
                  </View>
                )}
                {summary.most_common_trigger && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryTrigger} numberOfLines={2}>{summary.most_common_trigger}</Text>
                    <Text style={styles.summaryLabel}>Top Trigger</Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          {logsLoading ? (
            <Loading />
          ) : (
            logs.map((log) => {
              const emotionData = EMOTIONS.find((e) => e.key === log.emotion);
              return (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logEmoji}>{emotionData?.emoji ?? '😶'}</Text>
                    <View style={styles.logInfo}>
                      <Text style={[styles.logEmotion, { color: emotionData?.color ?? colors.textPrimary }]}>
                        {emotionData?.label ?? log.emotion}
                      </Text>
                      <Text style={styles.logTime}>
                        {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    {log.severity && (
                      <Badge
                        label={log.severity}
                        variant={log.severity === 'mild' ? 'success' : log.severity === 'moderate' ? 'warning' : 'error'}
                        small
                      />
                    )}
                  </View>
                  {log.location && <Text style={styles.logDetail}>📍 {log.location}</Text>}
                  {log.trigger && <Text style={styles.logDetail}>⚡ Trigger: {log.trigger}</Text>}
                  {log.intervention_used && <Text style={styles.logDetail}>💡 Helped: {log.intervention_used}</Text>}
                  {log.notes && <Text style={styles.logNotes}>{log.notes}</Text>}
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: {
    flexDirection: 'row', gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: spacing.sm,
    alignItems: 'center', borderRadius: radius.full,
    backgroundColor: colors.primaryLight + '50',
    borderWidth: 1.5, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
  tabTextActive: { color: colors.white },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  sectionCard: { marginBottom: spacing.lg },

  // Emotion grid
  emotionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  emotionBtn: {
    width: '22%', aspectRatio: 1, borderRadius: radius.lg,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xs,
  },
  emotionEmoji: { fontSize: 28, marginBottom: 2 },
  emotionLabel: { fontSize: fontSizes.xs, fontWeight: '700', textAlign: 'center' },

  // Severity
  severityRow: { flexDirection: 'row', gap: spacing.md },
  severityBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radius.lg,
    borderWidth: 2, alignItems: 'center',
  },
  severityText: { fontWeight: '700', fontSize: fontSizes.md },

  // Chips
  chipRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  chipTextSelected: { color: colors.primary, fontWeight: '700' },

  // Inputs
  textInput: {
    backgroundColor: colors.surfaceElevated, borderRadius: radius.md,
    padding: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  textAreaInput: { minHeight: 88 },
  submitBtn: { marginTop: spacing.md },

  // History
  summaryCard: { marginBottom: spacing.lg },
  summaryTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary },
  summaryEmoji: { fontSize: fontSizes['2xl'] },
  summaryTrigger: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.warning, textAlign: 'center', maxWidth: 80 },
  summaryLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 4 },

  logCard: { marginBottom: spacing.md },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  logEmoji: { fontSize: 32, marginRight: spacing.md },
  logInfo: { flex: 1 },
  logEmotion: { fontSize: fontSizes.lg, fontWeight: '700' },
  logTime: { fontSize: fontSizes.sm, color: colors.textTertiary },
  logDetail: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
  logNotes: { fontSize: fontSizes.sm, color: colors.textTertiary, marginTop: spacing.sm, fontStyle: 'italic' },
});
