/**
 * Design System Tokens
 * 
 * This file exports all design tokens used throughout the application.
 * These tokens are derived from the Tailwind configuration and provide
 * a centralized source of truth for colors, typography, spacing, shadows,
 * and animations.
 * 
 * Usage:
 * import { colors, typography, spacing, shadows, animations } from '@/styles/designTokens';
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors (Cyan to Blue Gradient)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Neutral Palette (Gray)
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1a6',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Slate Palette (Alternative Neutral)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Success Color (Emerald)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#059669',
    700: '#10b981',
    800: '#047857',
    900: '#065f46',
  },

  // Warning Color (Orange)
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Error Color (Red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Accent Color (Warm)
  accent: {
    50: '#fdf8f3',
    100: '#fdf2e9',
    200: '#fbe8d3',
    300: '#f5d5b8',
    400: '#ebb896',
    500: '#dfa369',
    600: '#c88548',
    700: '#a0633a',
    800: '#7d4a2b',
    900: '#5d3820',
  },

  // Semantic Colors
  semantic: {
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    info: '#0ea5e9',
  },

  // Gradients
  gradients: {
    premium: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    warm: 'linear-gradient(135deg, #dfa369 0%, #c88548 100%)',
    subtle: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    dark: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
    display: ['Playfair Display', 'serif'],
  },

  fontSize: {
    // Heading Sizes
    h1: { size: '48px', weight: 600, lineHeight: '52px' },
    h2: { size: '36px', weight: 600, lineHeight: '44px' },
    h3: { size: '24px', weight: 600, lineHeight: '32px' },
    h4: { size: '20px', weight: 600, lineHeight: '28px' },
    h5: { size: '18px', weight: 600, lineHeight: '28px' },
    h6: { size: '16px', weight: 600, lineHeight: '24px' },

    // Body Sizes
    body: { size: '16px', weight: 400, lineHeight: '24px' },
    bodySmall: { size: '14px', weight: 400, lineHeight: '20px' },
    bodyXSmall: { size: '12px', weight: 400, lineHeight: '16px' },

    // Label Sizes
    label: { size: '12px', weight: 500, lineHeight: '16px' },
    labelLarge: { size: '14px', weight: 500, lineHeight: '20px' },

    // Caption Sizes
    caption: { size: '12px', weight: 400, lineHeight: '16px' },
    captionSmall: { size: '11px', weight: 400, lineHeight: '14px' },
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',

  // Aliases for common usage
  gutter: '16px',
  gutterLg: '24px',
  gutterXl: '32px',

  // Padding scale
  padding: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // Margin scale
  margin: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // Gap scale (for flexbox/grid)
  gap: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  premium: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',

  // Glow shadows
  glowBlue: '0 0 30px rgba(3, 105, 161, 0.3)',
  glowOrange: '0 0 30px rgba(230, 132, 36, 0.3)',
  glowEmerald: '0 0 30px rgba(16, 185, 129, 0.3)',
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },

  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounceSmooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  transitions: {
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  keyframes: {
    fadeIn: 'fadeIn 300ms ease-in-out',
    fadeInUp: 'fadeInUp 600ms ease-out forwards',
    fadeInDown: 'fadeInDown 600ms ease-out forwards',
    fadeInLeft: 'fadeInLeft 600ms ease-out forwards',
    fadeInRight: 'fadeInRight 600ms ease-out forwards',
    slideUp: 'slideUp 500ms ease-out',
    slideDown: 'slideDown 500ms ease-out',
    slideLeft: 'slideLeft 500ms ease-out',
    slideRight: 'slideRight 500ms ease-out',
    scaleIn: 'scaleIn 300ms ease-out',
    scaleOut: 'scaleOut 300ms ease-out',
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    float: 'float 3s ease-in-out infinite',
    bounce: 'bounce 2s infinite',
    glow: 'glow 2s ease-in-out infinite',
    shimmer: 'shimmer 2s infinite',
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const componentSizes = {
  button: {
    sm: {
      padding: '8px 12px',
      fontSize: '14px',
      height: '32px',
    },
    md: {
      padding: '10px 16px',
      fontSize: '16px',
      height: '40px',
    },
    lg: {
      padding: '12px 24px',
      fontSize: '18px',
      height: '48px',
    },
  },

  input: {
    sm: {
      padding: '8px 12px',
      fontSize: '14px',
      height: '32px',
    },
    md: {
      padding: '10px 16px',
      fontSize: '16px',
      height: '40px',
    },
    lg: {
      padding: '12px 16px',
      fontSize: '18px',
      height: '48px',
    },
  },

  badge: {
    sm: {
      padding: '4px 8px',
      fontSize: '12px',
    },
    md: {
      padding: '6px 12px',
      fontSize: '14px',
    },
    lg: {
      padding: '8px 16px',
      fontSize: '16px',
    },
  },

  card: {
    padding: '24px',
    borderRadius: '12px',
    shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },

  modal: {
    maxWidth: '500px',
    borderRadius: '12px',
    shadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
};

// ============================================================================
// DESIGN SYSTEM EXPORT
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  borderRadius,
  componentSizes,
  breakpoints,
  zIndex,
};

export default designTokens;
