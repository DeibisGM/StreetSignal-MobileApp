import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Bell, ClipboardText, Plus} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {EmptyState, ErrorMessage, LogoMark, ReportCard} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {useAuth} from '../../../navigation/AuthContext';
import {useLanguage} from '../../../i18n';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import {STORAGE_KEYS} from '../../../constants';
import type {AppTabParamList, HomeStackParamList} from '../../../navigation/types';
import type {Report, ReportStatus} from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type TabNav = BottomTabNavigationProp<AppTabParamList>;

const PAGE_SIZE = 10;

type FilterOption = {label: string; value: ReportStatus | null};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent<TabNav>();
  const {user} = useAuth();
  const {t} = useLanguage();
  const h = t.home;

  const firstName = user?.fullName?.split(' ')[0] ?? h.defaultGreeting;

  // Build filter options using i18n status labels
  const FILTER_OPTIONS: FilterOption[] = [
    {label: t.statusLabels.Pending === 'Pendiente' ? 'Todos' : 'All', value: null},
    {label: t.statusLabels.Pending, value: 'Pending'},
    {label: t.statusLabels.InReview, value: 'InReview'},
    {label: t.statusLabels.Assigned, value: 'Assigned'},
    {label: t.statusLabels.InProgress, value: 'InProgress'},
    {label: t.statusLabels.Resolved, value: 'Resolved'},
    {label: t.statusLabels.Rejected, value: 'Rejected'},
  ];

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | null>(null);

  const mountedRef = React.useRef(false);
  const hasDataRef = React.useRef(false);

  const goToCreate = () => navigation.navigate('CreateReport');
  const goToNotifs = () => parentNavigation?.navigate('Notifications');

  async function fetchPage(
    pageNum: number,
    filter: ReportStatus | null,
    mode: 'initial' | 'refresh' | 'more' | 'focus' = 'initial',
  ) {
    if (!mountedRef.current) {
      return;
    }
    setError(null);
    try {
      const response = await reportsService.getMyReports({
        page: pageNum,
        pageSize: PAGE_SIZE,
        status: filter ?? undefined,
      });
      if (!mountedRef.current) {
        return;
      }
      const newItems = response.items;
      setReports(prev => (pageNum === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(response.page * response.pageSize < response.total);
      setPage(pageNum);
      if (newItems.length > 0) {
        hasDataRef.current = true;
      }
      if (pageNum === 1 && mode !== 'refresh' && newItems.length > 0) {
        AsyncStorage.setItem(
          STORAGE_KEYS.CACHED_REPORTS,
          JSON.stringify(newItems),
        ).catch(() => {});
      }
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }
      setError(
        err instanceof ApiError ? err.message : h.loadError,
      );
    } finally {
      if (!mountedRef.current) {
        return;
      }
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }

  React.useEffect(() => {
    mountedRef.current = true;
    AsyncStorage.getItem(STORAGE_KEYS.CACHED_REPORTS)
      .then(raw => {
        if (raw && mountedRef.current) {
          try {
            const cached = JSON.parse(raw) as Report[];
            if (cached.length > 0) {
              setReports(cached);
              hasDataRef.current = true;
            }
          } catch {
            /* ignore corrupt cache */
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        fetchPage(1, null, 'initial').catch(() => {});
      });
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!hasDataRef.current) {
        return;
      }
      fetchPage(1, statusFilter, 'focus').catch(() => {});
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]),
  );

  function handleRefresh() {
    setRefreshing(true);
    fetchPage(1, statusFilter, 'refresh').catch(() => {});
  }

  function handleLoadMore() {
    if (!hasMore || loadingMore || loading || refreshing) {
      return;
    }
    setLoadingMore(true);
    fetchPage(page + 1, statusFilter, 'more').catch(() => {});
  }

  function handleFilterChange(filter: ReportStatus | null) {
    if (filter === statusFilter) {
      return;
    }
    setStatusFilter(filter);
    setLoading(true);
    setReports([]);
    fetchPage(1, filter, 'initial').catch(() => {});
  }

  const showFullPageLoading = loading && reports.length === 0;
  const showFullPageError = !loading && !!error && reports.length === 0;
  const showEmptyState = !loading && !error && reports.length === 0;

  return (
    <View style={styles.root} testID="home-screen">
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ── Hero header ───────────────────────────────────────────── */}
      <View style={[styles.hero, {paddingTop: insets.top + 14}]}>
        <View style={styles.heroRow}>
          <View style={styles.heroNameRow}>
            <LogoMark size={32} testID="home-hero-logo" />
            <Text style={styles.heroName}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={goToNotifs}
            accessibilityRole="button"
            accessibilityLabel={h.notificationsA11y}>
            <Bell size={20} color="#fff" weight="regular" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Status filter chips ──────────────────────────────────── */}
      <View style={styles.chipsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {FILTER_OPTIONS.map(opt => {
            const isActive = statusFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value ?? 'all'}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleFilterChange(opt.value)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                testID={`home-status-chip-${opt.value ?? 'all'}`}>
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content area ─────────────────────────────────────────── */}
      {showFullPageLoading ? (
        <View style={styles.feedbackArea} testID="home-reports-loading">
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.feedbackText}>{h.loadingReports}</Text>
        </View>
      ) : showFullPageError ? (
        <View style={styles.feedbackArea} testID="home-reports-error">
          <ErrorMessage message={error!} />
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchPage(1, statusFilter, 'initial').catch(() => {})}
            activeOpacity={0.8}
            accessibilityRole="button">
            <Text style={styles.retryLabel}>{t.reports.myReports.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : showEmptyState ? (
        <View style={styles.flex} testID="home-empty-state">
          <View style={styles.emptyWrap}>
            <EmptyState
              Icon={ClipboardText}
              title={statusFilter ? t.common.loading : h.emptyTitle}
              subtitle={
                statusFilter
                  ? t.reports.myReports.emptyTitle
                  : h.emptySub
              }
              actionLabel={statusFilter ? undefined : h.createFirst}
              onAction={statusFilter ? undefined : goToCreate}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ReportCard
              report={item}
              onPress={() =>
                navigation.navigate('ReportDetail', {reportId: item.id})
              }
              testID={`home-report-card-${item.id}`}
            />
          )}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.listHeaderLeft}>
                <Text style={styles.listHeaderTitle}>{h.myReports}</Text>
              </View>
              <View
                style={styles.listHeaderCount}
                testID="home-reports-count"
                accessibilityLabel={`${reports.length}${hasMore ? ' o más' : ''} reportes`}>
                <Text style={styles.listHeaderCountNumber}>{reports.length}</Text>
                {hasMore ? <Text style={styles.listHeaderCountPlus}>+</Text> : null}
              </View>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.6}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={8}
          testID="home-reports-list"
        />
      )}

      {/* ── FAB ──────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 20}]}
        onPress={goToCreate}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={h.newReportA11y}
        testID="home-fab">
        <Plus size={22} color="#fff" weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginPage,
    paddingBottom: 22,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
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
  chipsBar: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.marginPage,
    paddingVertical: 14,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {fontSize: 13, fontWeight: '500', color: Colors.onSurfaceVariant},
  chipLabelActive: {color: '#fff', fontWeight: '600'},
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginPage,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 12,
  },
  listHeaderLeft: {flex: 1, minWidth: 0},
  listHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  listHeaderCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 44,
    justifyContent: 'center',
  },
  listHeaderCountNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  listHeaderCountPlus: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
    marginLeft: 1,
  },
  listContent: {paddingBottom: 96},
  loadMoreRow: {paddingVertical: 16, alignItems: 'center'},
  feedbackArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.marginPage,
  },
  feedbackText: {fontSize: 14, color: Colors.onSurfaceVariant},
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  retryLabel: {fontSize: 14, fontWeight: '600', color: '#fff'},
  emptyWrap: {flex: 1, justifyContent: 'center'},
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
