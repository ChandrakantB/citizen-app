import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  showProfile?: boolean;
}

export default function CustomHeader({ 
  title = "Bin2Win", 
  showNotifications = true, 
  showSearch = true,
  showProfile = true 
}: HeaderProps) {
  const { theme, isDark } = useTheme();
  const { notifications, isOnline, syncWithBackend } = useData();
  
  // Get unread notification count from real data
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSyncPress = async () => {
    try {
      await syncWithBackend();
    } catch (error) {
      console.log('Manual sync failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      {/* Left: App Name with Icon + Network Status */}
      <View style={styles.leftSection}>
        <Ionicons 
          name="leaf-outline" 
          size={24} 
          color={theme.primary} 
          style={styles.appIcon}
        />
        <View style={styles.titleSection}>
          <Text style={[styles.appTitle, { color: theme.primary }]}>
            {title}
          </Text>
          {!isOnline && (
            <Text style={styles.offlineIndicator}>
              Offline Mode
            </Text>
          )}
        </View>
      </View>

      {/* Right: Action Icons + Sync Button */}
      <View style={styles.rightSection}>
        {!isOnline && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleSyncPress}
            accessibilityLabel="Sync with server"
          >
            <Ionicons 
              name="sync-outline" 
              size={22} 
              color="#f59e0b" 
            />
          </TouchableOpacity>
        )}

        {showSearch && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/Search')}
            accessibilityLabel="Search"
          >
            <Ionicons 
              name="search-outline" 
              size={22} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}

        {showNotifications && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/Notification')}
            accessibilityLabel="Notifications"
          >
            <Ionicons 
              name="notifications-outline" 
              size={22} 
              color={theme.text} 
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Profile"
          >
            <Ionicons 
              name="person-circle-outline" 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}

        {isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    marginRight: 8,
  },
  titleSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  offlineIndicator: {
    fontSize: 10,
    color: '#f59e0b',
    fontWeight: '500',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  onlineIndicator: {
    marginLeft: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
});
