import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { notesApi } from '../../api/notes';
import { CaregiverNote, MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'CaregiverNotes'>;
  route: RouteProp<MainStackParamList, 'CaregiverNotes'>;
};

const CATEGORIES = ['All', 'progress', 'therapy', 'behavior', 'school', 'medical', 'general'];
const CATEGORY_COLORS: Record<string, string> = { progress: 'success', therapy: 'primary', behavior: 'warning', school: 'info', medical: 'error', general: 'neutral' };

export const CaregiverNotesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', childId, filter],
    queryFn: () => notesApi.list(childId, filter === 'All' ? undefined : filter),
  });

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', childId] });
      setShowAdd(false); setTitle(''); setContent('');
    },
    onError: () => Alert.alert('Error', 'Could not save note.'),
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', childId] }),
  });

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Caregiver Notes"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.filterChip, filter === cat && styles.filterChipActive]} onPress={() => setFilter(cat)}>
            <Text style={[styles.filterChipText, filter === cat && styles.filterChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {notes.length === 0 ? (
        <EmptyState icon="document-text-outline" title="No notes yet" message="Add notes after therapy sessions, school days, or any notable moments." actionLabel="Add Note" onAction={() => setShowAdd(true)} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: note }) => (
            <Card style={styles.noteCard}>
              <View style={styles.noteHeader}>
                {note.is_pinned && <Ionicons name="pin" size={14} color={colors.accent} style={styles.pinIcon} />}
                <Text style={styles.noteTitle} numberOfLines={1}>{note.title || 'Note'}</Text>
                {note.category && <Badge label={note.category} variant={(CATEGORY_COLORS[note.category] as any) ?? 'neutral'} small />}
                <TouchableOpacity onPress={() => Alert.alert('Delete Note?', '', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(note.id) },
                ])} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
              <Text style={styles.noteContent} numberOfLines={5}>{note.content}</Text>
              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {note.tags.map(t => <Badge key={t} label={`#${t}`} variant="neutral" small style={styles.tag} />)}
                </View>
              )}
              <Text style={styles.noteDate}>{new Date(note.created_at).toLocaleDateString()}</Text>
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>New Note</Text>
          <Text style={styles.label}>Title (optional)</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Great day at school" placeholderTextColor={colors.textTertiary} />
          <Text style={styles.label}>Note</Text>
          <TextInput style={[styles.input, styles.textArea]} value={content} onChangeText={setContent} placeholder="Write your note here..." placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />
          <Text style={styles.label}>Category</Text>
          <View style={styles.catRow}>
            {CATEGORIES.slice(1).map(cat => (
              <TouchableOpacity key={cat} style={[styles.catChip, category === cat && styles.catChipActive]} onPress={() => setCategory(cat)}>
                <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <Button label="Cancel" onPress={() => setShowAdd(false)} variant="outline" style={{ flex: 1 }} />
            <Button label="Save Note" onPress={() => {
              if (!content.trim()) { Alert.alert('Missing', 'Please write something in the note.'); return; }
              createMutation.mutate({ child_id: childId, title, content, category });
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.primaryLight + '60', borderWidth: 1.5, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '700' },
  filterChipTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  noteCard: {},
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.xs },
  pinIcon: { marginRight: 2 },
  noteTitle: { flex: 1, fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  deleteBtn: { padding: spacing.xs },
  noteContent: { fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: {},
  noteDate: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: spacing.sm },
  modal: { flex: 1, padding: spacing['2xl'], backgroundColor: colors.background },
  modalTitle: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.xl },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  textArea: { minHeight: 160 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  catChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  catChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: colors.primary },
  modalActions: { flexDirection: 'row', gap: spacing.md },
});
