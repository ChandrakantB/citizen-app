import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logoutUser, loading } = useData();
  const styles = createStyles(theme);

  // Don't navigate immediately - wait for data to load
  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated AND loading is complete
    if (!loading && !user) {
      // Use setTimeout to ensure the component is fully mounted
      setTimeout(() => {
        router.replace('/(auth)/welcome');
      }, 100);
    }
  }, [user, loading]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              // Use setTimeout to ensure logout completes
              setTimeout(() => {
                router.replace('/(auth)/welcome');
              }, 100);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon!');
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="person-circle" size={64} color={theme.textSecondary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Show login prompt if no user (but don't navigate immediately)
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="person-circle" size={64} color={theme.textSecondary} />
        <Text style={[styles.noUserTitle, { color: theme.text }]}>Not Logged In</Text>
        <Text style={[styles.noUserText, { color: theme.textSecondary }]}>
          Please log in to view your profile
        </Text>
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/(auth)/welcome')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const profileOptions = [
    { icon: 'person-outline', title: 'Edit Profile', action: handleEditProfile },
    { icon: 'notifications-outline', title: 'Notifications', action: () => Alert.alert('Notifications', 'Settings coming soon!') },
    { icon: 'location-outline', title: 'Address Book', action: () => Alert.alert('Address Book', 'Manage your addresses') },
    { icon: 'help-circle-outline', title: 'Help & Support', action: () => Alert.alert('Help', 'Contact support at help@bin2win.com') },
    { icon: 'information-circle-outline', title: 'About', action: () => Alert.alert('About', 'Bin2Win v1.0\nSmart Waste Management') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.content}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={theme.primary} />
              </View>
              <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userLevel}>{user.level}</Text>
            </View>

            <TouchableOpacity style={[styles.editButton, { borderColor: theme.primary }]} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={18} color={theme.primary} />
              <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={24} color={theme.success} />
                <Text style={styles.statNumber}>{user.reportsSubmitted}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy" size={24} color={theme.warning} />
                <Text style={styles.statNumber}>{user.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color={theme.primary} />
                <Text style={styles.statNumber}>
                  {new Date().getFullYear() - new Date(user.joinDate).getFullYear() || 'New'}
                </Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={theme.textSecondary} />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={theme.textSecondary} />
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="calendar" size={20} color={theme.textSecondary} />
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>{user.joinDate}</Text>
              </View>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            {/* Dark Mode Toggle */}
            <View style={styles.optionItem}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={theme.textSecondary} />
              <Text style={styles.optionText}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDark ? theme.surface : '#f4f3f4'}
              />
            </View>

            {profileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionItem}
                onPress={option.action}
              >
                <Ionicons name={option.icon as any} size={22} color={theme.textSecondary} />
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  noUserTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noUserText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.success,
    backgroundColor: theme.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  optionsSection: {
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error + '20',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
