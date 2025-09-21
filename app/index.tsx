import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Index() {
  const { isAuthenticated, loading } = useData();
  const { theme } = useTheme();

  useEffect(() => {
    if (!loading) {
      // Once loading is complete, decide where to redirect
      if (isAuthenticated) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/splash');
      }
    }
  }, [loading, isAuthenticated]);

  // Show loading screen while checking authentication
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme?.background || '#f8fafc' 
    }}>
      <ActivityIndicator size="large" color={theme?.primary || '#2563eb'} />
    </View>
  );
}
