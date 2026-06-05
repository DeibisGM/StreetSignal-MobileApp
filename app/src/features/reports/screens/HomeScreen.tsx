import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ArrowRight, Bell, ClipboardText, PlusCircle} from 'phosphor-react-native';

import {useAuth} from '../../../navigation/AuthContext';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import type {AppTabParamList, HomeStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type TabNav = BottomTabNavigationProp<AppTabParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent<TabNav>();
  const {user} = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'ciudadano';

  const goToCreate = () => parentNavigation?.navigate('CreateReport');
  const goToNotifs = () => parentNavigation?.navigate('Notifications');

  return (
    <View style={styles.root} testID="home-screen">
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={[styles.hero, {paddingTop: insets.top + 16}]}>
        <View style={styles.heroRow}>
          <Text style={styles.heroName}>{firstName}</Text>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={goToNotifs}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones">
            <Bell size={20} color="#fff" weight="regular" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + Spacing.stackXl},
        ]}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.createCard}
          onPress={goToCreate}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Crear nuevo reporte">
          <View style={styles.createCardLeft}>
            <View style={styles.createIconBg}>
              <PlusCircle size={26} color="#fff" weight="fill" />
            </View>
            <View>
              <Text style={styles.createCardTitle}>Nuevo reporte</Text>
              <Text style={styles.createCardSub}>Foto · Categoría · Ubicación</Text>
            </View>
          </View>
          <View style={styles.createArrow}>
            <ArrowRight size={17} color="#fff" weight="bold" />
          </View>
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

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <ClipboardText size={30} color={Colors.primary} weight="light" />
          </View>
          <Text style={styles.emptyTitle}>Aún no tienes reportes</Text>
          <Text style={styles.emptySub}>
            Cuando crees un reporte aparecerá aquí con su estado actualizado.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={goToCreate}
            activeOpacity={0.85}>
            <PlusCircle size={15} color="#fff" weight="fill" />
            <Text style={styles.emptyBtnText}>Crear mi primer reporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginPage,
    paddingBottom: Spacing.stackLg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
    marginTop: 3,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.stackLg,
    paddingHorizontal: Spacing.marginPage,
    gap: Spacing.stackLg,
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  createCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  createIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  createCardSub: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  createArrow: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: Spacing.marginPage,
    gap: 8,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
