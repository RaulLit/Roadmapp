import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { getDatabase } from '../db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    try {
      getDatabase();
    } catch (e) {
      console.error('Failed to initialize database:', e);
    } finally {
      SplashScreen.hideAsync();
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#f3f4f6',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Roadmaps',
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
