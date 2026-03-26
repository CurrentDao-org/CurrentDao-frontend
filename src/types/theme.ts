export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'high-contrast';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface Theme {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

export interface ThemeConfig {
  defaultMode: ThemeMode;
  defaultColorScheme: ColorScheme;
  enableSystemDetection: boolean;
  enableTransitions: boolean;
  transitionDuration: string;
}

export interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  colorScheme: ColorScheme;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleMode: () => void;
  resetTheme: () => void;
  isHighContrast: boolean;
  previewTheme: (mode: ThemeMode, scheme: ColorScheme) => void;
  stopPreview: () => void;
}

export interface ThemePreview {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  isActive: boolean;
}
