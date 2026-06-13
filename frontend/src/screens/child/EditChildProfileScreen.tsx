import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, Modal, TouchableOpacity, Clipboard,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { childrenApi } from '../../api/children';
import { useChildStore } from '../../store/childStore';
import { MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'EditChildProfile'>;
  route: RouteProp<MainStackParamList, 'EditChildProfile'>;
};

export const EditChildProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params ?? {};
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { addChild } = useChildStore();
  const isEditing = !!childId;

  // Basic info
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [triggers, setTriggers] = useState('');
  const [calmingStrategies, setCalmingStrategies] = useState('');
  const [strengthsInterests, setStrengthsInterests] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Child login
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasLogin, setHasLogin] = useState(false);

  // Credentials modal (shown after create)
  const [credModal, setCredModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ name: string; username: string; password: string } | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['child', childId],
    queryFn: () => childrenApi.get(childId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existing) {
      setFullName(existing.full_name ?? '');
      setNickname(existing.nickname ?? '');
      setAge(existing.age?.toString() ?? '');
      setDiagnosisSummary(existing.diagnosis_summary ?? '');
      setTriggers(existing.triggers ?? '');
      setCalmingStrategies(existing.calming_strategies ?? '');
      setStrengthsInterests(existing.strengths_interests ?? '');
      setEmergencyName(existing.emergency_contact_name ?? '');
      setEmergencyPhone(existing.emergency_contact_phone ?? '');
      setHasLogin(!!existing.user_id);
    }
  }, [existing]);

  // Auto-suggest username from name
  useEffect(() => {
    if (!isEditing && fullName && !childUsername) {
      const slug = fullName.trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '');
      setChildUsername(slug);
    }
  }, [fullName]);

  const createMutation = useMutation({
    mutationFn: childrenApi.create,
    onSuccess: (child: any) => {
      addChild(child);
      queryClient.invalidateQueries({ queryKey: ['children'] });
      if (child.child_username) {
        setCreatedCreds({
          name: child.full_name,
          username: child.child_username,
          password: childPassword,
        });
        setCredModal(true);
      } else {
        Alert.alert('Profile Created!', `${child.full_name}'s profile is ready.`);
        navigation.goBack();
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? 'Could not save profile. Please try again.';
      Alert.alert('Error', msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => childrenApi.update(childId!, data),
    onSuccess: (child: any) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['child', childId] });
      // If a new login was just created, show the credentials modal
      if (!hasLogin && childUsername && childPassword) {
        setCreatedCreds({ name: child.full_name, username: childUsername, password: childPassword });
        setCredModal(true);
      } else {
        Alert.alert('Saved!', 'Profile updated.');
        navigation.goBack();
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail ?? 'Could not update profile.';
      Alert.alert('Error', msg);
    },
  });

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', "Please enter the child's full name.");
      return;
    }
    if (childUsername && childPassword && childPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'The passwords do not match.');
      return;
    }
    if (childUsername && !childPassword && !isEditing) {
      Alert.alert('Password required', 'Please enter a password for the child login.');
      return;
    }

    const payload: any = {
      full_name: fullName.trim(),
      nickname: nickname.trim() || undefined,
      age: age ? parseInt(age, 10) : undefined,
      diagnosis_summary: diagnosisSummary.trim() || undefined,
      triggers: triggers.trim() || undefined,
      calming_strategies: calmingStrategies.trim() || undefined,
      strengths_interests: strengthsInterests.trim() || undefined,
      emergency_contact_name: emergencyName.trim() || undefined,
      emergency_contact_phone: emergencyPhone.trim() || undefined,
    };

    if (childUsername.trim()) payload.child_username = childUsername.trim().toLowerCase();
    if (childPassword.trim()) payload.child_password = childPassword.trim();

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isEditing && isLoading) return <Loading fullScreen />;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const SectionTitle: React.FC<{ label: string; icon?: string }> = ({ label, icon }) => (
    <View style={styles.sectionHeader}>
      {icon && <Ionicons name={icon as any} size={14} color={colors.textTertiary} />}
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  return (
    <>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title={isEditing ? 'Edit Profile' : 'New Child Profile'}
          onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SectionTitle label="Basic Information" icon="person-outline" />
          <Input label="Full Name *" value={fullName} onChangeText={setFullName} placeholder="Child's full name" leftIcon="person-outline" />
          <Input label="Nickname" value={nickname} onChangeText={setNickname} placeholder="What do you call them at home?" leftIcon="happy-outline" />
          <Input label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Current age" leftIcon="calendar-outline" />

          <SectionTitle label="Diagnosis" icon="medkit-outline" />
          <Input label="Diagnosis Summary" value={diagnosisSummary} onChangeText={setDiagnosisSummary} placeholder="Brief overview of diagnosis and support needs..." multiline numberOfLines={4} />

          <SectionTitle label="Behavior & Support" icon="heart-outline" />
          <Input label="Triggers" value={triggers} onChangeText={setTriggers} placeholder="What tends to cause distress? (sounds, transitions, etc.)" multiline />
          <Input label="Calming Strategies" value={calmingStrategies} onChangeText={setCalmingStrategies} placeholder="What helps when upset? (quiet space, music, etc.)" multiline />
          <Input label="Strengths & Interests" value={strengthsInterests} onChangeText={setStrengthsInterests} placeholder="What does this child love and do well?" multiline />

          <SectionTitle label="Emergency Contact" icon="call-outline" />
          <Input label="Contact Name" value={emergencyName} onChangeText={setEmergencyName} placeholder="Parent/guardian name" leftIcon="call-outline" />
          <Input label="Contact Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="+1 555 0100" keyboardType="phone-pad" leftIcon="phone-portrait-outline" />

          {/* ── Child Login ── */}
          <View style={styles.loginSection}>
            <View style={styles.loginHeader}>
              <View style={styles.loginHeaderLeft}>
                <Ionicons name="key-outline" size={18} color="#F7A44A" />
                <Text style={styles.loginTitle}>Child Login</Text>
              </View>
              {isEditing && hasLogin && (
                <View style={styles.loginBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4CAF82" />
                  <Text style={styles.loginBadgeText}>Account active</Text>
                </View>
              )}
            </View>
            <Text style={styles.loginDesc}>
              {isEditing
                ? hasLogin
                  ? 'Update the child\'s login password below (leave blank to keep current).'
                  : 'Create a login account so the child can use the app independently.'
                : 'Optional: set a username and password so your child can log in on their own.'}
            </Text>

            <Input
              label="Username"
              value={childUsername}
              onChangeText={setChildUsername}
              placeholder="e.g. aiden"
              leftIcon="at-outline"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label={isEditing ? 'New Password (optional)' : 'Password'}
              value={childPassword}
              onChangeText={setChildPassword}
              secure
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
            />
            {childPassword.length > 0 && (
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secure
                leftIcon="lock-closed-outline"
                placeholder="••••••••"
              />
            )}
          </View>

          <Button
            label={isEditing ? 'Save Changes' : 'Create Profile'}
            onPress={handleSave}
            loading={isSaving}
            fullWidth size="lg" style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Credentials modal ── */}
      <Modal visible={credModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.credCard, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.credHeader}>
              <View style={styles.credIconCircle}>
                <Ionicons name="key" size={32} color="#F7A44A" />
              </View>
              <Text style={styles.credTitle}>Child Account Created!</Text>
              <Text style={styles.credSub}>
                Save these login details for {createdCreds?.name}. They can use the app independently.
              </Text>
            </View>

            <View style={styles.credBox}>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Name / Username</Text>
                <TouchableOpacity
                  style={styles.credValue}
                  onPress={() => Clipboard.setString(createdCreds?.username ?? '')}
                >
                  <Text style={styles.credValueText}>{createdCreds?.username}</Text>
                  <Ionicons name="copy-outline" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.credRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.credLabel}>Password</Text>
                <TouchableOpacity
                  style={styles.credValue}
                  onPress={() => Clipboard.setString(createdCreds?.password ?? '')}
                >
                  <Text style={styles.credValueText}>{createdCreds?.password}</Text>
                  <Ionicons name="copy-outline" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.credNote}>
              The child should choose "Child Login" on the sign-in screen and enter their username.
            </Text>

            <TouchableOpacity
              style={styles.credDoneBtn}
              onPress={() => {
                setCredModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.credDoneText}>Got it, all done!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: spacing.md, marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  // Child login section
  loginSection: {
    marginTop: spacing.xl,
    backgroundColor: '#FFF8EE',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#F7A44A40',
    gap: spacing.md,
  },
  loginHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loginHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  loginTitle: { fontSize: fontSizes.md, fontWeight: '800', color: '#F7A44A' },
  loginBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E4F7EE', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  loginBadgeText: { fontSize: fontSizes.xs, fontWeight: '700', color: '#4CAF82' },
  loginDesc: { fontSize: fontSizes.sm, color: colors.textTertiary, lineHeight: 20 },

  saveBtn: { marginTop: spacing.xl },

  // Credentials modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  credCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, gap: spacing.lg,
  },
  credHeader: { alignItems: 'center', gap: spacing.sm },
  credIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF4E3', justifyContent: 'center', alignItems: 'center',
  },
  credTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  credSub: { fontSize: fontSizes.sm, color: colors.textTertiary, textAlign: 'center', lineHeight: 20 },
  credBox: {
    backgroundColor: '#F6F9FF', borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#E2E8F4', overflow: 'hidden',
  },
  credRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  credLabel: { fontSize: fontSizes.sm, color: colors.textTertiary, fontWeight: '600' },
  credValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  credValueText: { fontSize: fontSizes.md, fontWeight: '800', color: '#1A2340', fontFamily: 'monospace' },
  credNote: {
    fontSize: fontSizes.xs, color: colors.textTertiary,
    textAlign: 'center', lineHeight: 18,
  },
  credDoneBtn: {
    backgroundColor: '#F7A44A', borderRadius: radius.full,
    paddingVertical: 16, alignItems: 'center',
  },
  credDoneText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
});
