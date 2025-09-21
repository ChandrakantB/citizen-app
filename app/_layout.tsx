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
        </Stack>
      </DataProvider>
    </ThemeProvider>
  );
}
