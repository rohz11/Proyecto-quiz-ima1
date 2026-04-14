import React from 'react';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Typography } from '@/constants/typography';
import Colors from '@/constants/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: Typography.colors.text.primary,
    background: Colors.background,
    card: Colors.surface,
    border: Colors.border,
    primary: Colors.primary,
    notification: Colors.danger,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomTheme}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaView>
    </ThemeProvider>
  );
}
