import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase } from '../db/database';
import { useThemeStore } from '../store/useThemeStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const { colors, isDark, initTheme, updateSystemTheme } = useThemeStore();

  useEffect(() => {
    try {
      getDatabase();
      initTheme();
    } catch (e) {
      console.error('Failed to initialize database or theme:', e);
    } finally {
      SplashScreen.hideAsync();
    }
  }, [initTheme]);

  useEffect(() => {
    updateSystemTheme(systemColorScheme);
  }, [systemColorScheme, updateSystemTheme]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="roadmap/[id]"
          options={{
            title: 'Roadmap Details',
          }}
        />
        <Stack.Screen
          name="roadmap/[id]/edit"
          options={{
            title: 'Edit Roadmap',
          }}
        />
        <Stack.Screen
          name="new-roadmap"
          options={{
            title: 'New Roadmap',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
