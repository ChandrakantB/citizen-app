import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, Image, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Demo Mode', 'Camera feature works on mobile devices. This is a web demo.');
      setSelectedImage('https://via.placeholder.com/300x200/dc2626/ffffff?text=Waste+Report+Demo');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to report waste');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert('Photo Captured!', 'Your waste report has been submitted successfully');
    }
  };

  const selectFromGallery = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Demo Mode', 'Gallery feature works on mobile devices. This is a web demo.');
      setSelectedImage('https://via.placeholder.com/300x200/22c55e/ffffff?text=Gallery+Demo');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery access is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      Alert.alert('Photo Selected!', 'Your waste report has been submitted successfully');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Report Waste',
      Platform.OS === 'web' 
        ? 'Choose an option (Web Demo Mode):'
        : 'How would you like to add a photo?',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: selectFromGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Bin2Win</Text>
          <Text style={styles.subtitle}>Smart Waste Management</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Ionicons name="leaf" size={48} color="#22c55e" />
            <Text style={styles.welcomeText}>Welcome to Bin2Win</Text>
            <Text style={styles.description}>
              Join the revolution of smart waste management and earn rewards
            </Text>
          </View>

          {selectedImage && (
            <View style={styles.photoPreview}>
              <Text style={styles.photoTitle}>Last Reported Waste:</Text>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Text style={styles.reportStatus}>✅ Report Submitted Successfully</Text>
            </View>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.reportButton} onPress={showPhotoOptions}>
              <Ionicons name="camera" size={24} color="#ffffff" />
              <Text style={styles.reportButtonText}>Submit Waste Report</Text>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="location" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Find Nearest Bin</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="time" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Track Report Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.actionText}>View Rewards</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>85</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </View>
            </View>
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                📱 Full functionality available on mobile devices
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#2563eb',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100, // Extra padding for tab bar
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  photoPreview: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  reportStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 10,
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#dc2626',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reportButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginLeft: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 15,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  webNotice: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  webNoticeText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});
