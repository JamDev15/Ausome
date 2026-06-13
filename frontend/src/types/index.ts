// ---- Auth ----
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  child_profile_id?: string;   // set for CHILD role
  preferred_language?: 'en' | 'tl';
  onboarding_completed?: boolean;
  plan_chosen?: boolean;
  subscription_plan?: string;
  subscription_status?: string;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
  is_full_access?: boolean;
}

export type UserRole = 'admin' | 'parent' | 'therapist' | 'caregiver' | 'child';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  login_count: number;
  last_active_at?: string;
  created_at: string;
  linked_children?: number;
}

// ---- Child Profile ----
export type CommunicationLevel =
  | 'nonverbal'
  | 'emerging_verbal'
  | 'functional_verbal'
  | 'conversational'
  | 'aac_dependent';

export type SupportLevel = 'level_1' | 'level_2' | 'level_3';

export interface SensoryProfile {
  id: string;
  sound_sensitivity?: string;
  light_sensitivity?: string;
  touch_sensitivity?: string;
  smell_sensitivity?: string;
  taste_sensitivity?: string;
  vestibular_notes?: string;
  proprioception_notes?: string;
  preferred_textures?: string;
  avoided_environments?: string;
  sensory_tools?: string;
}

export interface ChildProfile {
  id: string;
  primary_caregiver_id?: string;
  full_name: string;
  nickname?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  photo_url?: string;
  diagnosis_summary?: string;
  asd_support_level?: SupportLevel;
  communication_level?: CommunicationLevel;
  diagnosis_date?: string;
  diagnosing_professional?: string;
  toileting_status?: string;
  sleep_notes?: string;
  motor_skill_notes?: string;
  food_preferences?: string;
  food_restrictions?: string;
  medications?: string;
  triggers?: string;
  calming_strategies?: string;
  behavior_notes?: string;
  preferred_rewards?: string;
  strengths_interests?: string;
  therapy_goals?: string;
  therapist_notes?: string;
  current_therapies?: string;
  school_name?: string;
  teacher_name?: string;
  school_notes?: string;
  iep_goals?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  custom_tags?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sensory_profile?: SensoryProfile;
  user_id?: string;          // child's own login account id
  caregiver_ids?: string[];
  therapist_ids?: string[];
  team?: TeamMember[];
}

export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

// ---- Behavior Log ----
export type EmotionType =
  | 'calm' | 'happy' | 'overwhelmed' | 'crying' | 'meltdown'
  | 'repetitive_behavior' | 'refusing_food' | 'energetic' | 'sleepy'
  | 'dysregulated' | 'anxious' | 'frustrated' | 'excited' | 'confused';

export type BehaviorSeverity = 'mild' | 'moderate' | 'severe';

export interface BehaviorLog {
  id: string;
  child_id: string;
  emotion: EmotionType;
  severity?: BehaviorSeverity;
  location?: string;
  trigger?: string;
  behavior_description?: string;
  intervention_used?: string;
  outcome?: string;
  notes?: string;
  duration_minutes?: number;
  event_time?: string;
  logged_by_id?: string;
  created_at: string;
}

export interface BehaviorSummary {
  total_logs: number;
  most_common_emotion?: string;
  most_common_trigger?: string;
  trend: Array<{ date: string; emotion: string; count: number }>;
}

// ---- AAC ----
export interface AACItem {
  id: string;
  category_id: string;
  label: string;
  image_url?: string;
  audio_url?: string;
  audio_text?: string;
  position: number;
  is_favorite: boolean;
  use_count: number;
  color?: string;
  child_id?: string;
}

export interface AACCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  position: number;
  is_default: boolean;
  child_id?: string;
  items: AACItem[];
}

// ---- Schedule ----
export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'custom';

export interface ScheduleItem {
  id: string;
  template_id: string;
  title: string;
  description?: string;
  image_url?: string;
  audio_url?: string;
  position: number;
  duration_minutes?: number;
  is_completed: boolean;
  completed_at?: string;
}

export interface ScheduleTemplate {
  id: string;
  child_id: string;
  title: string;
  routine_type: RoutineType;
  description?: string;
  is_active: boolean;
  is_recurring: boolean;
  days_of_week?: number[];
  color?: string;
  created_at: string;
  items: ScheduleItem[];
}

// ---- Goal ----
export type GoalDomain =
  | 'speech' | 'ot' | 'behavior' | 'sensory' | 'toileting'
  | 'life_skills' | 'social' | 'academic' | 'communication' | 'motor' | 'custom';

export type GoalStatus = 'active' | 'mastered' | 'on_hold' | 'discontinued';

export interface ProgressEntry {
  id: string;
  goal_id: string;
  child_id: string;
  percentage: number;
  trials_attempted?: number;
  trials_successful?: number;
  prompt_level?: string;
  notes?: string;
  session_date?: string;
  logged_by_id?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  domain: GoalDomain;
  status: GoalStatus;
  baseline?: string;
  target?: string;
  measurement_method?: string;
  frequency?: string;
  target_date?: string;
  mastered_date?: string;
  current_percentage: number;
  created_at: string;
  progress_entries: ProgressEntry[];
}

// ---- Reward ----
export type RewardType = 'activity' | 'item' | 'privilege' | 'praise' | 'screen_time' | 'custom';

export interface Reward {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  reward_type: RewardType;
  token_cost: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenBalance {
  child_id: string;
  current_balance: number;
  current_streak: number;
  longest_streak: number;
  total_earned: number;
  total_redeemed: number;
}

// ---- Note ----
export interface CaregiverNote {
  id: string;
  child_id: string;
  author_id: string;
  title?: string;
  content: string;
  category?: string;
  tags?: string[];
  session_date?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Admin ----
export interface AdminOverview {
  total_users: number;
  active_users: number;
  total_children: number;
  total_behavior_logs: number;
  total_goals: number;
  logins_today: number;
  logins_this_week: number;
  most_used_feature?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  detail?: string;
  ip_address?: string;
  created_at: string;
}

// ---- AI ----
export interface ChatResponse {
  conversation_id: string;
  message: string;
  disclaimer: string;
}

// ---- Navigation ----
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type OnboardingStackParamList = {
  PlanSelect: undefined;
  LanguageSelect: undefined;
  Survey: undefined;
  OnboardingResult: {
    routine: RoutineBlock[];
    goals: ParentGoalData[];
    childName: string;
  };
};

export interface RoutineBlock {
  time_range: string;
  activity_key: string;
  duration_minutes: number;
  category: string;
  tip_key: string;
  why_key: string;
  icon_key: string;
}

export interface ParentGoalData {
  goal_key: string;
  order: number;
  frequency: string;
  target_days: number;
}

export type MainTabParamList = {
  Dashboard: undefined;
  AAC: { childId: string } | undefined;
  Schedule: { childId: string } | undefined;
  Rewards: { childId: string } | undefined;
  More: undefined;
};

export type HubTabParamList = {
  Home: undefined;
  Talk: undefined;
  Feelings: undefined;
  AIChat: undefined;
  More: undefined;
};

export type MainStackParamList = {
  Hub: undefined;
  ParentDashboard: undefined;
  ChildDashboard: { fromParent?: boolean };
  ChildProfile: { childId: string };
  EditChildProfile: { childId?: string };
  AACBoard: { childId: string };
  Flashcards: { childId?: string };
  VisualSchedule: { childId: string };
  TaskTrainer: { childId: string };
  BehaviorLog: { childId: string };
  Rewards: { childId: string };
  Goals: { childId: string };
  CaregiverNotes: { childId: string };
  Settings: undefined;
  AIAssistant: { childId?: string };
  // Medicine & Episodes
  MedicineReminder: { childId: string };
  EpisodeTracker: { childId: string };
  ManageTeam: { childId: string };
  PersonalizedPlan: { childId: string; childName: string };
  // Activities
  Activities: { childId: string };
  DrawingActivity: { childId: string };
  ConnectActivity: { childId: string };
  CountingActivity: { childId: string };
  AlphabetActivity: { childId: string };
  ColorsActivity: { childId: string };
  ShapesActivity: { childId: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminChildProfiles: undefined;
  AdminReports: undefined;
  AdminAuditLog: undefined;
};
