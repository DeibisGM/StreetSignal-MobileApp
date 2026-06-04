import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';

import {AppTabParamList, HomeStackParamList, StaffStackParamList} from './types';
import {useAuth} from './AuthContext';

import HomeScreen from '../features/reports/screens/HomeScreen';
import ReportDetailScreen from '../features/reports/screens/ReportDetailScreen';
import CreateReportScreen from '../features/reports/screens/CreateReportScreen';
import StaffReportsListScreen from '../features/staff/screens/StaffReportsListScreen';
import StaffReportDetailScreen from '../features/staff/screens/StaffReportDetailScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const StaffStack = createNativeStackNavigator<StaffStackParamList>();

const HEADER_STYLE = {
  headerStyle: {backgroundColor: '#1A3C5E'},
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {fontWeight: '700' as const},
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={HEADER_STYLE}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Inicio'}}
      />
      <HomeStack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{title: 'Detalle del reporte'}}
      />
    </HomeStack.Navigator>
  );
}

function StaffStackNavigator() {
  return (
    <StaffStack.Navigator screenOptions={HEADER_STYLE}>
      <StaffStack.Screen
        name="StaffReportsList"
        component={StaffReportsListScreen}
        options={{title: 'Reportes'}}
      />
      <StaffStack.Screen
        name="StaffReportDetail"
        component={StaffReportDetailScreen}
        options={{title: 'Detalle del reporte'}}
      />
    </StaffStack.Navigator>
  );
}

const TAB_BAR_STYLE = {
  tabBarActiveTintColor: '#2196F3',
  tabBarInactiveTintColor: '#8A9BB0',
  tabBarStyle: {backgroundColor: '#FFFFFF', borderTopColor: '#E5EBF1'},
};

export default function AppNavigator() {
  const {user} = useAuth();
  const isStaff = user?.role === 'staff';

  return (
    <Tab.Navigator screenOptions={{headerShown: false, ...TAB_BAR_STYLE}}>
      {isStaff ? (
        <Tab.Screen
          name="StaffTab"
          component={StaffStackNavigator}
          options={{
            title: 'Reportes',
            tabBarIcon: ({color}) => <Text style={{color}}>📋</Text>,
          }}
        />
      ) : (
        <>
          <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
            options={{
              title: 'Inicio',
              tabBarIcon: ({color}) => <Text style={{color}}>🏠</Text>,
            }}
          />
          <Tab.Screen
            name="CreateReport"
            component={CreateReportScreen}
            options={{
              title: 'Reportar',
              tabBarIcon: ({color}) => <Text style={{color}}>➕</Text>,
            }}
          />
        </>
      )}
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({color}) => <Text style={{color}}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({color}) => <Text style={{color}}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
