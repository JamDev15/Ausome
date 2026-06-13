import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speak } from '../../utils/speak';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types';
import { FlashcardIllustration } from '../../components/flashcards/FlashcardIllustration';
import { spacing, fontSizes, radius, shadow } from '../../theme';
import { activitiesApi } from '../../api/activities';
import { ACTIVITY_STAGES, nextLockedStage } from './activityConfig';
import { StageBar } from './StageBar';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ConnectActivity'>;
  route: RouteProp<MainStackParamList, 'ConnectActivity'>;
};

const { width: SW } = Dimensions.get('window');
const COLS = 4;
const GAP = 8;
const CARD_SIZE = (SW - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

const ALL_PAIRS = ['happy', 'dog', 'apple', 'ball', 'mom', 'car', 'book', 'bird'];
const STAGE_PAIRS = [4, 6, 8];

interface Card { id: string; word: string; flipped: boolean; matched: boolean; }

function buildDeck(pairCount: number): Card[] {
  const words = ALL_PAIRS.slice(0, pairCount);
  const deck = [...words, ...words].map((word, i) => ({
    id: `${word}-${i < pairCount ? 'a' : 'b'}`,
    word, flipped: false, matched: false,
  }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export const ConnectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.connect;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.connect?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('connect', completedStages));
  useEffect(() => { setActiveStage(nextLockedStage('connect', completedStages)); }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: ({ stage, score }: { stage: number; score: number }) =>
      activitiesApi.completeStage(childId, 'connect', stage, score),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const pairCount = STAGE_PAIRS[activeStage - 1] ?? 4;
  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairCount));
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [stageWon, setStageWon] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setCards(buildDeck(pairCount));
    setSelected([]); setMoves(0); setMatched(0); setLocked(false); setStageWon(false);
  }, [activeStage, pairCount]);

  const flip = useCallback((id: string) => {
    if (locked) return;
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    setSelected(prev => (prev.includes(id) || prev.length >= 2) ? prev : [...prev, id]);
  }, [locked]);

  useEffect(() => {
    if (selected.length < 2) return;
    const [a, b] = selected;
    const ca = cards.find(c => c.id === a)!;
    const cb = cards.find(c => c.id === b)!;
    setMoves(m => m + 1);
    if (ca.word === cb.word) {
      speak(ca.word, { rate: 0.85 });
      setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c));
      const newMatched = matched + 1;
      setMatched(newMatched);
      setSelected([]);
      if (newMatched === pairCount) {
        Animated.spring(bounceAnim, { toValue: 1.08, useNativeDriver: true }).start(() =>
          Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true }).start());
        saveMutation.mutate({ stage: activeStage, score: moves + 1 });
        setTimeout(() => setStageWon(true), 500);
      }
    } else {
      setLocked(true);
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, flipped: false } : c));
        setSelected([]); setLocked(false);
      }, 900);
    }
  }, [selected]);

  const restart = () => {
    setCards(buildDeck(pairCount));
    setSelected([]); setMoves(0); setMatched(0); setLocked(false); setStageWon(false);
  };

  const goNext = () => {
    const nextId = activeStage + 1;
    if (nextId <= stages.length) { setActiveStage(nextId); }
    else navigation.goBack();
  };

  const renderCard = ({ item }: { item: Card }) => {
    const isFlipped = item.flipped || item.matched;
    return (
      <TouchableOpacity
        style={[styles.card, item.matched && styles.cardMatched, !isFlipped && styles.cardBack]}
        onPress={() => !item.flipped && !item.matched && flip(item.id)}
        activeOpacity={0.8}
        disabled={item.flipped || item.matched || locked}
      >
        {isFlipped ? (
          <>
            <FlashcardIllustration word={item.word} color={item.matched ? '#4CAF82' : '#7C5CBF'} size={CARD_SIZE * 0.58} />
            <Text style={[styles.cardWord, item.matched && { color: '#4CAF82' }]} numberOfLines={1}>{item.word}</Text>
          </>
        ) : (
          <Ionicons name="help" size={28} color="rgba(255,255,255,0.7)" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Match It!</Text>
          <Text style={styles.subtitle}>Find the matching pairs</Text>
        </View>
        <TouchableOpacity style={styles.restartBtn} onPress={restart}>
          <Ionicons name="refresh" size={20} color="#7C5CBF" />
        </TouchableOpacity>
      </View>

      <StageBar stages={stages} activeStage={activeStage} completedStages={completedStages} accentColor="#7C5CBF" onSelect={setActiveStage} />

      <View style={styles.scoreStrip}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNum}>{matched}</Text>
          <Text style={styles.scoreLabel}>Pairs</Text>
        </View>
        <View style={styles.scoreProgress}>
          <View style={[styles.progressBar, { width: `${(matched / pairCount) * 100}%` }]} />
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreNum}>{moves}</Text>
          <Text style={styles.scoreLabel}>Moves</Text>
        </View>
      </View>

      <FlatList
        data={cards}
        numColumns={COLS}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.grid}
        scrollEnabled={false}
      />

      <Modal visible={stageWon} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.winBox, { transform: [{ scale: bounceAnim }] }]}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>Stage {activeStage} Done!</Text>
            <Text style={styles.winSub}>{pairCount} pairs in {moves} moves!</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>{activeStage < stages.length ? 'Next Stage' : 'All Done!'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.replayBtn} onPress={restart}>
              <Text style={styles.replayText}>Play Again</Text>
            </TouchableOpacity>
          </Animated.View>
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
  restartBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFE8FF', justifyContent: 'center', alignItems: 'center' },
  scoreStrip: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4' },
  scoreBox: { alignItems: 'center', minWidth: 44 },
  scoreNum: { fontSize: fontSizes.xl, fontWeight: '800', color: '#7C5CBF' },
  scoreLabel: { fontSize: fontSizes.xs, color: '#8894B0', fontWeight: '600' },
  scoreProgress: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E2E8F4', overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#4CAF82', borderRadius: 4 },
  grid: { padding: spacing.lg, gap: GAP },
  card: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: radius.lg, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', margin: GAP / 2, ...shadow.sm, overflow: 'hidden' },
  cardBack: { backgroundColor: '#7C5CBF' },
  cardMatched: { backgroundColor: '#E4F7EE', borderWidth: 2, borderColor: '#4CAF82' },
  cardWord: { fontSize: 9, fontWeight: '700', color: '#1A2340', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  winBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  winEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  winSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#7C5CBF', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  replayBtn: { paddingVertical: spacing.sm },
  replayText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
