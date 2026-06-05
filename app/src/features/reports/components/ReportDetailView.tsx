import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ArrowLeft, ImageBroken, MapPin, WifiSlash} from 'phosphor-react-native';

import {StatusBadge, UpdateTimelineItem} from '../../../components';
import {Colors, BorderRadius, Spacing} from '../../../theme';
import {formatDate, statusLabel} from '../../../utils';
import type {Report} from '../../../types';

interface ReportDetailViewProps {
  report: Report;
  children?: React.ReactNode;
  testID?: string;
  /**
   * When true, the user is looking at the cached version of the report
   * because the network call failed. Renders a non-blocking banner so
   * they know the data might be stale.
   */
  offline?: boolean;
  /**
   * If provided, a floating "Volver" button is rendered on top of the
   * hero image. Wired to the parent's `navigation.goBack` (or whatever
   * the parent considers "back").
   */
  onBack?: () => void;
  testIDBackButton?: string;
  testIDOfflineBanner?: string;
}

export function ReportDetailView({
  report,
  children,
  testID,
  offline = false,
  onBack,
  testIDBackButton,
  testIDOfflineBanner,
}: ReportDetailViewProps) {
  const [imgError, setImgError] = React.useState(false);
  const updates = report.updates ?? [];
  const showImage = !!report.imageUrl && !imgError;

  return (
    <View style={styles.root}>
      {offline ? (
        <View
          style={styles.offlineBanner}
          testID={testIDOfflineBanner ?? 'report-detail-offline-banner'}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          <WifiSlash size={15} color="#92400E" weight="fill" />
          <Text style={styles.offlineText}>
            Modo offline — mostrando la última versión guardada.
          </Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID={testID ?? 'report-detail-view'}>
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            {showImage ? (
              <Image
                source={{uri: report.imageUrl}}
                style={styles.image}
                resizeMode="cover"
                accessibilityLabel="Foto del reporte"
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <ImageBroken size={32} color={Colors.outlineVariant} weight="light" />
                <Text style={styles.imagePlaceholderText}>
                  {imgError ? 'No se pudo cargar la imagen' : 'Sin foto'}
                </Text>
              </View>
            )}

            {onBack ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Volver"
                testID={testIDBackButton ?? 'report-detail-back-button'}>
                <ArrowLeft size={18} color="#fff" weight="bold" />
              </TouchableOpacity>
            ) : null}
          </View>

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
              <View style={styles.addressRow}>
                <MapPin size={13} color={Colors.onSurfaceVariant} weight="fill" />
                <Text style={styles.address}>{report.address}</Text>
              </View>
            ) : null}

            {report.latitude !== null && report.longitude !== null ? (
              <Text style={styles.coords}>
                {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
              </Text>
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
            <View style={styles.timelineList} testID="report-detail-timeline">
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingVertical: 8,
    paddingHorizontal: Spacing.marginPage,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
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
  imageWrap: {
    position: 'relative',
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
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  coords: {
    fontSize: 11,
    color: Colors.outline,
    fontVariant: ['tabular-nums'],
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
