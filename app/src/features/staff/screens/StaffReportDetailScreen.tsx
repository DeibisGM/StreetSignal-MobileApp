import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppTextInput,
  ErrorMessage,
  LoadingButton,
  StatusBadge,
  SuccessToast,
} from '../../../components';
import {reportsService} from '../../../api/reportsService';
import {usersService, type StaffUser} from '../../../api/usersService';
import {ApiError} from '../../../api/types';
import {REPORT_STATUSES} from '../../../constants';
import {Colors, BorderRadius, Spacing} from '../../../theme';
import {priorityLabel, statusLabel} from '../../../utils';
import {StaffStackParamList} from '../../../navigation/types';
import type {Report, ReportPriority, ReportStatus} from '../../../types';
import {ReportDetailView} from '../../reports/components/ReportDetailView';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffReportDetail'>;

const MESSAGE_MAX_LENGTH = 500;
const REPORT_PRIORITIES: ReportPriority[] = ['Low', 'Medium', 'High', 'Critical'];

function isValidStatus(value: ReportStatus | null): value is ReportStatus {
  return value !== null && REPORT_STATUSES.includes(value);
}

export default function StaffReportDetailScreen({route}: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<ReportPriority | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
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
        setSelectedPriority(data.priority ?? null);
        setSelectedAssigneeId(data.assignedToId ?? null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setScreenError(
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

  async function loadStaff() {
    setLoadingStaff(true);
    try {
      const staff = await usersService.getStaffUsers();
      if (mountedRef.current) {
        setStaffMembers(staff);
      }
    } catch {
      if (mountedRef.current) {
        setStaffMembers([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingStaff(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    loadReport().catch(() => {});
    loadStaff().catch(() => {});

    return () => {
      mountedRef.current = false;
    };
    // loadReport/loadStaff are recreated on render; run once per route id.
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
      setActionError('El mensaje no puede estar vacio.');
      return;
    }
    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      setActionError('El mensaje no puede exceder 500 caracteres.');
      return;
    }
    if (!isValidStatus(selectedStatus)) {
      setActionError('Selecciona un estado valido.');
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const hasChange =
        selectedStatus !== report.status ||
        selectedPriority !== (report.priority ?? null) ||
        selectedAssigneeId !== (report.assignedToId ?? null);

      if (hasChange) {
        await reportsService.updateReportStatus(report.id, {
          newStatus: selectedStatus,
          priority: selectedPriority,
          assignedToId: selectedAssigneeId,
          message: trimmedMessage,
        });
        setToastMessage('Reporte actualizado correctamente.');
      } else {
        await reportsService.addReportUpdate(report.id, {
          message: trimmedMessage,
        });
        setToastMessage('Comentario agregado correctamente.');
      }

      setMessage('');
      await refreshAfterAction();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'No se pudo actualizar el reporte.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !report) {
    return (
      <View style={styles.center} testID="staff-report-detail-loading">
        <Text style={styles.centerText}>Cargando detalle...</Text>
      </View>
    );
  }

  if (screenError && !report) {
    return (
      <View style={styles.center} testID="staff-report-detail-error">
        <ErrorMessage message={screenError} />
        <LoadingButton label="Reintentar" onPress={loadReport} />
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
          <Text style={styles.panelTitle}>Acciones de staff</Text>
          <Text style={styles.panelSubtitle}>
            El cambio de estado, prioridad y encargado queda registrado en la
            linea de tiempo.
          </Text>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Prioridad actual</Text>
              <Text style={styles.summaryValue}>
                {report.priority ? priorityLabel(report.priority) : 'Sin prioridad'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Encargado actual</Text>
              <Text style={styles.summaryValue}>
                {report.assignedTo?.fullName ?? report.assignedToName ?? 'Sin asignar'}
              </Text>
            </View>
          </View>

          <Text style={styles.selectorLabel}>Cambiar estado a</Text>
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
                  accessibilityLabel={statusLabel(status)}
                  testID={`status-option-${status}`}>
                  <StatusBadge status={status} />
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.selectorLabel}>Cambiar prioridad</Text>
          <View style={styles.selectorGrid}>
            {REPORT_PRIORITIES.map(priority => {
              const selected = selectedPriority === priority;
              return (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.selectorChip,
                    selected && styles.selectorChipSelected,
                  ]}
                  onPress={() => {
                    if (isBusy) {
                      return;
                    }
                    setSelectedPriority(priority);
                    setActionError(null);
                  }}
                  disabled={isBusy}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{selected, disabled: isBusy}}
                  accessibilityLabel={priorityLabel(priority)}
                  testID={`priority-option-${priority}`}>
                  <Text style={styles.priorityChipText}>
                    {priorityLabel(priority)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.selectorLabel}>Encargado de staff</Text>
          <View style={styles.staffList}>
            {loadingStaff ? (
              <View style={styles.staffLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.panelSubtitle}>Cargando staff...</Text>
              </View>
            ) : staffMembers.length ? (
              staffMembers.map(staff => {
                const selected = selectedAssigneeId === staff.id;
                return (
                  <TouchableOpacity
                    key={staff.id}
                    style={[
                      styles.staffChip,
                      selected && styles.staffChipSelected,
                    ]}
                    onPress={() => {
                      if (isBusy) {
                        return;
                      }
                      setSelectedAssigneeId(staff.id);
                      setActionError(null);
                    }}
                    disabled={isBusy}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{selected, disabled: isBusy}}
                    accessibilityLabel={staff.fullName}
                    testID={`staff-option-${staff.id}`}>
                    <Text style={styles.staffChipText}>{staff.fullName}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.panelSubtitle}>No hay staff disponible.</Text>
            )}
          </View>

          <AppTextInput
            label="Mensaje"
            placeholder="Describe el avance o la razon del cambio"
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
            helperText="Obligatorio. Maximo 500 caracteres."
            testID="staff-message-input"
          />

          <ErrorMessage message={actionError} testID="staff-action-error" />

          <LoadingButton
            label="Actualizar"
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    padding: 12,
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
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
    borderColor: '#CBD5E1',
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  selectorChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF4FF',
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  staffLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staffChip: {
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  staffChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF4FF',
  },
  staffChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
