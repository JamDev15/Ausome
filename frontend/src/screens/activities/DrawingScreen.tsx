import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, PanResponder, Alert, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';
import { spacing, fontSizes, radius } from '../../theme';
import { activitiesApi } from '../../api/activities';
import { ACTIVITY_STAGES, nextLockedStage } from './activityConfig';
import { StageBar } from './StageBar';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'DrawingActivity'>;
  route: RouteProp<MainStackParamList, 'DrawingActivity'>;
};

const { width: SW, height: SH } = Dimensions.get('window');

const ALL_PALETTE = [
  '#E8589A', '#FF6B6B', '#F7A44A', '#FFD700',
  '#4CAF82', '#5B8DEF', '#7C5CBF', '#16A085',
  '#FF8C00', '#00CED1', '#8B4513', '#1A2340',
];
// Stage 1 = 6 colors, Stage 2 = 12, Stage 3 = 12 + eraser + brush sizes
const STAGE_COLORS = [6, 12, 12];
const STAGE_BRUSHES = [1, 2, 3]; // number of brush sizes available
const STAGE_ERASER = [false, false, true];

const BRUSHES = [{ size: 4, label: 'S' }, { size: 10, label: 'M' }, { size: 20, label: 'L' }];

interface Stroke { d: string; color: string; width: number; }

export const DrawingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.drawing;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.drawing?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('drawing', completedStages));
  useEffect(() => { setActiveStage(nextLockedStage('drawing', completedStages)); }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: (stage: number) => activitiesApi.completeStage(childId, 'drawing', stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const colorCount = STAGE_COLORS[activeStage - 1] ?? 12;
  const brushCount = STAGE_BRUSHES[activeStage - 1] ?? 1;
  const hasEraser = STAGE_ERASER[activeStage - 1] ?? false;
  const palette = ALL_PALETTE.slice(0, colorCount);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeColor, setActiveColor] = useState(palette[0]);
  const [activeBrush, setActiveBrush] = useState(0);
  const [isEraser, setIsEraser] = useState(false);
  const [savedModal, setSavedModal] = useState(false);

  const currentD = useRef('');
  const strokesRef = useRef<Stroke[]>([]);
  const colorRef = useRef(activeColor);
  const brushRef = useRef(BRUSHES[0].size);
  const eraserRef = useRef(false);

  // Reset canvas when stage changes
  useEffect(() => {
    strokesRef.current = [];
    setStrokes([]);
    setActiveColor(ALL_PALETTE.slice(0, STAGE_COLORS[activeStage - 1] ?? 12)[0]);
    setActiveBrush(0);
    setIsEraser(false);
  }, [activeStage]);

  const TOOLBAR_H = 86 + insets.bottom;
  const HEADER_H = insets.top + 56;
  const STAGEBAR_H = 74;
  const CANVAS_H = SH - HEADER_H - STAGEBAR_H - TOOLBAR_H;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      currentD.current = `M${x.toFixed(1)},${y.toFixed(1)}`;
    },
    onPanResponderMove: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      currentD.current += ` L${x.toFixed(1)},${y.toFixed(1)}`;
      if (currentD.current.split('L').length % 3 === 0) {
        const live: Stroke = { d: currentD.current, color: eraserRef.current ? '#FAFBFF' : colorRef.current, width: eraserRef.current ? brushRef.current * 3 : brushRef.current };
        setStrokes([...strokesRef.current, live]);
      }
    },
    onPanResponderRelease: () => {
      if (!currentD.current) return;
      const done: Stroke = { d: currentD.current, color: eraserRef.current ? '#FAFBFF' : colorRef.current, width: eraserRef.current ? brushRef.current * 3 : brushRef.current };
      strokesRef.current = [...strokesRef.current, done];
      setStrokes([...strokesRef.current]);
      currentD.current = '';
    },
  })).current;

  const selectColor = useCallback((c: string) => {
    setActiveColor(c); colorRef.current = c;
    setIsEraser(false); eraserRef.current = false;
  }, []);

  const selectBrush = useCallback((idx: number) => {
    setActiveBrush(idx); brushRef.current = BRUSHES[idx].size;
  }, []);

  const toggleEraser = useCallback(() => {
    setIsEraser(prev => { eraserRef.current = !prev; return !prev; });
  }, []);

  const undo = useCallback(() => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokes([...strokesRef.current]);
  }, []);

  const clear = useCallback(() => {
    Alert.alert('Clear Canvas', 'Erase everything?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { strokesRef.current = []; setStrokes([]); } },
    ]);
  }, []);

  const saveDrawing = useCallback(() => {
    if (strokesRef.current.length === 0) {
      Alert.alert('Nothing to save!', 'Draw something first.');
      return;
    }
    if (!completedStages.includes(activeStage)) {
      saveMutation.mutate(activeStage);
    }
    setSavedModal(true);
  }, [activeStage, completedStages]);

  const goNext = () => {
    const nextId = activeStage + 1;
    if (nextId <= stages.length) { setActiveStage(nextId); setSavedModal(false); }
    else navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <Text style={styles.title}>Painting</Text>
        <TouchableOpacity style={styles.undoBtn} onPress={undo}>
          <Ionicons name="arrow-undo" size={20} color="#5B8DEF" />
        </TouchableOpacity>
      </View>

      <StageBar stages={stages} activeStage={activeStage} completedStages={completedStages} accentColor="#E8589A" onSelect={setActiveStage} />

      <View style={[styles.canvas, { height: CANVAS_H }]} {...panResponder.panHandlers}>
        <Svg width={SW} height={CANVAS_H} style={StyleSheet.absoluteFill}>
          {strokes.map((s, i) => (
            <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
        {strokes.length === 0 && (
          <View style={styles.canvasHint} pointerEvents="none">
            <Ionicons name="brush" size={40} color="rgba(0,0,0,0.08)" />
            <Text style={styles.canvasHintText}>Draw something!</Text>
          </View>
        )}
      </View>

      <View style={[styles.toolbar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={styles.palette}>
          {palette.map((c) => (
            <TouchableOpacity key={c} style={[styles.dot, { backgroundColor: c }, activeColor === c && !isEraser && styles.dotActive]} onPress={() => selectColor(c)} />
          ))}
        </View>
        <View style={styles.toolRow}>
          {BRUSHES.slice(0, brushCount).map((b, i) => (
            <TouchableOpacity key={b.label} style={[styles.brushBtn, activeBrush === i && { backgroundColor: activeColor + '33', borderColor: activeColor }]} onPress={() => selectBrush(i)}>
              <View style={{ width: b.size * 0.6 + 6, height: b.size * 0.6 + 6, borderRadius: 99, backgroundColor: isEraser ? '#ccc' : activeColor }} />
            </TouchableOpacity>
          ))}
          <View style={styles.toolDivider} />
          {hasEraser && (
            <TouchableOpacity style={[styles.iconBtn, isEraser && { backgroundColor: '#FFE0E0' }]} onPress={toggleEraser}>
              <Ionicons name="pencil" size={18} color={isEraser ? '#E74C3C' : '#8894B0'} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={clear}>
            <Ionicons name="trash-outline" size={18} color="#E74C3C" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { marginLeft: 'auto' }]} onPress={saveDrawing}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={savedModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.winBox}>
            <Text style={styles.winEmoji}>🎨</Text>
            <Text style={styles.winTitle}>Beautiful!</Text>
            <Text style={styles.winSub}>Your drawing is saved!</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>{activeStage < stages.length ? 'Next Stage' : 'All Done!'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replayBtn} onPress={() => setSavedModal(false)}>
              <Text style={styles.replayText}>Keep Drawing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFBFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  title: { flex: 1, fontSize: fontSizes.lg, fontWeight: '800', color: '#1A2340' },
  undoBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EAF1FF', justifyContent: 'center', alignItems: 'center' },
  canvas: { width: SW, backgroundColor: '#FAFBFF', justifyContent: 'center', alignItems: 'center' },
  canvasHint: { alignItems: 'center', gap: 8 },
  canvasHintText: { fontSize: fontSizes.sm, color: 'rgba(0,0,0,0.12)', fontWeight: '600' },
  toolbar: { backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: '#E2E8F4', paddingTop: spacing.sm, paddingHorizontal: spacing.md, gap: spacing.sm },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' },
  dotActive: { borderColor: '#1A2340', transform: [{ scale: 1.18 }] },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brushBtn: { width: 42, height: 42, borderRadius: radius.md, borderWidth: 1.5, borderColor: '#E2E8F4', justifyContent: 'center', alignItems: 'center' },
  toolDivider: { width: 1, height: 28, backgroundColor: '#E2E8F4', marginHorizontal: 2 },
  iconBtn: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: '#F6F9FF', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8589A', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 10 },
  saveBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  winBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%' },
  winEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  winSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#E8589A', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  replayBtn: { paddingVertical: spacing.sm },
  replayText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
