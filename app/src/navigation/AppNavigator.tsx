import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Bell, ClipboardText, House, PlusCircle} from 'phosphor-react-native';

import {AppTabParamList, HomeStackParamList, StaffStackParamList} from './types';
import {useAuth} from './AuthContext';
import {Colors} from '../theme';

import HomeScreen from '../features/reports/screens/HomeScreen';
import ReportDetailScreen from '../features/reports/screens/ReportDetailScreen';
import CreateReportScreen from '../features/reports/screens/CreateReportScreen';
import StaffReportsListScreen from '../features/staff/screens/StaffReportsListScreen';
import StaffReportDetailScreen from '../features/staff/screens/StaffReportDetailScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const StaffStack = createNativeStackNavigator<StaffStackParamList>();

const HEADER = {
  headerStyle: {backgroundColor: Colors.primary},
  headerTintColor: '#fff',
  headerTitleStyle: {fontWeight: '700' as const, fontSize: 17},
  headerShadowVisible: false,
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={HEADER}>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
      <HomeStack.Screen name="ReportDetail" component={ReportDetailScreen} options={{title: 'Detalle'}} />
    </HomeStack.Navigator>
  );
}

function StaffStackNavigator() {
  return (
    <StaffStack.Navigator screenOptions={HEADER}>
      <StaffStack.Screen name="StaffReportsList" component={StaffReportsListScreen} options={{title: 'Reportes'}} />
      <StaffStack.Screen name="StaffReportDetail" component={StaffReportDetailScreen} options={{title: 'Detalle'}} />
    </StaffStack.Navigator>
  );
}

type TabIconProps = {color: string; focused: boolean};

const iconSize = 24;

function TabIconHouse({color, focused}: TabIconProps) {
  return <House size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />;
}
function TabIconPlus({color}: {color: string}) {
  return <PlusCircle size={iconSize + 4} color={color} weight="fill" />;
}
function TabIconBell({color, focused}: TabIconProps) {
  return <Bell size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />;
}
function TabIconClipboard({color}: {color: string}) {
  return <ClipboardText size={iconSize} color={color} weight="fill" />;
}

export default function AppNavigator() {
  const {user} = useAuth();
  const isStaff = user?.role === 'staff';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: Colors.outlineVariant,
          height: 76,
          paddingBottom: 14,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.1,
        },
      }}>

      {isStaff ? (
        <Tab.Screen
          name="StaffTab"
          component={StaffStackNavigator}
          options={{
            title: 'Reportes',
            tabBarIcon: TabIconClipboard,
          }}
        />
      ) : (
        <>
          <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
            options={{
              title: 'Inicio',
              tabBarIcon: TabIconHouse,
            }}
          />
          <Tab.Screen
            name="CreateReport"
            component={CreateReportScreen}
            options={{
              title: 'Reportar',
              headerShown: true,
              headerTitle: 'Nuevo reporte',
              ...HEADER,
              tabBarIcon: TabIconPlus,
              tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
            }}
          />
        </>
      )}

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alertas',
          tabBarIcon: TabIconBell,
        }}
      />
    </Tab.Navigator>
  );
}
