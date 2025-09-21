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
  const { notifications } = useData();
  
  // Get unread notification count from real data
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      {/* Left: App Name with Icon */}
      <View style={styles.leftSection}>
        <Ionicons 
          name="leaf-outline" 
          size={24} 
          color={theme.primary} 
          style={styles.appIcon}
        />
        <Text style={[styles.appTitle, { color: theme.primary }]}>
          {title}
        </Text>
      </View>

      {/* Right: Action Icons */}
      <View style={styles.rightSection}>
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
  appTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
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
});
