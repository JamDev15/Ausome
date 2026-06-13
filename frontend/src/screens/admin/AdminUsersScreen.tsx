import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../api/admin';
import { User } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminUsers'>;
};

const ROLE_BADGE: Record<string, any> = {
  admin: 'error', parent: 'primary', therapist: 'success', caregiver: 'info',
};

export const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminApi.toggleUserStatus(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: () => Alert.alert('Error', 'Could not update user status.'),
  });

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="User Management" subtitle={`${users.length} users total`} onBack={() => navigation.goBack()} />

      <View style={styles.toolbar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {[null, 'admin', 'parent', 'therapist', 'caregiver'].map((role) => (
          <TouchableOpacity
            key={role ?? 'all'}
            style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
            onPress={() => setFilterRole(role)}
          >
            <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>
              {role ?? 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: user }) => (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{user.full_name}</Text>
                <Badge label={user.role} variant={ROLE_BADGE[user.role] ?? 'neutral'} small />
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.metaText}>
                  🔑 {user.login_count} logins
                </Text>
                {user.linked_children !== undefined && user.linked_children > 0 && (
                  <Text style={styles.metaText}>👶 {user.linked_children} child{user.linked_children !== 1 ? 'ren' : ''}</Text>
                )}
                {user.last_active_at && (
                  <Text style={styles.metaText}>
                    Last: {new Date(user.last_active_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.statusToggle, user.is_active ? styles.statusActive : styles.statusInactive]}
              onPress={() => {
                Alert.alert(
                  user.is_active ? 'Disable Account?' : 'Enable Account?',
                  `${user.is_active ? 'Disable' : 'Enable'} access for ${user.full_name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: user.is_active ? 'Disable' : 'Enable',
                      style: user.is_active ? 'destructive' : 'default',
                      onPress: () => toggleMutation.mutate({ userId: user.id, isActive: !user.is_active }),
                    },
                  ]
                );
              }}
            >
              <Ionicons
                name={user.is_active ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={user.is_active ? colors.success : colors.error}
              />
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: { padding: spacing.lg, paddingBottom: 0 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSizes.md, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingTop: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },
  list: { padding: spacing.lg, paddingTop: 0 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: fontSizes.lg, fontWeight: '700' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  userName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  userEmail: { fontSize: fontSizes.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  userMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaText: { fontSize: fontSizes.xs, color: colors.textTertiary },
  statusToggle: { padding: spacing.sm },
  statusActive: {},
  statusInactive: {},
  separator: { height: spacing.sm },
});
