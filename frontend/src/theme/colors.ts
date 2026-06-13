/**
 * Ausome Color System
 * Calm, supportive, high-contrast autism-friendly palette.
 * Inspired by evidence-based recommendations for autism-friendly UIs:
 * - Soft backgrounds, no harsh whites
 * - Strong text contrast
 * - Muted but warm accent colors
 * - Clear semantic colors for state feedback
 */

export const colors = {
  // ---- Brand ----
  primary: '#5B8DEF',       // Calm blue — trust, clarity
  primaryLight: '#EAF1FF',
  primaryDark: '#3A6BD4',

  secondary: '#6EC6A1',     // Soft teal-green — growth, calm
  secondaryLight: '#E8F8F2',
  secondaryDark: '#4EA882',

  accent: '#F7A44A',        // Warm amber — positive, rewarding
  accentLight: '#FFF4E3',

  // ---- Backgrounds ----
  background: '#F6F9FF',    // Off-white blue-tint — soft, easy on eyes
  surface: '#FFFFFF',
  surfaceElevated: '#F0F5FF',
  cardBg: '#FFFFFF',

  // ---- Text ----
  textPrimary: '#1A2340',   // Deep navy — strong contrast
  textSecondary: '#4A5578',
  textTertiary: '#8894B0',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // ---- Borders ----
  border: '#E2E8F4',
  borderFocus: '#5B8DEF',

  // ---- States ----
  success: '#4CAF82',
  successLight: '#E8F7F0',
  warning: '#F59E0B',
  warningLight: '#FFF8E1',
  error: '#EF5350',
  errorLight: '#FFEAEA',
  info: '#5B8DEF',
  infoLight: '#EAF1FF',

  // ---- Emotion Colors (for behavior tracker) ----
  emotion: {
    calm: '#87CEEB',
    happy: '#FFD700',
    overwhelmed: '#FF8C69',
    crying: '#6495ED',
    meltdown: '#DC143C',
    repetitive_behavior: '#9370DB',
    refusing_food: '#FF6347',
    energetic: '#FFA500',
    sleepy: '#708090',
    dysregulated: '#FF4500',
    anxious: '#DDA0DD',
    frustrated: '#CD853F',
    excited: '#FF69B4',
    confused: '#B0C4DE',
  },

  // ---- AAC Category Colors ----
  aac: {
    food: '#FF6B6B',
    drink: '#4ECDC4',
    feelings: '#FFE66D',
    bathroom: '#A8E6CF',
    play: '#FF8B94',
    people: '#C3AED6',
    places: '#87CEEB',
    actions: '#DDA0DD',
    help: '#F0E68C',
  },

  // ---- Domain Colors (goals) ----
  domain: {
    speech: '#5B8DEF',
    ot: '#6EC6A1',
    behavior: '#F7A44A',
    sensory: '#C3AED6',
    toileting: '#87CEEB',
    life_skills: '#FFE66D',
    social: '#FF8B94',
    academic: '#4ECDC4',
    communication: '#6495ED',
    motor: '#FFA500',
  },

  // ---- Misc ----
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(26, 35, 64, 0.5)',
  shadow: 'rgba(91, 141, 239, 0.12)',
  shimmer: '#E8EEF7',
};

export type Colors = typeof colors;
