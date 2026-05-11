# Design System Documentation

## Overview

This document provides comprehensive guidelines for using the unified design system across the application. The design system ensures visual consistency, improves user experience, and accelerates development by providing reusable components and tokens.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Shadows](#shadows)
5. [Animations](#animations)
6. [Border Radius](#border-radius)
7. [Component Sizes](#component-sizes)
8. [Usage Guidelines](#usage-guidelines)
9. [Dark Mode](#dark-mode)
10. [Accessibility](#accessibility)

---

## Color Palette

### Primary Colors (Cyan to Blue Gradient)

The primary color palette is based on a cyan-to-blue gradient, used for primary actions, highlights, and brand elements.

```
Primary 50:   #f0f9ff (Lightest)
Primary 100:  #e0f2fe
Primary 200:  #bae6fd
Primary 300:  #7dd3fc
Primary 400:  #38bdf8
Primary 500:  #0ea5e9 (Main)
Primary 600:  #0284c7 (Dark)
Primary 700:  #0369a1
Primary 800:  #075985
Primary 900:  #0c3d66 (Darkest)
```

**Usage:**
- Primary 500 for main CTAs and interactive elements
- Primary 600 for hover states on primary buttons
- Primary 700 for active states
- Primary 50-200 for backgrounds and light accents
- Primary 800-900 for text on light backgrounds

### Neutral Colors (Gray)

The neutral palette is used for backgrounds, text, borders, and secondary elements.

```
Neutral 50:   #fafafa (Lightest)
Neutral 100:  #f4f4f5
Neutral 200:  #e4e4e7
Neutral 300:  #d4d4d8
Neutral 400:  #a1a1a6
Neutral 500:  #71717a (Main)
Neutral 600:  #52525b
Neutral 700:  #3f3f46
Neutral 800:  #27272a
Neutral 900:  #18181b
Neutral 950:  #09090b (Darkest)
```

**Usage:**
- Neutral 50 for page backgrounds
- Neutral 100 for card backgrounds
- Neutral 200 for borders and dividers
- Neutral 500 for secondary text
- Neutral 700 for primary text
- Neutral 900 for dark backgrounds

### Semantic Colors

#### Success (Emerald)
- **Primary:** #22c55e
- **Usage:** Positive actions, confirmations, success messages
- **Palette:** Emerald 50-900

#### Warning (Orange)
- **Primary:** #f97316
- **Usage:** Alerts, cautions, warnings
- **Palette:** Orange 50-900

#### Error (Red)
- **Primary:** #ef4444
- **Usage:** Destructive actions, errors, validation failures
- **Palette:** Red 50-900

#### Info (Cyan)
- **Primary:** #0ea5e9
- **Usage:** Informational messages, hints
- **Palette:** Primary 50-900

### Gradients

#### Premium Gradient
```
linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)
```
**Usage:** Hero sections, premium features, prominent CTAs

#### Warm Gradient
```
linear-gradient(135deg, #dfa369 0%, #c88548 100%)
```
**Usage:** Accent sections, secondary highlights

#### Subtle Gradient
```
linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)
```
**Usage:** Overlay effects, glass morphism

### Color Contrast

All color combinations meet WCAG AA standards (4.5:1 for text, 3:1 for graphics).

**Text on Primary 500:**
- White text: ✓ Passes WCAG AA
- Neutral 900 text: ✓ Passes WCAG AA

**Text on Neutral 50:**
- Neutral 900 text: ✓ Passes WCAG AA
- Primary 600 text: ✓ Passes WCAG AA

---

## Typography

### Font Families

- **Body Text:** Inter (sans-serif)
- **Display/Headings:** Playfair Display (serif)

### Font Sizes and Weights

#### Headings

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 48px | 600 | 52px | Page titles |
| H2 | 36px | 600 | 44px | Section titles |
| H3 | 24px | 600 | 32px | Subsection titles |
| H4 | 20px | 600 | 28px | Card titles |
| H5 | 18px | 600 | 28px | Subheadings |
| H6 | 16px | 600 | 24px | Minor headings |

#### Body Text

| Type | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Body | 16px | 400 | 24px | Regular content |
| Body Small | 14px | 400 | 20px | Secondary content |
| Body XSmall | 12px | 400 | 16px | Tertiary content |

#### Labels and Captions

| Type | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Label | 12px | 500 | 16px | Form labels, badges |
| Label Large | 14px | 500 | 20px | Larger labels |
| Caption | 12px | 400 | 16px | Image captions |
| Caption Small | 11px | 400 | 14px | Small captions |

### Font Weights

- **Light:** 300 (rarely used)
- **Normal:** 400 (body text)
- **Medium:** 500 (labels, emphasis)
- **Semibold:** 600 (headings, strong emphasis)
- **Bold:** 700 (strong emphasis)
- **Black:** 900 (rarely used)

### Line Height

- **Tight:** 1.2 (headings)
- **Normal:** 1.5 (body text)
- **Relaxed:** 1.75 (comfortable reading)
- **Loose:** 2 (accessibility)

### Typography Usage Examples

```jsx
// Page Title
<h1 className="text-5xl font-semibold text-neutral-900">Page Title</h1>

// Section Title
<h2 className="text-4xl font-semibold text-neutral-900">Section Title</h2>

// Body Text
<p className="text-base font-normal text-neutral-700">Body text content</p>

// Label
<label className="text-xs font-medium text-neutral-600">Form Label</label>
```

---

## Spacing

The spacing system is based on an 8px base unit, creating a consistent scale throughout the application.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal spacing |
| sm | 8px | Small spacing |
| md | 16px | Default spacing |
| lg | 24px | Large spacing |
| xl | 32px | Extra large spacing |
| 2xl | 48px | Double extra large |
| 3xl | 64px | Triple extra large |

### Spacing Usage

```jsx
// Padding
<div className="p-4">xs padding</div>
<div className="p-2">sm padding</div>
<div className="p-4">md padding</div>

// Margin
<div className="m-4">xs margin</div>
<div className="m-2">sm margin</div>
<div className="m-4">md margin</div>

// Gap (flexbox/grid)
<div className="flex gap-4">xs gap</div>
<div className="grid gap-2">sm gap</div>
<div className="grid gap-4">md gap</div>
```

### Common Spacing Patterns

- **Card Padding:** 24px (lg)
- **Section Margin:** 32px (xl)
- **Component Gap:** 16px (md)
- **Form Field Gap:** 8px (sm)
- **Button Padding:** 10px vertical, 16px horizontal (md)

---

## Shadows

Shadows create depth and hierarchy in the interface. Use them strategically to guide user attention.

### Shadow Scale

| Level | Value | Usage |
|-------|-------|-------|
| xs | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle elevation |
| sm | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | Light elevation |
| md | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | Default elevation |
| lg | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05) | Prominent elevation |
| xl | 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) | High elevation |
| premium | 0 25px 50px -12px rgb(0 0 0 / 0.15) | Maximum elevation |
| glass | 0 8px 32px 0 rgba(31, 38, 135, 0.1) | Glass morphism |

### Glow Shadows

- **Glow Blue:** 0 0 30px rgba(3, 105, 161, 0.3)
- **Glow Orange:** 0 0 30px rgba(230, 132, 36, 0.3)
- **Glow Emerald:** 0 0 30px rgba(16, 185, 129, 0.3)

### Shadow Usage

```jsx
// Card with default shadow
<div className="shadow-md">Card content</div>

// Elevated card
<div className="shadow-lg">Elevated card</div>

// Premium shadow (modals, overlays)
<div className="shadow-premium">Premium content</div>

// Glow effect
<div className="shadow-glow-blue">Glowing element</div>
```

---

## Animations

Animations provide visual feedback and enhance user experience. All animations use GPU-accelerated properties for smooth 60fps performance.

### Animation Durations

| Duration | Value | Usage |
|----------|-------|-------|
| Fast | 200ms | Quick interactions (hover, focus) |
| Normal | 300ms | Standard transitions |
| Slow | 500ms | Page transitions |
| Slower | 700ms | Complex animations |
| Slowest | 1000ms | Entrance animations |

### Animation Easing

| Easing | Value | Usage |
|--------|-------|-------|
| Smooth | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| Bounce Smooth | cubic-bezier(0.34, 1.56, 0.64, 1) | Bouncy effects |
| Ease In | cubic-bezier(0.4, 0, 1, 1) | Accelerating |
| Ease Out | cubic-bezier(0, 0, 0.2, 1) | Decelerating |
| Ease In Out | cubic-bezier(0.4, 0, 0.2, 1) | Smooth both ways |

### Common Animations

- **Fade In:** 300ms smooth easing
- **Slide Up:** 500ms ease-out
- **Scale In:** 300ms ease-out
- **Spin:** 1s linear infinite
- **Pulse:** 2s cubic-bezier infinite
- **Float:** 3s ease-in-out infinite

### Animation Usage

```jsx
// Fade in animation
<div className="animate-fade-in">Fading in</div>

// Slide up animation
<div className="animate-slide-in-up">Sliding up</div>

// Scale in animation
<div className="animate-scale-in">Scaling in</div>

// Hover animation
<div className="hover:scale-105 transition-transform duration-300">
  Hover me
</div>
```

---

## Border Radius

Border radius creates rounded corners for a modern, friendly appearance.

### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Minimal rounding |
| sm | 6px | Slight rounding |
| md | 8px | Default rounding |
| lg | 12px | Card rounding |
| xl | 16px | Large rounding |
| 2xl | 20px | Extra large rounding |
| 3xl | 24px | Maximum rounding |
| full | 9999px | Circular/pill shape |

### Border Radius Usage

```jsx
// Card with default rounding
<div className="rounded-lg">Card</div>

// Button with rounding
<button className="rounded-md">Button</button>

// Circular avatar
<img className="rounded-full" src="avatar.jpg" />

// Pill-shaped badge
<span className="rounded-full px-3 py-1">Badge</span>
```

---

## Component Sizes

### Button Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm | 8px 12px | 14px | 32px |
| md | 10px 16px | 16px | 40px |
| lg | 12px 24px | 18px | 48px |

### Input Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm | 8px 12px | 14px | 32px |
| md | 10px 16px | 16px | 40px |
| lg | 12px 16px | 18px | 48px |

### Badge Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| sm | 4px 8px | 12px |
| md | 6px 12px | 14px |
| lg | 8px 16px | 16px |

### Card Sizing

- **Padding:** 24px
- **Border Radius:** 12px
- **Shadow:** md (default)

### Modal Sizing

- **Max Width:** 500px
- **Border Radius:** 12px
- **Shadow:** premium

---

## Usage Guidelines

### Color Usage

1. **Primary Actions:** Use Primary 500 for main CTAs
2. **Secondary Actions:** Use Neutral 200 for secondary buttons
3. **Destructive Actions:** Use Error 500 for delete/remove actions
4. **Success States:** Use Success 500 for confirmations
5. **Warning States:** Use Warning 500 for alerts
6. **Error States:** Use Error 500 for validation errors

### Typography Usage

1. **Page Titles:** Use H1 (48px, semibold)
2. **Section Titles:** Use H2 (36px, semibold)
3. **Card Titles:** Use H4 (20px, semibold)
4. **Body Content:** Use Body (16px, normal)
5. **Labels:** Use Label (12px, medium)
6. **Captions:** Use Caption (12px, normal)

### Spacing Usage

1. **Card Padding:** Use lg (24px)
2. **Section Margin:** Use xl (32px)
3. **Component Gap:** Use md (16px)
4. **Form Field Gap:** Use sm (8px)
5. **Button Padding:** Use md (10px vertical, 16px horizontal)

### Shadow Usage

1. **Cards:** Use md shadow
2. **Elevated Cards:** Use lg shadow
3. **Modals:** Use premium shadow
4. **Hover Effects:** Increase shadow on hover
5. **Glow Effects:** Use glow shadows for emphasis

### Animation Usage

1. **Page Transitions:** Use fade-in (300ms)
2. **Button Hover:** Use scale (200ms)
3. **Modal Entrance:** Use scale-in (300ms)
4. **Loading States:** Use spin (1s)
5. **Entrance Animations:** Use fade-in-up (600ms)

---

## Dark Mode

The design system supports dark mode with automatic color adjustments.

### Dark Mode Colors

- **Background:** Neutral 950 (#09090b)
- **Surface:** Neutral 900 (#18181b)
- **Text:** Neutral 50 (#fafafa)
- **Secondary Text:** Neutral 400 (#a1a1a6)
- **Borders:** Neutral 800 (#27272a)

### Dark Mode Implementation

```jsx
// Automatic dark mode support with Tailwind
<div className="bg-neutral-50 dark:bg-neutral-950">
  <p className="text-neutral-900 dark:text-neutral-50">Content</p>
</div>
```

### Dark Mode Considerations

1. **Contrast:** Ensure text contrast meets WCAG AA standards
2. **Shadows:** Adjust shadow opacity for visibility
3. **Gradients:** Maintain visual distinction in dark mode
4. **Images:** Consider image appearance in dark mode
5. **Testing:** Test all pages in both light and dark modes

---

## Accessibility

### Color Contrast

All color combinations meet WCAG AA standards:
- **Text:** 4.5:1 minimum contrast ratio
- **Graphics:** 3:1 minimum contrast ratio

### Focus States

All interactive elements have visible focus states:
- **Focus Ring:** 2px solid primary color
- **Focus Offset:** 2px
- **Focus Color:** Primary 500

### Keyboard Navigation

- **Tab Order:** Logical and intuitive
- **Focus Visible:** Always visible
- **Keyboard Shortcuts:** Documented and consistent

### Screen Reader Support

- **Semantic HTML:** Proper heading hierarchy
- **ARIA Labels:** For complex components
- **Alt Text:** For all images
- **Form Labels:** Properly associated with inputs

### Motion and Animation

- **Prefers Reduced Motion:** Respect user preferences
- **Animation Duration:** Not too fast or slow
- **Flashing:** Avoid flashing content (> 3 times per second)

### Implementation

```jsx
// Accessible button
<button
  className="px-4 py-2 bg-primary-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
  aria-label="Submit form"
>
  Submit
</button>

// Accessible form
<form>
  <label htmlFor="email" className="block text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="mt-1 block w-full rounded-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
    aria-describedby="email-error"
  />
  <p id="email-error" className="mt-1 text-sm text-error-500">
    Please enter a valid email
  </p>
</form>
```

---

## Best Practices

1. **Use Design Tokens:** Always use design tokens instead of hardcoded values
2. **Consistent Spacing:** Use the spacing scale consistently
3. **Semantic Colors:** Use semantic colors for their intended purpose
4. **Typography Hierarchy:** Maintain clear visual hierarchy with typography
5. **Accessibility First:** Design with accessibility in mind from the start
6. **Test Thoroughly:** Test all pages in light and dark modes
7. **Performance:** Use GPU-accelerated animations
8. **Documentation:** Keep documentation up to date

---

## Resources

- **Design Tokens:** `src/styles/designTokens.js`
- **Tailwind Config:** `tailwind.config.js`
- **Component Library:** `src/components/`
- **Storybook:** (Coming soon)

---

## Questions or Feedback?

For questions or feedback about the design system, please contact the design team or create an issue in the project repository.
