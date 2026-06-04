import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {categoriesService} from '../../../api/categoriesService';
import {reportsService} from '../../../api/reportsService';
import {STORAGE_KEYS} from '../../../constants';
import type {Category, PaginatedResponse, Report, ReportStatus} from '../../../types';
import {staffStorageService} from '../../../storage/staff/storageService';

type StatusFilter = ReportStatus | 'All';
type CategoryFilter = string | 'All';

const STATUS_OPTIONS: StatusFilter[] = [
  'All',
  'Pending',
  'InReview',
  'Assigned',
  'InProgress',
  'Resolved',
  'Rejected',
];

const STATUS_LABELS: Record<StatusFilter, string> = {
  All: 'All',
  Pending: 'Pending',
  InReview: 'In review',
  Assigned: 'Assigned',
  InProgress: 'In progress',
  Resolved: 'Resolved',
  Rejected: 'Rejected',
};

function getCacheKey(filter: {status?: StatusFilter; categoryId?: CategoryFilter; search?: string}) {
  return `${STORAGE_KEYS.CACHED_REPORTS}:${filter.status ?? 'All'}:${filter.categoryId ?? 'All'}:${filter.search ?? ''}`;
}

function normalizeFilter(filter: {status?: StatusFilter; categoryId?: CategoryFilter; search?: string}) {
  return {
    status: filter.status && filter.status !== 'All' ? filter.status : undefined,
    categoryId:
      filter.categoryId && filter.categoryId !== 'All' ? filter.categoryId : undefined,
    search: filter.search?.trim() ? filter.search.trim() : undefined,
  };
}

function isApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unable to load reports.';
}

function ReportCard({report}: {report: Report}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{report.status}</Text>
        </View>
        <Text style={styles.cardCategory}>{report.category}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {report.title}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={3}>
        {report.description}
      </Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaLabel}>Created by</Text>
        <Text style={styles.cardMetaValue}>{report.createdByName}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.cardFooterText}>{report.address ?? 'No address'}</Text>
      </View>
    </View>
  );
}

export function StaffReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<StatusFilter>('All');
  const [categoryId, setCategoryId] = useState<CategoryFilter>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestId = useRef(0);

  const activeFilter = useMemo(
    () => normalizeFilter({status, categoryId, search}),
    [status, categoryId, search],
  );

  const canLoadMore = reports.length < total;

  useEffect(() => {
    let mounted = true;
    async function hydrate() {
      const savedFilter = await staffStorageService.getLastFilter();
      const cacheKey = getCacheKey(savedFilter ?? {});
      const savedCache = await AsyncStorage.getItem(cacheKey);

      if (!mounted) {
        return;
      }

      if (savedFilter) {
        if (savedFilter.status) {
          setStatus(savedFilter.status);
        }
        if (savedFilter.categoryId) {
          setCategoryId(savedFilter.categoryId);
        }
        if (savedFilter.search) {
          setSearch(savedFilter.search);
        }
      }

      if (savedCache) {
        const parsed = JSON.parse(savedCache) as PaginatedResponse<Report>;
        setReports(parsed.data ?? []);
        setTotal(parsed.pagination?.totalItems ?? 0);
        setPage((parsed.pagination?.page ?? 1) + 1);
      }

      setHydrated(true);
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const controller = ++requestId.current;
    setLoading(true);
    setError(null);

    void staffStorageService.saveLastFilter({
      status,
      categoryId,
      search,
    });

    const fetchInitial = async () => {
      try {
        const [reportResponse, categoryResponse] = await Promise.all([
          reportsService.getReports({
            ...activeFilter,
            page: 1,
            pageSize,
          }),
          categoriesService.getCategories(),
        ]);

        if (requestId.current !== controller) {
          return;
        }

        setReports(reportResponse.data ?? []);
        setTotal(reportResponse.pagination?.totalItems ?? 0);
        setPage(2);
        setCategories(categoryResponse);

        await AsyncStorage.setItem(getCacheKey({status, categoryId, search}), JSON.stringify(reportResponse));
      } catch (err) {
        if (requestId.current === controller) {
          setError(isApiErrorMessage(err));
        }
      } finally {
        if (requestId.current === controller) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    };

    void fetchInitial();
  }, [activeFilter, categoryId, hydrated, pageSize, refreshToken, search, status]);

  const loadMore = async () => {
    if (!canLoadMore || loadingMore || loading || refreshing) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await reportsService.getReports({
        ...activeFilter,
        page,
        pageSize,
      });
      setReports(prev => [...prev, ...(response.data ?? [])]);
      setTotal(response.pagination?.totalItems ?? 0);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(isApiErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    setRefreshToken(prev => prev + 1);
  };

  const clearFilters = () => {
    setStatus('All');
    setCategoryId('All');
    setSearch('');
  };

  const categoryLabel =
    categoryId === 'All'
      ? 'All categories'
      : categories.find(category => category.id === categoryId)?.name ?? 'Category';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Staff Console</Text>
          <Text style={styles.title}>All citizen reports</Text>
          <Text style={styles.subtitle}>
            Review every report from the municipality, filter by status or category, and follow up faster.
          </Text>
        </View>

        <View style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by title"
              placeholderTextColor="#7D8CA3"
            />
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Status</Text>
          <FlatList
            data={STATUS_OPTIONS}
            horizontal
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[styles.chip, status === item && styles.chipActive]}
                onPress={() => setStatus(item)}>
                <Text style={[styles.chipText, status === item && styles.chipTextActive]}>
                  {STATUS_LABELS[item]}
                </Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.sectionLabel}>Category</Text>
              <Text style={styles.categoryValue}>{categoryLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setCategoryPickerVisible(true)}>
              <Text style={styles.pickerButtonText}>Pick</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && reports.length === 0 ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color="#5BC0BE" />
            <Text style={styles.stateText}>Loading reports...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>No reports found</Text>
            <Text style={styles.stateText}>
              Try clearing the filters or changing the search term.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={item => item.id}
            renderItem={({item}) => <ReportCard report={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5BC0BE" />
            }
            onEndReachedThreshold={0.5}
            onEndReached={loadMore}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color="#5BC0BE" />
                </View>
              ) : null
            }
          />
        )}
      </View>

      <Modal visible={categoryPickerVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setCategoryPickerVisible(false)}>
          <Pressable style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choose category</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setCategoryId('All');
                setCategoryPickerVisible(false);
              }}>
              <Text style={styles.modalOptionText}>All categories</Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.modalOption}
                onPress={() => {
                  setCategoryId(category.id);
                  setCategoryPickerVisible(false);
                }}>
                <Text style={styles.modalOptionText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#0D1B2A'},
  screen: {flex: 1, paddingHorizontal: 16, paddingTop: 8},
  header: {paddingVertical: 12},
  kicker: {color: '#5BC0BE', fontSize: 12, fontWeight: '700', letterSpacing: 1.2},
  title: {color: '#F8FAFC', fontSize: 28, fontWeight: '800', marginTop: 4},
  subtitle: {color: '#B8C4D6', marginTop: 8, lineHeight: 20},
  filtersCard: {
    backgroundColor: '#10233A',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  searchRow: {flexDirection: 'row', gap: 10, alignItems: 'center'},
  searchInput: {
    flex: 1,
    backgroundColor: '#17304C',
    color: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  clearButton: {
    backgroundColor: '#5BC0BE',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {color: '#0D1B2A', fontWeight: '800'},
  sectionLabel: {color: '#B8C4D6', marginTop: 14, marginBottom: 8, fontWeight: '700'},
  chipsRow: {gap: 8},
  chip: {
    backgroundColor: '#17304C',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  chipActive: {backgroundColor: '#5BC0BE'},
  chipText: {color: '#D7E2F0', fontWeight: '600'},
  chipTextActive: {color: '#0D1B2A'},
  categoryRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8},
  categoryInfo: {flex: 1},
  categoryValue: {color: '#F8FAFC', fontSize: 16, fontWeight: '700'},
  pickerButton: {
    backgroundColor: '#17304C',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerButtonText: {color: '#5BC0BE', fontWeight: '700'},
  listContent: {paddingBottom: 28},
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  statusPill: {backgroundColor: '#E2F8F7', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6},
  statusPillText: {color: '#0F766E', fontWeight: '700', fontSize: 12},
  cardCategory: {color: '#48607A', fontWeight: '700'},
  cardTitle: {fontSize: 18, color: '#0D1B2A', fontWeight: '800', marginTop: 12},
  cardDescription: {color: '#516173', marginTop: 8, lineHeight: 20},
  cardMeta: {marginTop: 12},
  cardMetaLabel: {color: '#7D8CA3', fontSize: 12},
  cardMetaValue: {color: '#0D1B2A', fontWeight: '700', marginTop: 2},
  cardFooter: {marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  cardFooterText: {color: '#7D8CA3', fontSize: 12, flex: 1},
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginBottom: 8},
  stateText: {color: '#B8C4D6', textAlign: 'center', lineHeight: 20},
  footerLoading: {paddingVertical: 18},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    maxHeight: '70%',
  },
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#0D1B2A', marginBottom: 12},
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D9E2EC',
  },
  modalOptionText: {color: '#0D1B2A', fontWeight: '600'},
});
