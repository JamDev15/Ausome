import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types';
import { PlanSelectScreen } from '../screens/onboarding/PlanSelectScreen';
import { LanguageSelectScreen } from '../screens/onboarding/LanguageSelectScreen';
import { OnboardingSurveyScreen } from '../screens/onboarding/OnboardingSurveyScreen';
import { OnboardingResultScreen } from '../screens/onboarding/OnboardingResultScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user) as any;
  const planChosen = user?.plan_chosen ?? false;

  return (
    <Stack.Navigator
      initialRouteName={planChosen ? 'LanguageSelect' : 'PlanSelect'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="PlanSelect" component={PlanSelectScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Survey" component={OnboardingSurveyScreen} />
      <Stack.Screen name="OnboardingResult" component={OnboardingResultScreen} />
    </Stack.Navigator>
  );
};
