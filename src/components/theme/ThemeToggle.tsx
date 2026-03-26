'use client';

import { useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeMode } from '@/types/theme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ 
  className, 
  showLabel = false, 
  variant = 'default',
  size = 'md'
}: ThemeToggleProps) {
  const { mode, toggleMode, resolvedMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleMode();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getIcon = () => {
    switch (resolvedMode) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 px-2',
    md: 'h-10 w-10 px-2',
    lg: 'h-12 w-12 px-3'
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'theme-toggle theme-focus inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        sizeClasses[size],
        variantClasses[variant],
        isAnimating && 'scale-95',
        className
      )}
      title={`Current theme: ${getLabel()} (Click to change)`}
      aria-label={`Toggle theme. Current theme: ${getLabel()}`}
    >
      <span className={cn(
        'transition-all duration-300',
        isAnimating && 'rotate-180 scale-0'
      )}>
        {getIcon()}
      </span>
      {showLabel && (
        <span className="ml-2 hidden sm:inline">
          {getLabel()}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
