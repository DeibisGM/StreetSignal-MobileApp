import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Lock} from 'phosphor-react-native';

import {ErrorMessage, LoadingButton} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {useAuth} from '../../../navigation/AuthContext';
import {storageService} from '../../../storage';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import {ReportDetailView} from '../components/ReportDetailView';
import {HomeStackParamList} from '../../../navigation/types';
import type {Report} from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReportDetail'>;

/**
 * The server tells us "this isn't your report" via either a 403 (auth ok,
 * ownership missing) or a 404 (don't reveal it exists). Both should land
 * on the same "no tenés permisos" screen from the citizen's perspective.
 */
function isForbidden(err: unknown): boolean {
  return err instanceof ApiError && (err.statusCode === 403 || err.statusCode === 404);
}

function isNetworkError(err: unknown): boolean {
  return err instanceof ApiError && (err.statusCode === 0 || err.code === 'NETWORK_ERROR');
}

export default function ReportDetailScreen({route, navigation}: Props) {
  const {user} = useAuth();
  const reportId = route.params.reportId;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [offline, setOffline] = useState(false);
  const mountedRef = useRef(false);
  /**
   * Tracks whether we already had a report on screen when the refresh
   * kicked off. Used to decide between "loading spinner" and "soft
   * background refresh" so the cached view stays visible.
   */
  const hasCachedRef = useRef(false);

  /**
   * Pull the cached detail (if any) from AsyncStorage. Synchronously
   * seeds the screen state so the citizen sees their last view
   * instantly, even before the first network byte arrives.
   */
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

      // Permission check: a citizen may only see reports they own.
      // The API should already enforce this, but we double-check so a
      // misconfigured backend or a stale link can't leak another
      // citizen's data.
      if (user && user.role === 'citizen' && data.createdById !== user.id) {
        setForbidden(true);
        setReport(null);
        // Drop the (potentially sensitive) cached copy.
        storageService.clearReportDetailCache(reportId).catch(() => {});
        return;
      }

      setForbidden(false);
      setReport(data);
      setOffline(false);
      hasCachedRef.current = true;

      // Persist for the next visit. Fire-and-forget; the UI is already
      // showing the fresh data.
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

      // Network problem + we already had a cached view → show it
      // with the offline banner instead of a hard error.
      if (isNetworkError(err) && hasCachedRef.current) {
        setOffline(true);
        setError(null);
        return;
      }

      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar el detalle del reporte.',
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [reportId, user]);

  useEffect(() => {
    mountedRef.current = true;

    // Sequence matters: we hydrate the cache *first*, then kick off
    // the network refresh. That way the API failure handler can look
    // at `hasCachedRef` and decide between "show offline banner" and
    // "show hard error" without a race.
    (async () => {
      try {
        await hydrateFromCache();
      } catch {
        // Cache read failures are non-fatal — the API call still runs.
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
      try {
        await loadReport();
      } catch {
        // loadReport handles its own errors; this catch is just so an
        // unhandled promise rejection doesn't surface.
      }
    })();

    return () => {
      mountedRef.current = false;
    };
    // hydrateFromCache & loadReport are recreated on each render via
    // useCallback([reportId, user]); route.params.reportId and the
    // logged-in user id are the only inputs that should trigger a
    // re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, user?.id]);

  function goHome() {
    // Pop back to Home. We deliberately avoid `navigation.popTo('Home')`
    // because the citizen might have arrived here from MyReports instead.
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    // No back stack (e.g. deep-linked in): jump to the Home tab.
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
        <Text style={styles.centerText}>Cargando reporte...</Text>
      </View>
    );
  }

  if (error && !report) {
    return (
      <View style={styles.center} testID="report-detail-error">
        <ErrorMessage message={error} />
        <LoadingButton label="Reintentar" onPress={loadReport} />
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
      <ReportDetailView
        report={report}
        offline={offline}
        onBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            goHome();
          }
        }}
      />
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
