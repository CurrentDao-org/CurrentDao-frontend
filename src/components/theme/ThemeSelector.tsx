'use client';

import { useState } from 'react';
import { Palette, Sun, Moon, Monitor, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeMode, ColorScheme } from '@/types/theme';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  className?: string;
  showPreview?: boolean;
}

interface ColorSchemeOption {
  value: ColorScheme;
  label: string;
  description: string;
  preview: {
    light: string;
    dark: string;
  };
}

const colorSchemeOptions: ColorSchemeOption[] = [
  {
    value: 'default',
    label: 'Default',
    description: 'Classic gray theme',
    preview: {
      light: 'bg-gray-100 border-gray-300',
      dark: 'bg-gray-800 border-gray-600'
    }
  },
  {
    value: 'blue',
    label: 'Ocean Blue',
    description: 'Calming blue accents',
    preview: {
      light: 'bg-blue-50 border-blue-300',
      dark: 'bg-blue-950 border-blue-700'
    }
  },
  {
    value: 'green',
    label: 'Forest Green',
    description: 'Natural green tones',
    preview: {
      light: 'bg-green-50 border-green-300',
      dark: 'bg-green-950 border-green-700'
    }
  },
  {
    value: 'purple',
    label: 'Royal Purple',
    description: 'Elegant purple theme',
    preview: {
      light: 'bg-purple-50 border-purple-300',
      dark: 'bg-purple-950 border-purple-700'
    }
  },
  {
    value: 'orange',
    label: 'Sunset Orange',
    description: 'Warm orange accents',
    preview: {
      light: 'bg-orange-50 border-orange-300',
      dark: 'bg-orange-950 border-orange-700'
    }
  },
  {
    value: 'high-contrast',
    label: 'High Contrast',
    description: 'Maximum accessibility',
    preview: {
      light: 'bg-white border-black',
      dark: 'bg-black border-white'
    }
  }
];

export function ThemeSelector({ className, showPreview = true }: ThemeSelectorProps) {
  const { 
    mode, 
    colorScheme, 
    resolvedMode, 
    setMode, 
    setColorScheme, 
    previewTheme, 
    stopPreview,
    isHighContrast 
  } = useTheme();
  
  const [previewMode, setPreviewMode] = useState<ThemeMode | null>(null);
  const [previewScheme, setPreviewScheme] = useState<ColorScheme | null>(null);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setPreviewMode(null);
  };

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    setPreviewScheme(null);
  };

  const handlePreview = (previewMode: ThemeMode, previewScheme: ColorScheme) => {
    setPreviewMode(previewMode);
    setPreviewScheme(previewScheme);
    previewTheme(previewMode, previewScheme);
  };

  const handleStopPreview = () => {
    setPreviewMode(null);
    setPreviewScheme(null);
    stopPreview();
  };

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: <Sun className="h-4 w-4" /> 
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: <Moon className="h-4 w-4" /> 
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: <Monitor className="h-4 w-4" /> 
    }
  ];

  return (
    <div className={cn('space-y-6 p-4 bg-card rounded-lg border', className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Theme Settings</h3>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Color Mode</h4>
        <div className="grid grid-cols-3 gap-2">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleModeChange(option.value)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-md border transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                mode === option.value && 'bg-primary text-primary-foreground border-primary'
              )}
            >
              {option.icon}
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === 'system' 
            ? `Following system preference (${resolvedMode})`
            : `Using ${mode} mode`
          }
        </p>
      </div>

      {/* Color Scheme Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Color Scheme</h4>
        <div className="grid grid-cols-2 gap-3">
          {colorSchemeOptions.map((option) => (
            <div
              key={option.value}
              className={cn(
                'relative p-3 rounded-md border transition-all cursor-pointer',
                'hover:bg-accent hover:text-accent-foreground',
                colorScheme === option.value && 'bg-primary text-primary-foreground border-primary'
              )}
              onClick={() => handleColorSchemeChange(option.value)}
              onMouseEnter={() => showPreview && handlePreview(mode, option.value)}
              onMouseLeave={handleStopPreview}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-4 h-4 rounded border-2',
                  option.preview[resolvedMode]
                )} />
                <span className="text-sm font-medium">{option.label}</span>
                {option.value === 'high-contrast' && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-1 rounded">
                    A11y
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Status */}
      {previewMode && previewScheme && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <Eye className="h-4 w-4" />
          <span className="text-sm">
            Previewing: {previewScheme} {previewMode}
          </span>
          <button
            onClick={handleStopPreview}
            className="ml-auto text-xs hover:text-destructive"
          >
            <EyeOff className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Accessibility Notice */}
      {isHighContrast && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            High contrast mode is active for improved accessibility.
          </p>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
