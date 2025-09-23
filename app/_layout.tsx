import { Stack } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DataProvider } from '../contexts/DataContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* ✅ Profile route */}
          <Stack.Screen 
            name="profile" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_right'
            }} 
          />
          {/* ✅ Notifications route */}
          <Stack.Screen 
            name="notifications" 
            options={{ 
              headerShown: true,
              title: 'Notifications',
              headerBackTitle: 'Back',
              presentation: 'card',
              animation: 'slide_from_right'
            }} 
          />
        </Stack>
      </DataProvider>
    </ThemeProvider>
  );
}
