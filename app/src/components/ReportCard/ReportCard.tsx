import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, ImageBroken, MapPin} from 'phosphor-react-native';
import {Colors, Spacing} from '../../theme';
import {REPORT_STATUS_LABELS} from '../../constants';
import {parseUTCDate} from '../../utils';
import type {Report, ReportStatus} from '../../types';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
  testID?: string;
}

function relativeDate(iso: string): string {
  const date = parseUTCDate(iso);
  const now = new Date();

  // Compare calendar days in LOCAL time to avoid timezone-shifted day boundaries.
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((todayStart - dateStart) / 86_400_000);

  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) {
    const w = Math.floor(diff / 7);
    return `Hace ${w} semana${w > 1 ? 's' : ''}`;
  }
  return date.toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function ReportCard({report, onPress, testID}: ReportCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const statusStyle = STATUS_STYLES[report.status] ?? STATUS_STYLES.Pending;
  const statusLabel = REPORT_STATUS_LABELS[report.status] ?? report.status;
  const dateStr = relativeDate(report.createdAt);
  const hasLocation = !!(report.address || (report.latitude && report.longitude));

  const showImage = !!report.imageUrl && !imgError;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.78}
      testID={testID ?? `report-card-${report.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Reporte: ${report.title}. Estado: ${statusLabel}`}>

      {/* ── Thumbnail ───────────────────────── */}
      <View style={styles.thumb}>
        {showImage ? (
          <Image
            source={{uri: report.imageUrl}}
            style={styles.thumbImg}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.thumbPlaceholder, {backgroundColor: statusStyle.dimBg}]}>
            {imgError ? (
              <ImageBroken size={20} color={statusStyle.dimColor} weight="light" />
            ) : (
              <Camera size={20} color={statusStyle.dimColor} weight="light" />
            )}
          </View>
        )}
      </View>

      {/* ── Body ────────────────────────────── */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.category} numberOfLines={1}>{report.category}</Text>
          <View style={[styles.badge, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.badgeText, {color: statusStyle.color}]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{report.title}</Text>

        {hasLocation && (
          <View style={styles.locationRow}>
            <MapPin size={11} color={Colors.onSurfaceVariant} weight="fill" />
            <Text style={styles.locationText} numberOfLines={1}>
              {report.address ?? 'Con ubicación'}
            </Text>
          </View>
        )}

        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </TouchableOpacity>
  );
}

type StatusStyle = {
  bg: string;
  color: string;
  dimBg: string;
  dimColor: string;
};

const STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  Pending:    {bg: '#FEF3C7', color: '#92400E', dimBg: '#FFFBEB', dimColor: '#D97706'},
  InReview:   {bg: '#DBEAFE', color: '#1E40AF', dimBg: '#EFF6FF', dimColor: '#3B82F6'},
  Assigned:   {bg: '#EDE9FE', color: '#5B21B6', dimBg: '#F5F3FF', dimColor: '#8B5CF6'},
  InProgress: {bg: '#FFEDD5', color: '#C2410C', dimBg: '#FFF7ED', dimColor: '#F97316'},
  Resolved:   {bg: '#DCFCE7', color: '#166534', dimBg: '#F0FDF4', dimColor: '#22C55E'},
  Rejected:   {bg: '#FEE2E2', color: '#DC2626', dimBg: '#FEF2F2', dimColor: '#F87171'},
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: Spacing.marginPage,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    overflow: 'hidden',
  },
  thumb: {
    width: 80,
  },
  thumbImg: {
    flex: 1,
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 19,
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
    marginTop: 1,
  },
});
