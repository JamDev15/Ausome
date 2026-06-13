import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, Switch, Linking, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useChildStore } from '../../store/childStore';
import { useLanguageStore } from '../../store/languageStore';
import { authApi } from '../../api/auth';
import { onboardingApi } from '../../api/onboarding';
import { Card } from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types';
import {
  requestNotificationPermissions,
} from '../../utils/notifications';

type Props = { navigation: NativeStackNavigationProp<MainStackParamList, 'Settings'> };

// ── Reusable row ─────────────────────────────────────────────────────────────
const SettingRow: React.FC<{
  icon: string; label: string; onPress?: () => void;
  danger?: boolean; value?: string; rightNode?: React.ReactNode;
  color?: string;
}> = ({ icon, label, onPress, danger, value, rightNode, color }) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <View style={[styles.settingIcon, {
      backgroundColor: danger ? colors.errorLight : (color ? color + '20' : colors.primaryLight),
    }]}>
      <Ionicons name={icon as any} size={18} color={danger ? colors.error : (color ?? colors.primary)} />
    </View>
    <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
    {value && <Text style={styles.settingValue}>{value}</Text>}
    {rightNode}
    {onPress && !rightNode && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
  </TouchableOpacity>
);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const SettingsModal: React.FC<{
  visible: boolean; title: string; onClose: () => void; children: React.ReactNode;
}> = ({ visible, title, onClose, children }) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalRoot, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={22} color="#1A2340" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const ModalInput: React.FC<{
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secure?: boolean; keyboardType?: any;
}> = ({ label, value, onChangeText, placeholder, secure, keyboardType }) => (
  <View style={styles.modalField}>
    <Text style={styles.modalFieldLabel}>{label}</Text>
    <TextInput
      style={styles.modalInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#C0C8D8"
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, role, logout, setUser } = useAuthStore();
  const { clearSelected } = useChildStore();
  const { language, setLanguage } = useLanguageStore();

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAudio, setShowAudio] = useState(false);

  // Edit profile form
  const [editName, setEditName] = useState(user?.full_name ?? '');
  const [editPhone, setEditPhone] = useState((user as any)?.phone ?? '');

  // Change password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Notification settings
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [medNotif, setMedNotif] = useState(true);

  const updateProfileMut = useMutation({
    mutationFn: () => authApi.updateProfile({ full_name: editName.trim(), phone: editPhone.trim() }),
    onSuccess: (data) => {
      setUser({ full_name: data.full_name, phone: data.phone } as any);
      setShowEditProfile(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail ?? 'Could not update profile.'),
  });

  const changePwdMut = useMutation({
    mutationFn: () => authApi.changePassword(currentPwd, newPwd),
    onSuccess: () => {
      setShowChangePassword(false);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      Alert.alert('Password changed', 'Your password has been updated successfully.');
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail ?? 'Could not change password.'),
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { clearSelected(); logout(); } },
    ]);
  };

  const handleChangePassword = useCallback(() => {
    if (!currentPwd) { Alert.alert('Required', 'Enter your current password.'); return; }
    if (newPwd.length < 8) { Alert.alert('Too short', 'New password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { Alert.alert('Mismatch', 'New passwords do not match.'); return; }
    changePwdMut.mutate();
  }, [currentPwd, newPwd, confirmPwd]);

  const openURL = (url: string) => Linking.openURL(url).catch(() =>
    Alert.alert('Cannot open', 'Unable to open this link on your device.')
  );

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        'Permission required',
        'Please allow notifications in your iPhone Settings → Ausome → Notifications.',
        [
          { text: 'Open Settings', onPress: () => Linking.openURL('app-settings:') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
    setNotifEnabled(granted);
  };

  const isChild = role === 'child';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Settings"
        onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Hub')}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.full_name?.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name}</Text>
            <Text style={styles.profileEmail}>{(user as any)?.email ?? ''}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Account */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          {!isChild && (
            <SettingRow
              icon="person-outline" label="Edit Profile"
              onPress={() => { setEditName(user?.full_name ?? ''); setEditPhone((user as any)?.phone ?? ''); setShowEditProfile(true); }}
            />
          )}
          <SettingRow
            icon="lock-closed-outline" label="Change Password"
            onPress={() => { setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setShowChangePassword(true); }}
          />
          <SettingRow
            icon="notifications-outline" label="Notifications"
            onPress={() => setShowNotifications(true)}
          />
        </Card>

        {/* App */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <SettingRow
            icon="volume-medium-outline" label="Audio & Speech"
            onPress={() => setShowAudio(true)}
            color="#4CAF82"
          />
          <SettingRow
            icon="language-outline"
            label="Language / Wika"
            value={language === 'tl' ? '🇵🇭 Tagalog' : '🇺🇸 English'}
            onPress={() => {
              Alert.alert(
                'Language / Wika',
                'Choose your preferred language.\nPumili ng wika.',
                [
                  { text: '🇺🇸 English', onPress: async () => { setLanguage('en'); try { await onboardingApi.setLanguage('en'); } catch {} } },
                  { text: '🇵🇭 Tagalog', onPress: async () => { setLanguage('tl'); try { await onboardingApi.setLanguage('tl'); } catch {} } },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
            color="#F7A44A"
          />
          <SettingRow
            icon="information-circle-outline" label="App Version" value="v1.0.0"
            color="#8894B0"
          />
        </Card>

        {/* Privacy */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & DATA</Text>
          <SettingRow
            icon="shield-outline" label="Privacy Policy"
            onPress={() => openURL('https://ausome.app/privacy')}
          />
          <SettingRow
            icon="document-text-outline" label="Terms of Service"
            onPress={() => openURL('https://ausome.app/terms')}
          />
          <SettingRow
            icon="download-outline" label="Export My Data"
            onPress={() => Alert.alert('Export Data', 'Your data export will be sent to your email address within 24 hours.\n\nContact support@ausome.app to request it.')}
          />
        </Card>

        {/* Support */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <SettingRow
            icon="help-circle-outline" label="Help & FAQ"
            onPress={() => openURL('https://ausome.app/help')}
            color="#5B8DEF"
          />
          <SettingRow
            icon="mail-outline" label="Contact Support"
            onPress={() => openURL('mailto:support@ausome.app?subject=Ading%20Support')}
            color="#5B8DEF"
          />
          <SettingRow
            icon="star-outline" label="Rate Ausome"
            onPress={() => openURL('https://apps.apple.com/app/id123456789')}
            color="#F7A44A"
          />
        </Card>

        {/* Sign out */}
        <Card style={styles.section}>
          <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
        </Card>

        <Text style={styles.version}>Ausome v1.0.0 · Made with ❤️ for families</Text>
        <Text style={styles.disclaimer}>
          This app provides educational support only — not a replacement for licensed medical or therapeutic care.
        </Text>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <SettingsModal visible={showEditProfile} title="Edit Profile" onClose={() => setShowEditProfile(false)}>
        <ModalInput label="Full Name" value={editName} onChangeText={setEditName} placeholder="Your full name" />
        <ModalInput label="Phone (optional)" value={editPhone} onChangeText={setEditPhone} placeholder="+1 555 0100" keyboardType="phone-pad" />
        <TouchableOpacity
          style={[styles.saveBtn, updateProfileMut.isPending && styles.saveBtnDisabled]}
          onPress={() => updateProfileMut.mutate()}
          disabled={updateProfileMut.isPending}
        >
          <Text style={styles.saveBtnText}>{updateProfileMut.isPending ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </SettingsModal>

      {/* ── Change Password Modal ── */}
      <SettingsModal visible={showChangePassword} title="Change Password" onClose={() => setShowChangePassword(false)}>
        <ModalInput label="Current Password" value={currentPwd} onChangeText={setCurrentPwd} placeholder="••••••••" secure />
        <ModalInput label="New Password" value={newPwd} onChangeText={setNewPwd} placeholder="At least 8 characters" secure />
        <ModalInput label="Confirm New Password" value={confirmPwd} onChangeText={setConfirmPwd} placeholder="••••••••" secure />
        <TouchableOpacity
          style={[styles.saveBtn, changePwdMut.isPending && styles.saveBtnDisabled]}
          onPress={handleChangePassword}
          disabled={changePwdMut.isPending}
        >
          <Text style={styles.saveBtnText}>{changePwdMut.isPending ? 'Changing...' : 'Change Password'}</Text>
        </TouchableOpacity>
      </SettingsModal>

      {/* ── Notifications Modal ── */}
      <SettingsModal visible={showNotifications} title="Notifications" onClose={() => setShowNotifications(false)}>
        <View style={styles.notifRow}>
          <View>
            <Text style={styles.notifLabel}>Enable Notifications</Text>
            <Text style={styles.notifSub}>Allow Ausome to send you alerts</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={(v) => { if (v) handleEnableNotifications(); else setNotifEnabled(false); }}
            trackColor={{ true: colors.primary, false: '#E2E8F4' }}
            thumbColor="#fff"
          />
        </View>
        <View style={[styles.notifRow, !notifEnabled && styles.notifRowDisabled]}>
          <View>
            <Text style={styles.notifLabel}>Medicine Reminders</Text>
            <Text style={styles.notifSub}>Daily alerts at scheduled medicine times</Text>
          </View>
          <Switch
            value={medNotif && notifEnabled}
            onValueChange={setMedNotif}
            disabled={!notifEnabled}
            trackColor={{ true: '#00B8A9', false: '#E2E8F4' }}
            thumbColor="#fff"
          />
        </View>
        <View style={[styles.notifRow, { borderBottomWidth: 0 }, !notifEnabled && styles.notifRowDisabled]}>
          <View>
            <Text style={styles.notifLabel}>Daily Schedule Reminders</Text>
            <Text style={styles.notifSub}>Morning reminder to check today's routine</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={() => {}}
            disabled={!notifEnabled}
            trackColor={{ true: colors.primary, false: '#E2E8F4' }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.notifNote}>
          To fully disable notifications, go to iPhone Settings → Ausome → Notifications.
        </Text>
      </SettingsModal>

      {/* ── Audio & Speech Modal ── */}
      <SettingsModal visible={showAudio} title="Audio & Speech" onClose={() => setShowAudio(false)}>
        <View style={styles.audioInfoBox}>
          <Ionicons name="volume-high" size={32} color="#4CAF82" />
          <Text style={styles.audioInfoTitle}>Text-to-Speech</Text>
          <Text style={styles.audioInfoText}>
            Ausome uses high-quality AI voices to speak words and phrases in the Talk Board, Flashcards, and Activities.
          </Text>
        </View>
        <View style={styles.audioDetailRow}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF82" />
          <Text style={styles.audioDetailText}>Audio plays through your device speakers</Text>
        </View>
        <View style={styles.audioDetailRow}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF82" />
          <Text style={styles.audioDetailText}>Works in Silent Mode (volume up to hear)</Text>
        </View>
        <View style={styles.audioDetailRow}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF82" />
          <Text style={styles.audioDetailText}>Audio is pre-loaded for instant playback</Text>
        </View>
        <View style={styles.audioDetailRow}>
          <Ionicons name="information-circle-outline" size={18} color="#8894B0" />
          <Text style={[styles.audioDetailText, { color: '#8894B0' }]}>Speech speed & voice customisation coming soon</Text>
        </View>
      </SettingsModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primaryLight, borderRadius: radius['2xl'],
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.primary + '30',
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  profileAvatarText: { color: colors.white, fontSize: fontSizes.xl, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.textPrimary },
  profileEmail: { fontSize: fontSizes.sm, color: colors.textTertiary, marginTop: 1 },
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.primary + '20',
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4,
  },
  roleText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: '800', letterSpacing: 0.5 },

  section: { marginBottom: spacing.lg, padding: 0, overflow: 'hidden', borderRadius: radius['2xl'] },
  sectionTitle: {
    fontSize: fontSizes.xs, fontWeight: '800', color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1.5,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  settingIcon: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  settingLabel: { flex: 1, fontSize: fontSizes.md, color: colors.textPrimary, fontWeight: '500' },
  settingLabelDanger: { color: colors.error },
  settingValue: { fontSize: fontSizes.sm, color: colors.textTertiary, marginRight: spacing.sm },

  version: { textAlign: 'center', fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: spacing.xl },
  disclaimer: { textAlign: 'center', fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: spacing.sm, lineHeight: 18, fontStyle: 'italic' },

  // Modal shared
  modalRoot: { flex: 1, backgroundColor: '#F6F9FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4',
  },
  modalTitle: { fontSize: fontSizes.xl, fontWeight: '800', color: '#1A2340' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },

  modalField: { gap: 6 },
  modalFieldLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#8894B0', textTransform: 'uppercase', letterSpacing: 0.8 },
  modalInput: {
    backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#E2E8F4',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontSize: fontSizes.md, color: '#1A2340', ...shadow.sm,
  },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },

  // Notifications
  notifRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: '#E2E8F4', ...shadow.sm,
  },
  notifRowDisabled: { opacity: 0.45 },
  notifLabel: { fontSize: fontSizes.md, fontWeight: '700', color: '#1A2340' },
  notifSub: { fontSize: fontSizes.xs, color: '#8894B0', marginTop: 2 },
  notifNote: { fontSize: fontSizes.xs, color: '#8894B0', textAlign: 'center', lineHeight: 18 },

  // Audio
  audioInfoBox: {
    backgroundColor: '#E8F8F2', borderRadius: radius.xl, padding: spacing.xl,
    alignItems: 'center', gap: spacing.sm,
  },
  audioInfoTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: '#1A2340' },
  audioInfoText: { fontSize: fontSizes.sm, color: '#4A5578', textAlign: 'center', lineHeight: 20 },
  audioDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 4 },
  audioDetailText: { flex: 1, fontSize: fontSizes.sm, color: '#1A2340', lineHeight: 20 },
});
