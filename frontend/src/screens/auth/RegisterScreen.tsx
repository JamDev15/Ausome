import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { OctopusMascot } from '../../components/common/OctopusMascot';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const ROLES = [
  { value: 'parent', label: 'Parent / Guardian', emoji: '👨‍👩‍👧' },
  { value: 'therapist', label: 'Therapist / Teacher', emoji: '🩺' },
  { value: 'caregiver', label: 'Caregiver / Support', emoji: '❤️' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setAuth } = useAuthStore();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.register(
        email.trim().toLowerCase(), password, fullName.trim(), role
      );
      setAuth(response);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Could not create account. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <OctopusMascot size={100} />
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join families supporting their children</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
            error={errors.fullName}
            placeholder="Your full name"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            leftIcon="mail-outline"
            error={errors.email}
            placeholder="your@email.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secure
            leftIcon="lock-closed-outline"
            error={errors.password}
            placeholder="Min 8 characters"
            hint="Use a mix of letters, numbers, and symbols"
          />

          <Text style={styles.roleLabel}>I am a...</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleSelected]}
                onPress={() => setRole(r.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: role === r.value }}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <Text style={[styles.roleText, role === r.value && styles.roleTextSelected]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Button
            label="Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            textStyle={styles.loginLink}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing['2xl'], paddingTop: spacing['4xl'] },
  header: { marginBottom: spacing['2xl'] },
  title: { fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: fontSizes.md, color: colors.textTertiary, marginTop: spacing.xs },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing['2xl'] },
  roleCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleEmoji: { fontSize: 24, marginBottom: spacing.xs },
  roleText: { fontSize: fontSizes.xs, color: colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  roleTextSelected: { color: colors.primary, fontWeight: '700' },
  submitBtn: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { fontSize: fontSizes.md, color: colors.textTertiary },
  loginLink: { color: colors.primary, fontWeight: '600', fontSize: fontSizes.md },
});
