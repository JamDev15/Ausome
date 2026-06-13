import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useChildStore } from '../../store/childStore';
import { MainStackParamList } from '../../types';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const ITEMS = [
  { icon: 'star',           label: 'Tokens & Rewards', color: '#FFD700', bg: '#FFFBF0', route: 'Rewards' },
  { icon: 'trending-up',    label: 'Goals & Progress',  color: '#5B8DEF', bg: '#EAF1FF', route: 'Goals' },
  { icon: 'list',           label: 'Task Training',     color: '#C3AED6', bg: '#F3F0FA', route: 'TaskTrainer' },
  { icon: 'albums',         label: 'Flashcards',        color: '#4ECDC4', bg: '#E8F8F7', route: 'Flashcards' },
  { icon: 'calendar',       label: 'Visual Schedule',   color: '#6EC6A1', bg: '#E8F8F2', route: 'VisualSchedule' },
  { icon: 'document-text',  label: 'Caregiver Notes',   color: '#87CEEB', bg: '#EAF5FF', route: 'CaregiverNotes' },
  { icon: 'person',         label: 'Child Profile',     color: '#FF8B94', bg: '#FFF0F1', route: 'ChildProfile' },
  { icon: 'settings',       label: 'Settings',          color: '#8894B0', bg: '#F4F6FB', route: 'Settings' },
];

export const MoreScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { selectedChild } = useChildStore();

  const handleNav = (route: string) => {
    if (!selectedChild && route !== 'Settings') return;
    navigation.navigate(route as any, selectedChild ? { childId: selectedChild.id } : undefined);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <OctopusLogo size={32} />
        <Text style={styles.title}>More</Text>
      </View>
      {selectedChild && (
        <View style={styles.childBanner}>
          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>{selectedChild.full_name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.childName}>{selectedChild.nickname ?? selectedChild.full_name}</Text>
            <Text style={styles.childSub}>Currently selected</Text>
          </View>
        </View>
      )}

      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[styles.tile, { backgroundColor: item.bg }]}
            onPress={() => handleNav(item.route)}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={[styles.tileLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9FF' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes['2xl'], fontWeight: '800',
    color: colors.textPrimary,
  },
  childBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl, padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.primary + '30',
  },
  childAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  childAvatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '800' },
  childName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  childSub: { fontSize: fontSizes.xs, color: colors.textTertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tile: {
    width: '47%', borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center',
    minHeight: 110, justifyContent: 'center',
    ...shadow.sm,
  },
  tileIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tileLabel: { fontSize: fontSizes.sm, fontWeight: '700', textAlign: 'center' },
});
