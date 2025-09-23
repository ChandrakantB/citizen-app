import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import CustomHeader from '../../components/CustomHeader';

export default function RootLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // ✅ Dynamic height based on device
  const getTabBarHeight = () => {
    if (Platform.OS === 'web') return 70;
    
    // Check if device has home indicator (iPhone X and newer)
    const hasHomeIndicator = insets.bottom > 0;
    
    if (hasHomeIndicator) {
      // iPhone X+ style devices - less padding needed
      return 85;
    } else {
      // Older devices or Android with navigation buttons
      return 75;
    }
  };

  return (
    <>
      {/* Add the header above your existing tabs */}
      <CustomHeader />
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            // ✅ DYNAMIC HEIGHT: Adapts to device type
            height: getTabBarHeight(),
            // ✅ SMART PADDING: Adjusts for device navigation
            paddingBottom: Math.max(insets.bottom - 5, 10), // At least 10px, subtract 5 from home indicator
            paddingTop: 12,
            // ✅ SHADOW: Better visual separation
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            // ✅ POSITIONING: Slightly above bottom on Android
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 0 : 0.1, // 5px above on Android
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'My Reports',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="construct" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="greenmitra"
          options={{
            title: 'GreenMitra',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
