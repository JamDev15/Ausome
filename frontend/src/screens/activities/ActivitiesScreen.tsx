import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainStackParamList } from '../../types';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { spacing, radius, shadow, fontSizes } from '../../theme';
import { activitiesApi } from '../../api/activities';
import { ACTIVITY_STAGES } from './activityConfig';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Activities'>;
  route: RouteProp<MainStackParamList, 'Activities'>;
};

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - spacing.lg * 2 - spacing.md) / 2;

const ACTIVITIES = [
  { key: 'DrawingActivity', type: 'drawing',  label: 'Painting',    desc: 'Draw & create art',     icon: 'color-palette', color: '#E8589A', bg: '#FDE8F3' },
  { key: 'ConnectActivity', type: 'connect',  label: 'Match It!',   desc: 'Find matching pairs',   icon: 'link',          color: '#7C5CBF', bg: '#EFE8FF' },
  { key: 'CountingActivity',type: 'counting', label: 'Count 1–100', desc: 'Tap numbers in order',  icon: 'calculator',    color: '#4CAF82', bg: '#E4F7EE' },
  { key: 'AlphabetActivity',type: 'alphabet', label: 'A to Z',      desc: 'Learn the alphabet',    icon: 'text',          color: '#F7A44A', bg: '#FFF4E3' },
  { key: 'ColorsActivity',  type: 'colors',   label: 'Colors',      desc: '20 colors to learn',    icon: 'color-fill',    color: '#5B8DEF', bg: '#EAF1FF' },
  { key: 'ShapesActivity',  type: 'shapes',   label: 'Shapes',      desc: '15 shapes to explore',  icon: 'shapes',        color: '#16A085', bg: '#E0F5F0' },
];

export const ActivitiesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: progress = {} } = useQuery({
    queryKey: ['activity-progress', childId],
    queryFn: () => activitiesApi.getProgress(childId),
    staleTime: 0,
  });

  const totalStars = Object.values(progress).reduce(
    (sum, p) => sum + (p.completed_stages?.length ?? 0), 0,
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <OctopusLogo size={28} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Activities</Text>
          <Text style={styles.subtitle}>Pick something fun to do!</Text>
        </View>
        {/* Total stars badge */}
        <View style={styles.starsBadge}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.starsText}>{totalStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {ACTIVITIES.map((act) => {
          const prog = progress[act.type];
          const completedStages = prog?.completed_stages ?? [];
          const totalStages = ACTIVITY_STAGES[act.type]?.length ?? 1;
          const pct = completedStages.length / totalStages;
          const allDone = completedStages.length === totalStages;

          return (
            <TouchableOpacity
              key={act.key}
              style={[styles.card, { backgroundColor: act.bg }]}
              onPress={() => navigation.navigate(act.key as any, { childId })}
              activeOpacity={0.82}
            >
              {/* Done badge */}
              {allDone && (
                <View style={[styles.doneBadge, { backgroundColor: act.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}

              <View style={[styles.iconCircle, { backgroundColor: act.color + '22' }]}>
                <Ionicons name={act.icon as any} size={34} color={act.color} />
              </View>

              <Text style={[styles.cardLabel, { color: act.color }]}>{act.label}</Text>
              <Text style={styles.cardDesc}>{act.desc}</Text>

              {/* Stage progress */}
              <View style={styles.progressRow}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: act.color }]} />
                </View>
                <Text style={[styles.stageText, { color: act.color }]}>
                  {completedStages.length}/{totalStages}
                </Text>
              </View>

              {/* Session count */}
              {(prog?.total_sessions ?? 0) > 0 && (
                <Text style={styles.sessionsText}>
                  {prog!.total_sessions} {prog!.total_sessions === 1 ? 'session' : 'sessions'}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F4', backgroundColor: '#fff',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.sm, color: '#8894B0', marginTop: 1 },
  starsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF4E3', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderWidth: 1.5, borderColor: '#FFD70040',
  },
  starsText: { fontSize: fontSizes.sm, fontWeight: '800', color: '#F7A44A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.lg },
  card: {
    width: CARD_W, borderRadius: radius['2xl'],
    padding: spacing.lg, alignItems: 'center',
    minHeight: 178, justifyContent: 'center',
    ...shadow.sm, position: 'relative',
  },
  doneBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  cardLabel: { fontSize: fontSizes.md, fontWeight: '800', textAlign: 'center' },
  cardDesc: { fontSize: fontSizes.xs, color: '#8894B0', textAlign: 'center', marginTop: 3, fontWeight: '500' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, width: '100%' },
  progressBg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  stageText: { fontSize: 9, fontWeight: '800' },
  sessionsText: { fontSize: 9, color: '#8894B0', marginTop: 3, fontWeight: '500' },
});
