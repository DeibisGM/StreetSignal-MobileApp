import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {MapPin} from 'phosphor-react-native';

import {StatusBadge, UpdateTimelineItem} from '../../../components';
import {Colors, BorderRadius, Spacing} from '../../../theme';
import {formatDate, statusLabel} from '../../../utils';
import type {Report} from '../../../types';

interface ReportDetailViewProps {
  report: Report;
  children?: React.ReactNode;
  testID?: string;
}

export function ReportDetailView({
  report,
  children,
  testID,
}: ReportDetailViewProps) {
  const updates = report.updates ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      testID={testID ?? 'report-detail-view'}>
      <View style={styles.card}>
        {report.imageUrl ? (
          <Image
            source={{uri: report.imageUrl}}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="Foto del reporte"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MapPin size={28} color={Colors.primary} weight="light" />
            <Text style={styles.imagePlaceholderText}>Sin foto</Text>
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{report.category}</Text>
            <StatusBadge status={report.status} />
          </View>

          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.meta}>
            Reporte creado por {report.createdByName}
          </Text>
          <Text style={styles.meta}>{formatDate(report.createdAt)}</Text>

          {report.address ? (
            <Text style={styles.address}>{report.address}</Text>
          ) : null}

          <Text style={styles.description}>{report.description}</Text>
          <Text style={styles.statusHint}>
            Estado actual: {statusLabel(report.status)}
          </Text>
        </View>
      </View>

      {children ? <View style={styles.panelSlot}>{children}</View> : null}

      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Historial</Text>
        {updates.length ? (
          <View style={styles.timelineList}>
            {updates.map((update, index) => (
              <UpdateTimelineItem
                key={update.id}
                update={update}
                isLast={index === updates.length - 1}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Todavía no hay actualizaciones registradas.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.marginPage,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackXl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 210,
    backgroundColor: '#E2E8F0',
  },
  imagePlaceholder: {
    width: '100%',
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  cardBody: {
    padding: Spacing.gutter,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  category: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: Colors.onSurface,
  },
  meta: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  address: {
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  statusHint: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  panelSlot: {
    marginTop: Spacing.stackLg,
  },
  timelineSection: {
    marginTop: Spacing.stackXl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.stackMd,
  },
  timelineList: {
    gap: Spacing.stackSm,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
});
