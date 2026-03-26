# Theme System Documentation

## Overview

This comprehensive theme system provides a flexible and accessible dark mode and color scheme management for the CurrentDao application. The system supports multiple color modes, custom themes, smooth transitions, and accessibility features.

## Features

### ✅ Implemented Features

- **Dark/Light/System Modes**: Toggle between light, dark, and system-preferred themes
- **Multiple Color Schemes**: 6 pre-built color schemes (default, blue, green, purple, orange, high-contrast)
- **System Theme Detection**: Automatically respects user's OS preferences
- **Theme Persistence**: User preferences are saved and restored across sessions
- **Smooth Transitions**: Animated theme changes with configurable duration
- **High Contrast Mode**: Enhanced accessibility with improved contrast ratios
- **Theme Preview**: Hover to preview themes before applying
- **Component Integration**: All components automatically adapt to theme changes
- **Responsive Design**: Theme controls work on all device sizes
- **Accessibility**: Full keyboard navigation and screen reader support

## Architecture

### Core Files

```
src/
├── types/
│   └── theme.ts              # TypeScript type definitions
├── hooks/
│   └── useTheme.ts           # Core theme hook and provider
├── components/
│   └── theme/
│       ├── ThemeToggle.tsx    # Quick toggle button
│       └── ThemeSelector.tsx  # Full theme selector UI
├── styles/
│   └── themes.css           # Theme CSS variables and styles
├── lib/
│   └── utils.ts             # Utility functions
└── app/
    ├── layout.tsx           # Theme provider integration
    └── theme-demo/
        └── page.tsx         # Demo page
```

### Type System

```typescript
type ThemeMode = 'light' | 'dark' | 'system';
type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'high-contrast';
```

## Usage

### Basic Setup

1. **Provider Setup**: The theme provider is already integrated in `app/layout.tsx`

```tsx
import { ThemeProvider } from '@/hooks/useTheme';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* Your app content */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

2. **Using the Theme Hook**:

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { 
    mode, 
    colorScheme, 
    resolvedMode, 
    setMode, 
    setColorScheme,
    toggleMode,
    isHighContrast 
  } = useTheme();

  return (
    <div>
      <p>Current theme: {resolvedMode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  );
}
```

### Components

#### ThemeToggle

Quick toggle button for switching between modes:

```tsx
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// Basic usage
<ThemeToggle />

// With label
<ThemeToggle showLabel />

// Custom styling
<ThemeToggle variant="outline" size="lg" />
```

#### ThemeSelector

Full theme selector with color scheme options:

```tsx
import { ThemeSelector } from '@/components/theme/ThemeSelector';

// Basic usage
<ThemeSelector />

// Without preview
<ThemeSelector showPreview={false} />
```

### CSS Variables

The theme system uses CSS custom properties for all colors:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

### Tailwind Integration

Use theme colors in Tailwind classes:

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Themed Button
  </button>
</div>
```

## Color Schemes

### Available Themes

1. **Default**: Classic gray-based theme
2. **Ocean Blue**: Calming blue accents
3. **Forest Green**: Natural green tones
4. **Royal Purple**: Elegant purple theme
5. **Sunset Orange**: Warm orange accents
6. **High Contrast**: Maximum accessibility (WCAG AAA)

### Theme Preview

Hover over color scheme options in the ThemeSelector to preview themes before applying them.

## Accessibility

### High Contrast Mode

The high contrast theme provides:
- Enhanced contrast ratios (WCAG AAA compliant)
- Increased border widths
- Bold font weights
- Clear visual indicators

### Keyboard Navigation

All theme controls support:
- Tab navigation
- Enter/Space activation
- Escape to close dialogs
- Arrow key navigation

### Screen Reader Support

- Proper ARIA labels
- Live region announcements
- Semantic HTML structure

## Performance

### Optimizations

- **CSS Variables**: Efficient theme switching without re-renders
- **LocalStorage**: Fast persistence with minimal storage
- **System Detection**: Native media query API
- **Smooth Transitions**: Hardware-accelerated animations
- **Reduced Motion**: Respects user's motion preferences

### Bundle Impact

- Minimal additional bundle size (~3KB gzipped)
- Tree-shakable components
- No runtime CSS processing

## Customization

### Adding New Color Schemes

1. **Update Types**:

```typescript
// types/theme.ts
type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'high-contrast' | 'your-theme';
```

2. **Add Colors**:

```typescript
// hooks/useTheme.ts
const colorSchemes = {
  // ... existing themes
  'your-theme': {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      // ... all color variables
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      // ... all color variables
    }
  }
};
```

3. **Update UI**:

```tsx
// components/theme/ThemeSelector.tsx
const colorSchemeOptions = [
  // ... existing options
  {
    value: 'your-theme',
    label: 'Your Theme',
    description: 'Custom theme description',
    preview: {
      light: 'bg-your-light-class',
      dark: 'bg-your-dark-class'
    }
  }
];
```

### Custom Theme Variables

Add custom CSS variables in `styles/themes.css`:

```css
:root {
  --your-custom-variable: 210 40% 50%;
}

[data-theme="your-theme"] {
  --your-custom-variable: 280 60% 45%;
}
```

## Testing

### Demo Page

Visit `/theme-demo` to test all theme features:

- Theme toggle functionality
- Color scheme switching
- Component adaptation
- Accessibility features
- Smooth transitions

### Manual Testing Checklist

- [ ] Theme toggle works in all modes
- [ ] Color schemes apply correctly
- [ ] System detection respects OS preferences
- [ ] Theme persistence works across sessions
- [ ] Transitions are smooth and performant
- [ ] High contrast mode improves accessibility
- [ ] Theme preview shows changes before applying
- [ ] All components work in both themes
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work

## Browser Compatibility

### Supported Browsers

- **Chrome/Edge 88+**: Full support
- **Firefox 85+**: Full support
- **Safari 14+**: Full support
- **IE 11**: Basic support (no transitions)

### Fallbacks

- Graceful degradation for older browsers
- Static themes without transitions
- Basic color scheme support

## Migration Guide

### From Existing Theme System

1. **Remove Old Theme Files**: Delete any existing theme-related files
2. **Update Imports**: Replace with new theme system imports
3. **Update CSS**: Use new CSS variable names
4. **Test Components**: Verify all components work correctly

### Breaking Changes

- CSS variable names have been standardized
- Theme hook API has changed
- Component props have been updated

## Troubleshooting

### Common Issues

**Theme not applying:**
- Ensure ThemeProvider wraps your app
- Check CSS imports in globals.css
- Verify Tailwind configuration

**Transitions not working:**
- Check CSS transition duration
- Verify no `!important` rules overriding
- Test with reduced motion disabled

**High contrast not active:**
- Ensure color scheme is set to 'high-contrast'
- Check CSS custom properties
- Verify accessibility styles

**System detection not working:**
- Check browser support for media queries
- Verify no JavaScript errors
- Test with different OS settings

## Contributing

### Development Guidelines

1. **Follow TypeScript**: Use proper typing for all theme-related code
2. **Test Accessibility**: Ensure new features work with screen readers
3. **Performance**: Minimize bundle size and runtime overhead
4. **Documentation**: Update docs for any API changes

### Code Style

- Use semantic HTML elements
- Follow ARIA guidelines
- Implement proper focus management
- Test with keyboard navigation

## License

This theme system is part of the CurrentDao project and follows the same MIT license.
