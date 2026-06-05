import React, {useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  CaretRight,
  Check,
  Globe,
  Info,
  SignOut,
  Tag,
  UserCircle,
  X,
} from 'phosphor-react-native';
import {useAuth} from '../../../navigation/AuthContext';
import {useLanguage} from '../../../i18n';
import {Colors} from '../../../theme';
import type {Language} from '../../../i18n';

const APP_VERSION = require('../../../../package.json').version as string;

export default function ProfileScreen() {
  const {user, logout} = useAuth();
  const {language, setLanguage, t} = useLanguage();
  const p = t.profile;
  const insets = useSafeAreaInsets();

  const [signingOut, setSigningOut] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const role = user?.role === 'staff' ? p.roleLabels.staff : p.roleLabels.citizen;

  const handleLogout = () => {
    Alert.alert(p.signOut.confirmTitle, p.signOut.confirmMessage, [
      {text: p.signOut.cancel, style: 'cancel'},
      {
        text: p.signOut.confirm,
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await logout();
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangModalVisible(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Blue header */}
      <View style={[styles.hero, {paddingTop: insets.top + 16}]}>
        <Text style={styles.heroTitle}>{p.header}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 32},
        ]}
        testID="profile-screen">

        {/* User card */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <UserCircle size={42} color={Colors.primary} weight="fill" />
          </View>
          <Text style={styles.name}>{user?.fullName ?? p.defaultName}</Text>
          <Text style={styles.email}>{user?.email ?? p.noEmail}</Text>
          <View style={styles.badge}>
            <Tag size={14} color="#155E75" weight="bold" />
            <Text style={styles.badgeText}>{role}</Text>
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{p.sections.account}</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={p.signOut.title}
            disabled={signingOut}
            testID="sign-out-button">
            <View style={styles.rowIcon}>
              <SignOut size={18} color="#DC2626" weight="regular" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{p.signOut.title}</Text>
              <Text style={styles.rowSubtitle}>{p.signOut.subtitle}</Text>
            </View>
            <CaretRight size={18} color="#94A3B8" weight="regular" />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{p.sections.settings}</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setLangModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={p.language.title}>
            <View style={styles.rowIconMuted}>
              <Globe size={18} color="#0F766E" weight="regular" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{p.language.title}</Text>
              <Text style={styles.rowSubtitle}>{p.language.subtitle}</Text>
            </View>
            <CaretRight size={18} color="#94A3B8" weight="regular" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => setTermsModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={p.terms.title}>
            <View style={styles.rowIconMuted}>
              <Info size={18} color="#475569" weight="regular" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{p.terms.title}</Text>
              <Text style={styles.rowSubtitle}>{p.terms.subtitle}</Text>
            </View>
            <CaretRight size={18} color="#94A3B8" weight="regular" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{p.sections.about}</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutLabel}>{p.appVersion}</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        transparent
        visible={langModalVisible}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}>
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}>
          <View
            style={modalStyles.card}
            onStartShouldSetResponder={() => true}>
            <View style={modalStyles.cardHeader}>
              <Text style={modalStyles.cardTitle}>{p.language.modalTitle}</Text>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <X size={20} color="#64748B" weight="regular" />
              </TouchableOpacity>
            </View>

            {(['es', 'en'] as Language[]).map(lang => {
              const label =
                lang === 'es' ? p.language.optionEs : p.language.optionEn;
              const selected = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    modalStyles.langOption,
                    selected && modalStyles.langOptionSelected,
                  ]}
                  onPress={() => handleSelectLanguage(lang)}
                  accessibilityRole="radio"
                  accessibilityState={{selected}}>
                  <Text
                    style={[
                      modalStyles.langOptionText,
                      selected && modalStyles.langOptionTextSelected,
                    ]}>
                    {label}
                  </Text>
                  {selected && (
                    <Check size={18} color={Colors.primary} weight="bold" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Terms modal */}
      <Modal
        transparent
        visible={termsModalVisible}
        animationType="slide"
        onRequestClose={() => setTermsModalVisible(false)}>
        <View style={modalStyles.termsOverlay}>
          <View
            style={[modalStyles.termsCard, {paddingBottom: insets.bottom + 16}]}>
            <View style={modalStyles.cardHeader}>
              <Text style={modalStyles.cardTitle}>{p.terms.modalTitle}</Text>
              <TouchableOpacity
                onPress={() => setTermsModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <X size={20} color="#64748B" weight="regular" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={modalStyles.termsScroll}
              showsVerticalScrollIndicator={false}>
              <Text style={modalStyles.termsText}>{p.terms.content}</Text>
            </ScrollView>

            <TouchableOpacity
              style={modalStyles.closeBtn}
              onPress={() => setTermsModalVisible(false)}
              activeOpacity={0.8}>
              <Text style={modalStyles.closeBtnText}>{p.terms.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF3FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E6F7FB',
  },
  badgeText: {
    fontSize: 12,
    color: '#155E75',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748B',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconMuted: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF6FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  aboutValue: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
});

const modalStyles = StyleSheet.create({
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
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  langOptionSelected: {
    backgroundColor: '#EAF3FB',
  },
  langOptionText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  langOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },

  /* Terms */
  termsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  termsCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '85%',
  },
  termsScroll: {
    marginTop: 4,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
