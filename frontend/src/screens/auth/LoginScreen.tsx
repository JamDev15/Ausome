import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Image } from 'react-native';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [isChildMode, setIsChildMode] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({});

  const { setAuth } = useAuthStore();

  const validate = () => {
    const errs: typeof errors = {};
    if (!login.trim()) {
      errs.login = isChildMode ? 'Username is required' : 'Email is required';
    } else if (!isChildMode && !/\S+@\S+\.\S+/.test(login)) {
      errs.login = 'Enter a valid email';
    }
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await authApi.login(login.trim().toLowerCase(), password);
      setAuth(response);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Unable to sign in. Please try again.';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (childMode: boolean) => {
    setIsChildMode(childMode);
    setLogin('');
    setPassword('');
    setErrors({});
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
        {/* Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/welcome-icon.png')}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Ausome</Text>
          <Text style={styles.tagline}>Supporting your family, every step of the way</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, !isChildMode && styles.modeBtnActive]}
            onPress={() => switchMode(false)}
          >
            <Text style={[styles.modeBtnText, !isChildMode && styles.modeBtnTextActive]}>
              Parent / Adult
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, isChildMode && styles.modeBtnActiveChild]}
            onPress={() => switchMode(true)}
          >
            <Text style={[styles.modeBtnText, isChildMode && styles.modeBtnTextActive]}>
              Child Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isChildMode ? 'Hi there! 👋' : 'Welcome back'}
          </Text>
          <Text style={styles.formSubtitle}>
            {isChildMode ? 'Enter your name and password' : 'Sign in to continue'}
          </Text>

          <Input
            label={isChildMode ? 'Your Name / Username' : 'Email'}
            value={login}
            onChangeText={setLogin}
            keyboardType={isChildMode ? 'default' : 'email-address'}
            autoComplete={isChildMode ? 'username' : 'email'}
            autoCapitalize="none"
            leftIcon={isChildMode ? 'happy-outline' : 'mail-outline'}
            error={errors.login}
            placeholder={isChildMode ? 'aiden' : 'your@email.com'}
          />

          <Input
            label={isChildMode ? 'Secret Password' : 'Password'}
            value={password}
            onChangeText={setPassword}
            secure
            leftIcon="lock-closed-outline"
            error={errors.password}
            placeholder="••••••••"
          />

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={isChildMode ? { ...styles.submitBtn, ...styles.submitBtnChild } : styles.submitBtn}
          />

          {!isChildMode && (
            <Button
              label="Forgot password?"
              onPress={() => navigation.navigate('ForgotPassword')}
              variant="ghost"
              fullWidth
              style={styles.forgotBtn}
              textStyle={styles.forgotText}
            />
          )}
        </View>

        {/* Register (adult only) */}
        {!isChildMode && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Ausome? </Text>
            <Button
              label="Create account"
              onPress={() => navigation.navigate('Register')}
              variant="ghost"
              textStyle={styles.registerLink}
            />
          </View>
        )}

        {isChildMode && (
          <View style={styles.childHint}>
            <Text style={styles.childHintText}>
              Ask a parent to set up your account
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    padding: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['5xl'],
  },
  header: { alignItems: 'center', marginBottom: spacing['2xl'] },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary, marginBottom: spacing.xs },
  tagline: { fontSize: fontSizes.md, color: colors.textTertiary, textAlign: 'center' },

  modeToggle: {
    flexDirection: 'row', backgroundColor: colors.border,
    borderRadius: radius.full, padding: 4, marginBottom: spacing.xl,
  },
  modeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.full,
    alignItems: 'center',
  },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnActiveChild: { backgroundColor: '#F7A44A' },
  modeBtnText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
  modeBtnTextActive: { color: '#fff' },

  form: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing['2xl'], marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  formTitle: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  formSubtitle: { fontSize: fontSizes.md, color: colors.textTertiary, marginBottom: spacing['2xl'] },

  submitBtn: { marginTop: spacing.sm },
  submitBtnChild: { backgroundColor: '#F7A44A' },
  forgotBtn: { marginTop: spacing.xs },
  forgotText: { color: colors.textTertiary, fontSize: fontSizes.md },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: fontSizes.md, color: colors.textTertiary },
  registerLink: { color: colors.primary, fontWeight: '600', fontSize: fontSizes.md },

  childHint: {
    marginTop: spacing.md, padding: spacing.md,
    backgroundColor: '#FFF4E3', borderRadius: radius.md,
  },
  childHintText: { fontSize: fontSizes.sm, color: '#F7A44A', textAlign: 'center', fontWeight: '600' },
});
