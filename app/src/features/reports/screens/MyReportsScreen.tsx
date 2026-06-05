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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {ErrorMessage, ReportCard} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {Colors, Spacing} from '../../../theme';
import {useLanguage} from '../../../i18n';
import {HomeStackParamList} from '../../../navigation/types';
import type {Report} from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'MyReports'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function MyReportsScreen(_props: Props) {
  const navigation = useNavigation<Nav>();
  const {t} = useLanguage();
  const mr = t.reports.myReports;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  async function loadReports() {
    if (!mountedRef.current) {
      return;
    }

    setError(null);
    try {
      const response = await reportsService.getMyReports();
      if (mountedRef.current) {
        setReports(response.items);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : mr.loadError,
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    loadReports().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
    // loadReports is defined inside the component and intentionally runs only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadReports().catch(() => {});
  }

  if (loading && reports.length === 0) {
    return (
      <View style={styles.center} testID="my-reports-loading">
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.centerText}>{mr.loading}</Text>
      </View>
    );
  }

  if (error && reports.length === 0) {
    return (
      <View style={styles.center} testID="my-reports-error">
        <ErrorMessage message={error} />
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadReports}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={mr.retryA11y}>
          <Text style={styles.retryLabel}>{mr.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root} testID="my-reports-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{mr.title}</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ReportCard
            report={item}
            onPress={() => navigation.navigate('ReportDetail', {reportId: item.id})}
            testID={`my-report-card-${item.id}`}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{mr.emptyTitle}</Text>
            <Text style={styles.emptyText}>{mr.emptySub}</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
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
