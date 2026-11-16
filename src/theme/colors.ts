export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  border3d: string;
  text: string;
  textMuted: string;
  textInverted: string;
  primary: string;
  primary3d: string;
  success: string;
  success3d: string;
  warning: string;
  warning3d: string;
  statusBarStyle: 'light' | 'dark';
  tabBarBg: string;
  tabBarBorder: string;
  pathConnector: string;
}

export const lightColors: ColorTokens = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  border: '#e2e8f0',
  border3d: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#64748b',
  textInverted: '#ffffff',
  primary: '#2563eb',
  primary3d: '#1d4ed8',
  success: '#10b981',
  success3d: '#059669',
  warning: '#eab308',
  warning3d: '#ca8a04',
  statusBarStyle: 'dark',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e2e8f0',
  pathConnector: '#cbd5e1',
};

export const darkColors: ColorTokens = {
  background: '#090d16',
  surface: '#131b2e',
  surfaceElevated: '#1e293b',
  border: '#1e293b',
  border3d: '#0f172a',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textInverted: '#0f172a',
  primary: '#3b82f6',
  primary3d: '#1d4ed8',
  success: '#10b981',
  success3d: '#059669',
  warning: '#facc15',
  warning3d: '#ca8a04',
  statusBarStyle: 'light',
  tabBarBg: '#131b2e',
  tabBarBorder: '#1e293b',
  pathConnector: '#334155',
};
