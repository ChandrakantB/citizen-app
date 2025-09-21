import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationsScreen() {
  const { notifications, markNotificationAsRead } = useData();
  const { theme, isDark } = useTheme();

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'report':
        router.back();
        setTimeout(() => router.push('/(tabs)/reports'), 100);
        break;
      case 'service':
        router.back();
        setTimeout(() => router.push('/(tabs)/services'), 100);
        break;
      case 'community':
        router.back();
        setTimeout(() => router.push('/(tabs)/explore'), 100);
        break;
      default:
        router.back();
        break;
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report':
        return 'document-text';
      case 'service':
        return 'construct';
      case 'community':
        return 'people';
      default:
        return 'information-circle';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: item.read ? theme.background : theme.cardBackground,
          borderLeftColor: item.read ? 'transparent' : theme.primary,
          borderLeftWidth: item.read ? 0 : 3,
        }
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.notificationIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={theme.primary} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationTitle, 
          { 
            color: theme.text,
            fontWeight: item.read ? '500' : '600'
          }
        ]}>
          {item.title}
        </Text>
        <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
          {getTimeAgo(item.timestamp)}
        </Text>
      </View>
      {!item.read && (
        <View style={styles.unreadIndicator}>
          <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
        </View>
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Notifications',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerRight: unreadCount > 0 ? () => (
            <TouchableOpacity 
              onPress={markAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={[styles.markAllText, { color: theme.primary }]}>
                Mark All Read
              </Text>
            </TouchableOpacity>
          ) : undefined,
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {notifications.length > 0 ? (
          <>
            {unreadCount > 0 && (
              <View style={[styles.headerInfo, { backgroundColor: `${theme.primary}10` }]}>
                <Text style={[styles.headerInfoText, { color: theme.primary }]}>
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.textSecondary}10` }]}>
              <Ionicons name="notifications-outline" size={48} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No notifications yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              You will see updates about your reports, services, and community activity here
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerInfo: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  headerInfoText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  markAllButton: {
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
