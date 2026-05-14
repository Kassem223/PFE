/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SaaS Dark Theme Palette
        'app': {
          bg:      '#161316',
          card:    '#1E1B1F',
          border:  '#2A2730',
          hover:   '#252229',
          input:   '#1A1720',
        },
        'accent': {
          DEFAULT: '#FF6D29',
          hover:   '#FF8547',
          muted:   '#FF6D2920',
          light:   '#FF6D2910',
        },
        'text': {
          primary:   '#FFFFFF',
          secondary: '#A1A1AA',
          muted:     '#71717A',
          inverse:   '#161316',
        },
        // Keep existing colors for compatibility
        'primary': {
          50: '#fff4ee', 100: '#ffe8d7', 200: '#ffd0ae', 300: '#ffb07c',
          400: '#ff8547', 500: '#FF6D29', 600: '#e85a18', 700: '#c24510',
          800: '#9a3710', 900: '#7c2e10', 950: '#431507',
        },
        'neutral': {
          50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
          400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
          800: '#27272a', 900: '#18181b', 950: '#09090b',
        },
        'slate': {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        'success': {
          50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 900: '#145231',
        },
        'warning': {
          50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', 900: '#7c2d12',
        },
        'error': {
          50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 900: '#7f1d1d',
        },
        'blue': {
          50: '#eff6ff', 100: '#dbeafe', 400: '#60a5fa', 500: '#3b82f6',
          600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
        },
        'emerald': {
          50: '#f0fdf4', 100: '#dcfce7', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 900: '#145231',
        },
        'purple': {
          50: '#faf5ff', 100: '#f3e8ff', 400: '#c084fc', 500: '#a855f7',
          600: '#9333ea', 700: '#7e22ce', 900: '#581c87',
        },
        'red': {
          50: '#fef2f2', 100: '#fee2e2', 400: '#f87171', 500: '#ef4444',
          600: '#dc2626', 700: '#b91c1c', 900: '#7f1d1d',
        },
        'green': {
          50: '#f0fdf4', 100: '#dcfce7', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 900: '#14532d',
        },
        'yellow': {
          50: '#fefce8', 100: '#fef9c3', 400: '#facc15', 500: '#eab308',
          600: '#ca8a04', 700: '#a16207', 900: '#713f12',
        },
        'orange': {
          50: '#fff7ed', 100: '#ffedd5', 400: '#fb923c', 500: '#f97316',
          600: '#ea580c', 700: '#c2410c', 900: '#7c2d12',
        },
        'indigo': {
          50: '#eef2ff', 100: '#e0e7ff', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 900: '#312e81',
        },
        'pink': {
          50: '#fdf2f8', 100: '#fce7f3', 400: '#f472b6', 500: '#ec4899',
          600: '#db2777', 700: '#be185d', 900: '#831843',
        },
        'cyan': {
          50: '#ecfeff', 100: '#cffafe', 400: '#22d3ee', 500: '#06b6d4',
          600: '#0891b2', 700: '#0e7490', 900: '#164e63',
        },
        'teal': {
          50: '#f0fdfa', 100: '#ccfbf1', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 900: '#134e4a',
        },
        'amber': {
          50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b',
          600: '#d97706', 700: '#b45309', 900: '#78350f',
        },
      },

      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '20px' }],
        'base': ['14px', { lineHeight: '22px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['34px', { lineHeight: '42px' }],
        '5xl': ['44px', { lineHeight: '52px' }],
        '6xl': ['56px', { lineHeight: '64px' }],
      },

      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        'sm':      '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
        'md':      '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
        'lg':      '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
        'xl':      '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
        '2xl':     '0 25px 50px -12px rgb(0 0 0 / 0.6)',
        'card':    '0 0 0 1px rgba(255,255,255,0.04), 0 4px 16px rgb(0 0 0 / 0.4)',
        'accent':  '0 0 20px rgba(255, 109, 41, 0.25)',
        'glow':    '0 0 30px rgba(255, 109, 41, 0.15)',
        'inner':   'inset 0 1px 0 rgba(255,255,255,0.05)',
        'premium': '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgb(0 0 0 / 0.5)',
        'glass':   '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        // Legacy
        'glow-blue':    '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-orange':  '0 0 30px rgba(255, 109, 41, 0.3)',
        'glow-emerald': '0 0 30px rgba(16, 185, 129, 0.3)',
        'glow-primary': '0 0 30px rgba(255, 109, 41, 0.3)',
      },

      borderRadius: {
        'xs': '4px', 'sm': '6px', 'md': '8px', 'lg': '10px',
        'xl': '12px', '2xl': '16px', '3xl': '20px', '4xl': '24px',
      },

      animation: {
        'fade-in':     'fadeIn 0.3s ease-out',
        'fade-in-up':  'fadeInUp 0.4s ease-out forwards',
        'slide-up':    'slideUp 0.3s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'shimmer':     'shimmer 2s infinite',
        'pulse-glow':  'pulseGlow 2s infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-custom': 'spin 1s linear infinite',
        // Legacy aliases
        'slide-in-up':    'fadeInUp 0.4s ease-out forwards',
        'slide-in-down':  'slideDown 0.3s ease-out',
        'slide-in-left':  'slideLeft 0.3s ease-out',
        'slide-in-right': 'slideRight 0.3s ease-out',
        'fade-in-down':   'slideDown 0.3s ease-out',
        'fade-in-left':   'slideLeft 0.3s ease-out',
        'fade-in-right':  'slideRight 0.3s ease-out',
        'bounce-custom':  'bounce 2s infinite',
        'pulse-custom':   'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient':       'gradientShift 3s ease infinite',
        'expand':         'expandWidth 0.8s ease-out forwards',
        'float-slow':     'float 4s ease-in-out infinite',
        'float-fast':     'float 2s ease-in-out infinite',
        'glow':           'pulseGlow 2s infinite',
        'glow-orange':    'pulseGlow 2s infinite',
        'glow-emerald':   'pulseGlowEmerald 2s infinite',
        'shimmer-slow':   'shimmer 3s infinite',
        'gradient-flow':  'gradientShift 4s ease infinite',
        'scale-out':      'scaleOut 0.2s ease-out',
        'scale-up':       'scaleIn 0.2s ease-out',
        'scale-down':     'scaleOut 0.2s ease-out',
        'slide-down':     'slideDown 0.3s ease-out',
        'slide-left':     'slideLeft 0.3s ease-out',
        'slide-right':    'slideRight 0.3s ease-out',
        'flip-x':         'flipX 0.6s ease-in-out forwards',
        'flip-y':         'flipY 0.6s ease-in-out forwards',
        'swing':          'swing 0.5s ease-in-out forwards',
        'shake':          'shake 0.5s ease-in-out forwards',
        'shake-small':    'shakeSmall 0.3s ease-in-out forwards',
        'expand-height':  'expandHeight 0.8s ease-out forwards',
        'spin-reverse':   'spinReverse 1s linear infinite',
        'bounce-large':   'bounceLarge 2s infinite',
      },

      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:  { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideLeft: { '0%': { transform: 'translateX(-12px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        slideRight:{ '0%': { transform: 'translateX(12px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:   { '0%': { transform: 'scale(0.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        scaleOut:  { '0%': { transform: 'scale(1)', opacity: '1' }, '100%': { transform: 'scale(0.96)', opacity: '0' } },
        shimmer:   { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 109, 41, 0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(255, 109, 41, 0)' },
        },
        pulseGlowEmerald: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(16, 185, 129, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        expandWidth:  { '0%': { width: '0' }, '100%': { width: '100%' } },
        expandHeight: { '0%': { height: '0' }, '100%': { height: '100%' } },
        spin:         { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        spinReverse:  { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } },
        bounce:       { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        bounceLarge:  { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
        pulse:        { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        flipX:        { '0%': { transform: 'rotateX(0deg)' }, '100%': { transform: 'rotateX(360deg)' } },
        flipY:        { '0%': { transform: 'rotateY(0deg)' }, '100%': { transform: 'rotateY(360deg)' } },
        swing: {
          '20%': { transform: 'rotate(12deg)' }, '40%': { transform: 'rotate(-8deg)' },
          '60%': { transform: 'rotate(4deg)' },  '80%': { transform: 'rotate(-4deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' },
        },
        shakeSmall: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-smooth': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      zIndex: {
        'hide': '-1', 'auto': 'auto', 'base': '0',
        'dropdown': '1000', 'sticky': '1020', 'fixed': '1030',
        'backdrop': '1040', 'offcanvas': '1050', 'modal': '1060',
        'popover': '1070', 'tooltip': '1080',
      },
    },
  },
  plugins: [],
}
