import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import {StatusBadge} from '../StatusBadge';
import {REPORT_STATUS_LABELS} from '../../constants';
import type {ReportUpdate} from '../../types';

interface UpdateTimelineItemProps {
  update: ReportUpdate;
  /** True if this is the last item in the list (hides the connector line) */
  isLast?: boolean;
  testID?: string;
}

/**
 * Timeline entry for a report activity log.
 * Status changes show old -> new badge transitions;
 * comments and system messages show plain text.
 */
export function UpdateTimelineItem({
  update,
  isLast = false,
  testID,
}: UpdateTimelineItemProps) {
  const timeLabel = new Date(update.createdAt).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isStatusChange = update.type === 'status_change';
  const contentStyle = [
    styles.content,
    update.isOfficial && styles.contentOfficial,
  ];

  return (
    <View
      style={styles.container}
      testID={testID ?? `timeline-item-${update.id}`}
      accessibilityRole="text">
      <View style={styles.connectorCol}>
        <View
          style={[
            styles.dot,
            isStatusChange ? styles.dotStatusChange : styles.dotComment,
          ]}
        />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={contentStyle}>
        <View style={styles.header}>
          <Text style={styles.author}>{update.createdByName}</Text>
          {update.isOfficial ? (
            <View style={styles.officialBadge}>
              <Text style={styles.officialBadgeText}>Oficial</Text>
            </View>
          ) : null}
          <Text style={styles.time}>{timeLabel}</Text>
        </View>

        {isStatusChange && update.oldStatus && update.newStatus ? (
          <View style={styles.statusRow}>
            <StatusBadge status={update.oldStatus} />
            <Text style={styles.arrow}>→</Text>
            <StatusBadge status={update.newStatus} />
          </View>
        ) : null}

        {update.message ? (
          <Text style={styles.message}>{update.message}</Text>
        ) : null}

        {update.type === 'system' && !update.message ? (
          <Text style={styles.systemText}>
            Estado actualizado a{' '}
            {update.newStatus
              ? REPORT_STATUS_LABELS[update.newStatus] ?? update.newStatus
              : '—'}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: Spacing.marginPage,
    paddingRight: Spacing.marginPage,
    minHeight: 56,
    alignItems: 'flex-start',
  },
  connectorCol: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.stackMd,
    flexShrink: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  dotStatusChange: {
    backgroundColor: Colors.primary,
  },
  dotComment: {
    backgroundColor: Colors.outline,
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: Colors.outlineVariant,
    marginTop: 4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingBottom: Spacing.stackMd,
    gap: 6,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  contentOfficial: {
    backgroundColor: '#F8FBFF',
    borderColor: '#D6E7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    flexShrink: 1,
    minWidth: 0,
  },
  officialBadge: {
    backgroundColor: Colors.primaryFixed,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 11,
    color: Colors.outline,
    marginLeft: 0,
    flexShrink: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  arrow: {
    fontSize: 14,
    color: Colors.outline,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    flexShrink: 1,
  },
  systemText: {
    fontSize: 13,
    color: Colors.outline,
    fontStyle: 'italic',
    flexShrink: 1,
  },
});
