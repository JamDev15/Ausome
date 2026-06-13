import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { childrenApi } from '../../api/children';
import { MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loading } from '../../components/common/Loading';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ChildProfile'>;
  route: RouteProp<MainStackParamList, 'ChildProfile'>;
};

const SUPPORT_LABELS: Record<string, string> = {
  level_1: 'Level 1 — Requiring Support',
  level_2: 'Level 2 — Substantial Support',
  level_3: 'Level 3 — Very Substantial Support',
};

const COMM_LABELS: Record<string, string> = {
  nonverbal: 'Non-verbal', emerging_verbal: 'Emerging Verbal',
  functional_verbal: 'Functional Verbal', conversational: 'Conversational', aac_dependent: 'AAC Dependent',
};

type SectionProps = { title: string; icon: string; children: React.ReactNode; color?: string };
const ProfileSection: React.FC<SectionProps> = ({ title, icon, children, color = colors.primary }) => (
  <Card style={styles.section}>
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </Card>
);

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

export const ChildProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;

  const { data: child, isLoading } = useQuery({
    queryKey: ['child', childId],
    queryFn: () => childrenApi.get(childId),
  });

  if (isLoading || !child) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={child.nickname ?? child.full_name}
        subtitle="Child Profile"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('EditChildProfile', { childId: child.id })}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {child.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.childName}>{child.full_name}</Text>
          {child.nickname && <Text style={styles.childNickname}>"{child.nickname}"</Text>}
          <View style={styles.badgeRow}>
            {child.age && <Badge label={`Age ${child.age}`} variant="neutral" />}
            {child.asd_support_level && (
              <Badge label={`ASD ${child.asd_support_level.replace('_', ' ')}`} variant="info" />
            )}
            {child.communication_level && (
              <Badge label={COMM_LABELS[child.communication_level] ?? child.communication_level} variant="primary" />
            )}
          </View>
        </View>

        {/* Diagnosis */}
        <ProfileSection title="Diagnosis & Communication" icon="medical" color="#5B8DEF">
          <Field label="Diagnosis Summary" value={child.diagnosis_summary} />
          <Field label="Support Level" value={SUPPORT_LABELS[child.asd_support_level ?? ''] ?? child.asd_support_level} />
          <Field label="Communication Level" value={COMM_LABELS[child.communication_level ?? ''] ?? child.communication_level} />
          <Field label="Diagnosed By" value={child.diagnosing_professional} />
          <Field label="Current Therapies" value={child.current_therapies} />
        </ProfileSection>

        {/* Sensory & Behavior */}
        <ProfileSection title="Sensory & Behavior" icon="pulse" color="#F7A44A">
          <Field label="Triggers" value={child.triggers} />
          <Field label="Calming Strategies" value={child.calming_strategies} />
          <Field label="Behavior Notes" value={child.behavior_notes} />
          {child.sensory_profile && (
            <>
              <Field label="Sound Sensitivity" value={child.sensory_profile.sound_sensitivity} />
              <Field label="Touch Sensitivity" value={child.sensory_profile.touch_sensitivity} />
              <Field label="Sensory Tools" value={child.sensory_profile.sensory_tools} />
            </>
          )}
        </ProfileSection>

        {/* Daily Living */}
        <ProfileSection title="Daily Living" icon="home" color="#6EC6A1">
          <Field label="Toileting" value={child.toileting_status} />
          <Field label="Sleep Notes" value={child.sleep_notes} />
          <Field label="Food Preferences" value={child.food_preferences} />
          <Field label="Food Restrictions" value={child.food_restrictions} />
          <Field label="Motor Skills" value={child.motor_skill_notes} />
          <Field label="Medications" value={child.medications} />
        </ProfileSection>

        {/* Strengths & Rewards */}
        <ProfileSection title="Strengths & Motivators" icon="star" color="#FFD700">
          <Field label="Strengths & Interests" value={child.strengths_interests} />
          <Field label="Preferred Rewards" value={child.preferred_rewards} />
        </ProfileSection>

        {/* School */}
        <ProfileSection title="School & Therapy Goals" icon="school" color="#C3AED6">
          <Field label="School" value={child.school_name} />
          <Field label="Teacher" value={child.teacher_name} />
          <Field label="IEP Goals" value={child.iep_goals} />
          <Field label="Therapy Goals" value={child.therapy_goals} />
          <Field label="Therapist Notes" value={child.therapist_notes} />
        </ProfileSection>

        {/* Emergency */}
        <ProfileSection title="Emergency Contact" icon="alert-circle" color={colors.error}>
          <Field label="Name" value={child.emergency_contact_name} />
          <Field label="Phone" value={child.emergency_contact_phone} />
          <Field label="Relationship" value={child.emergency_contact_relation} />
        </ProfileSection>

        {/* Tags */}
        {child.custom_tags && child.custom_tags.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {child.custom_tags.map((tag) => (
                <Badge key={tag} label={tag} variant="neutral" style={styles.tag} />
              ))}
            </View>
          </Card>
        )}

        {/* Personalized Plan */}
        <TouchableOpacity
          style={styles.teamCard}
          onPress={() => navigation.navigate('PersonalizedPlan', { childId: child.id, childName: child.full_name })}
          activeOpacity={0.85}
        >
          <View style={styles.teamLeft}>
            <View style={[styles.teamIconCircle, { backgroundColor: '#E8F8F2' }]}>
              <Ionicons name="calendar" size={22} color="#6EC6A1" />
            </View>
            <View>
              <Text style={styles.teamLabel}>Personalized Plan</Text>
              <Text style={styles.teamSub}>Daily routine & parent goals from survey</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Care Team */}
        <TouchableOpacity
          style={styles.teamCard}
          onPress={() => navigation.navigate('ManageTeam', { childId: child.id })}
          activeOpacity={0.85}
        >
          <View style={styles.teamLeft}>
            <View style={styles.teamIconCircle}>
              <Ionicons name="people" size={22} color="#5B8DEF" />
            </View>
            <View>
              <Text style={styles.teamLabel}>Care Team</Text>
              <Text style={styles.teamSub}>
                {(child.team?.length ?? 0) > 0
                  ? `${child.team!.length} member${child.team!.length !== 1 ? 's' : ''} — guardians & therapists`
                  : 'Invite guardians & therapists'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },
  editBtn: { padding: spacing.xs },

  profileHeader: { alignItems: 'center', marginBottom: spacing['2xl'], paddingVertical: spacing.xl },
  avatarLarge: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLargeText: { color: colors.white, fontSize: fontSizes['3xl'], fontWeight: '800' },
  childName: { fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  childNickname: { fontSize: fontSizes.md, color: colors.textTertiary, fontStyle: 'italic', marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },

  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  sectionIconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },

  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fieldValue: { fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {},

  teamCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  teamLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  teamIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EAF1FF', justifyContent: 'center', alignItems: 'center',
  },
  teamLabel: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  teamSub: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
});
