import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppTextInput,
  ErrorMessage,
  LoadingButton,
  StatusBadge,
  SuccessToast,
} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {ApiError} from '../../../api/types';
import {REPORT_STATUSES} from '../../../constants';
import {Colors, BorderRadius, Spacing} from '../../../theme';
import {useLanguage} from '../../../i18n';
import {StaffStackParamList} from '../../../navigation/types';
import type {Report, ReportStatus} from '../../../types';
import {ReportDetailView} from '../../reports/components/ReportDetailView';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffReportDetail'>;

const MESSAGE_MAX_LENGTH = 500;

function isValidStatus(value: ReportStatus | null): value is ReportStatus {
  return value !== null && REPORT_STATUSES.includes(value);
}

export default function StaffReportDetailScreen({route}: Props) {
  const {t} = useLanguage();
  const sd = t.staff.detail;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | null>(
    null,
  );
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const mountedRef = useRef(false);

  async function loadReport() {
    setLoading(true);
    setScreenError(null);
    try {
      const data = await reportsService.getReport(route.params.reportId);
      if (mountedRef.current) {
        setReport(data);
        setSelectedStatus(data.status);
      }
    } catch (err) {
      if (mountedRef.current) {
        setScreenError(
          err instanceof ApiError
            ? err.message
            : sd.loadError,
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
    // loadReport is recreated on each render, so we intentionally run only once per route id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.reportId]);

  async function refreshAfterAction() {
    await loadReport();
  }

  async function handleSubmit() {
    if (!report || submitting) {
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setActionError(sd.errors.messageEmpty);
      return;
    }
    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      setActionError(sd.errors.messageTooLong);
      return;
    }
    if (!isValidStatus(selectedStatus)) {
      setActionError(sd.errors.invalidStatus);
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      if (selectedStatus !== report.status) {
        await reportsService.updateReportStatus(report.id, {
          newStatus: selectedStatus,
          message: trimmedMessage,
        });
        setToastMessage(sd.success.statusUpdated);
      } else {
        await reportsService.addReportUpdate(report.id, {
          message: trimmedMessage,
        });
        setToastMessage(sd.success.commentAdded);
      }

      setMessage('');
      await refreshAfterAction();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : sd.errors.updateFailed,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !report) {
    return (
      <View style={styles.center} testID="staff-report-detail-loading">
        <Text style={styles.centerText}>{sd.loading}</Text>
      </View>
    );
  }

  if (screenError && !report) {
    return (
      <View style={styles.center} testID="staff-report-detail-error">
        <ErrorMessage message={screenError} />
        <LoadingButton label={sd.retry} onPress={loadReport} />
      </View>
    );
  }

  if (!report) {
    return null;
  }

  const isBusy = loading || submitting;

  return (
    <View style={styles.root} testID="staff-report-detail-screen">
      <SuccessToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />

      <ReportDetailView report={report}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{sd.actionsTitle}</Text>
          <Text style={styles.panelSubtitle}>{sd.actionsHint}</Text>

          <View style={styles.currentStatusRow}>
            <Text style={styles.currentStatusLabel}>{sd.currentStatus}</Text>
            <StatusBadge status={report.status} />
          </View>

          <View style={styles.selectorGrid}>
            {REPORT_STATUSES.map(status => {
              const selected = selectedStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.selectorChip,
                    selected && styles.selectorChipSelected,
                  ]}
                  onPress={() => {
                    if (isBusy) {
                      return;
                    }
                    setSelectedStatus(status);
                    setActionError(null);
                  }}
                  disabled={isBusy}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{selected, disabled: isBusy}}
                  accessibilityLabel={t.statusLabels[status] ?? status}
                  testID={`status-option-${status}`}>
                  <StatusBadge status={status} />
                </TouchableOpacity>
              );
            })}
          </View>

          <AppTextInput
            label={sd.messageLabel}
            placeholder={sd.messagePlaceholder}
            value={message}
            onChangeText={text => {
              setMessage(text);
              if (actionError) {
                setActionError(null);
              }
            }}
            editable={!isBusy}
            multiline
            numberOfLines={4}
            maxLength={MESSAGE_MAX_LENGTH}
            helperText={sd.messageHint}
            testID="staff-message-input"
          />

          <ErrorMessage message={actionError} testID="staff-action-error" />

          <LoadingButton
            label={sd.submitButton}
            onPress={handleSubmit}
            loading={submitting}
            disabled={loading}
            testID="staff-update-button"
          />
        </View>
      </ReportDetailView>
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
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: Spacing.gutter,
    gap: Spacing.stackMd,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  panelSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  selectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorChip: {
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 2,
  },
  selectorChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF4FF',
  },
});
