import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../types';
import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminAuditLogScreen } from '../screens/admin/AdminAuditLogScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';
import { AdminChildProfilesScreen } from '../screens/admin/AdminChildProfilesScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    initialRouteName="AdminDashboard"
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminChildProfiles" component={AdminChildProfilesScreen} />
    <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
    <Stack.Screen name="AdminAuditLog" component={AdminAuditLogScreen} />
  </Stack.Navigator>
);
