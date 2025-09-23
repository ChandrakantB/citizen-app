import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
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
  const { notifications, isOnline, syncWithBackend, user } = useData();
  
  // Get unread notification count from real data
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSyncPress = async () => {
    try {
      await syncWithBackend();
    } catch (error) {
      console.log('Manual sync failed:', error);
    }
  };

  const handleProfilePress = () => {
    console.log('🔄 Navigating to profile...');
    try {
      router.push('/profile');
    } catch (error) {
      console.error('Profile navigation error:', error);
      Alert.alert('Error', 'Could not open profile. Please restart the app.');
    }
  };

  // ✅ FIXED: Better notification handling
  const handleNotificationsPress = () => {
    console.log('🔔 Notifications pressed - Total:', notifications.length, 'Unread:', unreadCount);
    
    try {
      // Try to navigate to notifications screen first
      router.push('/notification');
    } catch (error) {
      console.log('❌ Notifications navigation failed:', error);
      
      // ✅ FALLBACK: Show notification info without confusing alerts
      if (notifications.length > 0) {
        const latestNotification = notifications[0];
        if (Platform.OS === 'web') {
          alert(`Latest Notification:\n\n${latestNotification.title}\n${latestNotification.message}`);
        } else {
          Alert.alert(
            latestNotification.title, 
            latestNotification.message,
            [{ text: 'OK' }]
          );
        }
      } else {
        if (Platform.OS === 'web') {
          alert('No notifications yet');
        } else {
          Alert.alert('Notifications', 'No new notifications', [{ text: 'OK' }]);
        }
      }
    }
  };

  const handleSearchPress = () => {
    if (Platform.OS === 'web') {
      alert('Search feature coming soon!');
    } else {
      Alert.alert('Search', 'Search feature coming soon!', [{ text: 'OK' }]);
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

      {/* Right: Action Icons */}
      <View style={styles.rightSection}>
        {/* Sync Button (only when offline) */}
        {!isOnline && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}
            onPress={handleSyncPress}
            accessibilityLabel="Sync with server"
          >
            <Ionicons 
              name="sync-outline" 
              size={20} 
              color="#f59e0b" 
            />
          </TouchableOpacity>
        )}

        {/* Search Button */}
        {showSearch && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]}
            onPress={handleSearchPress}
            accessibilityLabel="Search"
          >
            <Ionicons 
              name="search-outline" 
              size={20} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}

        {/* Notifications Button */}
        {showNotifications && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.background }]}
            onPress={handleNotificationsPress}
            accessibilityLabel="Notifications"
          >
            <Ionicons 
              name="notifications-outline" 
              size={20} 
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

        {/* Profile Button */}
        {showProfile && (
          <TouchableOpacity 
            style={[styles.iconButton, styles.profileButton]}
            onPress={handleProfilePress}
            accessibilityLabel="Profile"
          >
            <View style={styles.profileIconContainer}>
              <Ionicons 
                name="person-circle-outline" 
                size={24} 
                color={theme.text} 
              />
              {user?.name && (
                <View style={styles.userIndicator}>
                  <Text style={[styles.userInitial, { color: theme.primary }]}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Online Status Indicator */}
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
    gap: 6,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    position: 'relative',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  profileIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInitial: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
});
