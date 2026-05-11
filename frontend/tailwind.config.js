/**
 * Tailwind CSS Configuration
 * 
 * Complete design system configuration with:
 * - Color palette (primary, neutral, success, warning, error)
 * - Typography system (Inter, Playfair Display)
 * - Spacing scale (8px base unit)
 * - Shadow system (xs, sm, md, lg, xl, premium, glass)
 * - Animation keyframes and durations
 * - Dark mode support
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ========================================================================
      // COLOR PALETTE
      // ========================================================================
      colors: {
        // Primary Brand Colors (Cyan to Blue Gradient)
        // Requirement 2.1: Primary color shall be cyan-to-blue gradient
        'primary': {
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
          950: '#051e3e',
        },

        // Neutral Palette (Gray)
        // Requirement 2.2: Neutral palette shall include 11 shades (50-950)
        'neutral': {
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

        // Slate - Alternative Neutral
        'slate': {
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
        // Requirement 2.3: Success color shall be emerald
        'success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#0a3622',
        },

        // Warning Color (Orange)
        // Requirement 2.4: Warning color shall be orange
        'warning': {
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
          950: '#431407',
        },

        // Error Color (Red)
        // Requirement 2.5: Error color shall be red
        'error': {
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
          950: '#500724',
        },

        // Accent Color (Warm)
        'accent': {
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
          950: '#3d2817',
        },

        // Blue - Primary action color
        'blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // Emerald - Success color
        'emerald': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#0a3622',
        },

        // Orange - Warning/Secondary color
        'orange': {
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
          950: '#431407',
        },

        // Red - Error/Destructive color
        'red': {
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
          950: '#500724',
        },

        // Semantic Colors
        'semantic': {
          success: '#22c55e',
          warning: '#f97316',
          error: '#ef4444',
          info: '#0ea5e9',
        },
      },

      // ========================================================================
      // TYPOGRAPHY SYSTEM
      // ========================================================================
      // Requirement 3: Typography system with consistent sizing and weights
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },

      fontSize: {
        // Heading Sizes
        // Requirement 3.1-3.6: Heading sizes with appropriate weights
        'xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'base': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'xl': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        '2xl': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '3xl': ['30px', { lineHeight: '36px', fontWeight: '600' }],
        '4xl': ['36px', { lineHeight: '44px', fontWeight: '600' }],
        '5xl': ['48px', { lineHeight: '52px', fontWeight: '600' }],
        '6xl': ['60px', { lineHeight: '72px', fontWeight: '600' }],
        
        // Semantic sizes
        'h1': ['48px', { lineHeight: '52px', fontWeight: '600' }],
        'h2': ['36px', { lineHeight: '44px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'h6': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },

      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'black': 900,
      },

      lineHeight: {
        'tight': 1.2,
        'normal': 1.5,
        'relaxed': 1.75,
        'loose': 2,
      },

      // ========================================================================
      // SPACING SCALE
      // ========================================================================
      // Requirement 1.3: Spacing values (8px, 16px, 24px, 32px, 48px)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        'gutter': '16px',
        'gutter-lg': '24px',
        'gutter-xl': '32px',
      },

      // ========================================================================
      // SHADOW SYSTEM
      // ========================================================================
      // Requirement 1.4: Shadow depths (xs, sm, md, lg, xl, premium, glass)
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'premium': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        
        // Glow shadows
        'glow-blue': '0 0 30px rgba(3, 105, 161, 0.3)',
        'glow-orange': '0 0 30px rgba(230, 132, 36, 0.3)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.3)',
        'glow-primary': '0 0 30px rgba(14, 165, 233, 0.3)',
      },

      backdropBlur: {
        'glass': '10px',
      },

      // ========================================================================
      // BACKGROUND IMAGES & GRADIENTS
      // ========================================================================
      // Requirement 2.7: Gradient palette with at least 3 combinations
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
        'gradient-premium': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-warm': 'linear-gradient(135deg, #dfa369 0%, #c88548 100%)',
        'gradient-cool': 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
      },

      // ========================================================================
      // ANIMATION SYSTEM
      // ========================================================================
      // Requirement 1.5: Animation keyframes and durations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.6s ease-out forwards',

        // Slide animations
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.6s ease-out forwards',
        'slide-in-down': 'slideInDown 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',

        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'scale-down': 'scaleDown 0.3s ease-out',

        // Spin animations
        'spin-custom': 'spin 1s linear infinite',
        'spin-reverse': 'spinReverse 1s linear infinite',

        // Pulse animations
        'pulse-custom': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s infinite',

        // Float animations
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'float-fast': 'floatFast 2s ease-in-out infinite',

        // Bounce animations
        'bounce-custom': 'bounce 2s infinite',
        'bounce-large': 'bounceLarge 2s infinite',

        // Glow animations
        'glow': 'glow 2s ease-in-out infinite',
        'glow-orange': 'glowOrange 2s ease-in-out infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite',

        // Shimmer animations
        'shimmer': 'shimmer 2s infinite',
        'shimmer-slow': 'shimmerSlow 3s infinite',

        // Gradient animations
        'gradient': 'gradientShift 3s ease infinite',
        'gradient-flow': 'gradientFlow 4s ease infinite',

        // Expand animations
        'expand': 'expandWidth 0.8s ease-out forwards',
        'expand-height': 'expandHeight 0.8s ease-out forwards',

        // Transform animations
        'flip-x': 'flipX 0.6s ease-in-out forwards',
        'flip-y': 'flipY 0.6s ease-in-out forwards',
        'swing': 'swing 0.5s ease-in-out forwards',
        'shake': 'shake 0.5s ease-in-out forwards',
        'shake-small': 'shakeSmall 0.3s ease-in-out forwards',
      },

      keyframes: {
        // Fade keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        // Slide keyframes
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        // Scale keyframes
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.9)' },
        },

        // Spin keyframes
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },

        // Pulse keyframes
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(230, 132, 36, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(230, 132, 36, 0)' },
        },

        // Float keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-30px)' },
        },

        // Bounce keyframes
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceLarge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },

        // Glow keyframes
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)' },
        },
        glowOrange: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230, 132, 36, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(230, 132, 36, 0.8)' },
        },
        glowEmerald: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)' },
        },

        // Shimmer keyframes
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        shimmerSlow: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },

        // Gradient keyframes
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },

        // Expand keyframes
        expandWidth: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        expandHeight: {
          '0%': { height: '0' },
          '100%': { height: '100%' },
        },

        // Transform keyframes
        flipX: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(360deg)' },
        },
        flipY: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        swing: {
          '20%': { transform: 'rotate(15deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(5deg)' },
          '80%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        shakeSmall: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },

      // ========================================================================
      // TRANSITION TIMING
      // ========================================================================
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-smooth': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ========================================================================
      // BORDER RADIUS
      // ========================================================================
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      // ========================================================================
      // Z-INDEX SCALE
      // ========================================================================
      zIndex: {
        'hide': '-1',
        'auto': 'auto',
        'base': '0',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'backdrop': '1040',
        'offcanvas': '1050',
        'modal': '1060',
        'popover': '1070',
        'tooltip': '1080',
      },
    },
  },
  plugins: [],
}
