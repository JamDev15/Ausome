import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { childrenApi } from '../../api/children';
import { rewardsApi } from '../../api/rewards';
import { useChildStore } from '../../store/childStore';
import { Loading } from '../../components/common/Loading';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { MainStackParamList } from '../../types';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

const { width: SW } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ChildDashboard'>;
  route: RouteProp<MainStackParamList, 'ChildDashboard'>;
};

const CATEGORIES = [
  { key: 'home', label: 'Home',     icon: 'home',        route: null },
  { key: 'talk', label: 'Talk',     icon: 'chatbubbles', route: 'AACBoard' },
  { key: 'day',  label: 'My Day',   icon: 'calendar',    route: 'VisualSchedule' },
  { key: 'feel', label: 'Feelings', icon: 'heart',       route: 'BehaviorLog' },
];

const ACTIONS = [
  { key: 'aac',        label: 'Talk Board',  icon: 'chatbubble-ellipses-outline', color: '#5B8DEF', bg: '#EAF1FF', route: 'AACBoard' },
  { key: 'schedule',   label: 'My Day',      icon: 'calendar-outline',            color: '#6EC6A1', bg: '#E8F8F2', route: 'VisualSchedule' },
  { key: 'tasks',      label: 'My Tasks',    icon: 'checkbox-outline',            color: '#C3AED6', bg: '#F3F0FA', route: 'TaskTrainer' },
  { key: 'rewards',    label: 'Rewards',     icon: 'star-outline',                color: '#F7A44A', bg: '#FFF4E3', route: 'Rewards' },
  { key: 'medicine',   label: 'Medicine',    icon: 'medical-outline',             color: '#00B8A9', bg: '#E0F8F5', route: 'MedicineReminder' },
  { key: 'episodes',   label: 'Episodes',    icon: 'pulse-outline',               color: '#E74C3C', bg: '#FFF0EE', route: 'EpisodeTracker' },
  { key: 'flashcard',  label: 'Learn',       icon: 'library-outline',             color: '#4ECDC4', bg: '#E8F8F7', route: 'Flashcards' },
  { key: 'feelings',   label: 'Feelings',    icon: 'heart-outline',               color: '#FF8B94', bg: '#FFF0F1', route: 'BehaviorLog' },
  { key: 'activities', label: 'Activities',  icon: 'color-palette-outline',       color: '#E8589A', bg: '#FDE8F3', route: 'Activities' },
];

const greetTime = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const TILE_W = (SW - spacing.lg * 2 - spacing.md) / 2;

export const ChildDashboard: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { selectedChild, setChildren } = useChildStore();
  const [activeCategory, setActiveCategory] = useState('home');
  const [bannerVisible, setBannerVisible] = useState(true);
  const fromParent = route.params?.fromParent ?? false;

  const { data: children, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['children'],
    queryFn: childrenApi.list,
  });

  useEffect(() => {
    if (children && children.length > 0) setChildren(children);
  }, [children]);

  const { data: balance } = useQuery({
    queryKey: ['balance', selectedChild?.id],
    queryFn: () => rewardsApi.getBalance(selectedChild!.id),
    enabled: !!selectedChild?.id,
  });

  if (isLoading) return <Loading fullScreen message="Loading..." />;

  const name = selectedChild?.nickname ?? selectedChild?.full_name?.split(' ')[0] ?? 'Friend';

  return (
    <View style={styles.rootContainer}>
      {/* ── Parent Mode Switch Bar ── */}
      {fromParent && (
        <View style={[styles.parentBar, { paddingTop: insets.top + 6 }]}>
          <View style={styles.parentBarLeft}>
            <View style={styles.parentBarDot} />
            <Text style={styles.parentBarLabel}>Viewing as child</Text>
          </View>
          <TouchableOpacity
            style={styles.parentBarBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="shield-checkmark" size={14} color={colors.white} />
            <Text style={styles.parentBarBtnText}>Parent Mode</Text>
          </TouchableOpacity>
        </View>
      )}

    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: fromParent ? spacing.md : insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <OctopusLogo size={48} />
          <View>
            <Text style={styles.greetSub}>{greetTime()}</Text>
            <Text style={styles.greetName}>{name} 👋</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Category chips ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow} style={styles.chipScroll}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity key={cat.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                setActiveCategory(cat.key);
                if (cat.route && selectedChild) {
                  navigation.navigate(cat.route as any, { childId: selectedChild.id });
                }
              }}>
              <Ionicons name={cat.icon as any} size={14} color={active ? colors.white : colors.textTertiary} />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Welcome banner ── */}
      {bannerVisible && (
        <LinearGradient colors={['#5B8DEF', '#3A6BD4']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerLabel}>WELCOME BACK</Text>
              <Text style={styles.bannerTitle}>{name}, ready{'\n'}to have fun today? 🎉</Text>
            </View>
            <View style={styles.bannerMascot}>
              <Ionicons name="star" size={64} color="rgba(255,255,255,0.25)" />
              <Ionicons name="star" size={48} color="rgba(255,255,255,0.6)" style={{ position: 'absolute' }} />
            </View>
          </View>
          <View style={styles.bannerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} /><View style={styles.dot} />
          </View>
          <TouchableOpacity style={styles.bannerClose} onPress={() => setBannerVisible(false)}>
            <Ionicons name="close" size={16} color={colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* ── Token strip ── */}
      {balance !== undefined && (
        <TouchableOpacity style={styles.tokenStrip}
          onPress={() => selectedChild && navigation.navigate('Rewards', { childId: selectedChild.id })}>
          <View style={styles.tokenLeft}>
            <View style={styles.tokenStarCircle}>
              <Ionicons name="star" size={20} color="#F7A44A" />
            </View>
            <View>
              <Text style={styles.tokenCount}>{balance.current_balance} stars</Text>
              <Text style={styles.tokenSub}>{balance.current_streak}-day streak</Text>
            </View>
          </View>
          <View style={styles.tokenRight}>
            <Text style={styles.tokenCta}>Redeem rewards</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      {/* ── Activity tiles ── */}
      {selectedChild ? (
        <>
          <Text style={styles.sectionLabel}>LET'S GO!</Text>
          <View style={styles.grid}>
            {ACTIONS.map((a) => (
              <TouchableOpacity key={a.key}
                style={[styles.tile, { backgroundColor: a.bg }]}
                onPress={() => navigation.navigate(a.route as any, { childId: selectedChild.id })}
                activeOpacity={0.8}>
                <View style={[styles.tileIconCircle, { backgroundColor: a.color + '22' }]}>
                  <Ionicons name={a.icon as any} size={30} color={a.color} />
                </View>
                <Text style={[styles.tileLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <TouchableOpacity style={styles.addCard}
          onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="person-add-outline" size={32} color={colors.primary} />
          <Text style={styles.addText}>Ask a parent to set up your profile</Text>
        </TouchableOpacity>
      )}

      {/* ── Settings link ── */}
      <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings-outline" size={16} color={colors.textTertiary} />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#F6F9FF' },
  container: { flex: 1, backgroundColor: '#F6F9FF' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 110 },

  parentBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', paddingHorizontal: spacing.lg, paddingBottom: 10,
  },
  parentBarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  parentBarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6EC6A1' },
  parentBarLabel: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  parentBarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 7,
  },
  parentBarBtnText: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.white },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '800' },
  greetSub: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '500' },
  greetName: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, ...shadow.sm },

  chipScroll: { marginBottom: spacing.xl },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textTertiary },
  chipLabelActive: { color: colors.white },

  banner: { borderRadius: radius['2xl'], padding: spacing.xl, marginBottom: spacing.lg, overflow: 'hidden', ...shadow.md },
  bannerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerText: { flex: 1 },
  bannerLabel: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  bannerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.white, marginTop: 4, lineHeight: 24 },
  bannerMascot: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  bannerDots: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.white, width: 18 },
  bannerClose: { position: 'absolute', top: spacing.md, right: spacing.md, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  tokenStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: '#FFD70030', ...shadow.sm },
  tokenLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tokenStarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF4E3', justifyContent: 'center', alignItems: 'center' },
  tokenCount: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary },
  tokenSub: { fontSize: fontSizes.xs, color: colors.textTertiary },
  tokenRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tokenCta: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary },

  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.md },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  tile: { width: TILE_W, borderRadius: radius['2xl'], padding: spacing.xl, alignItems: 'center', minHeight: 120, justifyContent: 'center', ...shadow.sm },
  tileIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  tileLabel: { fontSize: fontSizes.md, fontWeight: '800', textAlign: 'center' },

  addCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: radius['2xl'], padding: spacing['3xl'], marginBottom: spacing.xl, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
  addText: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },

  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  settingsText: { fontSize: fontSizes.sm, color: colors.textTertiary },
});
