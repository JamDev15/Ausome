import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Modal, Animated,
} from 'react-native';
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
  navigation: NativeStackNavigationProp<MainStackParamList, 'CountingActivity'>;
  route: RouteProp<MainStackParamList, 'CountingActivity'>;
};

const { width: SW } = Dimensions.get('window');
const COLS = 10;
const GAP = 5;
const NUM_SIZE = (SW - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

const STAGE_MAX = [0, 10, 25, 50, 100];

const NUMBER_WORDS = [
  '', 'one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty',
  'twenty one','twenty two','twenty three','twenty four','twenty five','twenty six','twenty seven','twenty eight','twenty nine','thirty',
  'thirty one','thirty two','thirty three','thirty four','thirty five','thirty six','thirty seven','thirty eight','thirty nine','forty',
  'forty one','forty two','forty three','forty four','forty five','forty six','forty seven','forty eight','forty nine','fifty',
  'fifty one','fifty two','fifty three','fifty four','fifty five','fifty six','fifty seven','fifty eight','fifty nine','sixty',
  'sixty one','sixty two','sixty three','sixty four','sixty five','sixty six','sixty seven','sixty eight','sixty nine','seventy',
  'seventy one','seventy two','seventy three','seventy four','seventy five','seventy six','seventy seven','seventy eight','seventy nine','eighty',
  'eighty one','eighty two','eighty three','eighty four','eighty five','eighty six','eighty seven','eighty eight','eighty nine','ninety',
  'ninety one','ninety two','ninety three','ninety four','ninety five','ninety six','ninety seven','ninety eight','ninety nine','one hundred',
];

const ROW_COLORS = [
  '#FF6B6B','#F7A44A','#FFD700','#4CAF82','#5B8DEF',
  '#7C5CBF','#E8589A','#16A085','#FF8C00','#00CED1',
];

export const CountingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.counting;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.counting?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('counting', completedStages));

  useEffect(() => {
    setActiveStage(nextLockedStage('counting', completedStages));
  }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: (stage: number) => activitiesApi.completeStage(childId, 'counting', stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const max = STAGE_MAX[activeStage] ?? 10;
  const [current, setCurrent] = useState(1);
  const [stageWon, setStageWon] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // reset counting when stage changes
  useEffect(() => { setCurrent(1); setStageWon(false); }, [activeStage]);

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const tap = useCallback((n: number) => {
    if (n < current) return;
    if (n === current) {
      speak(NUMBER_WORDS[n], { rate: 0.85 });
      if (n === max) {
        Animated.spring(bounceAnim, { toValue: 1.08, useNativeDriver: true }).start(() =>
          Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }).start());
        speak(`${NUMBER_WORDS[max]}! Amazing!`, { rate: 0.85 });
        saveMutation.mutate(activeStage);
        setTimeout(() => setStageWon(true), 900);
      } else {
        setCurrent(n + 1);
      }
    } else {
      shake();
      speak(`Try number ${NUMBER_WORDS[current]}`, { rate: 0.85 });
    }
  }, [current, max, shake, bounceAnim, activeStage]);

  const restart = () => { setCurrent(1); setStageWon(false); };

  const goNext = () => {
    const nextId = activeStage + 1;
    if (nextId <= stages.length) {
      setActiveStage(nextId);
      setStageWon(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Count 1 – {max}</Text>
          <Text style={styles.subtitle}>Tap the numbers in order!</Text>
        </View>
        <TouchableOpacity style={styles.restartBtn} onPress={restart}>
          <Ionicons name="refresh" size={20} color="#4CAF82" />
        </TouchableOpacity>
      </View>

      <StageBar
        stages={stages}
        activeStage={activeStage}
        completedStages={completedStages}
        accentColor="#4CAF82"
        onSelect={(id) => { setActiveStage(id); }}
      />

      <Animated.View style={[styles.progressWrap, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${((current - 1) / max) * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          Tap <Text style={styles.progressNum}>{current}</Text> next!
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const tapped = n < current;
          const isNext = n === current;
          const c = ROW_COLORS[Math.floor((n - 1) / 10) % 10];
          return (
            <TouchableOpacity
              key={n}
              style={[
                styles.numBtn,
                tapped && { backgroundColor: c, borderColor: c },
                isNext && { backgroundColor: c, borderColor: c, transform: [{ scale: 1.1 }] },
              ]}
              onPress={() => tap(n)}
              activeOpacity={0.75}
            >
              <Text style={[styles.numText, (tapped || isNext) && { color: '#fff' }]}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={stageWon} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.modal, { transform: [{ scale: bounceAnim }] }]}>
            <Text style={styles.modalEmoji}>🌟</Text>
            <Text style={styles.modalTitle}>Stage {activeStage} Done!</Text>
            <Text style={styles.modalSub}>You counted to {max}! Amazing!</Text>
            <TouchableOpacity style={styles.modalPrimary} onPress={goNext}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.modalPrimaryText}>
                {activeStage < stages.length ? 'Next Stage' : 'All Done!'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSecondary} onPress={restart}>
              <Text style={styles.modalSecondaryText}>Play Again</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: fontSizes.lg, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.xs, color: '#8894B0' },
  restartBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#E4F7EE', justifyContent: 'center', alignItems: 'center',
  },
  progressWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: '#E2E8F4', overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', backgroundColor: '#4CAF82', borderRadius: 4 },
  progressLabel: { fontSize: fontSizes.xs, color: '#8894B0', fontWeight: '600' },
  progressNum: { fontWeight: '800', color: '#4CAF82', fontSize: fontSizes.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.lg, gap: GAP },
  numBtn: {
    width: NUM_SIZE, height: NUM_SIZE, borderRadius: radius.sm,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E2E8F4', ...shadow.sm,
  },
  numText: { fontSize: NUM_SIZE * 0.3, fontWeight: '800', color: '#4A5578' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modal: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  modalEmoji: { fontSize: 56, marginBottom: spacing.sm },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  modalSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  modalPrimary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#4CAF82', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  modalPrimaryText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  modalSecondary: { paddingVertical: spacing.sm },
  modalSecondaryText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
