import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal } from 'react-native';
import Svg, { Circle, Rect, Polygon, Ellipse, Path, G } from 'react-native-svg';
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
  navigation: NativeStackNavigationProp<MainStackParamList, 'ShapesActivity'>;
  route: RouteProp<MainStackParamList, 'ShapesActivity'>;
};

const { width: SW } = Dimensions.get('window');
const COLS = 3;
const GAP = 12;
const CARD_W = (SW - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;
const SVG_S = CARD_W * 0.56;

type SR = (c: string) => React.ReactNode;
const ALL_SHAPES: { name: string; color: string; render: SR }[] = [
  { name: 'Circle',    color: '#FF6B6B', render: c => <Circle cx="50" cy="50" r="42" fill={c} /> },
  { name: 'Square',    color: '#F7A44A', render: c => <Rect x="10" y="10" width="80" height="80" rx="6" fill={c} /> },
  { name: 'Triangle',  color: '#FFD700', render: c => <Polygon points="50,8 92,90 8,90" fill={c} /> },
  { name: 'Rectangle', color: '#4CAF82', render: c => <Rect x="8" y="25" width="84" height="50" rx="6" fill={c} /> },
  { name: 'Oval',      color: '#5B8DEF', render: c => <Ellipse cx="50" cy="50" rx="44" ry="28" fill={c} /> },
  { name: 'Star',      color: '#FFD700', render: c => <Polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={c} /> },
  { name: 'Heart',     color: '#E8589A', render: c => <Path d="M50,80 C20,60 5,45 5,30 C5,18 14,8 25,8 C33,8 42,14 50,22 C58,14 67,8 75,8 C86,8 95,18 95,30 C95,45 80,60 50,80 Z" fill={c} /> },
  { name: 'Diamond',   color: '#7C5CBF', render: c => <Polygon points="50,5 95,50 50,95 5,50" fill={c} /> },
  { name: 'Pentagon',  color: '#16A085', render: c => <Polygon points="50,5 97,37 79,91 21,91 3,37" fill={c} /> },
  { name: 'Hexagon',   color: '#FF8C00', render: c => <Polygon points="50,5 91,27 91,73 50,95 9,73 9,27" fill={c} /> },
  { name: 'Octagon',   color: '#00CED1', render: c => <Polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill={c} /> },
  { name: 'Cross',     color: '#FF6B6B', render: c => <G fill={c}><Rect x="35" y="5" width="30" height="90" rx="6" /><Rect x="5" y="35" width="90" height="30" rx="6" /></G> },
  { name: 'Crescent',  color: '#5B8DEF', render: c => <Path d="M50,5 A45,45 0 1 1 50,95 A30,30 0 1 0 50,5 Z" fill={c} /> },
  { name: 'Arrow',     color: '#4CAF82', render: c => <Polygon points="50,5 95,45 70,45 70,95 30,95 30,45 5,45" fill={c} /> },
  { name: 'Trapezoid', color: '#F7A44A', render: c => <Polygon points="20,75 80,75 95,25 5,25" fill={c} /> },
];
const STAGE_COUNTS = [5, 10, 15];

export const ShapesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.shapes;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.shapes?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('shapes', completedStages));
  useEffect(() => { setActiveStage(nextLockedStage('shapes', completedStages)); }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: (stage: number) => activitiesApi.completeStage(childId, 'shapes', stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const count = STAGE_COUNTS[activeStage - 1] ?? 15;
  const stageShapes = ALL_SHAPES.slice(0, count);
  const [selected, setSelected] = useState<typeof ALL_SHAPES[0] | null>(null);
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [stageWon, setStageWon] = useState(false);

  useEffect(() => { setTapped(new Set()); setStageWon(false); }, [activeStage]);

  const tap = useCallback((item: typeof ALL_SHAPES[0]) => {
    setSelected(item);
    speak(item.name, { rate: 0.85 });
    setTapped(prev => {
      const next = new Set(prev);
      next.add(item.name);
      if (next.size === stageShapes.length && !completedStages.includes(activeStage)) {
        saveMutation.mutate(activeStage);
        setTimeout(() => setStageWon(true), 600);
      }
      return next;
    });
  }, [stageShapes, completedStages, activeStage]);

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
          <Text style={styles.title}>Shapes</Text>
          <Text style={styles.subtitle}>Tap every shape — {stageShapes.length - tapped.size} left!</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
      </View>

      <StageBar stages={stages} activeStage={activeStage} completedStages={completedStages} accentColor="#16A085" onSelect={setActiveStage} />

      <FlatList
        data={stageShapes}
        numColumns={COLS}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const done = tapped.has(item.name);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: item.color + '15' }, done && { borderColor: item.color, borderWidth: 2 }]}
              onPress={() => tap(item)} activeOpacity={0.82}
            >
              {done && <Ionicons name="checkmark-circle" size={14} color={item.color} style={styles.checkIcon} />}
              <Svg width={SVG_S} height={SVG_S} viewBox="0 0 100 100">
                {item.render(done ? item.color : item.color + 'AA')}
              </Svg>
              <Text style={[styles.shapeName, { color: item.color }]}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={!!selected && !stageWon} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        {selected && (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
            <View style={[styles.detailBox, { borderTopColor: selected.color, borderTopWidth: 5 }]}>
              <Svg width={130} height={130} viewBox="0 0 100 100" style={{ marginBottom: spacing.lg }}>
                {selected.render(selected.color)}
              </Svg>
              <Text style={[styles.detailName, { color: selected.color }]}>{selected.name}</Text>
              <TouchableOpacity style={[styles.listenBtn, { backgroundColor: selected.color }]}
                onPress={() => speak(selected.name, { rate: 0.85 })}>
                <Ionicons name="volume-high" size={18} color="#fff" />
                <Text style={styles.listenText}>Say it!</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </Modal>

      <Modal visible={stageWon} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.winBox}>
            <Text style={styles.winEmoji}>🔷</Text>
            <Text style={styles.winTitle}>Stage {activeStage} Done!</Text>
            <Text style={styles.winSub}>You learned {count} shapes!</Text>
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
  badge: { backgroundColor: '#16A085', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontSize: fontSizes.xs, fontWeight: '800', color: '#fff' },
  grid: { padding: spacing.lg, gap: GAP },
  card: { width: CARD_W, borderRadius: radius.xl, margin: GAP / 2, alignItems: 'center', paddingVertical: spacing.md, ...shadow.sm, position: 'relative' },
  checkIcon: { position: 'absolute', top: 6, right: 6 },
  shapeName: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  detailBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '78%', ...shadow.lg },
  detailName: { fontSize: 26, fontWeight: '800', marginBottom: spacing.xl },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 12 },
  listenText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  winBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  winEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  winSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#16A085', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  replayBtn: { paddingVertical: spacing.sm },
  replayText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
