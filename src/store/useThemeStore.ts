import { create } from 'zustand';
import { Appearance } from 'react-native';
import { ColorTokens, darkColors, lightColors } from '../theme/colors';
import * as queries from '../db/queries';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  themePreference: ThemePreference;
  isDark: boolean;
  colors: ColorTokens;
  systemColorScheme: 'light' | 'dark';
  initTheme: () => void;
  setThemePreference: (pref: ThemePreference) => void;
  updateSystemTheme: (systemScheme: 'light' | 'dark' | null | undefined) => void;
}

function resolveIsDark(pref: ThemePreference, systemScheme: 'light' | 'dark'): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return systemScheme === 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialSystem = (Appearance.getColorScheme() as 'light' | 'dark') || 'light';
  const initialPref: ThemePreference = 'system';
  const initialIsDark = resolveIsDark(initialPref, initialSystem);

  return {
    themePreference: initialPref,
    systemColorScheme: initialSystem,
    isDark: initialIsDark,
    colors: initialIsDark ? darkColors : lightColors,

    initTheme: () => {
      try {
        const saved = queries.getSetting('theme_preference') as ThemePreference | null;
        if (saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
          const sys = get().systemColorScheme;
          const isDark = resolveIsDark(saved, sys);
          set({
            themePreference: saved,
            isDark,
            colors: isDark ? darkColors : lightColors,
          });
        }
      } catch (e) {
        console.error('Failed to load theme preference from SQLite:', e);
      }
    },

    setThemePreference: (pref: ThemePreference) => {
      try {
        queries.setSetting('theme_preference', pref);
      } catch (e) {
        console.error('Failed to save theme preference to SQLite:', e);
      }
      const sys = get().systemColorScheme;
      const isDark = resolveIsDark(pref, sys);
      set({
        themePreference: pref,
        isDark,
        colors: isDark ? darkColors : lightColors,
      });
    },

    updateSystemTheme: (systemScheme: 'light' | 'dark' | null | undefined) => {
      const sys = systemScheme === 'dark' ? 'dark' : 'light';
      const pref = get().themePreference;
      const isDark = resolveIsDark(pref, sys);
      set({
        systemColorScheme: sys,
        isDark,
        colors: isDark ? darkColors : lightColors,
      });
    },
  };
});
