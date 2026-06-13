import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useChildStore } from '../store/childStore';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { medicineApi } from '../api/medicine';
import { rescheduleAllMedicines } from '../utils/notifications';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, role, user, refreshSubscription } = useAuthStore();
  const { selectedChildId } = useChildStore();

  const onboardingDone = (user as any)?.onboarding_completed ?? false;
  // Child accounts skip onboarding — parents handle their profile setup
  const needsOnboarding = isAuthenticated && !onboardingDone && role !== 'child' && role !== 'admin';

  useEffect(() => {
    if (!isAuthenticated || role === 'child' || role === 'admin') return;
    refreshSubscription();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedChildId) return;
    medicineApi.list(selectedChildId).then((meds) => {
      const active = meds.filter((m: any) => m.is_active !== false && m.times?.length);
      rescheduleAllMedicines(active).catch(() => {});
    }).catch(() => {});
  }, [isAuthenticated, selectedChildId]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : role === 'admin' ? (
          <>
            <Stack.Screen name="Admin" component={AdminNavigator} />
            <Stack.Screen name="Main" component={MainNavigator} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
