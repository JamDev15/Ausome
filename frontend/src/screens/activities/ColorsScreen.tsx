import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speak } from '../../utils/speak';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';
import { spacing, fontSizes, radius, shadow } from '../../theme';
import { activitiesApi } from '../../api/activities';
import { ACTIVITY_STAGES, nextLockedStage } from './activityConfig';
import { StageBar } from './StageBar';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ColorsActivity'>;
  route: RouteProp<MainStackParamList, 'ColorsActivity'>;
};

const { width: SW } = Dimensions.get('window');
const COLS = 4;
const GAP = 10;
const CARD_W = (SW - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

const ALL_COLORS = [
  // Stage 1 — 6 primary/basic
  { name: 'Red',     hex: '#FF3B30', text: '#fff' },
  { name: 'Blue',    hex: '#007AFF', text: '#fff' },
  { name: 'Yellow',  hex: '#FFCC00', text: '#1A2340' },
  { name: 'Green',   hex: '#34C759', text: '#fff' },
  { name: 'Orange',  hex: '#FF9500', text: '#fff' },
  { name: 'Purple',  hex: '#AF52DE', text: '#fff' },
  // Stage 2 — next 6
  { name: 'Pink',    hex: '#FF2D92', text: '#fff' },
  { name: 'Brown',   hex: '#A2845E', text: '#fff' },
  { name: 'Black',   hex: '#1C1C1E', text: '#fff' },
  { name: 'White',   hex: '#FFFFFF', text: '#1A2340' },
  { name: 'Gray',    hex: '#8E8E93', text: '#fff' },
  { name: 'Cyan',    hex: '#32ADE6', text: '#fff' },
  // Stage 3 — remaining 8
  { name: 'Lime',    hex: '#A4D65E', text: '#1A2340' },
  { name: 'Teal',    hex: '#30B0C7', text: '#fff' },
  { name: 'Indigo',  hex: '#5856D6', text: '#fff' },
  { name: 'Violet',  hex: '#BF5AF2', text: '#fff' },
  { name: 'Gold',    hex: '#D4AF37', text: '#fff' },
  { name: 'Silver',  hex: '#C0C0C0', text: '#1A2340' },
  { name: 'Coral',   hex: '#FF6B6B', text: '#fff' },
  { name: 'Magenta', hex: '#FF45A0', text: '#fff' },
];
const STAGE_COUNTS = [6, 12, 20];

export const ColorsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.colors;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.colors?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('colors', completedStages));
  useEffect(() => { setActiveStage(nextLockedStage('colors', completedStages)); }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: (stage: number) => activitiesApi.completeStage(childId, 'colors', stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const count = STAGE_COUNTS[activeStage - 1] ?? 20;
  const stageColors = ALL_COLORS.slice(0, count);
  const [selected, setSelected] = useState<typeof ALL_COLORS[0] | null>(null);
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [stageWon, setStageWon] = useState(false);

  useEffect(() => { setTapped(new Set()); setStageWon(false); }, [activeStage]);

  const tap = useCallback((item: typeof ALL_COLORS[0]) => {
    setSelected(item);
    speak(item.name, { rate: 0.85 });
    setTapped(prev => {
      const next = new Set(prev);
      next.add(item.name);
      if (next.size === stageColors.length && !completedStages.includes(activeStage)) {
        saveMutation.mutate(activeStage);
        setTimeout(() => setStageWon(true), 600);
      }
      return next;
    });
  }, [stageColors, completedStages, activeStage]);

  const goNext = () => {
    const nextId = activeStage + 1;
    if (nextId <= stages.length) { setActiveStage(nextId); setStageWon(false); }
    else navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Colors</Text>
          <Text style={styles.subtitle}>Tap every color — {stageColors.length - tapped.size} left!</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
      </View>

      <StageBar stages={stages} activeStage={activeStage} completedStages={completedStages} accentColor="#5B8DEF" onSelect={setActiveStage} />

      <FlatList
        data={stageColors}
        numColumns={COLS}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const done = tapped.has(item.name);
          return (
            <TouchableOpacity style={[styles.card, done && styles.cardDone]} onPress={() => tap(item)} activeOpacity={0.82}>
              <View style={[styles.swatch, { backgroundColor: item.hex, borderColor: item.hex === '#FFFFFF' ? '#E2E8F4' : item.hex }]}>
                {done && <Ionicons name="checkmark-circle" size={22} color={item.hex === '#FFFFFF' ? '#4CAF82' : 'rgba(255,255,255,0.9)'} />}
              </View>
              <Text style={styles.colorName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail modal */}
      <Modal visible={!!selected && !stageWon} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        {selected && (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
            <View style={styles.detailBox}>
              <View style={[styles.bigSwatch, { backgroundColor: selected.hex, borderColor: selected.hex === '#FFFFFF' ? '#E2E8F4' : selected.hex }]}>
                <Text style={[styles.swatchInitial, { color: selected.text }]}>{selected.name[0]}</Text>
              </View>
              <Text style={styles.detailName}>{selected.name}</Text>
              <TouchableOpacity style={[styles.listenBtn, { backgroundColor: selected.hex, borderColor: selected.hex === '#FFFFFF' ? '#E2E8F4' : selected.hex }]}
                onPress={() => speak(selected.name, { rate: 0.85 })}>
                <Ionicons name="volume-high" size={18} color={selected.text} />
                <Text style={[styles.listenText, { color: selected.text }]}>Say it!</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </Modal>

      {/* Stage win */}
      <Modal visible={stageWon} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.winBox}>
            <Text style={styles.winEmoji}>🌈</Text>
            <Text style={styles.winTitle}>Stage {activeStage} Done!</Text>
            <Text style={styles.winSub}>You learned {count} colors!</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>{activeStage < stages.length ? 'Next Stage' : 'All Done!'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replayBtn} onPress={() => { setTapped(new Set()); setStageWon(false); }}>
              <Text style={styles.replayText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.lg, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.xs, color: '#8894B0' },
  badge: { backgroundColor: '#5B8DEF', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontSize: fontSizes.xs, fontWeight: '800', color: '#fff' },
  grid: { padding: spacing.lg, gap: GAP },
  card: { width: CARD_W, borderRadius: radius.lg, margin: GAP / 2, alignItems: 'center', backgroundColor: '#fff', ...shadow.sm, overflow: 'hidden' },
  cardDone: { borderWidth: 2, borderColor: '#4CAF82' },
  swatch: { width: CARD_W, height: CARD_W, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  colorName: { paddingVertical: 6, fontSize: 10, fontWeight: '800', color: '#1A2340', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  detailBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '78%', ...shadow.lg },
  bigSwatch: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 3, marginBottom: spacing.lg },
  swatchInitial: { fontSize: 48, fontWeight: '900' },
  detailName: { fontSize: 26, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xl },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 12, borderWidth: 2 },
  listenText: { fontSize: fontSizes.md, fontWeight: '800' },
  winBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  winEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  winSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#5B8DEF', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  replayBtn: { paddingVertical: spacing.sm },
  replayText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
