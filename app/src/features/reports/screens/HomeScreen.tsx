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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Bell, ClipboardText, Plus} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {EmptyState, ErrorMessage, ReportCard} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {useAuth} from '../../../navigation/AuthContext';
import {Colors, Spacing} from '../../../theme';
import {REPORT_STATUS_LABELS, STORAGE_KEYS} from '../../../constants';
import type {HomeStackParamList} from '../../../navigation/types';
import type {Report, ReportStatus} from '../../../types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

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

  const goToCreate = () => navigation.navigate('CreateReport');
  const goToNotifs = () => navigation.getParent()?.navigate('Notifications');

  async function fetchPage(
    pageNum: number,
    filter: ReportStatus | null,
    mode: 'initial' | 'refresh' | 'more' = 'initial',
  ) {
    if (!mountedRef.current) return;
    setError(null);
    try {
      const response = await reportsService.getMyReports({
        page: pageNum,
        pageSize: PAGE_SIZE,
        status: filter ?? undefined,
      });
      if (!mountedRef.current) return;
      const newItems = response.items;
      setReports(prev => (pageNum === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(response.page * response.pageSize < response.total);
      setPage(pageNum);
      if (pageNum === 1 && mode !== 'refresh' && newItems.length > 0) {
        AsyncStorage.setItem(STORAGE_KEYS.CACHED_REPORTS, JSON.stringify(newItems)).catch(() => {});
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus reportes.');
    } finally {
      if (!mountedRef.current) return;
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
            if (cached.length > 0) setReports(cached);
          } catch { /* ignore */ }
        }
      })
      .catch(() => {})
      .finally(() => { fetchPage(1, null, 'initial').catch(() => {}); });
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchPage(1, statusFilter, 'refresh').catch(() => {});
  }

  function handleLoadMore() {
    if (!hasMore || loadingMore || loading || refreshing) return;
    setLoadingMore(true);
    fetchPage(page + 1, statusFilter, 'more').catch(() => {});
  }

  function handleFilterChange(filter: ReportStatus | null) {
    if (filter === statusFilter) return;
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

      {/* ── Header ─────────────────────────────────────── */}
      <View style={[styles.header, {paddingTop: insets.top + 14}]}>
        <View style={styles.headerInner}>
          <Text style={styles.headerName}>{firstName}</Text>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={goToNotifs}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones">
            <Bell size={20} color="#fff" weight="regular" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chips bar — siempre visible ────────────────── */}
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
                accessibilityState={{selected: isActive}}>
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Contenido ──────────────────────────────────── */}
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
              title={statusFilter ? 'Nada por aquí' : 'Aún no tienes reportes'}
              subtitle={
                statusFilter
                  ? 'No tienes reportes con este estado.'
                  : 'Crea tu primer reporte y aparecerá aquí.'
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
              onPress={() => navigation.navigate('ReportDetail', {reportId: item.id})}
              testID={`home-report-card-${item.id}`}
            />
          )}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Reportes</Text>
              <View style={styles.listHeaderCount}>
                <Text style={styles.listHeaderCountText}>
                  {reports.length}{hasMore ? '+' : ''}
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
          contentContainerStyle={{paddingBottom: 96}}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={8}
          testID="home-reports-list"
        />
      )}

      {/* ── FAB ────────────────────────────────────────── */}
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

  /* Header */
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginPage,
    paddingBottom: 22,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Chips bar */
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
    paddingTop: 18,
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

  /* Load more */
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
