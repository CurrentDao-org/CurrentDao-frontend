'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { ThemeMode, ColorScheme, ThemeContextType, ThemePreview, ThemeConfig, ThemeColors } from '@/types/theme';

const THEME_STORAGE_KEY = 'currentdao-theme';
const PREVIEW_STORAGE_KEY = 'currentdao-theme-preview';

const defaultConfig: ThemeConfig = {
  defaultMode: 'system',
  defaultColorScheme: 'default',
  enableSystemDetection: true,
  enableTransitions: true,
  transitionDuration: '300ms',
};

const colorSchemes: Record<ColorScheme, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '222.2 47.4% 11.2%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '210 40% 98%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '212.7 26.8% 83.9%',
    },
  },
  blue: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '221.2 83.2% 53.3%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '221.2 83.2% 53.3%',
    },
  },
  green: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '142.1 76.2% 36.3%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '142.1 76.2% 36.3%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '142.1 70.6% 45.3%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '142.1 70.6% 45.3%',
    },
  },
  purple: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '262.1 83.3% 57.8%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '262.1 83.3% 57.8%',
    },
  },
  orange: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '210 40% 98%',
      secondary: '210 40% 96%',
      secondaryForeground: '222.2 84% 4.9%',
      muted: '210 40% 96%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96%',
      accentForeground: '222.2 84% 4.9%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '24.6 95% 53.1%',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '24.6 95% 53.1%',
    },
  },
  'high-contrast': {
    light: {
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      card: '0 0% 100%',
      cardForeground: '0 0% 0%',
      popover: '0 0% 100%',
      popoverForeground: '0 0% 0%',
      primary: '0 0% 0%',
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 96.1%',
      secondaryForeground: '0 0% 0%',
      muted: '0 0% 96.1%',
      mutedForeground: '0 0% 45.1%',
      accent: '0 0% 96.1%',
      accentForeground: '0 0% 0%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 100%',
      border: '0 0% 0%',
      input: '0 0% 0%',
      ring: '0 0% 0%',
    },
    dark: {
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      card: '0 0% 0%',
      cardForeground: '0 0% 100%',
      popover: '0 0% 0%',
      popoverForeground: '0 0% 100%',
      primary: '0 0% 100%',
      primaryForeground: '0 0% 0%',
      secondary: '0 0% 8.9%',
      secondaryForeground: '0 0% 100%',
      muted: '0 0% 8.9%',
      mutedForeground: '0 0% 63.9%',
      accent: '0 0% 8.9%',
      accentForeground: '0 0% 100%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '0 0% 100%',
      border: '0 0% 100%',
      input: '0 0% 100%',
      ring: '0 0% 100%',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultConfig.defaultMode);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(defaultConfig.defaultColorScheme);
  const [preview, setPreview] = useState<ThemePreview | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setModeState(parsed.mode || defaultConfig.defaultMode);
        setColorSchemeState(parsed.colorScheme || defaultConfig.defaultColorScheme);
      } catch (error) {
        console.error('Failed to parse theme from localStorage:', error);
      }
    }
  }, []);

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  const resolvedMode = preview
    ? preview.mode
    : mode === 'system'
      ? getSystemTheme()
      : mode;

  const applyTheme = useCallback((targetMode: ThemeMode, targetScheme: ColorScheme) => {
    const actualMode = targetMode === 'system' ? getSystemTheme() : targetMode;
    const colors = colorSchemes[targetScheme][actualMode];

    const root = document.documentElement;

    (Object.keys(colors) as Array<keyof ThemeColors>).forEach((key) => {
      const value = colors[key];
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    root.setAttribute('data-theme', targetScheme);
    root.classList.remove('light', 'dark');
    root.classList.add(actualMode);

    if (defaultConfig.enableTransitions) {
      root.style.setProperty('--theme-transition-duration', defaultConfig.transitionDuration);
    }
  }, [getSystemTheme]);

  useEffect(() => {
    if (!mounted) return;

    if (preview) {
      applyTheme(preview.mode, preview.colorScheme);
    } else {
      applyTheme(mode, colorScheme);
    }
  }, [mode, colorScheme, preview, mounted, applyTheme]);

  useEffect(() => {
    if (!defaultConfig.enableSystemDetection) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system' && !preview) {
        applyTheme('system', colorScheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, colorScheme, preview, applyTheme]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setPreview(null);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      mode: newMode,
      colorScheme,
    }));
  }, [colorScheme]);

  const setColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    setPreview(null);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      mode,
      colorScheme: newScheme,
    }));
  }, [mode]);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(newMode);
  }, [mode, setMode]);

  const resetTheme = useCallback(() => {
    setMode(defaultConfig.defaultMode);
    setColorScheme(defaultConfig.defaultColorScheme);
    setPreview(null);
    localStorage.removeItem(THEME_STORAGE_KEY);
  }, [setMode, setColorScheme]);

  const previewTheme = useCallback((previewMode: ThemeMode, previewScheme: ColorScheme) => {
    setPreview({ mode: previewMode, colorScheme: previewScheme, isActive: true });
  }, []);

  const stopPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const isHighContrast = preview
    ? preview.colorScheme === 'high-contrast'
    : colorScheme === 'high-contrast';

  const value: ThemeContextType = {
    theme: {
      mode,
      colorScheme,
      colors: colorSchemes[colorScheme],
    },
    mode,
    colorScheme,
    resolvedMode,
    setMode,
    setColorScheme,
    toggleMode,
    resetTheme,
    isHighContrast,
    previewTheme,
    stopPreview,
  };

  return (
    <ThemeContext.Provider value= { value } >
    { children }
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
