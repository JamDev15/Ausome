import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { authApi } from '../api/auth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { colors, spacing, fontSizes } from '../theme';

const Stack = createNativeStackNavigator<AuthStackParamList>();

// ── Forgot Password (3 steps: email → code → new password) ──────────────────
const ForgotPasswordScreen: React.FC<{
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
}> = ({ navigation }) => {
  const [step, setStep] = React.useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const sendCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setStep('code');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code from your email.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Too short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim().toLowerCase(), code.trim(), password);
      setStep('done');
    } catch {
      Alert.alert('Error', 'The code is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <View style={fp.container}>
        <View style={fp.center}>
          <Text style={fp.emoji}>✅</Text>
          <Text style={fp.title}>Password updated!</Text>
          <Text style={fp.body}>Your password has been changed. You can now sign in.</Text>
          <Button label="Sign In" onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  if (step === 'code') {
    return (
      <View style={fp.container}>
        <Button label="← Back" onPress={() => setStep('email')} variant="ghost"
          style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
        <Text style={fp.emoji}>📧</Text>
        <Text style={fp.title}>Check your email</Text>
        <Text style={fp.body}>
          We sent a <Text style={{ fontWeight: '800', color: colors.textPrimary }}>6-digit code</Text> to{' '}
          <Text style={{ fontWeight: '700' }}>{email}</Text>.{'\n'}Enter it below with your new password.
        </Text>

        <Input
          label="6-digit code"
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          leftIcon="key-outline"
          placeholder="123456"
        />
        <Input
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock-closed-outline"
          placeholder="At least 6 characters"
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          leftIcon="lock-closed-outline"
          placeholder="Repeat password"
        />
        <Button label="Update Password" onPress={resetPassword} loading={loading} fullWidth size="lg" />
        <Button
          label="Resend code"
          onPress={() => { setCode(''); sendCode(); }}
          variant="ghost"
          style={{ marginTop: 8 }}
        />
      </View>
    );
  }

  return (
    <View style={fp.container}>
      <Button label="← Back" onPress={() => navigation.goBack()} variant="ghost"
        style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
      <Text style={fp.title}>Forgot Password?</Text>
      <Text style={fp.body}>Enter your email and we'll send a 6-digit reset code.</Text>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
        placeholder="your@email.com"
      />
      <Button label="Send Code" onPress={sendCode} loading={loading} fullWidth size="lg" />
    </View>
  );
};

const fp = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing['2xl'], paddingTop: spacing['5xl'] },
  center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  emoji: { fontSize: 48, marginBottom: spacing.lg },
  title: { fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  body: { fontSize: fontSizes.md, color: colors.textTertiary, marginBottom: spacing['2xl'], lineHeight: 22 },
});

// ── Navigator ────────────────────────────────────────────────────────────────
export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    initialRouteName="Login"
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={() => null} />
  </Stack.Navigator>
);
