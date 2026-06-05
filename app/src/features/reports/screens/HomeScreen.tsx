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
import {
  Bell,
  ClipboardText,
  Plus,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {EmptyState, ErrorMessage, ReportCard} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {useAuth} from '../../../navigation/AuthContext';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import {REPORT_STATUS_LABELS, STORAGE_KEYS} from '../../../constants';
import type {AppTabParamList, HomeStackParamList} from '../../../navigation/types';
import type {Report, ReportStatus} from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type TabNav = BottomTabNavigationProp<AppTabParamList>;

const PAGE_SIZE = 10;

type FilterOption = {label: string; value: ReportStatus | null};

const FILTER_OPTIONS: FilterOption[] = [
  {label: 'Todos', value: null},
  {label: REPORT_STATUS_LABELS.Pending, value: 'Pending'},
  {label: REPORT_STATUS_LABELS.InReview, value: 'InReview'},
  {label: REPORT_STATUS_LABELS.Assigned, value: 'Assigned'},
  {label: REPORT_STATUS_LABELS.InProgress, value: 'InProgress'},
  {label: REPORT_STATUS_LABELS.Resolved, value: 'Resolved'},
  {label: REPORT_STATUS_LABELS.Rejected, value: 'Rejected'},
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const parentNavigation = navigation.getParent<TabNav>();
  const {user} = useAuth();
  const firstName = user?.fullName?.split(' ')[0] ?? 'ciudadano';

  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | null>(null);

  const mountedRef = React.useRef(false);
  /**
   * Tracks whether we ever had data on screen. Used to decide between
   * "show full-page spinner" and "soft refresh" on focus — we don't
   * want to blank the list every time the citizen comes back from
   * CreateReport.
   */
  const hasDataRef = React.useRef(false);

  const goToCreate = () => parentNavigation?.navigate('CreateReport');
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
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar tus reportes.',
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

  // Mount: hydrate cache → first fetch.
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

  // Focus: silently refresh the first page so a new report created in
  // CreateReport shows up the moment the citizen returns. We don't
  // touch the spinner — if we already have data, we keep showing it.
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
                <Text
                  style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
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
          <Text style={styles.feedbackText}>Cargando...</Text>
        </View>
      ) : showFullPageError ? (
        <View style={styles.feedbackArea} testID="home-reports-error">
          <ErrorMessage message={error!} />
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchPage(1, statusFilter, 'initial').catch(() => {})}
            activeOpacity={0.8}
            accessibilityRole="button">
            <Text style={styles.retryLabel}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : showEmptyState ? (
        <View style={styles.flex} testID="home-empty-state">
          <View style={styles.emptyWrap}>
            <EmptyState
              Icon={ClipboardText}
              title={
                statusFilter
                  ? REPORT_STATUS_LABELS[statusFilter] === 'Pendiente' &&
                    statusFilter === 'Pending'
                    ? 'Nada por aquí'
                    : 'Sin resultados'
                  : 'Aún no tienes reportes'
              }
              subtitle={
                statusFilter
                  ? 'No tienes reportes con este estado.'
                  : 'Crea tu primer reporte y aparecerá aquí con su estado actualizado.'
              }
              actionLabel={statusFilter ? undefined : 'Crear reporte'}
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
              <Text style={styles.listHeaderTitle}>Reportes</Text>
              <View style={styles.listHeaderCount}>
                <Text style={styles.listHeaderCountText}>
                  {reports.length}
                  {hasMore ? '+' : ''}
                </Text>
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

      {/* ── FAB ──────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 20}]}
        onPress={goToCreate}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Crear nuevo reporte"
        testID="home-fab">
        <Plus size={22} color="#fff" weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {flex: 1},

  /* Hero header */
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

  /* Chips bar (status filter) */
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
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },

  /* List section header */
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginPage,
    paddingTop: Spacing.stackLg,
    paddingBottom: 10,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  listHeaderCount: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  listHeaderCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },

  /* List content padding */
  listContent: {
    paddingBottom: 96,
  },

  /* Load more spinner */
  loadMoreRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  /* Feedback states (loading / error) */
  feedbackArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.marginPage,
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  /* Empty state */
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },

  /* FAB */
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
