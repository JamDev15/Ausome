import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { speak, prewarm } from '../../utils/speak';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import apiClient from '../../api/client';
import { MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Loading } from '../../components/common/Loading';
import { FlashcardIllustration } from '../../components/flashcards/FlashcardIllustration';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Flashcards'>;
  route: RouteProp<MainStackParamList, 'Flashcards'>;
};

const { width: SW, height: SH } = Dimensions.get('window');
const CARD_W = SW - spacing.lg * 2;
const CARD_H = SH * 0.52;

// Vibrant set color themes
const SET_THEMES = [
  { bg: '#EAF1FF', accent: '#5B8DEF', light: '#D4E4FF' },
  { bg: '#FFF4E3', accent: '#F7A44A', light: '#FFE4B5' },
  { bg: '#F3F0FA', accent: '#A78BFA', light: '#E5DCFF' },
  { bg: '#FFF0F1', accent: '#FF8B94', light: '#FFD6D9' },
  { bg: '#E8F8F2', accent: '#6EC6A1', light: '#C8EFE0' },
  { bg: '#E8F8F7', accent: '#4ECDC4', light: '#C8F0EE' },
];


function getTheme(index: number) {
  return SET_THEMES[index % SET_THEMES.length];
}

export const FlashcardsScreen: React.FC<Props> = ({ navigation }) => {
  const [setIndex, setSetIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const flipAnim = useRef(new Animated.Value(0)).current;

  const { data: sets = [], isLoading } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/flashcards/sets');
      return data;
    },
  });

  useEffect(() => {
    sets.forEach((s: any) => s.cards?.forEach((c: any) => prewarm(c.word)));
  }, [sets]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const flipCard = useCallback(() => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8, tension: 10, useNativeDriver: true,
    }).start();
    setFlipped(f => !f);
  }, [flipped, flipAnim]);

  const goNext = () => {
    Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    setFlipped(false);
    setTimeout(() => setCardIndex(i => Math.min(i + 1, cards.length - 1)), 150);
  };

  const goPrev = () => {
    Animated.timing(flipAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    setFlipped(false);
    setTimeout(() => setCardIndex(i => Math.max(i - 1, 0)), 150);
  };

  const changeSet = (i: number) => {
    flipAnim.setValue(0);
    setFlipped(false);
    setCardIndex(0);
    setSetIndex(i);
  };

  if (isLoading) return <Loading fullScreen />;

  const currentSet = sets[setIndex];
  const cards = currentSet?.cards ?? [];
  const card = cards[cardIndex];
  const theme = getTheme(setIndex);
  const mastered = card ? masteredIds.has(card.id) : false;
  const masteredCount = cards.filter((c: any) => masteredIds.has(c.id)).length;

  const markMastered = () => {
    if (!card) return;
    setMasteredIds(prev => {
      const next = new Set(prev);
      next.add(card.id);
      return next;
    });
    if (cardIndex < cards.length - 1) goNext();
  };

  const speakWord = () => {
    if (card?.audio_text || card?.word) {
      speak(card.word, { rate: 0.78 });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Flashcards" subtitle="Learn & practice" onBack={() => navigation.goBack()} />

      {/* Set selector chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.setRow} style={styles.setScroll}>
        {sets.map((s: any, i: number) => {
          const t = getTheme(i);
          const active = setIndex === i;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.setChip, active && { backgroundColor: t.accent, borderColor: t.accent }]}
              onPress={() => changeSet(i)}
            >
              <Text style={[styles.setChipText, active && styles.setChipTextActive]}>
                {s.title}
              </Text>
              {active && (
                <View style={styles.setChipCount}>
                  <Text style={styles.setChipCountText}>{cards.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!card ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={styles.emptyText}>No cards in this set yet.</Text>
        </View>
      ) : (
        <View style={styles.cardArea}>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${((cardIndex + 1) / cards.length) * 100}%`,
                backgroundColor: theme.accent,
              }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.accent }]}>
              {cardIndex + 1} / {cards.length}
            </Text>
          </View>

          {/* Mastery indicator */}
          {masteredCount > 0 && (
            <View style={styles.masteryRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.masteryText}>{masteredCount} mastered</Text>
            </View>
          )}

          {/* Flip card */}
          <View style={styles.flipContainer}>
            {/* FRONT */}
            <Animated.View style={[
              styles.card,
              { transform: [{ rotateY: frontRotate }], backfaceVisibility: 'hidden' },
            ]}>
              {/* Colored image area */}
              <View style={[styles.cardImgArea, { backgroundColor: theme.accent }]}>
                {mastered && (
                  <View style={styles.masteredBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.white} />
                    <Text style={styles.masteredBadgeText}>Mastered!</Text>
                  </View>
                )}
                <FlashcardIllustration word={card.word} color={theme.accent} size={160} />
              </View>
              {/* Word area */}
              <View style={[styles.cardWordArea, { backgroundColor: theme.bg }]}>
                <Text style={[styles.cardWord, { color: theme.accent }]}>{card.word}</Text>
                {card.category && (
                  <Text style={styles.cardCategory}>{card.category}</Text>
                )}
                <View style={styles.tapHint}>
                  <Ionicons name="sync-outline" size={13} color={colors.textTertiary} />
                  <Text style={styles.cardHint}>Tap card to reveal</Text>
                </View>
              </View>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flipCard} activeOpacity={1} />
            </Animated.View>

            {/* BACK */}
            <Animated.View style={[
              styles.card, styles.cardBack,
              { transform: [{ rotateY: backRotate }], backfaceVisibility: 'hidden' },
            ]}>
              <View style={[styles.cardImgAreaSmall, { backgroundColor: theme.light }]}>
                <FlashcardIllustration word={card.word} color={theme.accent} size={48} />
                <Text style={[styles.cardWordSmall, { color: theme.accent }]}>{card.word}</Text>
              </View>
              <View style={styles.cardDescArea}>
                {card.description ? (
                  <>
                    <Text style={styles.descLabel}>MEANING</Text>
                    <Text style={styles.cardDesc}>{card.description}</Text>
                  </>
                ) : (
                  <Text style={styles.cardDesc}>"{card.word}"</Text>
                )}
                {card.example && (
                  <View style={[styles.exampleBox, { borderLeftColor: theme.accent }]}>
                    <Text style={styles.exampleLabel}>Example</Text>
                    <Text style={styles.exampleText}>{card.example}</Text>
                  </View>
                )}

                {/* Got it / Practice buttons */}
                <View style={styles.ratingRow}>
                  <TouchableOpacity style={styles.practiceBtn} onPress={goNext}>
                    <Ionicons name="refresh-outline" size={16} color="#E06C75" />
                    <Text style={styles.practiceBtnText}>Practice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.gotItBtn, { backgroundColor: theme.accent }]} onPress={markMastered}>
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                    <Text style={styles.gotItBtnText}>Got it!</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={[StyleSheet.absoluteFill, { bottom: 140 }]}
                onPress={flipCard} activeOpacity={1}
              />
            </Animated.View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.navBtn, cardIndex === 0 && styles.navBtnDisabled]}
              onPress={goPrev} disabled={cardIndex === 0}
            >
              <Ionicons name="chevron-back" size={26} color={cardIndex === 0 ? colors.border : colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.speakBtn, { backgroundColor: theme.accent }]} onPress={speakWord}>
              <Ionicons name="volume-high" size={26} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, cardIndex === cards.length - 1 && styles.navBtnDisabled]}
              onPress={goNext} disabled={cardIndex === cards.length - 1}
            >
              <Ionicons name="chevron-forward" size={26} color={cardIndex === cards.length - 1 ? colors.border : colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {cards.slice(0, 10).map((_: any, i: number) => (
              <TouchableOpacity key={i} onPress={() => { changeSet(setIndex); setCardIndex(i); }}>
                <View style={[
                  styles.dot,
                  i === cardIndex && { backgroundColor: theme.accent, width: 16 },
                  masteredIds.has(cards[i]?.id) && { backgroundColor: colors.success },
                ]} />
              </TouchableOpacity>
            ))}
            {cards.length > 10 && <Text style={styles.moreDots}>+{cards.length - 10}</Text>}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },

  setScroll: { maxHeight: 56, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  setRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  setChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  setChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '700' },
  setChipTextActive: { color: colors.white },
  setChipCount: {
    backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  setChipCountText: { fontSize: 10, color: colors.white, fontWeight: '800' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emptyText: { fontSize: fontSizes.md, color: colors.textTertiary },

  cardArea: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', marginBottom: spacing.xs },
  progressBar: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  progressText: { fontSize: fontSizes.xs, fontWeight: '800', minWidth: 36, textAlign: 'right' },

  masteryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  masteryText: { fontSize: fontSizes.xs, color: colors.success, fontWeight: '700' },

  flipContainer: { width: CARD_W, height: CARD_H },

  card: {
    position: 'absolute', width: CARD_W, height: CARD_H,
    borderRadius: radius['2xl'], overflow: 'hidden',
    ...shadow.lg,
  },
  cardBack: { backgroundColor: colors.white },

  // Front card sections
  cardImgArea: {
    flex: 1.4, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  masteredBadge: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.success, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  masteredBadgeText: { fontSize: fontSizes.xs, color: colors.white, fontWeight: '800' },
  cardWordArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.md },
  cardWord: { fontSize: fontSizes['3xl'], fontWeight: '900', textAlign: 'center' },
  cardCategory: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  cardHint: { fontSize: fontSizes.xs, color: colors.textTertiary, fontStyle: 'italic' },

  // Back card sections
  cardImgAreaSmall: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  cardWordSmall: { fontSize: fontSizes['2xl'], fontWeight: '900' },
  cardDescArea: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  descLabel: {
    fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs,
  },
  cardDesc: { fontSize: fontSizes.lg, color: colors.textPrimary, lineHeight: 26, marginBottom: spacing.lg },
  exampleBox: {
    borderLeftWidth: 3, paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  exampleLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '700', marginBottom: 2 },
  exampleText: { fontSize: fontSizes.md, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 22 },

  // Rating buttons
  ratingRow: { flexDirection: 'row', gap: spacing.md },
  practiceBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    borderWidth: 1.5, borderColor: '#FECACA', borderRadius: radius.full,
    paddingVertical: spacing.sm, backgroundColor: '#FEE2E2',
  },
  practiceBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: '#E06C75' },
  gotItBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    borderRadius: radius.full, paddingVertical: spacing.sm,
  },
  gotItBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.white },

  // Controls
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing['2xl'], marginTop: spacing.lg,
  },
  navBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, ...shadow.sm,
  },
  navBtnDisabled: { opacity: 0.35 },
  speakBtn: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.md,
  },

  // Dots
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  moreDots: { fontSize: fontSizes.xs, color: colors.textTertiary, marginLeft: 4 },
});
