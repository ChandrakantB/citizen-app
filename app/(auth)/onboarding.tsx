import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = React.useRef<ScrollView>(null);

  const onboardingData = [
    {
      id: 1,
      title: 'Report Waste Issues',
      description: 'Snap a photo of waste problems in your area and help make your community cleaner',
      icon: 'camera',
      color: '#ef4444',
      illustration: '📸'
    },
    {
      id: 2,
      title: 'Track Your Impact',
      description: 'Monitor your contributions and see how you\'re making a difference in real-time',
      icon: 'analytics',
      color: '#3b82f6',
      illustration: '📊'
    },
    {
      id: 3,
      title: 'Earn Rewards',
      description: 'Get points for every report and climb the leaderboard to become an Eco Champion',
      icon: 'trophy',
      color: '#f59e0b',
      illustration: '🏆'
    },
    {
      id: 4,
      title: 'Join Community',
      description: 'Connect with like-minded people and share your eco-friendly achievements',
      icon: 'people',
      color: '#22c55e',
      illustration: '🌱'
    }
  ];

  const nextPage = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextIndex = currentPage + 1;
      setCurrentPage(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  const skipOnboarding = () => {
    router.replace('/(auth)/welcome');
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    scrollRef.current?.scrollTo({ x: pageIndex * width, animated: true });
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / width);
    setCurrentPage(pageIndex);
  };

  const renderPage = (item: any, index: number) => (
    <View key={item.id} style={styles.pageContainer}>
      <View style={styles.illustrationContainer}>
        <View style={[styles.illustrationCircle, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.illustration}>{item.illustration}</Text>
        </View>
        <Animated.View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={40} color="#ffffff" />
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => goToPage(index)}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentPage ? '#2563eb' : '#e5e7eb',
              width: index === currentPage ? 24 : 8,
            }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {onboardingData.map((item, index) => renderPage(item, index))}
      </ScrollView>

      {/* Pagination */}
      {renderPagination()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentPage > 0 && (
            <TouchableOpacity
              onPress={() => goToPage(currentPage - 1)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#6b7280" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={nextPage}
            style={[styles.nextButton, { flex: currentPage === 0 ? 1 : 0 }]}
          >
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentPage === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="#ffffff" 
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Background Decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 40,
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 80,
  },
  iconContainer: {
    position: 'absolute',
    bottom: 10,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    flex: 0.8,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  backgroundDecoration: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    top: 100,
    left: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    bottom: 200,
    right: -10,
  },
});
