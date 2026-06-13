import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { HubTabParamList } from '../types';
import { colors } from '../theme';
import { useChildStore } from '../store/childStore';

import { ParentDashboard } from '../screens/dashboard/ParentDashboard';
import { MoreScreen } from '../screens/more/MoreScreen';

const DummyScreen: React.FC = () => null;

const Tab = createBottomTabNavigator<HubTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:     { active: 'home',        inactive: 'home-outline' },
  Talk:     { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Feelings: { active: 'heart',       inactive: 'heart-outline' },
  AIChat:   { active: 'sparkles',    inactive: 'sparkles-outline' },
  More:     { active: 'grid',        inactive: 'grid-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Home:     'Hub',
  Talk:     'Communicate',
  Feelings: 'Feelings',
  AIChat:   'AI Chat',
  More:     'More',
};

export const HubNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        const icons = TAB_ICONS[route.name];
        const iconName = (focused ? icons.active : icons.inactive) as any;
        if (focused) {
          return (
            <View style={styles.activeTab}>
              <Ionicons name={iconName} size={22} color={colors.white} />
            </View>
          );
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
    })}
  >
    <Tab.Screen name="Home" component={ParentDashboard} />

    <Tab.Screen
      name="Talk"
      component={DummyScreen}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          const childId = useChildStore.getState().selectedChild?.id ?? '';
          navigation.getParent()?.navigate('AACBoard' as never, { childId } as never);
        },
      })}
    />

    <Tab.Screen
      name="Feelings"
      component={DummyScreen}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          const childId = useChildStore.getState().selectedChild?.id ?? '';
          navigation.getParent()?.navigate('BehaviorLog' as never, { childId } as never);
        },
      })}
    />

    <Tab.Screen
      name="AIChat"
      component={DummyScreen}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          e.preventDefault();
          const childId = useChildStore.getState().selectedChild?.id ?? '';
          navigation.getParent()?.navigate('AIAssistant' as never, { childId } as never);
        },
      })}
    />

    <Tab.Screen name="More" component={MoreScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});
