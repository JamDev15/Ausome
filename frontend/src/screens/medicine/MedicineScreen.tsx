import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, FlatList, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';
import { medicineApi, Medicine } from '../../api/medicine';
import { Loading } from '../../components/common/Loading';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { spacing, fontSizes, radius, shadow } from '../../theme';
import {
  requestNotificationPermissions,
  scheduleMedicineNotifications,
  cancelMedicineNotifications,
} from '../../utils/notifications';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'MedicineReminder'>;
  route: RouteProp<MainStackParamList, 'MedicineReminder'>;
};

const PILL_COLORS = ['#5B8DEF','#4CAF82','#F7A44A','#E8589A','#7C5CBF','#FF6B6B','#16A085','#FF8C00'];
const FREQ_OPTIONS = ['Once daily','Twice daily','Three times daily','Every 4 hours','Every 6 hours','Every 8 hours','As needed','Weekly'];

const DEFAULT_FORM = { name: '', dosage: '', frequency: 'Once daily', times: ['08:00'], color: PILL_COLORS[0], notes: '' };

function timeLabel(times: string[]): string {
  if (!times.length) return 'As needed';
  return times.join(' · ');
}

export const MedicineScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', childId],
    queryFn: () => medicineApi.list(childId),
    staleTime: 0,
  });

  const takenCount = medicines.filter(m => m.taken_today).length;

  const createMut = useMutation({
    mutationFn: (p: Parameters<typeof medicineApi.create>[0]) => medicineApi.create(p),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ['medicines', childId] });
      // Schedule daily notifications for the new medicine
      scheduleMedicineNotifications(created.id, created.name, created.dosage, created.times ?? []);
    },
  });
  const markTakenMut = useMutation({
    mutationFn: ({ id }: { id: string }) => medicineApi.markTaken(childId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines', childId] }),
  });
  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      await cancelMedicineNotifications(id);
      return medicineApi.remove(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicines', childId] }),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showFreqPicker, setShowFreqPicker] = useState(false);

  const submit = useCallback(() => {
    if (!form.name.trim() || !form.dosage.trim()) {
      Alert.alert('Missing info', 'Please enter medicine name and dosage.');
      return;
    }
    createMut.mutate({
      child_id: childId,
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      times: form.times,
      color: form.color,
      notes: form.notes.trim() || undefined,
    }, {
      onSuccess: () => { setShowForm(false); setForm(DEFAULT_FORM); },
    });
  }, [form, childId]);

  const confirmDelete = (med: Medicine) => {
    Alert.alert('Remove Medicine', `Remove ${med.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMut.mutate(med.id) },
    ]);
  };

  if (isLoading) return <Loading fullScreen />;

  const renderMed = ({ item }: { item: Medicine }) => {
    const pillColor = item.color ?? '#5B8DEF';
    return (
      <View style={[styles.medCard, { borderLeftColor: pillColor, borderLeftWidth: 5 }]}>
        <View style={styles.medTop}>
          <View style={[styles.pillIcon, { backgroundColor: pillColor + '22' }]}>
            <Ionicons name="medical" size={20} color={pillColor} />
          </View>
          <View style={styles.medInfo}>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.medDosage}>{item.dosage} · {item.frequency}</Text>
            {item.times.length > 0 && (
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={12} color="#8894B0" />
                <Text style={styles.timeText}>{timeLabel(item.times)}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>

        {item.notes ? <Text style={styles.medNotes}>{item.notes}</Text> : null}

        <TouchableOpacity
          style={[styles.takenBtn, item.taken_today && styles.takenBtnDone]}
          onPress={() => !item.taken_today && markTakenMut.mutate({ id: item.id })}
          disabled={item.taken_today}
        >
          <Ionicons
            name={item.taken_today ? 'checkmark-circle' : 'ellipse-outline'}
            size={18}
            color={item.taken_today ? '#4CAF82' : pillColor}
          />
          <Text style={[styles.takenBtnText, item.taken_today && { color: '#4CAF82' }]}>
            {item.taken_today ? 'Taken today ✓' : 'Mark as taken'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <OctopusLogo size={28} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Medicine</Text>
          <Text style={styles.subtitle}>
            {takenCount}/{medicines.length} taken today
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Today summary strip */}
      {medicines.length > 0 && (
        <View style={styles.summaryStrip}>
          <View style={styles.summaryProgress}>
            <View style={[styles.summaryFill, { width: `${medicines.length ? (takenCount / medicines.length) * 100 : 0}%` }]} />
          </View>
          <Text style={styles.summaryText}>
            {takenCount === medicines.length
              ? '🎉 All medicines taken today!'
              : `${medicines.length - takenCount} remaining today`}
          </Text>
        </View>
      )}

      {medicines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="medical-outline" size={64} color="#E2E8F4" />
          <Text style={styles.emptyTitle}>No medicines yet</Text>
          <Text style={styles.emptySub}>Tap + to add a medicine reminder</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.emptyBtnText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={m => m.id}
          renderItem={renderMed}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Medicine Modal */}
      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.formRoot, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Add Medicine</Text>
            <TouchableOpacity onPress={() => { setShowForm(false); setForm(DEFAULT_FORM); }}>
              <Ionicons name="close" size={24} color="#1A2340" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formBody} showsVerticalScrollIndicator={false}>
            {/* Color picker */}
            <Text style={styles.fieldLabel}>Pill Color</Text>
            <View style={styles.colorRow}>
              {PILL_COLORS.map(c => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, form.color === c && styles.colorDotActive]} onPress={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Medicine Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholder="e.g. Valproic Acid, Risperidone..."
              placeholderTextColor="#C0C8D8"
            />

            <Text style={styles.fieldLabel}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={form.dosage}
              onChangeText={v => setForm(f => ({ ...f, dosage: v }))}
              placeholder="e.g. 250mg, 1 tablet, 5ml..."
              placeholderTextColor="#C0C8D8"
            />

            <Text style={styles.fieldLabel}>Frequency</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowFreqPicker(true)}>
              <Text style={styles.pickerText}>{form.frequency}</Text>
              <Ionicons name="chevron-down" size={18} color="#8894B0" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Times (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={form.times.join(', ')}
              onChangeText={v => setForm(f => ({ ...f, times: v.split(',').map(t => t.trim()).filter(Boolean) }))}
              placeholder="e.g. 08:00, 14:00, 20:00"
              placeholderTextColor="#C0C8D8"
            />

            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.notes}
              onChangeText={v => setForm(f => ({ ...f, notes: v }))}
              placeholder="e.g. Take with food"
              placeholderTextColor="#C0C8D8"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: form.color }]}
              onPress={submit}
              disabled={createMut.isPending}
            >
              <Ionicons name="medical" size={18} color="#fff" />
              <Text style={styles.submitText}>
                {createMut.isPending ? 'Saving...' : 'Save Medicine'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Frequency picker modal */}
        <Modal visible={showFreqPicker} transparent animationType="fade">
          <TouchableOpacity style={styles.freqOverlay} activeOpacity={1} onPress={() => setShowFreqPicker(false)}>
            <View style={styles.freqBox}>
              {FREQ_OPTIONS.map(opt => (
                <TouchableOpacity key={opt} style={[styles.freqItem, form.frequency === opt && styles.freqItemActive]}
                  onPress={() => { setForm(f => ({ ...f, frequency: opt })); setShowFreqPicker(false); }}>
                  <Text style={[styles.freqText, form.frequency === opt && styles.freqTextActive]}>{opt}</Text>
                  {form.frequency === opt && <Ionicons name="checkmark" size={16} color="#5B8DEF" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 1 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5B8DEF', justifyContent: 'center', alignItems: 'center', ...shadow.sm },
  summaryStrip: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 6 },
  summaryProgress: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F4', overflow: 'hidden' },
  summaryFill: { height: '100%', backgroundColor: '#4CAF82', borderRadius: 4 },
  summaryText: { fontSize: fontSizes.xs, color: '#4A5578', fontWeight: '600' },
  list: { padding: spacing.lg, gap: spacing.md },
  medCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, ...shadow.sm },
  medTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  pillIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  medInfo: { flex: 1, gap: 3 },
  medName: { fontSize: fontSizes.lg, fontWeight: '800', color: '#1A2340' },
  medDosage: { fontSize: fontSizes.sm, color: '#4A5578', fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  timeText: { fontSize: fontSizes.xs, color: '#8894B0', fontWeight: '500' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
  medNotes: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: spacing.sm, fontStyle: 'italic' },
  takenBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: '#F6F9FF', borderWidth: 1.5, borderColor: '#E2E8F4' },
  takenBtnDone: { backgroundColor: '#E4F7EE', borderColor: '#4CAF8240' },
  takenBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: '#4A5578' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing['3xl'] },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  emptySub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#5B8DEF', borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 14, marginTop: spacing.md },
  emptyBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  // Form
  formRoot: { flex: 1, backgroundColor: '#F6F9FF' },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  formTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  formBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  fieldLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: -4 },
  colorRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  colorDotActive: { borderColor: '#1A2340', transform: [{ scale: 1.15 }] },
  input: { backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4', paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: fontSizes.md, color: '#1A2340', ...shadow.sm },
  textarea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  picker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4', paddingHorizontal: spacing.lg, paddingVertical: 14, ...shadow.sm },
  pickerText: { fontSize: fontSizes.md, color: '#1A2340', fontWeight: '600' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.full, paddingVertical: 16, marginTop: spacing.md },
  submitText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
  freqOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  freqBox: { backgroundColor: '#fff', borderRadius: radius.xl, width: '85%', overflow: 'hidden', ...shadow.lg },
  freqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F4FF' },
  freqItemActive: { backgroundColor: '#EAF1FF' },
  freqText: { fontSize: fontSizes.md, color: '#1A2340', fontWeight: '600' },
  freqTextActive: { color: '#5B8DEF', fontWeight: '800' },
});
