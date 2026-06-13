import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { speak as ttsSpeak } from '../../utils/speak';
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
  navigation: NativeStackNavigationProp<MainStackParamList, 'AlphabetActivity'>;
  route: RouteProp<MainStackParamList, 'AlphabetActivity'>;
};

const { width: SW } = Dimensions.get('window');
const COLS = 5;
const GAP = 8;
const CARD_W = (SW - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

const ALL_LETTERS = [
  { letter: 'A', word: 'Apple',   color: '#FF6B6B' },
  { letter: 'B', word: 'Ball',    color: '#F7A44A' },
  { letter: 'C', word: 'Cat',     color: '#FFD700' },
  { letter: 'D', word: 'Dog',     color: '#4CAF82' },
  { letter: 'E', word: 'Egg',     color: '#5B8DEF' },
  { letter: 'F', word: 'Fish',    color: '#7C5CBF' },
  { letter: 'G', word: 'Grape',   color: '#E8589A' },
  { letter: 'H', word: 'Happy',   color: '#16A085' },
  { letter: 'I', word: 'Ice',     color: '#5B8DEF' },
  { letter: 'J', word: 'Juice',   color: '#FF8C00' },
  { letter: 'K', word: 'Kite',    color: '#00CED1' },
  { letter: 'L', word: 'Lion',    color: '#F7A44A' },
  { letter: 'M', word: 'Milk',    color: '#E8589A' },
  { letter: 'N', word: 'Numbers', color: '#4CAF82' },
  { letter: 'O', word: 'Orange',  color: '#FF8C00' },
  { letter: 'P', word: 'Pizza',   color: '#FF6B6B' },
  { letter: 'Q', word: 'Queen',   color: '#7C5CBF' },
  { letter: 'R', word: 'Rabbit',  color: '#E8589A' },
  { letter: 'S', word: 'Star',    color: '#FFD700' },
  { letter: 'T', word: 'Turtle',  color: '#4CAF82' },
  { letter: 'U', word: 'Up',      color: '#5B8DEF' },
  { letter: 'V', word: 'Violet',  color: '#7C5CBF' },
  { letter: 'W', word: 'Walk',    color: '#16A085' },
  { letter: 'X', word: 'X-ray',   color: '#8894B0' },
  { letter: 'Y', word: 'Yellow',  color: '#FFD700' },
  { letter: 'Z', word: 'Zebra',   color: '#1A2340' },
];

const STAGE_LETTERS = [
  ALL_LETTERS.slice(0, 13),   // A–M
  ALL_LETTERS.slice(13, 26),  // N–Z
  ALL_LETTERS,                // A–Z
];

export const AlphabetScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const stages = ACTIVITY_STAGES.alphabet;

  const { data: progress } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });
  const completedStages = progress?.alphabet?.completed_stages ?? [];
  const [activeStage, setActiveStage] = useState(() => nextLockedStage('alphabet', completedStages));
  useEffect(() => { setActiveStage(nextLockedStage('alphabet', completedStages)); }, [completedStages.length]);

  const saveMutation = useMutation({
    mutationFn: (stage: number) => activitiesApi.completeStage(childId, 'alphabet', stage),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity-progress', childId] }),
  });

  const [uppercase, setUppercase] = useState(true);
  const [selected, setSelected] = useState<typeof ALL_LETTERS[0] | null>(null);
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [stageWon, setStageWon] = useState(false);

  const stageLetters = STAGE_LETTERS[(activeStage - 1) % 3] ?? ALL_LETTERS;

  useEffect(() => { setTapped(new Set()); setStageWon(false); }, [activeStage]);

  const speak = useCallback((item: typeof ALL_LETTERS[0]) => {
    setSelected(item);
    ttsSpeak(`${item.letter} is for ${item.word}`, { rate: 0.8 });
    setTapped(prev => {
      const next = new Set(prev);
      next.add(item.letter);
      if (next.size === stageLetters.length && !completedStages.includes(activeStage)) {
        saveMutation.mutate(activeStage);
        setTimeout(() => setStageWon(true), 600);
      }
      return next;
    });
  }, [stageLetters, completedStages, activeStage]);

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
          <Text style={styles.title}>A to Z Alphabet</Text>
          <Text style={styles.subtitle}>Tap every letter — {stageLetters.length - tapped.size} left!</Text>
        </View>
        <TouchableOpacity style={[styles.caseBtn, !uppercase && { backgroundColor: '#F7A44A' }]} onPress={() => setUppercase(u => !u)}>
          <Text style={[styles.caseBtnText, !uppercase && { color: '#fff' }]}>{uppercase ? 'Aa' : 'aa'}</Text>
        </TouchableOpacity>
      </View>

      <StageBar stages={stages} activeStage={activeStage} completedStages={completedStages} accentColor="#F7A44A" onSelect={setActiveStage} />

      <FlatList
        data={stageLetters}
        numColumns={COLS}
        keyExtractor={item => item.letter}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const done = tapped.has(item.letter);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: done ? item.color + '30' : item.color + '18' }, done && { borderColor: item.color, borderWidth: 2 }]}
              onPress={() => speak(item)}
              activeOpacity={0.8}
            >
              {done && <Ionicons name="checkmark-circle" size={13} color={item.color} style={styles.checkIcon} />}
              <Text style={[styles.letter, { color: item.color }]}>
                {uppercase ? item.letter : item.letter.toLowerCase()}
              </Text>
              <Text style={styles.word} numberOfLines={1}>{item.word}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail modal */}
      <Modal visible={!!selected && !stageWon} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        {selected && (
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
            <View style={[styles.detailBox, { borderTopColor: selected.color, borderTopWidth: 5 }]}>
              <Text style={[styles.bigLetter, { color: selected.color }]}>
                {uppercase ? selected.letter : selected.letter.toLowerCase()}
              </Text>
              <FlashcardIllustration word={selected.word} color={selected.color} size={110} />
              <Text style={styles.detailPhrase}>
                <Text style={{ color: selected.color, fontWeight: '800' }}>{selected.letter}</Text>
                {' is for '}
                <Text style={{ color: selected.color, fontWeight: '800' }}>{selected.word}</Text>
              </Text>
              <TouchableOpacity style={[styles.listenBtn, { backgroundColor: selected.color }]}
                onPress={() => ttsSpeak(`${selected.letter} is for ${selected.word}`, { rate: 0.8 })}>
                <Ionicons name="volume-high" size={18} color="#fff" />
                <Text style={styles.listenText}>Listen again</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </Modal>

      {/* Stage win modal */}
      <Modal visible={stageWon} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.winBox}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>Stage {activeStage} Done!</Text>
            <Text style={styles.winSub}>You tapped all {stageLetters.length} letters!</Text>
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
  caseBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, backgroundColor: '#F0F4FF', borderWidth: 1.5, borderColor: '#E2E8F4' },
  caseBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: '#4A5578' },
  grid: { padding: spacing.lg, gap: GAP },
  card: { width: CARD_W, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, margin: GAP / 2, minHeight: CARD_W, ...shadow.sm, position: 'relative' },
  checkIcon: { position: 'absolute', top: 4, right: 4 },
  letter: { fontSize: CARD_W * 0.38, fontWeight: '900', lineHeight: CARD_W * 0.44 },
  word: { fontSize: 8.5, fontWeight: '700', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  detailBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  bigLetter: { fontSize: 72, fontWeight: '900', lineHeight: 80 },
  detailPhrase: { fontSize: fontSizes.md, color: '#4A5578', textAlign: 'center', marginVertical: spacing.md },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 12, marginTop: spacing.sm },
  listenText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  winBox: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center', width: '85%', ...shadow.lg },
  winEmoji: { fontSize: 56, marginBottom: spacing.sm },
  winTitle: { fontSize: 24, fontWeight: '800', color: '#1A2340', marginBottom: spacing.xs },
  winSub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center', marginBottom: spacing.xl },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#F7A44A', borderRadius: radius.full, paddingHorizontal: spacing['2xl'], paddingVertical: 14, marginBottom: spacing.md },
  nextBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },
  replayBtn: { paddingVertical: spacing.sm },
  replayText: { fontSize: fontSizes.sm, color: '#8894B0', fontWeight: '600' },
});
