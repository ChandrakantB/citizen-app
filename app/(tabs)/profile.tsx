import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Switch, 
  TextInput,
  Modal,
  Platform,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

const { width } = Dimensions.get('window');

interface EditableField {
  key: keyof typeof user | 'currentPassword' | 'newPassword' | 'confirmPassword';
  label: string;
  value: string;
  placeholder: string;
  icon: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logoutUser, loading, updateUserProfile } = useData();
  const styles = createStyles(theme);

  // Modal and editing states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    reportUpdates: true,
    communityActivity: true,
    achievementAlerts: true,
    weeklyDigest: false,
    promotionalEmails: false,
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Don't navigate immediately - wait for data to load
  useEffect(() => {
    if (!loading && !user) {
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
    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!editFormData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!editFormData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation (basic)
    if (editFormData.phone && editFormData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsUpdating(true);
    
    try {
      // In a real app, this would be an API call
      await updateUserProfile({
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!editFormData.currentPassword || !editFormData.newPassword || !editFormData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (editFormData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (editFormData.newPassword !== editFormData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsUpdating(true);

    try {
      // In a real app, this would verify current password and update
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setEditFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setIsUpdating(true);
    
    try {
      // In a real app, this would save notification preferences to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Notification preferences updated!');
      setShowSettingsModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Warning',
              'Are you absolutely sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    // In a real app, this would call delete account API
                    Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
                    await logoutUser();
                    router.replace('/(auth)/welcome');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export has been started. You will receive an email with your data within 24 hours.');
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle" size={64} color={theme.textSecondary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.notLoggedInContainer}>
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
        </View>
      </SafeAreaView>
    );
  }

  const achievements = [
    { id: 1, name: 'First Report', description: 'Submit your first waste report', icon: 'document-text', earned: user.reportsSubmitted > 0, color: '#10b981' },
    { id: 2, name: 'Eco Warrior', description: 'Submit 5 reports', icon: 'shield', earned: user.reportsSubmitted >= 5, color: '#3b82f6' },
    { id: 3, name: 'Green Champion', description: 'Earn 100 green coins', icon: 'trophy', earned: (user.points || 0) >= 100, color: '#f59e0b' },
    { id: 4, name: 'Community Hero', description: 'Active for 30 days', icon: 'people', earned: false, color: '#8b5cf6' },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);
  const nextAchievement = achievements.find(a => !a.earned);

  const profileOptions = [
    { 
      icon: 'person-outline', 
      title: 'Edit Profile', 
      action: handleEditProfile,
      subtitle: 'Update your personal information',
      color: '#3b82f6'
    },
    { 
      icon: 'lock-closed-outline', 
      title: 'Change Password', 
      action: () => setShowPasswordModal(true),
      subtitle: 'Update your account password',
      color: '#f59e0b'
    },
    { 
      icon: 'notifications-outline', 
      title: 'Notification Settings', 
      action: () => setShowSettingsModal(true),
      subtitle: 'Manage your notification preferences',
      color: '#8b5cf6'
    },
    { 
      icon: 'trophy-outline', 
      title: 'Achievements & Badges', 
      action: () => setShowAchievementsModal(true),
      subtitle: `${earnedAchievements.length}/${achievements.length} achievements earned`,
      color: '#10b981'
    },
    { 
      icon: 'download-outline', 
      title: 'Export My Data', 
      action: handleExportData,
      subtitle: 'Download all your data',
      color: '#6b7280'
    },
    { 
      icon: 'help-circle-outline', 
      title: 'Help & Support', 
      action: () => Alert.alert('Help & Support', 'Contact us at support@bin2win.com or call +91-1234567890'),
      subtitle: 'Get help with the app',
      color: '#06b6d4'
    },
    { 
      icon: 'information-circle-outline', 
      title: 'About Bin2Win', 
      action: () => Alert.alert('About Bin2Win', 'Version 1.0.0\nSmart Waste Management System\n\nDeveloped for cleaner communities.'),
      subtitle: 'App information and version',
      color: '#64748b'
    },
  ];

  const renderEditProfileModal = () => (
    <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            <Text style={[styles.saveButton, { color: isUpdating ? theme.textSecondary : theme.primary }]}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.name}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.email}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.phone}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editFormData.address}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, address: text }))}
                placeholder="Enter your address"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPasswordModal = () => (
    <Modal visible={showPasswordModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity 
            onPress={handleChangePassword}
            disabled={isUpdating}
          >
            <Text style={[styles.saveButton, { color: isUpdating ? theme.textSecondary : theme.primary }]}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Password Security</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password *</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.currentPassword}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter current password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password *</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.newPassword}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <TextInput
                style={styles.textInput}
                value={editFormData.confirmPassword}
                onChangeText={(text) => setEditFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm new password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.passwordTips}>
              <Text style={styles.passwordTipsTitle}>Password Requirements:</Text>
              <Text style={styles.passwordTip}>• At least 6 characters long</Text>
              <Text style={styles.passwordTip}>• Mix of letters and numbers recommended</Text>
              <Text style={styles.passwordTip}>• Avoid using personal information</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal visible={showSettingsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Notification Settings</Text>
          <TouchableOpacity 
            onPress={handleUpdateNotifications}
            disabled={isUpdating}
          >
            <Text style={[styles.saveButton, { color: isUpdating ? theme.textSecondary : theme.primary }]}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Push Notifications</Text>
            
            {Object.entries({
              reportUpdates: 'Report Status Updates',
              communityActivity: 'Community Activity',
              achievementAlerts: 'Achievement Alerts',
            }).map(([key, label]) => (
              <View key={key} style={styles.settingItem}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Switch
                  value={notificationSettings[key as keyof typeof notificationSettings]}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, [key]: value }))}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={notificationSettings[key as keyof typeof notificationSettings] ? theme.surface : '#f4f3f4'}
                />
              </View>
            ))}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Email Preferences</Text>
            
            {Object.entries({
              weeklyDigest: 'Weekly Activity Digest',
              promotionalEmails: 'Promotional Emails',
            }).map(([key, label]) => (
              <View key={key} style={styles.settingItem}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Switch
                  value={notificationSettings[key as keyof typeof notificationSettings]}
                  onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, [key]: value }))}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={notificationSettings[key as keyof typeof notificationSettings] ? theme.surface : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderAchievementsModal = () => (
    <Modal visible={showAchievementsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAchievementsModal(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Achievements & Badges</Text>
          <View style={styles.achievementProgress}>
            <Text style={[styles.saveButton, { color: theme.primary }]}>
              {earnedAchievements.length}/{achievements.length}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Your Achievements</Text>
            
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementItem,
                { opacity: achievement.earned ? 1 : 0.6 }
              ]}>
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.color + '20' }
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={achievement.earned ? achievement.color : theme.textSecondary} 
                  />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementName,
                    { color: achievement.earned ? theme.text : theme.textSecondary }
                  ]}>
                    {achievement.name}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    { color: achievement.earned ? theme.textSecondary : theme.textSecondary }
                  ]}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.earned && (
                  <View style={[styles.earnedBadge, { backgroundColor: achievement.color }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>
            ))}
          </View>

          {nextAchievement && (
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Next Achievement</Text>
              <View style={styles.nextAchievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: nextAchievement.color + '20' }]}>
                  <Ionicons name={nextAchievement.icon as any} size={24} color={nextAchievement.color} />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[styles.achievementName, { color: theme.text }]}>
                    {nextAchievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>
                    {nextAchievement.description}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Enhanced Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderGradient}>
            <View style={styles.profileHeaderContent}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color="#ffffff" />
                  </View>
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userLevelBadge}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.userLevel}>{user.level}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.editProfileButton} 
                onPress={handleEditProfile}
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Enhanced Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Impact Dashboard</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="document-text" size={28} color="#3b82f6" />
                </View>
                <Text style={styles.statNumber}>{user.reportsSubmitted || 0}</Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
                <Text style={styles.statProgress}>Keep reporting! 📋</Text>
              </View>
              
              <View style={[styles.statCard, styles.statCardSuccess]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="leaf" size={28} color="#10b981" />
                </View>
                <Text style={styles.statNumber}>{user.points || 0}</Text>
                <Text style={styles.statLabel}>Green Coins</Text>
                <Text style={styles.statProgress}>Eco rewards! 🪙</Text>
              </View>
            </View>

            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Ionicons name="earth" size={24} color="#10b981" />
                <Text style={styles.impactTitle}>Environmental Impact</Text>
              </View>
              <View style={styles.impactStats}>
                <View style={styles.impactStat}>
                  <Text style={styles.impactNumber}>{Math.round((user.reportsSubmitted || 0) * 2.5)}kg</Text>
                  <Text style={styles.impactLabel}>CO₂ Prevented</Text>
                </View>
                <View style={styles.impactStat}>
                  <Text style={styles.impactNumber}>{user.reportsSubmitted || 0}</Text>
                  <Text style={styles.impactLabel}>Areas Cleaned</Text>
                </View>
                <View style={styles.impactStat}>
                  <Text style={styles.impactNumber}>{Math.floor((user.reportsSubmitted || 0) * 1.2)}</Text>
                  <Text style={styles.impactLabel}>Trees Saved</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="mail" size={20} color="#3b82f6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call" size={20} color="#10b981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar" size={20} color="#f59e0b" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{user.joinDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Enhanced Settings Section */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Settings & Preferences</Text>
            
            {/* Dark Mode Toggle */}
            <View style={styles.optionCard}>
              <View style={[styles.optionIconContainer, { backgroundColor: isDark ? '#6366f1' + '20' : '#f59e0b' + '20' }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={isDark ? '#6366f1' : '#f59e0b'} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Dark Mode</Text>
                <Text style={styles.optionSubtitle}>Switch between light and dark theme</Text>
              </View>
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
                style={styles.optionCard}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={22} color={option.color} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#dc2626" />
              <View style={styles.dangerContent}>
                <Text style={styles.dangerButtonText}>Delete Account</Text>
                <Text style={styles.dangerButtonSubtext}>Permanently remove your account</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Enhanced Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutContent}>
              <Ionicons name="log-out-outline" size={24} color="#ffffff" />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderEditProfileModal()}
      {renderPasswordModal()}
      {renderSettingsModal()}
      {renderAchievementsModal()}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  notLoggedInContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
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
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Enhanced Profile Header
   profileHeader: {
    height: 265,
    position: 'relative',
    marginTop: Platform.OS === 'ios' ? 54 : 20, // Add this line to push content below header
  },
  profileHeaderGradient: {
    flex: 1,
    backgroundColor: '#3b82f6',
    justifyContent: 'flex-end',
  },
  profileHeaderContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  userLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  userLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Enhanced Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: theme.card,
  },
  statCardSuccess: {
    backgroundColor: theme.card,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  statProgress: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  impactCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactStat: {
    alignItems: 'center',
    flex: 1,
  },
  impactNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Enhanced Info Section
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },

  // Enhanced Options Section
  optionsSection: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },

  // Enhanced Danger Zone
  dangerZone: {
    marginBottom: 20,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626' + '15',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dc2626' + '30',
    gap: 12,
  },
  dangerContent: {
    flex: 1,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 2,
  },
  dangerButtonSubtext: {
    fontSize: 12,
    color: '#dc2626',
    opacity: 0.8,
  },

  // Enhanced Logout Button
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 20,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  passwordTips: {
    backgroundColor: theme.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  passwordTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 8,
  },
  passwordTip: {
    fontSize: 12,
    color: theme.text,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.text,
  },

  // Achievement Modal
  achievementProgress: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.card,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
  },
  earnedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextAchievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.primary + '30',
    borderStyle: 'dashed',
    gap: 12,
  },
});
