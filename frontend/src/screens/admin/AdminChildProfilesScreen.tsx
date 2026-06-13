import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { childrenApi } from '../../api/children';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminChildProfiles'> };

export const AdminChildProfilesScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const { data: children = [], isLoading } = useQuery({ queryKey: ['children'], queryFn: childrenApi.list });
  const filtered = search ? children.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase())) : children;
  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Child Profiles" subtitle={`${children.length} profiles`} onBack={() => navigation.goBack()} />
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput style={styles.searchInput} placeholder="Search by name..." placeholderTextColor={colors.textTertiary} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.childRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.full_name}</Text>
              {item.age && <Text style={styles.age}>Age {item.age}</Text>}
              {item.asd_support_level && <Badge label={`ASD ${item.asd_support_level.replace('_', ' ')}`} variant="info" small />}
            </View>
            {item.communication_level && (
              <Badge label={item.communication_level.replace('_', ' ')} variant="primary" small />
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrapper: { flexDirection: 'row', alignItems: 'center', margin: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.md, fontSize: fontSizes.sm, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  childRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: fontSizes.md },
  info: { flex: 1, gap: spacing.xs },
  name: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  age: { fontSize: fontSizes.xs, color: colors.textTertiary },
});
