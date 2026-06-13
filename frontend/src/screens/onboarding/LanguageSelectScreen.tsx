import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingStackParamList } from '../../types';
import { useLanguageStore, AppLanguage } from '../../store/languageStore';
import { onboardingApi } from '../../api/onboarding';
import { OctopusMascot } from '../../components/common/OctopusMascot';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LanguageSelect'>;
};

export const LanguageSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();

  const pick = async (lang: AppLanguage) => {
    setLanguage(lang);
    try { await onboardingApi.setLanguage(lang); } catch { /* non-blocking */ }
    navigation.navigate('Survey');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <StatusBar barStyle="dark-content" />

      {/* Logo */}
      <View style={styles.header}>
        <OctopusMascot size={100} />
        <Text style={styles.appName}>Ausome</Text>
      </View>

      {/* Bilingual welcome */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeEn}>Welcome — choose your language to continue.</Text>
        <View style={styles.divider} />
        <Text style={styles.welcomeTl}>Maligayang pagdating — pumili ng wika para magpatuloy.</Text>
      </View>

      {/* Language buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          onPress={() => pick('en')}
          activeOpacity={0.85}
        >
          <Text style={styles.flag}>🇺🇸</Text>
          <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langBtn, language === 'tl' && styles.langBtnActiveTl]}
          onPress={() => pick('tl')}
          activeOpacity={0.85}
        >
          <Text style={styles.flag}>🇵🇭</Text>
          <View>
            <Text style={[styles.langBtnText, language === 'tl' && styles.langBtnTextActive]}>
              Tagalog
            </Text>
            <Text style={[styles.langBtnSub, language === 'tl' && { color: '#fff' }]}>
              Wikang Filipino
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        {t('language_select.note')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    paddingHorizontal: spacing['2xl'],
    paddingTop: 0, paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  header: { alignItems: 'center', marginBottom: spacing['2xl'] },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.primary },

  welcomeBox: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, marginBottom: spacing['2xl'],
    borderWidth: 1, borderColor: colors.border, width: '100%',
    gap: spacing.md,
  },
  welcomeEn: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border },
  welcomeTl: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  buttonsContainer: { width: '100%', gap: spacing.md, marginBottom: spacing.xl },

  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.xl, borderWidth: 2, borderColor: colors.border,
    ...shadow.sm,
  },
  langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  langBtnActiveTl: { borderColor: '#F7A44A', backgroundColor: '#F7A44A' },

  flag: { fontSize: 32 },
  langBtnText: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.textPrimary },
  langBtnTextActive: { color: '#fff' },
  langBtnSub: { fontSize: fontSizes.sm, color: colors.textTertiary, marginTop: 2 },

  note: { fontSize: fontSizes.sm, color: colors.textTertiary, textAlign: 'center' },
});
