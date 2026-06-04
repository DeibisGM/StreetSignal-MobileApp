import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, BorderRadius, Spacing} from '../../theme';
import type {ReportUpdate} from '../../types';

interface CommentItemProps {
  update: ReportUpdate;
  testID?: string;
}

/** Single comment entry in a report's update thread. */
export function CommentItem({update, testID}: CommentItemProps) {
  const initials = update.createdByName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const timeLabel = new Date(update.createdAt).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={styles.container}
      testID={testID ?? `comment-${update.id}`}
      accessibilityRole="text"
      accessibilityLabel={`${update.createdByName}: ${update.message}`}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          update.isOfficial && styles.avatarOfficial,
        ]}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>

      {/* Bubble */}
      <View style={styles.bubble}>
        <View style={styles.bubbleHeader}>
          <Text style={styles.authorName}>{update.createdByName}</Text>
          {update.isOfficial ? (
            <View style={styles.officialBadge}>
              <Text style={styles.officialBadgeText}>Oficial</Text>
            </View>
          ) : null}
          <Text style={styles.timestamp}>{timeLabel}</Text>
        </View>
        <Text style={styles.message}>{update.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.stackMd,
    marginBottom: Spacing.stackMd,
    paddingHorizontal: Spacing.marginPage,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  avatarOfficial: {
    backgroundColor: Colors.primaryContainer,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  officialBadge: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  timestamp: {
    marginLeft: 'auto',
    fontSize: 11,
    color: Colors.outline,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.onSurface,
  },
});
