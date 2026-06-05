import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MagnifyingGlass, X} from 'phosphor-react-native';

import {AppTextInput, ErrorMessage, ReportCard} from '../../../components';
import {categoriesService} from '../../../api/categoriesService';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {STORAGE_KEYS, storageService} from '../../../storage/storageService';
import {Colors, BorderRadius, Spacing} from '../../../theme';
import {StaffStackParamList} from '../../../navigation/types';
import type {Category, Report, ReportStatus} from '../../../types';

type Nav = NativeStackNavigationProp<StaffStackParamList>;
type StaffFilterStatus = ReportStatus | 'All';

interface StaffReportsFilterState {
  status: StaffFilterStatus;
  categoryId: string | null;
  search: string;
}

interface StaffReportsCacheEntry {
  key: string;
  filter: StaffReportsFilterState;
  items: Report[];
  page: number;
  pageSize: number;
  total: number;
}

const PAGE_SIZE = 10;

const STATUS_OPTIONS: StaffFilterStatus[] = [
  'All',
  'Pending',
  'InReview',
  'Assigned',
  'InProgress',
  'Resolved',
  'Rejected',
];

const DEFAULT_FILTER: StaffReportsFilterState = {
  status: 'All',
  categoryId: null,
  search: '',
};

function normalizeSearch(value: string): string {
  return value.trim();
}

function buildFilterKey(filter: StaffReportsFilterState): string {
  return JSON.stringify({
    status: filter.status,
    categoryId: filter.categoryId ?? '',
    search: normalizeSearch(filter.search).toLowerCase(),
  });
}

function isStatusOption(value: unknown): value is StaffFilterStatus {
  return STATUS_OPTIONS.includes(value as StaffFilterStatus);
}

function toStoredFilter(filter: StaffReportsFilterState) {
  return {
    status: filter.status,
    categoryId: filter.categoryId,
    search: filter.search,
  };
}

function fromStoredFilter(value: unknown): StaffReportsFilterState | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<StaffReportsFilterState>;
  if (!isStatusOption(candidate.status)) {
    return null;
  }

  return {
    status: candidate.status,
    categoryId:
      typeof candidate.categoryId === 'string' && candidate.categoryId.length > 0
        ? candidate.categoryId
        : null,
    search: typeof candidate.search === 'string' ? candidate.search : '',
  };
}

function buildStaffReportParams(
  filter: StaffReportsFilterState,
  page: number,
  pageSize: number,
) {
  return {
    ...(filter.status === 'All' ? {} : {status: filter.status}),
    ...(filter.categoryId ? {categoryId: filter.categoryId} : {}),
    ...(normalizeSearch(filter.search) ? {search: normalizeSearch(filter.search)} : {}),
    page,
    pageSize,
  };
}

function ReportListSeparator() {
  return <View style={styles.separator} />;
}

function EmptyReportsState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No reports found.</Text>
      <Text style={styles.emptyText}>
        Try adjusting status, category, or title search.
      </Text>
    </View>
  );
}

export default function StaffReportsListScreen() {
  const navigation = useNavigation<Nav>();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<StaffReportsFilterState>(DEFAULT_FILTER);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const mountedRef = useRef(false);

  async function persistFilter(nextFilter: StaffReportsFilterState) {
    await storageService.setItem(
      STORAGE_KEYS.STAFF_LAST_FILTER,
      toStoredFilter(nextFilter),
    );
  }

  async function persistCache(entry: StaffReportsCacheEntry) {
    await storageService.setItem(STORAGE_KEYS.STAFF_REPORTS_CACHE, entry);
  }

  async function readCache(key: string): Promise<StaffReportsCacheEntry | null> {
    const raw = await storageService.getItem<StaffReportsCacheEntry>(
      STORAGE_KEYS.STAFF_REPORTS_CACHE,
    );
    if (!raw || raw.key !== key) {
      return null;
    }
    return raw;
  }

  async function loadCategories() {
    try {
      const items = await categoriesService.getCategories();
      if (mountedRef.current) {
        setCategories(items);
      }
    } catch {
      // Categories help filtering but should not block the list.
    }
  }

  async function loadPage(
    nextFilter: StaffReportsFilterState,
    nextPage = 1,
    mode: 'replace' | 'append' = 'replace',
    options?: {skipCache?: boolean},
  ) {
    if (!mountedRef.current) {
      return;
    }

    if (mode === 'replace') {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await reportsService.getReports(
        buildStaffReportParams(nextFilter, nextPage, PAGE_SIZE),
      );

      if (!mountedRef.current) {
        return;
      }

      setReports(prev => (mode === 'append' ? [...prev, ...response.items] : response.items));
      setPage(response.page);
      setTotal(response.total);
      setHasNextPage(response.page * response.pageSize < response.total);

      if (!options?.skipCache && nextPage === 1) {
        await persistCache({
          key: buildFilterKey(nextFilter),
          filter: nextFilter,
          items: response.items,
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof ApiError ? err.message : 'Could not load reports.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }

  async function initialize() {
    setInitializing(true);
    try {
      const storedFilter = await storageService.getItem<unknown>(
        STORAGE_KEYS.STAFF_LAST_FILTER,
      );
      const restoredFilter = fromStoredFilter(storedFilter) ?? DEFAULT_FILTER;

      if (mountedRef.current) {
        setFilter(restoredFilter);
      }

      await loadCategories();

      const cacheKey = buildFilterKey(restoredFilter);
      const cache = await readCache(cacheKey);
      if (cache && mountedRef.current) {
        setReports(cache.items);
        setPage(cache.page);
        setTotal(cache.total);
        setHasNextPage(cache.items.length < cache.total);
        setLoading(false);
      }

      await loadPage(restoredFilter, 1, 'replace', {skipCache: !!cache});

      if (mountedRef.current) {
        await persistFilter(restoredFilter);
      }
    } finally {
      if (mountedRef.current) {
        setInitializing(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    initialize().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
    // initialize is intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const refreshOnFocus = async () => {
        if (!active || !mountedRef.current) {
          return;
        }

        const cacheKey = buildFilterKey(filter);
        const cache = await storageService.getItem<StaffReportsCacheEntry>(
          STORAGE_KEYS.STAFF_REPORTS_CACHE,
        );
        const validCache = cache && cache.key === cacheKey ? cache : null;

        if (validCache && mountedRef.current && active) {
          setReports(validCache.items);
          setPage(validCache.page);
          setTotal(validCache.total);
          setHasNextPage(validCache.page * validCache.pageSize < validCache.total);
        }

        if (mountedRef.current && active) {
          setLoading(true);
          setError(null);

          try {
            const response = await reportsService.getReports(
              buildStaffReportParams(filter, 1, PAGE_SIZE),
            );

            if (!mountedRef.current || !active) {
              return;
            }

            setReports(response.items);
            setPage(response.page);
            setTotal(response.total);
            setHasNextPage(response.page * response.pageSize < response.total);

            if (!validCache) {
              await storageService.setItem(STORAGE_KEYS.STAFF_REPORTS_CACHE, {
                key: buildFilterKey(filter),
                filter,
                items: response.items,
                page: response.page,
                pageSize: response.pageSize,
                total: response.total,
              });
            }
          } catch (err) {
            if (mountedRef.current && active) {
              setError(
                err instanceof ApiError
                  ? err.message
                  : 'Could not load reports.',
              );
            }
          } finally {
            if (mountedRef.current && active) {
              setLoading(false);
              setLoadingMore(false);
              setRefreshing(false);
            }
          }
        }
      };

      refreshOnFocus().catch(() => {});

      return () => {
        active = false;
      };
    }, [filter]),
  );

  async function applyFilter(nextFilter: StaffReportsFilterState) {
    if (!mountedRef.current) {
      return;
    }

    setFilter(nextFilter);
    await persistFilter(nextFilter);
    await loadPage(nextFilter, 1, 'replace');
  }

  function handleStatusChange(nextStatus: StaffFilterStatus) {
    applyFilter({...filter, status: nextStatus}).catch(() => {});
  }

  function handleCategoryChange(category: Category | null) {
    applyFilter({...filter, categoryId: category?.id ?? null}).catch(() => {});
  }

  function handleSearchChange(text: string) {
    setFilter(current => ({...current, search: text}));
  }

  function commitSearch() {
    applyFilter(filter).catch(() => {});
  }

  function handleClearFilters() {
    applyFilter(DEFAULT_FILTER).catch(() => {});
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadPage(filter, 1, 'replace');
  }

  async function handleLoadMore() {
    if (loadingMore || loading || refreshing || !hasNextPage) {
      return;
    }
    await loadPage(filter, page + 1, 'append');
  }

  const activeFiltersCount =
    (filter.status === 'All' ? 0 : 1) +
    (filter.categoryId ? 1 : 0) +
    (normalizeSearch(filter.search) ? 1 : 0);

  if (initializing && loading && reports.length === 0) {
    return (
      <View style={styles.center} testID="staff-reports-list-loading">
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.centerText}>Loading reports...</Text>
      </View>
    );
  }

  if (error && reports.length === 0) {
    return (
      <View style={styles.center} testID="staff-reports-list-error">
        <ErrorMessage message={error} />
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            loadPage(filter, 1, 'replace').catch(() => {});
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Retry loading reports">
          <Text style={styles.retryLabel}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.root}
      testID="staff-reports-list-screen"
      data={reports}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <ReportCard
          report={item}
          onPress={() =>
            navigation.navigate('StaffReportDetail', {reportId: item.id})
          }
          testID={`staff-report-card-${item.id}`}
        />
      )}
      ListHeaderComponent={
        <View style={styles.headerWrapper}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>All reports</Text>
            <Text style={styles.subtitle}>
              Staff review queue · Use filters to narrow the list.
            </Text>
          </View>

          <View style={styles.filtersPanel}>
            <AppTextInput
              label="Search by title"
              placeholder="Type a report title"
              value={filter.search}
              onChangeText={handleSearchChange}
              onSubmitEditing={commitSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              testID="staff-report-search"
              prefix={<MagnifyingGlass size={18} color="#64748B" weight="regular" />}
              suffix={
                filter.search ? (
                  <TouchableOpacity
                    onPress={() => {
                      const nextFilter = {...filter, search: ''};
                      setFilter(nextFilter);
                      applyFilter(nextFilter).catch(() => {});
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search">
                    <X size={18} color="#64748B" weight="regular" />
                  </TouchableOpacity>
                ) : undefined
              }
            />

            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map(status => {
                const selected = filter.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => handleStatusChange(status)}
                    accessibilityRole="radio"
                    accessibilityState={{selected}}
                    testID={`status-filter-${status}`}>
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !filter.categoryId && styles.chipSelected]}
                onPress={() => handleCategoryChange(null)}
                accessibilityRole="radio"
                accessibilityState={{selected: !filter.categoryId}}
                testID="category-filter-all">
                <Text style={[styles.chipLabel, !filter.categoryId && styles.chipLabelSelected]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map(category => {
                const selected = filter.categoryId === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => handleCategoryChange(category)}
                    accessibilityRole="radio"
                    accessibilityState={{selected}}
                    testID={`category-filter-${category.id}`}>
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.clearButton,
                  activeFiltersCount === 0 && styles.clearButtonDisabled,
                ]}
                onPress={handleClearFilters}
                disabled={activeFiltersCount === 0}
                accessibilityRole="button"
                accessibilityLabel="Clear all filters">
                <Text style={styles.clearButtonLabel}>Clear filters</Text>
              </TouchableOpacity>
              <Text style={styles.activeCount}>{activeFiltersCount} active</Text>
            </View>

            <Text style={styles.totalCount}>
              {reports.length} loaded of {total} total
            </Text>

            {error ? (
              <View style={styles.errorWrap}>
                <ErrorMessage message={error} />
              </View>
            ) : null}
          </View>
        </View>
      }
      ListEmptyComponent={!loading ? <EmptyReportsState /> : null}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.footerText}>Loading more reports...</Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            handleRefresh().catch(() => {});
          }}
          tintColor={Colors.primary}
        />
      }
      contentContainerStyle={[
        styles.listContent,
        reports.length === 0 && styles.emptyListContent,
      ]}
      ItemSeparatorComponent={ReportListSeparator}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        handleLoadMore().catch(() => {});
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    paddingBottom: Spacing.stackMd,
  },
  titleBlock: {
    paddingHorizontal: Spacing.marginPage,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackMd,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  filtersPanel: {
    marginHorizontal: Spacing.marginPage,
    padding: Spacing.gutter,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    gap: Spacing.stackMd,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: -4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  activeCount: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  totalCount: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  errorWrap: {
    marginTop: Spacing.stackMd,
  },
  listContent: {
    paddingBottom: Spacing.stackXl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.stackSm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginPage,
    paddingTop: Spacing.stackXl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.stackMd,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.marginPage,
    gap: Spacing.stackMd,
  },
  centerText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});