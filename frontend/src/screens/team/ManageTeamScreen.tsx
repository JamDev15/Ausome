import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, FlatList,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { childrenApi } from '../../api/children';
import { TeamMember, MainStackParamList } from '../../types';
import { Loading } from '../../components/common/Loading';
import { OctopusLogo } from '../../components/common/OctopusLogo';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ManageTeam'>;
  route: RouteProp<MainStackParamList, 'ManageTeam'>;
};

const ROLE_OPTIONS = [
  { key: 'caregiver', label: 'Guardian / Caregiver', icon: 'people-outline', color: '#5B8DEF', desc: 'Trusted family member or support worker' },
  { key: 'therapist', label: 'Therapist', icon: 'medical-outline', color: '#4CAF82', desc: 'Speech, OT, ABA, or other professional' },
] as const;

type RoleKey = typeof ROLE_OPTIONS[number]['key'];

const ROLE_COLORS: Record<string, string> = {
  caregiver: '#5B8DEF',
  therapist: '#4CAF82',
  parent: '#E8589A',
};

const ROLE_LABELS: Record<string, string> = {
  caregiver: 'Guardian',
  therapist: 'Therapist',
  parent: 'Parent',
};

export const ManageTeamScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState<RoleKey>('caregiver');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const { data: child, isLoading } = useQuery({
    queryKey: ['child', childId],
    queryFn: () => childrenApi.get(childId),
  });

  const inviteMut = useMutation({
    mutationFn: (payload: { email: string; full_name: string; role: RoleKey }) =>
      childrenApi.inviteTeamMember(childId, payload),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['child', childId] });
      setShowInvite(false);
      resetForm();
      const msg = result.is_new_account
        ? `An account has been created and an email with login credentials was sent to ${result.email}.`
        : `${result.full_name} has been added to the care team.`;
      Alert.alert('Team member added', msg);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.detail ?? 'Could not add team member.');
    },
  });

  const removeMut = useMutation({
    mutationFn: (memberId: string) => childrenApi.removeTeamMember(childId, memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['child', childId] }),
  });

  const resetForm = () => {
    setInviteName('');
    setInviteEmail('');
    setInviteRole('caregiver');
  };

  const handleInvite = useCallback(() => {
    if (!inviteName.trim()) { Alert.alert('Required', 'Please enter a name.'); return; }
    if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      Alert.alert('Required', 'Please enter a valid email address.'); return;
    }
    inviteMut.mutate({ email: inviteEmail.trim().toLowerCase(), full_name: inviteName.trim(), role: inviteRole });
  }, [inviteName, inviteEmail, inviteRole]);

  const confirmRemove = (member: TeamMember) => {
    Alert.alert('Remove member', `Remove ${member.full_name} from this child's care team?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMut.mutate(member.id) },
    ]);
  };

  if (isLoading) return <Loading fullScreen />;

  const team: TeamMember[] = child?.team ?? [];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1A2340" />
        </TouchableOpacity>
        <OctopusLogo size={28} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Care Team</Text>
          <Text style={styles.subtitle}>{child?.full_name}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowInvite(true)}>
          <Ionicons name="person-add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.infoText}>
          Invite guardians and therapists to view and contribute to {child?.full_name}'s care. They'll receive an email with login credentials.
        </Text>

        {team.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#E2E8F4" />
            <Text style={styles.emptyTitle}>No team members yet</Text>
            <Text style={styles.emptySub}>Tap + to invite a guardian or therapist</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowInvite(true)}>
              <Ionicons name="person-add" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Invite Someone</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Team Members ({team.length})</Text>
            {team.map((member) => {
              const roleColor = ROLE_COLORS[member.role] ?? colors.primary;
              const roleLabel = ROLE_LABELS[member.role] ?? member.role;
              return (
                <View key={member.id} style={styles.memberCard}>
                  <View style={[styles.avatar, { backgroundColor: roleColor + '22' }]}>
                    <Text style={[styles.avatarText, { color: roleColor }]}>
                      {member.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.full_name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <View style={[styles.roleChip, { backgroundColor: roleColor + '18' }]}>
                      <Text style={[styles.roleChipText, { color: roleColor }]}>{roleLabel}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => confirmRemove(member)}>
                    <Ionicons name="close-circle-outline" size={22} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Invite modal */}
      <Modal visible={showInvite} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalRoot, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Team Member</Text>
            <TouchableOpacity onPress={() => { setShowInvite(false); resetForm(); }}>
              <Ionicons name="close" size={24} color="#1A2340" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Role selector */}
            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleOptions}>
              {ROLE_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleOption, inviteRole === r.key && { borderColor: r.color, backgroundColor: r.color + '12' }]}
                  onPress={() => setInviteRole(r.key)}
                >
                  <Ionicons name={r.icon as any} size={24} color={inviteRole === r.key ? r.color : '#8894B0'} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleOptionLabel, inviteRole === r.key && { color: r.color }]}>{r.label}</Text>
                    <Text style={styles.roleOptionDesc}>{r.desc}</Text>
                  </View>
                  {inviteRole === r.key && (
                    <Ionicons name="checkmark-circle" size={20} color={r.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={inviteName}
              onChangeText={setInviteName}
              placeholder="Their full name"
              placeholderTextColor="#C0C8D8"
            />

            <Text style={styles.fieldLabel}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="their@email.com"
              placeholderTextColor="#C0C8D8"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color="#5B8DEF" />
              <Text style={styles.infoBoxText}>
                If they don't have an account, one will be created and login credentials will be sent to their email.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, inviteMut.isPending && styles.submitBtnDisabled]}
              onPress={handleInvite}
              disabled={inviteMut.isPending}
            >
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={styles.submitText}>
                {inviteMut.isPending ? 'Sending invite...' : 'Send Invite'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F9FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  subtitle: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 1 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#5B8DEF', justifyContent: 'center', alignItems: 'center', ...shadow.sm },

  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  infoText: { fontSize: fontSizes.sm, color: colors.textTertiary, lineHeight: 20, marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },

  memberCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, ...shadow.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: fontSizes.xl, fontWeight: '800' },
  memberInfo: { flex: 1, gap: 3 },
  memberName: { fontSize: fontSizes.md, fontWeight: '700', color: '#1A2340' },
  memberEmail: { fontSize: fontSizes.xs, color: '#8894B0' },
  roleChip: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  roleChipText: { fontSize: fontSizes.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  removeBtn: { padding: spacing.xs },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing['3xl'] },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  emptySub: { fontSize: fontSizes.md, color: '#8894B0', textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#5B8DEF', borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: 14, marginTop: spacing.md },
  emptyBtnText: { fontSize: fontSizes.md, fontWeight: '800', color: '#fff' },

  // Modal
  modalRoot: { flex: 1, backgroundColor: '#F6F9FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  modalTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  modalBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  fieldLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: -4 },
  input: {
    backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontSize: fontSizes.md, color: '#1A2340', ...shadow.sm,
  },
  roleOptions: { gap: spacing.sm },
  roleOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#fff', borderRadius: radius.xl, borderWidth: 1.5, borderColor: '#E2E8F4',
    padding: spacing.lg, ...shadow.sm,
  },
  roleOptionLabel: { fontSize: fontSizes.md, fontWeight: '700', color: '#4A5578' },
  roleOptionDesc: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 2 },
  infoBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: '#EAF1FF', borderRadius: radius.lg, padding: spacing.md },
  infoBoxText: { flex: 1, fontSize: fontSizes.xs, color: '#5B8DEF', lineHeight: 18 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: '#5B8DEF', borderRadius: radius.full, paddingVertical: 16, marginTop: spacing.md },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
});
