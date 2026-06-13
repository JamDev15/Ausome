import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, FlatList, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';
import { episodesApi, Episode, EpisodeType, EpisodeSeverity } from '../../api/episodes';
import { Loading } from '../../components/common/Loading';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EpisodeTracker'>;
  route: RouteProp<MainStackParamList, 'EpisodeTracker'>;
};

// ── Config ────────────────────────────────────────────────────────────────────
const EPISODE_TYPES: { value: EpisodeType; label: string; icon: string; color: string }[] = [
  { value: 'seizure',   label: 'Seizure',          icon: 'flash',          color: '#E74C3C' },
  { value: 'absence',   label: 'Absence',           icon: 'radio-button-off',color: '#F7A44A' },
  { value: 'epilepsy',  label: 'Epilepsy',          icon: 'pulse',          color: '#C0392B' },
  { value: 'meltdown',  label: 'Meltdown',          icon: 'thunderstorm',   color: '#7C5CBF' },
  { value: 'panic',     label: 'Panic / Anxiety',   icon: 'heart-dislike',  color: '#E8589A' },
  { value: 'fever',     label: 'Fever / Illness',   icon: 'thermometer',    color: '#FF8C00' },
  { value: 'injury',    label: 'Injury',            icon: 'bandage',        color: '#FF6B6B' },
  { value: 'other',     label: 'Other',             icon: 'ellipsis-horizontal', color: '#8894B0' },
];

const SEVERITY_OPTIONS: { value: EpisodeSeverity; label: string; color: string }[] = [
  { value: 'mild',     label: 'Mild',     color: '#4CAF82' },
  { value: 'moderate', label: 'Moderate', color: '#F7A44A' },
  { value: 'severe',   label: 'Severe',   color: '#E74C3C' },
];

function typeInfo(t: EpisodeType) {
  return EPISODE_TYPES.find(e => e.value === t) ?? EPISODE_TYPES[EPISODE_TYPES.length - 1];
}
function severityColor(s: EpisodeSeverity | null) {
  return SEVERITY_OPTIONS.find(o => o.value === s)?.color ?? '#8894B0';
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const DEFAULT_FORM = {
  episode_type: 'seizure' as EpisodeType,
  duration_minutes: '',
  severity: null as EpisodeSeverity | null,
  triggers: '',
  symptoms: '',
  intervention: '',
  outcome: '',
  emergency_called: false,
  notes: '',
};

export const EpisodeTrackerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['episodes', childId],
    queryFn: () => episodesApi.list(childId),
    staleTime: 0,
  });

  const logMut = useMutation({
    mutationFn: (p: Parameters<typeof episodesApi.log>[0]) => episodesApi.log(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episodes', childId] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => episodesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episodes', childId] }),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);

  const submit = useCallback(() => {
    logMut.mutate({
      child_id: childId,
      episode_type: form.episode_type,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : undefined,
      severity: form.severity ?? undefined,
      triggers: form.triggers.trim() || undefined,
      symptoms: form.symptoms.trim() || undefined,
      intervention: form.intervention.trim() || undefined,
      outcome: form.outcome.trim() || undefined,
      emergency_called: form.emergency_called,
      notes: form.notes.trim() || undefined,
    }, {
      onSuccess: () => { setShowForm(false); setForm(DEFAULT_FORM); },
    });
  }, [form, childId]);

  const confirmDelete = (ep: Episode) => {
    Alert.alert('Delete Episode', 'Remove this episode record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(ep.id) },
    ]);
  };

  const renderEpisode = ({ item }: { item: Episode }) => {
    const info = typeInfo(item.episode_type);
    const isOpen = expanded === item.id;
    return (
      <TouchableOpacity
        style={[styles.epCard, { borderLeftColor: info.color, borderLeftWidth: 4 }]}
        onPress={() => setExpanded(isOpen ? null : item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.epTop}>
          <View style={[styles.epIcon, { backgroundColor: info.color + '18' }]}>
            <Ionicons name={info.icon as any} size={20} color={info.color} />
          </View>
          <View style={styles.epMeta}>
            <Text style={[styles.epType, { color: info.color }]}>{info.label}</Text>
            <Text style={styles.epDate}>{formatDate(item.started_at)}</Text>
            <View style={styles.epBadgeRow}>
              {item.duration_minutes && (
                <View style={styles.badge}>
                  <Ionicons name="time-outline" size={10} color="#8894B0" />
                  <Text style={styles.badgeText}>{item.duration_minutes} min</Text>
                </View>
              )}
              {item.severity && (
                <View style={[styles.badge, { backgroundColor: severityColor(item.severity) + '18' }]}>
                  <Text style={[styles.badgeText, { color: severityColor(item.severity), fontWeight: '800' }]}>
                    {item.severity.toUpperCase()}
                  </Text>
                </View>
              )}
              {item.emergency_called && (
                <View style={[styles.badge, { backgroundColor: '#E74C3C18' }]}>
                  <Ionicons name="call" size={10} color="#E74C3C" />
                  <Text style={[styles.badgeText, { color: '#E74C3C' }]}>Emergency</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.epActions}>
            <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={15} color="#E74C3C" />
            </TouchableOpacity>
            <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#8894B0" />
          </View>
        </View>

        {isOpen && (
          <View style={styles.epDetail}>
            {item.triggers && <DetailRow label="Triggers / Before" value={item.triggers} />}
            {item.symptoms && <DetailRow label="Symptoms Observed" value={item.symptoms} />}
            {item.intervention && <DetailRow label="What Helped" value={item.intervention} />}
            {item.outcome && <DetailRow label="Outcome" value={item.outcome} />}
            {item.notes && <DetailRow label="Notes" value={item.notes} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <OctopusLogo size={28} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Episode Tracker</Text>
          <Text style={styles.subtitle}>{episodes.length} episodes recorded</Text>
        </View>
        <TouchableOpacity style={styles.logBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.logBtnText}>Log</Text>
        </TouchableOpacity>
      </View>

      {episodes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pulse-outline" size={64} color="#E2E8F4" />
          <Text style={styles.emptyTitle}>No Episodes Logged</Text>
          <Text style={styles.emptySub}>Tap "Log" to record an episode</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Log Episode</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={e => e.id}
          renderItem={renderEpisode}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Log Episode Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.formRoot, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Log Episode</Text>
            <TouchableOpacity onPress={() => { setShowForm(false); setForm(DEFAULT_FORM); }}>
              <Ionicons name="close" size={24} color="#1A2340" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formBody} showsVerticalScrollIndicator={false}>
            {/* Episode type */}
            <Text style={styles.fieldLabel}>Episode Type *</Text>
            <View style={styles.typeGrid}>
              {EPISODE_TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.typeChip, form.episode_type === t.value && { backgroundColor: t.color, borderColor: t.color }]}
                  onPress={() => setForm(f => ({ ...f, episode_type: t.value }))}
                >
                  <Ionicons name={t.icon as any} size={16} color={form.episode_type === t.value ? '#fff' : t.color} />
                  <Text style={[styles.typeChipText, form.episode_type === t.value && { color: '#fff' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Severity */}
            <Text style={styles.fieldLabel}>Severity</Text>
            <View style={styles.severityRow}>
              {SEVERITY_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.sevBtn, form.severity === s.value && { backgroundColor: s.color, borderColor: s.color }]}
                  onPress={() => setForm(f => ({ ...f, severity: f.severity === s.value ? null : s.value }))}
                >
                  <Text style={[styles.sevBtnText, form.severity === s.value && { color: '#fff' }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration */}
            <Text style={styles.fieldLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={form.duration_minutes}
              onChangeText={v => setForm(f => ({ ...f, duration_minutes: v.replace(/[^0-9]/g, '') }))}
              placeholder="e.g. 3"
              placeholderTextColor="#C0C8D8"
              keyboardType="number-pad"
            />

            {/* Emergency toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Emergency services called?</Text>
                <Text style={styles.toggleSub}>Ambulance, 911, etc.</Text>
              </View>
              <Switch
                value={form.emergency_called}
                onValueChange={v => setForm(f => ({ ...f, emergency_called: v }))}
                trackColor={{ true: '#E74C3C', false: '#E2E8F4' }}
                thumbColor={form.emergency_called ? '#fff' : '#fff'}
              />
            </View>

            {/* Text fields */}
            {[
              { key: 'triggers', label: 'What happened before? (Triggers)', ph: 'e.g. Missed sleep, loud noise, skipped meal...' },
              { key: 'symptoms', label: 'Symptoms observed', ph: 'e.g. Body shaking, eyes rolling, loss of consciousness...' },
              { key: 'intervention', label: 'What was done / What helped', ph: 'e.g. Recovery position, timed the episode, called doctor...' },
              { key: 'outcome', label: 'Outcome / After', ph: 'e.g. Recovered fully, went to sleep, taken to hospital...' },
              { key: 'notes', label: 'Additional Notes', ph: 'Any other observations...' },
            ].map(field => (
              <View key={field.key}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.ph}
                  placeholderTextColor="#C0C8D8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: typeInfo(form.episode_type).color }]}
              onPress={submit}
              disabled={logMut.isPending}
            >
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={styles.submitText}>
                {logMut.isPending ? 'Saving...' : 'Save Episode'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 1 },
  logBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E74C3C', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 10, ...shadow.sm },
  logBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: '#fff' },
  list: { padding: spacing.lg, gap: spacing.md },
  epCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, ...shadow.sm },
  epTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  epIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  epMeta: { flex: 1, gap: 3 },
  epType: { fontSize: fontSizes.md, fontWeight: '800' },
  epDate: { fontSize: fontSizes.xs, color: '#8894B0', fontWeight: '500' },
  epBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0F4FF', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9.5, fontWeight: '600', color: '#8894B0' },
  epActions: { alignItems: 'center', gap: spacing.xs },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
  epDetail: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#F0F4FF', gap: spacing.sm },
  detailRow: { gap: 3 },
  detailLabel: { fontSize: 10, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: fontSizes.sm, color: '#1A2340', lineHeight: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing['3xl'] },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  emptySub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#E74C3C', borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 14, marginTop: spacing.md },
  emptyBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  // Form
  formRoot: { flex: 1, backgroundColor: '#F6F9FF' },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  formTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  formBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  fieldLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: -4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, paddingVertical: 9, borderRadius: radius.full, borderWidth: 1.5, borderColor: '#E2E8F4', backgroundColor: '#F6F9FF' },
  typeChipText: { fontSize: fontSizes.sm, fontWeight: '700', color: '#4A5578' },
  severityRow: { flexDirection: 'row', gap: spacing.sm },
  sevBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4', backgroundColor: '#F6F9FF' },
  sevBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: '#4A5578' },
  input: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4', paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: fontSizes.md, color: '#1A2340', ...shadow.sm },
  textarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1.5, borderColor: '#E2E8F4', ...shadow.sm },
  toggleLabel: { fontSize: fontSizes.md, fontWeight: '700', color: '#1A2340' },
  toggleSub: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 2 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.full, paddingVertical: 16, marginTop: spacing.md },
  submitText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
});
