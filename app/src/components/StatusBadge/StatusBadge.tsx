import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BorderRadius} from '../../theme';
import {REPORT_STATUS_LABELS} from '../../constants';
import type {ReportStatus} from '../../types';

interface StatusBadgeProps {
  status: ReportStatus;
  /** 'default' = compact pill. 'prominent' = larger, bolder, more eye-catching. */
  size?: 'default' | 'prominent';
  testID?: string;
}

type StatusStyle = {bg: string; color: string};

const STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  Pending:    {bg: '#FEF3C7', color: '#B45309'},
  InReview:   {bg: '#DBEAFE', color: '#1D4ED8'},
  Assigned:   {bg: '#EDE9FE', color: '#6D28D9'},
  InProgress: {bg: '#FFEDD5', color: '#C2410C'},
  Resolved:   {bg: '#DCFCE7', color: '#15803D'},
  Rejected:   {bg: '#FEE2E2', color: '#DC2626'},
};

export function StatusBadge({status, size = 'default', testID}: StatusBadgeProps) {
  const {bg, color} = STATUS_STYLES[status] ?? STATUS_STYLES.Pending;
  const label = REPORT_STATUS_LABELS[status] ?? status;
  const prominent = size === 'prominent';

  return (
    <View
      testID={testID ?? `status-badge-${status}`}
      accessibilityLabel={`Estado: ${label}`}
      style={[
        prominent ? styles.pillProminent : styles.pill,
        {backgroundColor: bg},
      ]}>
      <View
        style={[
          prominent ? styles.dotProminent : styles.dot,
          {backgroundColor: color},
        ]}
      />
      <Text
        style={[
          prominent ? styles.labelProminent : styles.label,
          {color},
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 5,
  },
  pillProminent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotProminent: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelProminent: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
});
