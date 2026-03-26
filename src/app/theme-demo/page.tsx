'use client';

import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ThemeSelector } from '@/components/theme/ThemeSelector';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeDemoPage() {
  const { resolvedMode, colorScheme, isHighContrast } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Theme System Demo</h1>
        <p className="text-lg text-muted-foreground">
          Experience the comprehensive dark mode and theme system
        </p>
      </div>

      {/* Theme Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Toggle</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle showLabel />
            <div className="text-sm text-muted-foreground">
              Current: {resolvedMode} mode with {colorScheme} theme
              {isHighContrast && ' (High Contrast)'}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Theme Selector</h2>
          <ThemeSelector />
        </div>
      </div>

      {/* Component Showcase */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Component Showcase</h2>
        
        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Card Component</h3>
            <p className="text-muted-foreground">
              This card uses theme-aware colors for background, text, and borders.
            </p>
          </div>
          
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Another Card</h3>
            <p className="text-muted-foreground">
              All components automatically adapt to theme changes.
            </p>
          </div>
          
          <div className="p-6 bg-card border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Third Card</h3>
            <p className="text-muted-foreground">
              Smooth transitions between themes.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90">
              Accent Button
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
              Destructive Button
            </button>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Form Elements</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Text Input</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                placeholder="Enter text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select</label>
              <select className="w-full px-3 py-2 border rounded-md bg-background text-foreground">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Alerts & Messages</h3>
          <div className="space-y-2">
            <div className="p-4 bg-muted border rounded-md">
              <p className="text-muted-foreground">This is a muted alert message.</p>
            </div>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive">This is a destructive alert message.</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Typography</h3>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-semibold">Heading 2</h2>
            <h3 className="text-2xl font-medium">Heading 3</h3>
            <p className="text-base">Regular paragraph text that adapts to theme changes.</p>
            <p className="text-sm text-muted-foreground">Muted text for secondary information.</p>
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-6 bg-muted border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Theme Information</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Resolved Mode:</strong> {resolvedMode}<br />
            <strong>Color Scheme:</strong> {colorScheme}<br />
            <strong>High Contrast:</strong> {isHighContrast ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <strong>Features:</strong><br />
            • System theme detection<br />
            • Theme persistence<br />
            • Smooth transitions<br />
            • High contrast mode<br />
            • Theme preview
          </div>
        </div>
      </div>
    </div>
  );
}
