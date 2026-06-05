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
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ArrowRight, Bell, ClipboardText, PlusCircle} from 'phosphor-react-native';
import {useAuth} from '../../../navigation/AuthContext';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import type {HomeStackParamList} from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {user} = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'ciudadano';

  const goToCreate = () => navigation.getParent()?.navigate('CreateReport');
  const goToNotifs = () => navigation.getParent()?.navigate('Notifications');

  return (
    <View style={styles.root} testID="home-screen">
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Hero — extends behind status bar */}
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

      {/* Scrollable body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + Spacing.stackXl},
        ]}
        showsVerticalScrollIndicator={false}>

        {/* Create card */}
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

        {/* Section header */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Mis reportes</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>0</Text>
          </View>
        </View>

        {/* Empty state */}
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

  // ── Hero ──
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

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.stackLg,
    paddingHorizontal: Spacing.marginPage,
    gap: Spacing.stackLg,
  },

  // ── Create card ──
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

  // ── Section ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  sectionBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },

  // ── Empty state ──
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
