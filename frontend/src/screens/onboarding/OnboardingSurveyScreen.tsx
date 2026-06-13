import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onboardingApi, SurveyPayload } from '../../api/onboarding';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Survey'>;
};

const TOTAL_STEPS = 8;

// ── Chip selector ────────────────────────────────────────────────────────────
const Chip: React.FC<{
  label: string; selected: boolean; onPress: () => void; color?: string;
}> = ({ label, selected, onPress, color = colors.primary }) => (
  <TouchableOpacity
    style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

// ── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar: React.FC<{ step: number; total: number }> = ({ step, total }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.progressContainer, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.progressLabel}>{t('common.step_of', { current: step, total })}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / total) * 100}%` as any }]} />
      </View>
    </View>
  );
};

// ── Time picker row ───────────────────────────────────────────────────────────
const TIME_OPTIONS = ['06:00','06:30','07:00','07:30','08:00','08:30','09:00',
  '12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','20:30','21:00','21:30','22:00'];

const TimePicker: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label, value, onChange,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.timeField}>
      <Text style={styles.timeLabel}>{label}</Text>
      <TouchableOpacity style={styles.timeTrigger} onPress={() => setOpen(!open)}>
        <Text style={styles.timeValue}>{value || '—'}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
      </TouchableOpacity>
      {open && (
        <View style={styles.timeDropdown}>
          <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
            {TIME_OPTIONS.map((t) => (
              <TouchableOpacity key={t} style={styles.timeOption} onPress={() => { onChange(t); setOpen(false); }}>
                <Text style={[styles.timeOptionText, value === t && styles.timeOptionSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ── Main screen ──────────────────────────────────────────────────────────────
export const OnboardingSurveyScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Survey state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosisYear, setDiagnosisYear] = useState('');
  const [communicationLevel, setCommunicationLevel] = useState('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [strengthsFreetext, setStrengthsFreetext] = useState('');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [bedtime, setBedtime] = useState('20:00');
  const [screenTime, setScreenTime] = useState('');
  const [parentGoals, setParentGoals] = useState<string[]>([]);
  const [supportSystem, setSupportSystem] = useState<string[]>([]);

  const name = childName.trim() || t('onboarding.step_child_name.placeholder');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string, max?: number) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else if (!max || list.length < max) {
      setList([...list, item]);
    }
  };

  const currentPayload = useCallback((): SurveyPayload => ({
    child_name: childName.trim() || undefined,
    child_age: childAge ? parseInt(childAge) : undefined,
    diagnosis_year: diagnosisYear ? parseInt(diagnosisYear) : undefined,
    communication_level: communicationLevel || undefined,
    challenges,
    strengths,
    strengths_freetext: strengthsFreetext || undefined,
    wake_time: wakeTime || undefined,
    school_start: schoolStart || undefined,
    school_end: schoolEnd || undefined,
    bedtime: bedtime || undefined,
    screen_time: screenTime || undefined,
    parent_goals: parentGoals,
    support_system: supportSystem,
    current_step: step,
  }), [childName, childAge, diagnosisYear, communicationLevel, challenges, strengths,
       strengthsFreetext, wakeTime, schoolStart, schoolEnd, bedtime, screenTime,
       parentGoals, supportSystem, step]);

  const saveProgress = async () => {
    try { await onboardingApi.saveSurvey(currentPayload()); } catch { /* silent */ }
  };

  const goNext = async () => {
    if (step === 1 && !childName.trim()) {
      Alert.alert(t('common.error_generic'), t('onboarding.step_child_name.question'));
      return;
    }
    if (step === 3 && !communicationLevel) {
      Alert.alert(t('common.error_generic'), t('onboarding.step_communication.question'));
      return;
    }
    await saveProgress();
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      await finishSurvey();
    }
  };

  const finishSurvey = async () => {
    setSaving(true);
    try {
      await onboardingApi.saveSurvey({ ...currentPayload(), current_step: TOTAL_STEPS });
      const result = await onboardingApi.complete();
      navigation.replace('OnboardingResult', {
        routine: result.routine,
        goals: result.goals,
        childName: childName.trim() || 'your child',
      });
    } catch {
      Alert.alert(t('common.error_generic'));
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      // Step 1: Child name
      case 1:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_child_name.question')}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_child_name.helper')}</Text>
            <TextInput
              style={styles.textInput}
              value={childName}
              onChangeText={setChildName}
              placeholder={t('onboarding.step_child_name.placeholder')}
              placeholderTextColor={colors.textTertiary}
              autoFocus
              returnKeyType="next"
            />
          </View>
        );

      // Step 2: Age
      case 2:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_child_age.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_child_age.helper')}</Text>
            <View style={styles.ageRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={childAge}
                onChangeText={v => setChildAge(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder="5"
                placeholderTextColor={colors.textTertiary}
                maxLength={2}
                autoFocus
              />
              <Text style={styles.ageUnit}>{t('onboarding.step_child_age.years')}</Text>
            </View>
          </View>
        );

      // Step 3: Communication level
      case 3:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_communication.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_communication.helper')}</Text>
            {(['nonverbal','minimal','verbal','fluent','aac'] as const).map(lvl => (
              <TouchableOpacity
                key={lvl}
                style={[styles.commCard, communicationLevel === lvl && styles.commCardSelected]}
                onPress={() => setCommunicationLevel(lvl)}
                activeOpacity={0.8}
              >
                <View style={styles.commCardRow}>
                  <View style={[styles.commRadio, communicationLevel === lvl && styles.commRadioSelected]}>
                    {communicationLevel === lvl && <View style={styles.commRadioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.commCardTitle, communicationLevel === lvl && { color: colors.primary }]}>
                      {t(`onboarding.step_communication.${lvl}`)}
                    </Text>
                    <Text style={styles.commCardDesc}>
                      {t(`onboarding.step_communication.${lvl}_desc`)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      // Step 4: Challenges
      case 4:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_challenges.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_challenges.helper')}</Text>
            <View style={styles.chipGrid}>
              {(['sleep','feeding','transitions','meltdowns','social','focus','motor','toileting','anxiety','sensory'] as const).map(ch => (
                <Chip
                  key={ch}
                  label={t(`onboarding.step_challenges.${ch}`)}
                  selected={challenges.includes(ch)}
                  onPress={() => toggleItem(challenges, setChallenges, ch)}
                  color="#E97B5B"
                />
              ))}
            </View>
          </View>
        );

      // Step 5: Strengths
      case 5:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_strengths.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_strengths.helper')}</Text>
            <View style={styles.chipGrid}>
              {(['music','numbers','animals','drawing','routines','technology','reading','movement','crafts','nature'] as const).map(s => (
                <Chip
                  key={s}
                  label={t(`onboarding.step_strengths.${s}`)}
                  selected={strengths.includes(s)}
                  onPress={() => toggleItem(strengths, setStrengths, s)}
                  color="#4CAF82"
                />
              ))}
            </View>
            <Text style={styles.freeLbl}>{t('onboarding.step_strengths.freetext_label')}</Text>
            <TextInput
              style={styles.textInput}
              value={strengthsFreetext}
              onChangeText={setStrengthsFreetext}
              placeholder={t('onboarding.step_strengths.freetext_placeholder')}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        );

      // Step 6: Schedule
      case 6:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_schedule.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_schedule.helper')}</Text>
            <TimePicker label={t('onboarding.step_schedule.wake_time')} value={wakeTime} onChange={setWakeTime} />
            <TimePicker label={t('onboarding.step_schedule.school_start')} value={schoolStart} onChange={setSchoolStart} />
            <TimePicker label={t('onboarding.step_schedule.school_end')} value={schoolEnd} onChange={setSchoolEnd} />
            <TimePicker label={t('onboarding.step_schedule.bedtime')} value={bedtime} onChange={setBedtime} />
            <Text style={styles.freeLbl}>{t('onboarding.step_schedule.screen_time')}</Text>
            <View style={styles.chipGrid}>
              {(['none','30min','1h','2h','more'] as const).map(st => (
                <Chip
                  key={st}
                  label={t(`onboarding.step_schedule.screen_${st === 'none' ? 'none' : st === '30min' ? '30' : st === '1h' ? '1h' : st === '2h' ? '2h' : 'more'}`)}
                  selected={screenTime === st}
                  onPress={() => setScreenTime(st)}
                  color="#8894B0"
                />
              ))}
            </View>
          </View>
        );

      // Step 7: Parent goals
      case 7:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_goals.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_goals.helper')}</Text>
            <Text style={styles.maxHint}>{t('onboarding.step_goals.max_hint')}</Text>
            <View style={styles.chipGrid}>
              {(['sleep','mealtime','meltdowns','communication','toileting','sensory','social','school','instructions','emotional','independence'] as const).map(g => (
                <Chip
                  key={g}
                  label={t(`onboarding.step_goals.${g}`)}
                  selected={parentGoals.includes(g)}
                  onPress={() => toggleItem(parentGoals, setParentGoals, g, 3)}
                  color={colors.primary}
                />
              ))}
            </View>
          </View>
        );

      // Step 8: Support system
      case 8:
        return (
          <View style={styles.stepBody}>
            <Text style={styles.stepQuestion}>{t('onboarding.step_support.question', { name })}</Text>
            <Text style={styles.stepHelper}>{t('onboarding.step_support.helper')}</Text>
            <View style={styles.chipGrid}>
              {(['other_parent','lola_lolo','siblings','therapist','teacher','caregiver','just_me'] as const).map(s => (
                <Chip
                  key={s}
                  label={t(`onboarding.step_support.${s}`)}
                  selected={supportSystem.includes(s)}
                  onPress={() => toggleItem(supportSystem, setSupportSystem, s)}
                  color="#C3AED6"
                />
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ProgressBar step={step} total={TOTAL_STEPS} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Ionicons name="arrow-back" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, saving && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {saving
              ? t('common.generating')
              : step < TOTAL_STEPS
                ? t('common.next')
                : t('common.done')}
          </Text>
          {!saving && step < TOTAL_STEPS && (
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: 120 },

  progressContainer: { paddingHorizontal: spacing.lg, paddingTop: 0, paddingBottom: spacing.md },
  progressLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textTertiary, marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },

  stepBody: { gap: spacing.md },
  stepQuestion: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.textPrimary, lineHeight: 30 },
  stepHelper: { fontSize: fontSizes.md, color: colors.textTertiary, lineHeight: 22 },

  textInput: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontSize: fontSizes.lg, color: colors.textPrimary,
    ...shadow.sm,
  },

  ageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ageUnit: { fontSize: fontSizes.lg, color: colors.textSecondary, fontWeight: '600' },

  commCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.border, padding: spacing.lg, ...shadow.sm,
  },
  commCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  commCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  commRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border, marginTop: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  commRadioSelected: { borderColor: colors.primary },
  commRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  commCardTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  commCardDesc: { fontSize: fontSizes.sm, color: colors.textTertiary },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.surface, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textSecondary },
  chipTextSelected: { color: '#fff' },

  freeLbl: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary, marginTop: spacing.sm },
  maxHint: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600' },

  timeField: { gap: 4 },
  timeLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
  timeTrigger: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
  },
  timeValue: { fontSize: fontSizes.md, color: colors.textPrimary, fontWeight: '600' },
  timeDropdown: {
    backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    marginTop: 2, ...shadow.md,
  },
  timeOption: { paddingVertical: 10, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  timeOptionText: { fontSize: fontSizes.md, color: colors.textSecondary },
  timeOptionSelected: { color: colors.primary, fontWeight: '700' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, paddingBottom: 34,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 14, gap: spacing.sm,
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { fontSize: fontSizes.lg, fontWeight: '800', color: '#fff' },
});
