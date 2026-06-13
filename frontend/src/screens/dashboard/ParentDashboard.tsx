import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { childrenApi } from '../../api/children';
import { rewardsApi } from '../../api/rewards';
import { useAuthStore } from '../../store/authStore';
import { useChildStore } from '../../store/childStore';
import { Loading } from '../../components/common/Loading';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { MainStackParamList } from '../../types';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

const { width: SW } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<MainStackParamList>;

const CATEGORIES = [
  { key: 'hub',   label: 'Hub',         icon: 'home',        route: null },
  { key: 'talk',  label: 'Communicate', icon: 'chatbubbles', route: 'AACBoard' },
  { key: 'sched', label: 'Schedule',    icon: 'calendar',    route: 'VisualSchedule' },
  { key: 'feel',  label: 'Feelings',    icon: 'heart',       route: 'BehaviorLog' },
  { key: 'goals', label: 'Goals',       icon: 'trending-up', route: 'Goals' },
];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const ParentDashboard: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { selectedChild, setChildren } = useChildStore();
  const [activeCategory, setActiveCategory] = useState('hub');
  const [bannerVisible, setBannerVisible] = useState(true);

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

  const firstName = user?.full_name?.split(' ')[0] ?? 'Friend';
  const childName = selectedChild?.nickname ?? selectedChild?.full_name ?? 'your child';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <OctopusLogo size={48} />
          <View>
            <Text style={styles.greetSub}>{greeting()}</Text>
            <Text style={styles.greetName}>{firstName} 👋</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {selectedChild && (
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => navigation.navigate('ChildDashboard', { fromParent: true })}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={13} color={colors.white} />
              <Text style={styles.switchBtnText}>Child View</Text>
              <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Category chips ── */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                setActiveCategory(cat.key);
                if (cat.route && selectedChild) {
                  navigation.navigate(cat.route as any, { childId: selectedChild.id });
                }
              }}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={active ? colors.white : colors.textTertiary}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Broadcast banner ── */}
      {bannerVisible && (
        <LinearGradient
          colors={['#5B8DEF', '#3A6BD4']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerLabel}>Welcome to Ausome</Text>
              <Text style={styles.bannerTitle}>
                Supporting {childName}{'\n'}every step of the way 💙
              </Text>
            </View>
            <View style={styles.bannerMascot}>
              <Ionicons name="heart-circle" size={64} color="rgba(255,255,255,0.25)" />
              <Ionicons name="heart-circle" size={48} color="rgba(255,255,255,0.6)" style={{ position: 'absolute' }} />
            </View>
          </View>
          <View style={styles.bannerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <TouchableOpacity style={styles.bannerClose} onPress={() => setBannerVisible(false)}>
            <Ionicons name="close" size={16} color={colors.white} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* ── Token balance strip ── */}
      {balance !== undefined && (
        <TouchableOpacity
          style={styles.tokenStrip}
          onPress={() => selectedChild && navigation.navigate('Rewards', { childId: selectedChild.id })}
        >
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
            <Text style={styles.tokenReward}>Redeem rewards</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      {/* ── 2-column mood + schedule ── */}
      {selectedChild && (
        <>
          <View style={styles.cardRow}>
            {/* Mood check-in */}
            <TouchableOpacity
              style={[styles.card, styles.cardBlue]}
              onPress={() => navigation.navigate('BehaviorLog', { childId: selectedChild.id })}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconCircle}>
                <Ionicons name="happy-outline" size={28} color="#5B8DEF" />
              </View>
              <Text style={styles.cardLabel}>How is{'\n'}{childName} today?</Text>
              <Text style={styles.cardCta}>Log feelings →</Text>
            </TouchableOpacity>

            {/* Daily schedule */}
            <TouchableOpacity
              style={[styles.card, styles.cardGreen]}
              onPress={() => navigation.navigate('VisualSchedule', { childId: selectedChild.id })}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIconCircle, { backgroundColor: '#C8EFE0' }]}>
                <Ionicons name="calendar-outline" size={28} color="#6EC6A1" />
              </View>
              <Text style={styles.cardLabel}>Today's{'\n'}Schedule</Text>
              <Text style={[styles.cardCta, { color: '#6EC6A1' }]}>View day →</Text>
            </TouchableOpacity>
          </View>

          {/* ── AI / Therapy chat card ── */}
          <TouchableOpacity
            style={styles.aiCard}
            onPress={() => navigation.navigate('AIAssistant', { childId: selectedChild.id })}
            activeOpacity={0.85}
          >
            <View style={styles.aiLeft}>
              <View style={styles.aiBotCircle}>
                <Ionicons name="sparkles" size={26} color={colors.primary} />
              </View>
              <View style={styles.aiInfo}>
                <Text style={styles.aiTag}>AI Support Chat</Text>
                <Text style={styles.aiTitle}>Need advice or ideas?</Text>
                <Text style={styles.aiSub}>Ask about routines, calming strategies & more</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>

          {/* ── Quick actions horizontal scroll ── */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {[
              { label: 'Talk Board',     icon: 'chatbubble-ellipses-outline', color: '#5B8DEF', bg: '#EAF1FF', route: 'AACBoard' },
              { label: 'Task Training',  icon: 'checkbox-outline',            color: '#C3AED6', bg: '#F3F0FA', route: 'TaskTrainer' },
              { label: 'Medicine',       icon: 'medical-outline',             color: '#00B8A9', bg: '#E0F8F5', route: 'MedicineReminder' },
              { label: 'Episodes',       icon: 'pulse-outline',               color: '#E74C3C', bg: '#FFF0EE', route: 'EpisodeTracker' },
              { label: 'Goals',          icon: 'trophy-outline',              color: '#6EC6A1', bg: '#E8F8F2', route: 'Goals' },
              { label: 'Flashcards',     icon: 'library-outline',             color: '#4ECDC4', bg: '#E8F8F7', route: 'Flashcards' },
              { label: 'Notes',          icon: 'document-text-outline',       color: '#5B8DEF', bg: '#EAF5FF', route: 'CaregiverNotes' },
            ].map((q) => (
              <TouchableOpacity
                key={q.route}
                style={[styles.quickCard, { backgroundColor: q.bg }]}
                onPress={() => navigation.navigate(q.route as any, { childId: selectedChild.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.quickIconCircle, { backgroundColor: q.color + '20' }]}>
                  <Ionicons name={q.icon as any} size={24} color={q.color} />
                </View>
                <Text style={[styles.quickLabel, { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Profile card ── */}
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate('ChildProfile', { childId: selectedChild.id })}
            activeOpacity={0.85}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {selectedChild.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{selectedChild.full_name}</Text>
              <Text style={styles.profileSub}>
                {selectedChild.age ? `Age ${selectedChild.age}` : ''}
                {selectedChild.communication_level ? `  ·  ${selectedChild.communication_level.replace('_', ' ')}` : ''}
              </Text>
            </View>
            <View style={styles.profileAction}>
              <Text style={styles.profileActionText}>View profile</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </>
      )}

      {!selectedChild && (
        <TouchableOpacity
          style={styles.addChildCard}
          onPress={() => navigation.navigate('EditChildProfile', {})}
        >
          <Ionicons name="person-add-outline" size={32} color={colors.primary} />
          <Text style={styles.addChildText}>Add a child profile to get started</Text>
          <Text style={styles.addChildCta}>Add Profile →</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.disclaimer}>
        Ausome provides educational support only — not a replacement for professional care.
      </Text>
    </ScrollView>
  );
};

const CARD_W = (SW - spacing.lg * 2 - spacing.md) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FF' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 110 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.xl,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#6EC6A1', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    ...shadow.sm,
  },
  switchBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.white },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '800' },
  greetSub: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '500' },
  greetName: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, ...shadow.sm,
  },

  // Category chips
  chipScroll: { marginBottom: spacing.xl },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textTertiary },
  chipLabelActive: { color: colors.white },

  // Banner
  banner: {
    borderRadius: radius['2xl'], padding: spacing.xl,
    marginBottom: spacing.lg, overflow: 'hidden',
    ...shadow.md,
  },
  bannerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerText: { flex: 1 },
  bannerLabel: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  bannerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.white, marginTop: 4, lineHeight: 24 },
  bannerMascot: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  bannerDots: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.white, width: 18 },
  bannerClose: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Token strip
  tokenStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: '#FFD70030',
    ...shadow.sm,
  },
  tokenLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tokenStarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF4E3', justifyContent: 'center', alignItems: 'center' },
  tokenCount: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary },
  tokenSub: { fontSize: fontSizes.xs, color: colors.textTertiary },
  tokenRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tokenReward: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary },

  // 2-col cards
  cardRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  card: {
    width: CARD_W, borderRadius: radius['2xl'],
    padding: spacing.xl, justifyContent: 'space-between',
    minHeight: 150, ...shadow.sm,
  },
  cardBlue: { backgroundColor: '#EAF1FF' },
  cardGreen: { backgroundColor: '#E8F8F2' },
  cardIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#D4E4FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardLabel: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, lineHeight: 22, flex: 1 },
  cardCta: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },

  // AI card
  aiCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.primary + '20',
    ...shadow.sm,
  },
  aiLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  aiBotCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  aiBotEmoji: { fontSize: 28 },
  aiInfo: { flex: 1 },
  aiTag: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  aiTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  aiSub: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },

  // Quick actions
  sectionTitle: {
    fontSize: fontSizes.sm, fontWeight: '800', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing.md,
  },
  quickRow: { gap: spacing.md, paddingRight: spacing.lg, marginBottom: spacing.xl },
  quickCard: {
    width: 96, borderRadius: radius.xl,
    padding: spacing.md, alignItems: 'center',
    justifyContent: 'center', minHeight: 100,
    ...shadow.sm,
  },
  quickIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickLabel: { fontSize: fontSizes.xs, fontWeight: '700', textAlign: 'center' },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.sm,
  },
  profileAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  profileAvatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  profileSub: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  profileAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  profileActionText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '600' },

  // Add child empty state
  addChildCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing['3xl'], marginBottom: spacing.xl,
    borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
  },
  addChildText: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  addChildCta: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },

  disclaimer: {
    fontSize: fontSizes.xs, color: colors.textTertiary,
    textAlign: 'center', fontStyle: 'italic', lineHeight: 18,
  },
});
