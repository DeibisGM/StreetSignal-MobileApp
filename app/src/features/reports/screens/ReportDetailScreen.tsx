import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ErrorMessage, LoadingButton} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {Colors, Spacing} from '../../../theme';
import {ReportDetailView} from '../components/ReportDetailView';
import {HomeStackParamList} from '../../../navigation/types';
import type {Report} from '../../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReportDetail'>;

export default function ReportDetailScreen({route}: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getReport(route.params.reportId);
      if (mountedRef.current) {
        setReport(data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudo cargar el detalle del reporte.',
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    loadReport().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
    // The route id is the only thing that should trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.reportId]);

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
      </View>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <View style={styles.root} testID="report-detail-screen">
      <ReportDetailView report={report} />
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
});
