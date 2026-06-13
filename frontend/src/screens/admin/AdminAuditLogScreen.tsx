import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../api/admin';
import { AuditLog } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminAuditLog'>;
};

const ACTION_COLORS: Record<string, string> = {
  'user.register': 'success',
  'user.login': 'info',
  'user.forgot_password': 'warning',
  'admin.user.status_change': 'error',
  'child.create': 'success',
  'child.update': 'primary',
  'child.archive': 'error',
  'goal.create': 'success',
  'schedule.create': 'success',
};

export const AdminAuditLogScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.auditLogs(200),
  });

  const filtered = search
    ? logs.filter((l) =>
        l.action.includes(search) || l.user_email?.includes(search) ||
        l.resource_type?.includes(search)
      )
    : logs;

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Audit Logs"
        subtitle={`${logs.length} entries`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by action, user, or resource..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: log }) => (
          <View style={styles.logRow}>
            <View style={styles.logIconWrapper}>
              <Ionicons
                name={getActionIcon(log.action) as any}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.logContent}>
              <View style={styles.logTop}>
                <Text style={styles.logAction}>{log.action}</Text>
                <Badge
                  label={ACTION_COLORS[log.action] ?? 'neutral'}
                  variant={(ACTION_COLORS[log.action] as any) ?? 'neutral'}
                  small
                />
              </View>
              {log.user_email && (
                <Text style={styles.logUser}>👤 {log.user_email}</Text>
              )}
              {log.resource_type && (
                <Text style={styles.logResource}>
                  📁 {log.resource_type}{log.resource_id ? ` · ${log.resource_id.slice(0, 8)}...` : ''}
                </Text>
              )}
              {log.detail && <Text style={styles.logDetail}>{log.detail}</Text>}
              <Text style={styles.logTime}>
                {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {log.ip_address && ` · ${log.ip_address}`}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

function getActionIcon(action: string): string {
  if (action.includes('login')) return 'log-in';
  if (action.includes('register')) return 'person-add';
  if (action.includes('delete') || action.includes('archive')) return 'trash';
  if (action.includes('update') || action.includes('edit')) return 'create';
  if (action.includes('create')) return 'add-circle';
  if (action.includes('admin')) return 'shield';
  return 'ellipse';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    margin: spacing.lg, backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSizes.sm, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  logRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  logIconWrapper: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  logContent: { flex: 1 },
  logTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  logAction: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  logUser: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 2 },
  logResource: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 2 },
  logDetail: { fontSize: fontSizes.xs, color: colors.textTertiary, marginBottom: 2 },
  logTime: { fontSize: fontSizes.xs, color: colors.textTertiary },
  separator: { height: spacing.sm },
});
