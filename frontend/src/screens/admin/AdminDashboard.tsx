import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { adminApi } from '../../api/admin';
import { AdminStackParamList } from '../../types';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useAuthStore } from '../../store/authStore';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

const { width: SW } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;
};

const CATEGORIES = [
  { key: 'overview',  label: 'Overview',  icon: 'grid' },
  { key: 'users',     label: 'Users',     icon: 'people' },
  { key: 'children',  label: 'Children',  icon: 'person' },
  { key: 'reports',   label: 'Reports',   icon: 'bar-chart' },
  { key: 'audit',     label: 'Audit',     icon: 'shield-checkmark' },
];

const ADMIN_MODULES = [
  { key: 'users',     label: 'User Management',    icon: 'people',           route: 'AdminUsers',         color: '#5B8DEF' },
  { key: 'children',  label: 'Child Profiles',     icon: 'person',           route: 'AdminChildProfiles', color: '#6EC6A1' },
  { key: 'reports',   label: 'Reports & Analytics', icon: 'bar-chart',       route: 'AdminReports',       color: '#F7A44A' },
  { key: 'audit',     label: 'Audit Logs',         icon: 'shield-checkmark', route: 'AdminAuditLog',      color: '#C3AED6' },
];

export const AdminDashboard: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [bannerVisible, setBannerVisible] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const { data: overview, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: adminApi.overview,
  });

  const { data: loginEvents = [] } = useQuery({
    queryKey: ['admin-login-events'],
    queryFn: () => adminApi.loginEvents(10),
  });

  if (isLoading) return <Loading fullScreen />;

  const initial = (user?.full_name ?? 'A').charAt(0).toUpperCase();

  const stats = [
    { label: 'Total Users',    value: overview?.total_users ?? 0,         icon: 'people',      color: colors.primary },
    { label: 'Active Users',   value: overview?.active_users ?? 0,        icon: 'pulse',       color: colors.success },
    { label: 'Children',       value: overview?.total_children ?? 0,      icon: 'person',      color: colors.secondary },
    { label: 'Behavior Logs',  value: overview?.total_behavior_logs ?? 0, icon: 'heart',       color: colors.warning },
    { label: 'Active Goals',   value: overview?.total_goals ?? 0,         icon: 'trending-up', color: colors.accent },
    { label: 'Logins Today',   value: overview?.logins_today ?? 0,        icon: 'log-in',      color: colors.info },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.greetSub}>Admin Panel</Text>
            <Text style={styles.greetName}>Dashboard 👋</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
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
              onPress={() => setActiveCategory(cat.key)}>
              <Ionicons name={cat.icon as any} size={14} color={active ? colors.white : colors.textTertiary} />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Banner ── */}
      {bannerVisible && (
        <LinearGradient colors={['#5B8DEF', '#3A6BD4']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerLabel}>ADING ADMIN</Text>
              <Text style={styles.bannerTitle}>Monitor &amp; manage{'\n'}the app 🛡️</Text>
            </View>
            <Text style={styles.bannerMascot}>⚙️</Text>
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

      {/* ── Stats grid ── */}
      <Text style={styles.sectionLabel}>OVERVIEW</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} style={styles.statCard} elevated>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      {/* ── This week bar chart ── */}
      <Card style={styles.weekCard} elevated>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>{overview?.logins_this_week ?? 0} logins</Text>
          </View>
        </View>
        <View style={styles.weekBar}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const height = Math.max(20, Math.random() * 60);
            return (
              <View key={i} style={styles.weekBarItem}>
                <View style={[styles.weekBarFill, { height, backgroundColor: colors.primary + (i === 6 ? 'FF' : '60') }]} />
                <Text style={styles.weekBarLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* ── Admin modules ── */}
      <Text style={styles.sectionLabel}>ADMIN MODULES</Text>
      <View style={styles.modulesGrid}>
        {ADMIN_MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.key}
            style={[styles.moduleCard, { borderColor: mod.color + '40' }]}
            onPress={() => navigation.navigate(mod.route as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.moduleIcon, { backgroundColor: mod.color + '20' }]}>
              <Ionicons name={mod.icon as any} size={24} color={mod.color} />
            </View>
            <Text style={styles.moduleLabel}>{mod.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent login activity ── */}
      <Text style={styles.sectionLabel}>RECENT LOGINS</Text>
      <Card style={styles.loginCard}>
        {loginEvents.length === 0 ? (
          <Text style={styles.emptyText}>No recent login events</Text>
        ) : (
          loginEvents.slice(0, 8).map((event: any) => (
            <View key={event.id} style={styles.loginRow}>
              <View style={[styles.loginDot, { backgroundColor: event.success ? colors.success : colors.error }]} />
              <View style={styles.loginInfo}>
                <Text style={styles.loginUser}>{event.user_id.slice(0, 8)}...</Text>
                <Text style={styles.loginTime}>
                  {new Date(event.created_at).toLocaleDateString()}{' '}
                  {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {event.platform && (
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>{event.platform}</Text>
                </View>
              )}
              {!event.success && (
                <View style={[styles.platformBadge, styles.failBadge]}>
                  <Text style={[styles.platformBadgeText, styles.failBadgeText]}>Failed</Text>
                </View>
              )}
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
};

const STAT_W = (SW - spacing.lg * 2 - spacing.md * 2) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FF' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 110 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '800' },
  greetSub: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '500' },
  greetName: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.errorLight, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.error + '30', ...shadow.sm },

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
  bannerMascot: { fontSize: 52 },
  bannerDots: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.white, width: 18 },
  bannerClose: { position: 'absolute', top: spacing.md, right: spacing.md, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.md },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  statCard: { width: STAT_W, alignItems: 'center', padding: spacing.md },
  statIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  statValue: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, textAlign: 'center', marginTop: 2 },

  weekCard: { marginBottom: spacing.xl },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  weekTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  weekBadge: { backgroundColor: colors.successLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  weekBadgeText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.success },
  weekBar: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: spacing.xs },
  weekBarItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  weekBarFill: { width: '100%', borderRadius: radius.sm },
  weekBarLabel: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 4 },

  modulesGrid: { gap: spacing.md, marginBottom: spacing.xl },
  moduleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius['2xl'],
    padding: spacing.lg, borderWidth: 1.5, ...shadow.sm,
  },
  moduleIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  moduleLabel: { flex: 1, fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },

  loginCard: { padding: 0, overflow: 'hidden', marginBottom: spacing.xl },
  emptyText: { padding: spacing.lg, color: colors.textTertiary, textAlign: 'center' },
  loginRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  loginDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  loginInfo: { flex: 1 },
  loginUser: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  loginTime: { fontSize: fontSizes.xs, color: colors.textTertiary },
  platformBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, marginLeft: spacing.xs },
  platformBadgeText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.primary },
  failBadge: { backgroundColor: colors.errorLight },
  failBadgeText: { color: colors.error },
});
