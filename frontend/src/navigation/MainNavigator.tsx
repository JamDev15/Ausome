import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';

import { HubNavigator } from './HubNavigator';
import { ChildDashboard } from '../screens/dashboard/ChildDashboard';
import { AACBoardScreen } from '../screens/aac/AACBoardScreen';
import { BehaviorLogScreen } from '../screens/behavior/BehaviorLogScreen';
import { RewardsScreen } from '../screens/rewards/RewardsScreen';
import { ChildProfileScreen } from '../screens/child/ChildProfileScreen';
import { GoalsScreen } from '../screens/goals/GoalsScreen';
import { CaregiverNotesScreen } from '../screens/notes/CaregiverNotesScreen';
import { VisualScheduleScreen } from '../screens/schedule/VisualScheduleScreen';
import { AIAssistantScreen } from '../screens/ai/AIAssistantScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { FlashcardsScreen } from '../screens/flashcards/FlashcardsScreen';
import { TaskTrainerScreen } from '../screens/tasks/TaskTrainerScreen';
import { EditChildProfileScreen } from '../screens/child/EditChildProfileScreen';
import { ActivitiesScreen } from '../screens/activities/ActivitiesScreen';
import { MedicineScreen } from '../screens/medicine/MedicineScreen';
import { EpisodeTrackerScreen } from '../screens/episodes/EpisodeTrackerScreen';
import { ManageTeamScreen } from '../screens/team/ManageTeamScreen';
import { PersonalizedPlanScreen } from '../screens/child/PersonalizedPlanScreen';
import { DrawingScreen } from '../screens/activities/DrawingScreen';
import { ConnectScreen } from '../screens/activities/ConnectScreen';
import { CountingScreen } from '../screens/activities/CountingScreen';
import { AlphabetScreen } from '../screens/activities/AlphabetScreen';
import { ColorsScreen } from '../screens/activities/ColorsScreen';
import { ShapesScreen } from '../screens/activities/ShapesScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  const { role } = useAuthStore();
  const initialRoute = role === 'child' ? 'ChildDashboard' : 'Hub';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F6F9FF' },
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="Hub" component={HubNavigator} options={{ animation: 'none' }} />
      <Stack.Screen name="ChildDashboard" component={ChildDashboard} />
      <Stack.Screen name="ParentDashboard" component={HubNavigator} />
      <Stack.Screen name="ChildProfile" component={ChildProfileScreen} />
      <Stack.Screen name="EditChildProfile" component={EditChildProfileScreen} />
      <Stack.Screen name="AACBoard" component={AACBoardScreen} />
      <Stack.Screen name="BehaviorLog" component={BehaviorLogScreen} />
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="CaregiverNotes" component={CaregiverNotesScreen} />
      <Stack.Screen name="VisualSchedule" component={VisualScheduleScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
      <Stack.Screen name="TaskTrainer" component={TaskTrainerScreen} />
      <Stack.Screen name="Activities" component={ActivitiesScreen} />
      <Stack.Screen name="MedicineReminder" component={MedicineScreen} />
      <Stack.Screen name="EpisodeTracker" component={EpisodeTrackerScreen} />
      <Stack.Screen name="ManageTeam" component={ManageTeamScreen} />
      <Stack.Screen name="PersonalizedPlan" component={PersonalizedPlanScreen} />
      <Stack.Screen name="DrawingActivity" component={DrawingScreen} />
      <Stack.Screen name="ConnectActivity" component={ConnectScreen} />
      <Stack.Screen name="CountingActivity" component={CountingScreen} />
      <Stack.Screen name="AlphabetActivity" component={AlphabetScreen} />
      <Stack.Screen name="ColorsActivity" component={ColorsScreen} />
      <Stack.Screen name="ShapesActivity" component={ShapesScreen} />
    </Stack.Navigator>
  );
};
