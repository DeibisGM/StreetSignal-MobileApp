import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, ImageBroken, MapPin} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import {REPORT_STATUS_LABELS} from '../../constants';
import {formatDate} from '../../utils';
import type {Report, ReportStatus} from '../../types';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
  testID?: string;
}

export function ReportCard({report, onPress, testID}: ReportCardProps) {
  const dateStr = formatDate(report.createdAt);
  const statusStyle = STATUS_STYLES[report.status] ?? STATUS_STYLES.Pending;
  const statusLabel = REPORT_STATUS_LABELS[report.status] ?? report.status;
  const hasLocation = !!(report.address || (report.latitude && report.longitude));
  const showImage = !!report.imageUrl;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID ?? `report-card-${report.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Reporte: ${report.title}. Estado: ${report.status}`}>
      <View style={styles.thumbnailWrapper}>
        {showImage ? (
          <Image
            source={{uri: report.imageUrl}}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityLabel="Foto del reporte"
            onError={() => {}}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            {report.imageUrl ? (
              <ImageBroken size={24} color="#94A3B8" weight="light" />
            ) : (
              <Camera size={24} color="#94A3B8" weight="light" />
            )}
          </View>
        )}
        <View style={[styles.status, {backgroundColor: statusStyle.bg}]}>
          <Text style={[styles.statusText, {color: statusStyle.color}]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {report.category}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {report.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {report.createdByName}
        </Text>
        {hasLocation ? (
          <View style={styles.locationRow}>
            <MapPin size={11} color={Colors.onSurfaceVariant} weight="fill" />
            <Text style={styles.locationText} numberOfLines={1}>
              {report.address ?? 'Con ubicación'}
            </Text>
          </View>
        ) : null}
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

type StatusStyle = {bg: string; color: string};

const STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  Pending: {bg: '#FEF3C7', color: '#B45309'},
  InReview: {bg: '#DBEAFE', color: '#1D4ED8'},
  Assigned: {bg: '#EDE9FE', color: '#6D28D9'},
  InProgress: {bg: '#FFEDD5', color: '#C2410C'},
  Resolved: {bg: '#DCFCE7', color: '#15803D'},
  Rejected: {bg: '#FEE2E2', color: '#DC2626'},
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xxl,
    marginHorizontal: Spacing.marginPage,
    marginBottom: Spacing.stackMd,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    width: 96,
    alignSelf: 'stretch',
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 15,
    justifyContent: 'flex-start',
    gap: 8,
  },
  category: {
    width: '100%',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 14,
    textAlign: 'left',
  },
  status: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 26,
    borderRadius: 0,
    paddingHorizontal: 8,
    paddingVertical: 0,
    overflow: 'hidden',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  author: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    flex: 1,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  date: {
    fontSize: 11,
    color: Colors.outline,
    lineHeight: 16,
    marginTop: 1,
  },
});