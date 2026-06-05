import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {Bell} from 'phosphor-react-native';

import {EmptyState, ErrorMessage} from '../../../components';
import {notificationsService} from '../../../api/notificationsService';
import {useAuth} from '../../../navigation/AuthContext';
import {useLanguage} from '../../../i18n';
import {BorderRadius, Colors, Spacing} from '../../../theme';
import type {Notification} from '../../../types';
import type {AppTabParamList} from '../../../navigation/types';

type TabNav = BottomTabNavigationProp<AppTabParamList>;

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNav>();
  const {user} = useAuth();
  const {t} = useLanguage();
  const nt = t.notifications;

  const [items, setItems] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mountedRef = React.useRef(true);

  async function load() {
    if (!mountedRef.current) {
      return;
    }
    setError(null);
    try {
      const response = await notificationsService.getNotifications({pageSize: 50});
      if (!mountedRef.current) {
        return;
      }
      setItems(response.items);
    } catch {
      if (!mountedRef.current) {
        return;
      }
      setError(nt.loadError);
    } finally {
      if (!mountedRef.current) {
        return;
      }
      setLoading(false);
      setRefreshing(false);
    }
  }

  React.useEffect(() => {
    mountedRef.current = true;
    load().catch(() => {});
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    load().catch(() => {});
  }

  async function handleTap(notif: Notification) {
    // Optimistically mark as read
    setItems(prev =>
      prev.map(n => (n.id === notif.id ? {...n, isRead: true} : n)),
    );
    notificationsService.markAsRead(notif.id).catch(() => {});

    if (!notif.reportId) {
      return;
    }

    const isStaff = user?.role === 'staff';
    if (isStaff) {
      navigation.navigate('StaffTab', {
        screen: 'StaffReportDetail',
        params: {reportId: notif.reportId},
      } as never);
    } else {
      navigation.navigate('HomeTab', {
        screen: 'ReportDetail',
        params: {reportId: notif.reportId},
      } as never);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(t.dateLocale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <View style={styles.centered} testID="notifications-loading">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.root, {paddingTop: insets.top}]}
      testID="notifications-screen">
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <Text style={styles.title}>{nt.title}</Text>
      </View>

      {error ? (
        <View style={styles.centered}>
          <ErrorMessage message={error} />
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              load().catch(() => {});
            }}
            activeOpacity={0.8}>
            <Text style={styles.retryText}>{t.common.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <NotificationItem
              notif={item}
              onPress={() => handleTap(item)}
              formatDate={formatDate}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState
                Icon={Bell}
                title={nt.empty.title}
                subtitle={nt.empty.subtitle}
              />
            </View>
          }
          contentContainerStyle={
            items.length === 0 ? styles.emptyContainer : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          testID="notifications-list"
        />
      )}
    </View>
  );
}

// ── Item component ────────────────────────────────────────────────────────────

type NotificationItemProps = {
  notif: Notification;
  onPress: () => void;
  formatDate: (iso: string) => string;
};

function NotificationItem({notif, onPress, formatDate}: NotificationItemProps) {
  return (
    <TouchableOpacity
      style={[styles.item, notif.isRead ? styles.itemRead : styles.itemUnread]}
      onPress={onPress}
      activeOpacity={0.75}
      testID={`notif-item-${notif.id}`}>
      <View style={styles.dotCol}>
        {!notif.isRead && <View style={styles.unreadDot} testID={`notif-dot-${notif.id}`} />}
      </View>
      <View style={styles.itemBody}>
        <Text
          style={[styles.itemTitle, notif.isRead && styles.itemTitleRead]}
          numberOfLines={1}>
          {notif.title}
        </Text>
        <Text style={styles.itemMessage} numberOfLines={2}>
          {notif.message}
        </Text>
        <Text style={styles.itemDate}>{formatDate(notif.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.background},
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.marginPage,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.marginPage,
    paddingTop: 14,
    paddingBottom: 18,
  },
  title: {fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.3},
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  retryText: {fontSize: 14, fontWeight: '600', color: '#fff'},
  emptyContainer: {flex: 1},
  emptyWrap: {flex: 1, justifyContent: 'center'},
  listContent: {paddingBottom: 20},
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.marginPage,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outlineVariant,
    gap: 10,
  },
  itemRead: {backgroundColor: Colors.background},
  itemUnread: {backgroundColor: Colors.surfaceContainerLowest},
  dotCol: {width: 10, paddingTop: 6, alignItems: 'center'},
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  itemBody: {flex: 1},
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 3,
  },
  itemTitleRead: {fontWeight: '500', color: Colors.onSurfaceVariant},
  itemMessage: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 11,
    color: Colors.outline,
    fontVariant: ['tabular-nums'],
  },
});
