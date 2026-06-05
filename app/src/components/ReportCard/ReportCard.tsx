import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MapPin} from 'phosphor-react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import {StatusBadge} from '../StatusBadge';
import type {Report} from '../../types';

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
  testID?: string;
}

export function ReportCard({report, onPress, testID}: ReportCardProps) {
  const formattedDate = new Date(report.createdAt).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID ?? `report-card-${report.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Reporte: ${report.title}. Estado: ${report.status}`}>
      {/* Thumbnail */}
      <View style={styles.thumbnailWrapper}>
        {report.imageUrl ? (
          <Image
            source={{uri: report.imageUrl}}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityLabel="Foto del reporte"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MapPin size={24} color="#94A3B8" weight="light" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.category} numberOfLines={1}>{report.category}</Text>
          <View style={styles.status}>
            <StatusBadge status={report.status} />
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{report.title}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
  );
}

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
    padding: 14,
    justifyContent: 'center',
    gap: 5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  status: {
    flexShrink: 0,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});
