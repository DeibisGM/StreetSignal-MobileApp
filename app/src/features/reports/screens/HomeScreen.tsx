import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../../../navigation/AuthContext';
import {Colors, Spacing, BorderRadius, Typography} from '../../../theme';
import type {AppTabParamList, HomeStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type TabNav = BottomTabNavigationProp<AppTabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent<TabNav>();
  const {user} = useAuth();

  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.greeting}>
        Hola, {user?.fullName?.split(' ')[0] ?? 'ciudadano'} 👋
      </Text>
      <Text style={styles.subtitle}>
        ¿Detectaste un problema en tu comunidad?
      </Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => parentNavigation?.navigate('CreateReport')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Crear nuevo reporte">
        <Text style={styles.createButtonIcon}>📋</Text>
        <Text style={styles.createButtonLabel}>Crear reporte</Text>
        <Text style={styles.createButtonSub}>Foto + ubicación + descripción</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportsButton}
        onPress={() => navigation.navigate('MyReports')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Ver mis reportes">
        <Text style={styles.reportsButtonLabel}>Mis reportes</Text>
        <Text style={styles.reportsButtonSub}>Revisa el estado y el historial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.marginPage,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.stackMd,
  },
  greeting: {
    ...Typography.headlineLgMobile,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.stackLg,
  },
  createButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.stackLg,
    alignItems: 'center',
    gap: 6,
  },
  createButtonIcon: {
    fontSize: 36,
  },
  createButtonLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  createButtonSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  reportsButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.stackMd,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#D7E1F0',
  },
  reportsButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  reportsButtonSub: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
