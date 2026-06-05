import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Lock} from 'phosphor-react-native';

import {ErrorMessage, LoadingButton} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {useAuth} from '../../../navigation/AuthContext';
import {storageService} from '../../../storage';
import {useLanguage} from '../../../i18n';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import {ReportDetailView} from '../components/ReportDetailView';
import {HomeStackParamList} from '../../../navigation/types';
import type {Report} from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReportDetail'>;

function isForbidden(err: unknown): boolean {
  return err instanceof ApiError && (err.statusCode === 403 || err.statusCode === 404);
}

function isNetworkError(err: unknown): boolean {
  return err instanceof ApiError && (err.statusCode === 0 || err.code === 'NETWORK_ERROR');
}

export default function ReportDetailScreen({route, navigation}: Props) {
  const {user} = useAuth();
  const {t} = useLanguage();
  const rd = t.reports.detail;
  const reportId = route.params.reportId;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [offline, setOffline] = useState(false);
  const mountedRef = useRef(false);
  const hasCachedRef = useRef(false);

  const hydrateFromCache = useCallback(async () => {
    try {
      const cached = await storageService.getReportDetailCache(reportId);
      if (cached && mountedRef.current) {
        setReport(cached);
        setOffline(false);
        setError(null);
        hasCachedRef.current = true;
      }
    } catch {
      // Cache read failures must never block the network fetch.
    }
  }, [reportId]);

  const loadReport = useCallback(async () => {
    setError(null);
    try {
      const data = await reportsService.getReport(reportId);

      if (!mountedRef.current) {
        return;
      }

      if (user && user.role === 'citizen' && data.createdById !== user.id) {
        setForbidden(true);
        setReport(null);
        storageService.clearReportDetailCache(reportId).catch(() => {});
        return;
      }

      setForbidden(false);
      setReport(data);
      setOffline(false);
      hasCachedRef.current = true;

      storageService.saveReportDetailCache(reportId, data).catch(() => {});
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }

      if (isForbidden(err)) {
        setForbidden(true);
        setReport(null);
        storageService.clearReportDetailCache(reportId).catch(() => {});
        return;
      }

      if (isNetworkError(err) && hasCachedRef.current) {
        setOffline(true);
        setError(null);
        return;
      }

      setError(
        err instanceof ApiError ? err.message : rd.loadError,
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [reportId, user, rd.loadError]);

  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        await hydrateFromCache();
      } catch {
        // non-fatal
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
      try {
        await loadReport();
      } catch {
        // loadReport handles its own errors
      }
    })();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, user?.id]);

  function goHome() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('HomeTab', {screen: 'Home'});
    }
  }

  if (forbidden) {
    return (
      <View style={styles.center} testID="report-detail-forbidden">
        <View style={styles.forbiddenIcon}>
          <Lock size={28} color={Colors.error} weight="regular" />
        </View>
        <Text style={styles.forbiddenTitle}>No tenés permisos</Text>
        <Text style={styles.forbiddenSub}>
          Este reporte pertenece a otro ciudadano. Volvé a Inicio para
          revisar tus propios reportes.
        </Text>
        <LoadingButton label="Volver a Inicio" onPress={goHome} />
      </View>
    );
  }

  if (loading && !report) {
    return (
      <View style={styles.center} testID="report-detail-loading">
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.centerText}>{rd.loading}</Text>
      </View>
    );
  }

  if (error && !report) {
    return (
      <View style={styles.center} testID="report-detail-error">
        <ErrorMessage message={error} />
        <LoadingButton label={rd.retry} onPress={loadReport} />
        <TouchableOpacity
          style={styles.softBackLink}
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Volver a Inicio">
          <Text style={styles.softBackLinkText}>Volver a Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <View style={styles.root} testID="report-detail-screen">
      <ReportDetailView report={report} offline={offline} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.marginPage,
    gap: Spacing.stackMd,
  },
  centerText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  forbiddenIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  forbiddenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  forbiddenSub: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: Spacing.stackSm,
  },
  softBackLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  softBackLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.outline,
  },
});
