import React from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Bell, House, SignOut, UserCircle} from 'phosphor-react-native';

import {useAuth} from './AuthContext';
import {AppTabParamList, HomeStackParamList, StaffStackParamList} from './types';
import {Colors} from '../theme';

import HomeScreen from '../features/reports/screens/HomeScreen';
import MyReportsScreen from '../features/reports/screens/MyReportsScreen';
import ReportDetailScreen from '../features/reports/screens/ReportDetailScreen';
import CreateReportScreen from '../features/reports/screens/CreateReportScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
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
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="MyReports"
        component={MyReportsScreen}
        options={{title: 'Mis reportes'}}
      />
      <HomeStack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{title: 'Detalle del reporte'}}
      />
      <HomeStack.Screen
        name="CreateReport"
        component={CreateReportScreen}
        options={{title: 'Nuevo reporte'}}
      />
    </HomeStack.Navigator>
  );
}

function StaffStackNavigator() {
  return (
    <StaffStack.Navigator screenOptions={HEADER}>
      <StaffStack.Screen
        name="StaffReportsList"
        component={StaffReportsListScreen}
        options={{title: 'Reportes'}}
      />
      <StaffStack.Screen
        name="StaffReportDetail"
        component={StaffReportDetailScreen}
        options={{title: 'Detalle'}}
      />
    </StaffStack.Navigator>
  );
}

// ── Logout tab button with confirmation modal ──────────────────────────────

function DummyScreen() {
  return <View style={{flex: 1}} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LogoutTabButton(props: Record<string, any>) {
  const [visible, setVisible] = React.useState(false);
  const {logout} = useAuth();

  function confirm() {
    setVisible(false);
    logout();
  }

  return (
    <>
      <TouchableOpacity
        style={[tabStyles.logoutBtn, props.style]}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión">
        <SignOut size={23} color="#DC2626" weight="regular" />
        <Text style={tabStyles.logoutLabel}>Salir</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={tabStyles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={tabStyles.card} onStartShouldSetResponder={() => true}>
            <View style={tabStyles.iconWrap}>
              <SignOut size={28} color="#DC2626" weight="regular" />
            </View>
            <Text style={tabStyles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={tabStyles.modalSub}>
              Tu sesión actual se cerrará.
            </Text>
            <View style={tabStyles.modalButtons}>
              <TouchableOpacity
                style={tabStyles.cancelBtn}
                onPress={() => setVisible(false)}
                activeOpacity={0.8}>
                <Text style={tabStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tabStyles.confirmBtn}
                onPress={confirm}
                activeOpacity={0.8}>
                <Text style={tabStyles.confirmText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────

type TabIconProps = {color: string; focused: boolean};
const iconSize = 23;

function TabIconHouse({color, focused}: TabIconProps) {
  return <House size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />;
}
function TabIconBell({color, focused}: TabIconProps) {
  return <Bell size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />;
}
function TabIconUser({color, focused}: TabIconProps) {
  return <UserCircle size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />;
}

// ── Navigator ──────────────────────────────────────────────────────────────

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
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: Colors.outlineVariant,
          height: 72,
          paddingBottom: 14,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -1},
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0,
          marginTop: 1,
        },
      }}>
      {isStaff ? (
        <Tab.Screen
          name="StaffTab"
          component={StaffStackNavigator}
          options={{
            title: 'Reportes',
            tabBarIcon: ({color, focused}) => (
              <House size={iconSize} color={color} weight={focused ? 'fill' : 'regular'} />
            ),
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
            name="Notifications"
            component={NotificationsScreen}
            options={{
              title: 'Alertas',
              tabBarIcon: TabIconBell,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Perfil',
              tabBarIcon: TabIconUser,
            }}
          />
          <Tab.Screen
            name="Logout"
            component={DummyScreen}
            options={{
              title: 'Salir',
              tabBarButton: props => <LogoutTabButton {...props} />,
            }}
          />
        </>
      )}

      {isStaff && (
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Alertas',
            tabBarIcon: TabIconBell,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// ── Styles para LogoutTabButton y modal ───────────────────────────────────

const tabStyles = StyleSheet.create({
  logoutBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logoutLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#DC2626',
    marginTop: 1,
  },

  /* Modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
