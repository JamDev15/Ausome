import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, StatusBar,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { speak, prewarm } from '../../utils/speak';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { aacApi } from '../../api/aac';
import { AACCategory, AACItem, MainStackParamList } from '../../types';
import { Loading } from '../../components/common/Loading';
import { FlashcardIllustration } from '../../components/flashcards/FlashcardIllustration';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { colors, spacing, fontSizes } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'AACBoard'>;
  route: RouteProp<MainStackParamList, 'AACBoard'>;
};

const { width: SW } = Dimensions.get('window');
const NUM_COLS = 5;
const GAP = 4;
const BTN = (SW - spacing.xs * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

// ── Proloquo2Go-standard grammar-based color coding ───────────────────────────
const CAT_COLORS: Record<string, string> = {
  // social / core
  social:        '#E8589A',
  greetings:     '#E8589A',
  core:          '#E8589A',
  // people / pronouns
  people:        '#F5A623',
  family:        '#F5A623',
  pronouns:      '#F5A623',
  // verbs / actions
  actions:       '#4CAF82',
  verbs:         '#4CAF82',
  activity:      '#4CAF82',
  // descriptives / adjectives
  descriptives:  '#5B8DEF',
  feelings:      '#5B8DEF',
  emotions:      '#5B8DEF',
  // nouns / things
  things:        '#9B59B6',
  objects:       '#9B59B6',
  // food
  food:          '#E8790A',
  'food & drink':'#E8790A',
  drink:         '#E8790A',
  // places
  places:        '#16A085',
  // body
  body:          '#E74C8B',
  // numbers
  numbers:       '#8E44AD',
  // colors
  colors:        '#2980B9',
  // school / nature
  school:        '#27AE60',
  nature:        '#27AE60',
  // transport
  transport:     '#1ABC9C',
};

function getCatColor(name: string, fallback?: string): string {
  const key = name.toLowerCase().trim();
  for (const k of Object.keys(CAT_COLORS)) {
    if (key.includes(k)) return CAT_COLORS[k];
  }
  return fallback ?? '#5B8DEF';
}

// ── Category icon mapping ─────────────────────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
  social:     'chatbubble-ellipses',
  greetings:  'hand-right',
  core:       'star',
  people:     'people',
  family:     'people',
  pronouns:   'person',
  actions:    'flash',
  verbs:      'flash',
  activity:   'bicycle',
  feelings:   'heart',
  emotions:   'heart',
  descriptives:'color-palette',
  things:     'cube',
  objects:    'cube',
  food:       'restaurant',
  drink:      'cafe',
  places:     'location',
  body:       'body',
  numbers:    'calculator',
  colors:     'color-palette',
  school:     'library',
  nature:     'leaf',
  transport:  'car',
};

function getCatIcon(name: string): string {
  const key = name.toLowerCase().trim();
  for (const k of Object.keys(CAT_ICONS)) {
    if (key.includes(k)) return CAT_ICONS[k];
  }
  return 'grid';
}

export const AACBoardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const [activeCat, setActiveCat] = useState<AACCategory | null>(null);
  const [phraseBar, setPhraseBar] = useState<AACItem[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const phraseScrollRef = useRef<ScrollView>(null);

  const { data: categories = [], isLoading } = useQuery<AACCategory[]>({
    queryKey: ['aac-categories', childId],
    queryFn: () => aacApi.getCategories(childId),
  });

  useEffect(() => {
    if (categories.length > 0 && !activeCat) setActiveCat(categories[0]);
  }, [categories]);

  // Pre-cache TTS audio for all visible items so first tap is instant
  useEffect(() => {
    const labels = categories.flatMap(c => c.items.map(i => i.label));
    labels.forEach(label => prewarm(label));
  }, [categories]);

  const usageMutation = useMutation({
    mutationFn: (itemId: string) => aacApi.recordUsage(itemId),
  });

  const speakItem = useCallback(async (item: AACItem) => {
    setSpeakingId(item.id);
    usageMutation.mutate(item.id);
    speak(item.label, {
      rate: 0.85,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  }, []);

  const addToPhrase = useCallback((item: AACItem) => {
    setPhraseBar(prev => [...prev, item]);
    speakItem(item);
    setTimeout(() => phraseScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [speakItem]);

  const speakPhrase = () => {
    if (!phraseBar.length) return;
    speak(phraseBar.map(i => i.label).join(' '), { rate: 0.80 });
  };

  if (isLoading) return <Loading fullScreen />;

  const items = activeCat?.items ?? [];
  const catColor = activeCat ? getCatColor(activeCat.name, activeCat.color) : colors.primary;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topTitleRow}>
          <OctopusLogo size={24} color="#fff" />
          <Text style={styles.topTitle}>Talk Board</Text>
        </View>
        <View style={styles.topRight}>
          <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* ── Sentence Strip ── */}
      <View style={styles.sentenceWrap}>
        <ScrollView
          ref={phraseScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sentenceScroll}
          contentContainerStyle={styles.sentenceContent}
        >
          {phraseBar.length === 0 ? (
            <Text style={styles.sentencePlaceholder}>Tap a button to speak...</Text>
          ) : (
            phraseBar.map((item, idx) => (
              <TouchableOpacity
                key={`${item.id}-${idx}`}
                style={styles.token}
                onLongPress={() => setPhraseBar(prev => prev.filter((_, i) => i !== idx))}
              >
                <FlashcardIllustration word={item.label} color="#5B8DEF" size={28} />
                <Text style={styles.tokenText} numberOfLines={1}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.sentenceActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.backspaceBtn, !phraseBar.length && styles.actionBtnDisabled]}
            onPress={() => setPhraseBar(prev => prev.slice(0, -1))}
            disabled={!phraseBar.length}
          >
            <Ionicons name="backspace" size={18} color={phraseBar.length ? '#E06C75' : '#DDD'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.clearBtn, !phraseBar.length && styles.actionBtnDisabled]}
            onPress={() => setPhraseBar([])}
            disabled={!phraseBar.length}
          >
            <Ionicons name="trash-outline" size={16} color={phraseBar.length ? '#888' : '#DDD'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.speakBtn, !phraseBar.length && styles.actionBtnDisabled]}
            onPress={speakPhrase}
            disabled={!phraseBar.length}
          >
            <Ionicons name="volume-high" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Category sidebar + grid ── */}
      <View style={styles.boardArea}>

        {/* Left category rail */}
        <View style={styles.categoryRail}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => {
              const active = activeCat?.id === cat.id;
              const cc = getCatColor(cat.name, cat.color);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.railTab, active && { backgroundColor: cc }]}
                  onPress={() => setActiveCat(cat)}
                >
                  <Ionicons
                    name={getCatIcon(cat.name) as any}
                    size={18}
                    color={active ? '#fff' : cc}
                  />
                  <Text
                    style={[styles.railLabel, active && styles.railLabelActive]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main symbol grid */}
        <View style={styles.gridWrap}>
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="grid-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>No items here yet</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              numColumns={NUM_COLS}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const speaking = speakingId === item.id;
                const btnColor = item.color ?? catColor;
                return (
                  <TouchableOpacity
                    style={[
                      styles.symbolBtn,
                      { backgroundColor: btnColor },
                      speaking && styles.symbolBtnActive,
                    ]}
                    onPress={() => addToPhrase(item)}
                    onLongPress={() => speakItem(item)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    {/* Symbol area */}
                    <View style={styles.symbolArea}>
                      {item.is_favorite && (
                        <View style={styles.favDot} />
                      )}
                      <FlashcardIllustration word={item.label} color="#fff" size={BTN * 0.62} />
                      {speaking && (
                        <View style={styles.speakingRing}>
                          <Ionicons name="volume-high" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                    {/* Label bar */}
                    <View style={[styles.labelBar, { backgroundColor: darken(btnColor) }]}>
                      <Text style={styles.symbolLabel} numberOfLines={2}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// Darken a hex color for the label bar
function darken(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 40);
  const b = Math.max(0, (n & 0xff) - 40);
  return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1E293B' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
  },
  topTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTitle: { color: '#fff', fontSize: fontSizes.lg, fontWeight: '800' },
  topRight: { width: 36, alignItems: 'center' },

  // Sentence strip
  sentenceWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 3, borderBottomColor: '#E2E8F0',
    minHeight: 68, paddingVertical: 8, paddingLeft: spacing.sm,
  },
  sentenceScroll: { flex: 1 },
  sentenceContent: { alignItems: 'center', paddingRight: 4, gap: 4 },
  sentencePlaceholder: {
    color: '#94A3B8', fontSize: fontSizes.sm, fontStyle: 'italic',
  },
  token: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F5F9', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 4,
    borderWidth: 1.5, borderColor: '#CBD5E1',
    minWidth: 46, maxWidth: 72,
  },
  tokenText: {
    fontSize: 9, fontWeight: '800', color: '#334155',
    textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1,
  },
  sentenceActions: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  backspaceBtn: { backgroundColor: '#FEE2E2' },
  clearBtn: { backgroundColor: '#F1F5F9' },
  speakBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#5B8DEF' },
  actionBtnDisabled: { opacity: 0.35 },

  // Board layout
  boardArea: { flex: 1, flexDirection: 'row' },

  // Category rail (left side)
  categoryRail: {
    width: 72, backgroundColor: '#0F172A',
    paddingVertical: 4,
  },
  railTab: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 4,
    marginHorizontal: 4, marginVertical: 2,
    borderRadius: 10, gap: 4,
  },
  railLabel: {
    fontSize: 8.5, fontWeight: '700', color: '#94A3B8',
    textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.2,
  },
  railLabelActive: { color: '#fff' },

  // Grid
  gridWrap: { flex: 1, backgroundColor: '#F0F4FF' },
  grid: { padding: spacing.xs, gap: GAP },
  symbolBtn: {
    width: BTN, borderRadius: 10,
    overflow: 'hidden', margin: GAP / 2,
  },
  symbolBtnActive: { opacity: 0.75, transform: [{ scale: 0.94 }] },
  symbolArea: {
    height: BTN * 0.68,
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  favDot: {
    position: 'absolute', top: 4, right: 4,
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFD700',
  },
  speakingRing: {
    position: 'absolute', bottom: 3, right: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8, padding: 2,
  },
  labelBar: {
    paddingVertical: 5, paddingHorizontal: 3,
    alignItems: 'center', justifyContent: 'center',
    minHeight: BTN * 0.32,
  },
  symbolLabel: {
    fontSize: 9.5, fontWeight: '800',
    color: '#fff', textAlign: 'center',
    textTransform: 'uppercase', letterSpacing: 0.3,
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emptyText: { fontSize: fontSizes.md, color: '#94A3B8' },
});
