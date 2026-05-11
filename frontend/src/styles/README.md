# Design System

Welcome to the unified design system for the application. This directory contains all design tokens, styles, and documentation for maintaining visual consistency across the entire application.

## Quick Start

### Importing Design Tokens

```javascript
import { colors, typography, spacing, shadows, animations } from '@/styles/designTokens';

// Access specific tokens
const primaryColor = colors.primary[500];
const bodyFont = typography.fontFamily.sans;
const defaultSpacing = spacing.md;
```

### Using Tailwind Classes

The design system is built on Tailwind CSS. Use Tailwind utility classes for styling:

```jsx
// Colors
<div className="bg-primary-500 text-white">Primary background</div>
<div className="bg-neutral-50 text-neutral-900">Neutral background</div>

// Typography
<h1 className="text-5xl font-semibold">Heading 1</h1>
<p className="text-base font-normal">Body text</p>

// Spacing
<div className="p-6 m-4">Padded and margined</div>

// Shadows
<div className="shadow-lg">Elevated card</div>

// Animations
<div className="animate-fade-in">Fading in</div>
```

### Dark Mode Support

The design system automatically supports dark mode:

```jsx
<div className="bg-neutral-50 dark:bg-neutral-950">
  <p className="text-neutral-900 dark:text-neutral-50">
    This text adapts to dark mode
  </p>
</div>
```

## File Structure

```
src/styles/
├── designTokens.js          # All design tokens (colors, typography, spacing, etc.)
├── designSystem.md          # Comprehensive design system documentation
└── README.md               # This file - quick start guide
```

## Design System Components

### Colors

The design system includes:
- **Primary:** Cyan-to-blue gradient (#0ea5e9 to #0284c7)
- **Neutral:** Gray palette for backgrounds and text
- **Semantic:** Success (emerald), Warning (orange), Error (red), Info (cyan)
- **Gradients:** Premium, warm, and subtle gradients

**Access colors:**
```javascript
import { colors } from '@/styles/designTokens';

colors.primary[500]      // #0ea5e9
colors.neutral[900]      // #18181b
colors.success[500]      // #22c55e
colors.warning[500]      // #f97316
colors.error[500]        // #ef4444
```

### Typography

The design system defines:
- **Font Families:** Inter (body), Playfair Display (display)
- **Font Sizes:** From 11px (caption small) to 48px (h1)
- **Font Weights:** Light (300) to Black (900)
- **Line Heights:** Tight (1.2) to Loose (2)

**Access typography:**
```javascript
import { typography } from '@/styles/designTokens';

typography.fontFamily.sans      // Inter
typography.fontSize.h1          // { size: '48px', weight: 600, lineHeight: '52px' }
typography.fontWeight.semibold  // 600
```

### Spacing

The design system uses an 8px base unit:
- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px
- **3xl:** 64px

**Access spacing:**
```javascript
import { spacing } from '@/styles/designTokens';

spacing.xs   // 4px
spacing.md   // 16px
spacing.xl   // 32px
```

### Shadows

The design system includes:
- **Elevation Shadows:** xs, sm, md, lg, xl, premium
- **Glow Shadows:** glowBlue, glowOrange, glowEmerald
- **Glass Shadow:** For glass morphism effects

**Access shadows:**
```javascript
import { shadows } from '@/styles/designTokens';

shadows.md           // Default shadow
shadows.lg           // Elevated shadow
shadows.premium      // Maximum elevation
shadows.glowBlue     // Blue glow effect
```

### Animations

The design system defines:
- **Durations:** Fast (200ms), Normal (300ms), Slow (500ms), Slower (700ms), Slowest (1000ms)
- **Easing Functions:** Smooth, bounceSmooth, easeIn, easeOut, easeInOut
- **Keyframes:** fadeIn, slideUp, scaleIn, spin, pulse, float, bounce, glow, shimmer

**Access animations:**
```javascript
import { animations } from '@/styles/designTokens';

animations.duration.normal      // 300ms
animations.easing.smooth        // cubic-bezier(0.4, 0, 0.2, 1)
animations.keyframes.fadeIn     // fadeIn 300ms ease-in-out
```

### Border Radius

The design system includes:
- **xs:** 4px
- **sm:** 6px
- **md:** 8px
- **lg:** 12px
- **xl:** 16px
- **2xl:** 20px
- **3xl:** 24px
- **full:** 9999px (circular)

**Access border radius:**
```javascript
import { borderRadius } from '@/styles/designTokens';

borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.full  // 9999px
```

## Common Patterns

### Button Styling

```jsx
// Primary button
<button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
  Primary Button
</button>

// Secondary button
<button className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-md hover:bg-neutral-300 transition-colors">
  Secondary Button
</button>

// Outline button
<button className="px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-md hover:bg-primary-50 transition-colors">
  Outline Button
</button>
```

### Card Styling

```jsx
// Basic card
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold text-neutral-900">Card Title</h3>
  <p className="mt-2 text-neutral-600">Card content</p>
</div>

// Elevated card
<div className="bg-white rounded-lg shadow-lg p-6">
  <h3 className="text-lg font-semibold text-neutral-900">Elevated Card</h3>
  <p className="mt-2 text-neutral-600">Card content</p>
</div>

// Gradient card
<div className="bg-gradient-premium rounded-lg shadow-lg p-6 text-white">
  <h3 className="text-lg font-semibold">Gradient Card</h3>
  <p className="mt-2 opacity-90">Card content</p>
</div>
```

### Form Input Styling

```jsx
// Text input
<input
  type="text"
  placeholder="Enter text"
  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>

// Input with error
<input
  type="email"
  placeholder="Enter email"
  className="w-full px-4 py-2 border-2 border-error-500 rounded-md focus:outline-none focus:ring-2 focus:ring-error-500"
/>

// Disabled input
<input
  type="text"
  placeholder="Disabled"
  disabled
  className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-100 text-neutral-500 cursor-not-allowed"
/>
```

### Alert Styling

```jsx
// Success alert
<div className="bg-success-50 border border-success-200 rounded-md p-4">
  <p className="text-success-800">Success message</p>
</div>

// Warning alert
<div className="bg-warning-50 border border-warning-200 rounded-md p-4">
  <p className="text-warning-800">Warning message</p>
</div>

// Error alert
<div className="bg-error-50 border border-error-200 rounded-md p-4">
  <p className="text-error-800">Error message</p>
</div>
```

### Badge Styling

```jsx
// Primary badge
<span className="inline-block px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
  Primary
</span>

// Success badge
<span className="inline-block px-3 py-1 bg-success-500 text-white text-sm rounded-full">
  Active
</span>

// Neutral badge
<span className="inline-block px-3 py-1 bg-neutral-200 text-neutral-900 text-sm rounded-full">
  Neutral
</span>
```

## Responsive Design

The design system supports responsive design with Tailwind breakpoints:

```jsx
// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-5xl">
  Responsive heading
</h1>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

## Dark Mode

The design system automatically supports dark mode:

```jsx
// Automatic dark mode
<div className="bg-neutral-50 dark:bg-neutral-950">
  <p className="text-neutral-900 dark:text-neutral-50">
    This adapts to dark mode
  </p>
</div>

// Dark mode specific styling
<div className="bg-white dark:bg-neutral-900 shadow-md dark:shadow-lg">
  <p className="text-neutral-900 dark:text-neutral-50">Content</p>
</div>
```

## Accessibility

The design system is built with accessibility in mind:

### Color Contrast

All color combinations meet WCAG AA standards:
- Text: 4.5:1 minimum contrast ratio
- Graphics: 3:1 minimum contrast ratio

### Focus States

All interactive elements have visible focus states:

```jsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Accessible Button
</button>
```

### Semantic HTML

Always use semantic HTML for better accessibility:

```jsx
// Good
<button onClick={handleClick}>Click me</button>
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Avoid
<div onClick={handleClick}>Click me</div>
<div>Email</div>
<div contentEditable>Email</div>
```

## Performance

The design system is optimized for performance:

- **CSS Purging:** Unused CSS is automatically removed
- **GPU Acceleration:** Animations use transform and opacity
- **Lazy Loading:** Images are lazy-loaded where appropriate
- **Bundle Size:** Optimized for minimal bundle size

## Best Practices

1. **Use Design Tokens:** Always use design tokens instead of hardcoded values
2. **Consistent Spacing:** Use the spacing scale consistently
3. **Semantic Colors:** Use semantic colors for their intended purpose
4. **Typography Hierarchy:** Maintain clear visual hierarchy
5. **Accessibility First:** Design with accessibility in mind
6. **Test Thoroughly:** Test all pages in light and dark modes
7. **Performance:** Use GPU-accelerated animations
8. **Documentation:** Keep documentation up to date

## Documentation

For comprehensive design system documentation, see:

- **Design System Guide:** `designSystem.md`
- **Design Tokens:** `designTokens.js`
- **Tailwind Config:** `../../tailwind.config.js`

## Troubleshooting

### Colors not appearing

Make sure you're using the correct Tailwind class names:
```jsx
// Correct
<div className="bg-primary-500">Content</div>

// Incorrect
<div className="bg-primary">Content</div>
```

### Animations not working

Ensure animations are enabled in your component:
```jsx
// Correct
<div className="animate-fade-in">Content</div>

// Incorrect
<div className="opacity-0">Content</div>
```

### Dark mode not working

Make sure dark mode is enabled in Tailwind config:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  // ...
}
```

## Contributing

When adding new design tokens or components:

1. Update `designTokens.js` with new tokens
2. Update `designSystem.md` with documentation
3. Update `tailwind.config.js` if needed
4. Test in both light and dark modes
5. Ensure accessibility compliance

## Support

For questions or issues with the design system, please:

1. Check the documentation in `designSystem.md`
2. Review the design tokens in `designTokens.js`
3. Check the Tailwind configuration in `tailwind.config.js`
4. Create an issue in the project repository

---

**Last Updated:** 2024
**Version:** 1.0.0
