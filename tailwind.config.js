export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexora: {
          primary: '#1A73E8',
          accent: '#03D7BE',
          navy: '#0A0F2B',
          paper: '#FFFFFF',
          slate: '#6B7280',
          brand: {
            purple: '#7C3AED',
            light: '#8B5CF6',
            orange: '#FB923C',
            dark: '#4C1D95'
          }
        },
        admin: {
          // Dark sidebar colors
          sidebar: {
            bg: '#0f0a1f',
            hover: 'rgba(139, 92, 246, 0.1)',
            active: 'rgba(139, 92, 246, 0.2)',
            border: 'rgba(139, 92, 246, 0.2)'
          },
          // Purple gradient theme
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764'
          },
          // Orange accent
          orange: {
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c'
          }
        }
      },
      borderRadius: {
        'lg-md': '12px',
        '2xl': '16px',
        '3xl': '24px'
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'admin': '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
        'admin-lg': '0 10px 15px -3px rgba(139, 92, 246, 0.1), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
        'admin-xl': '0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 10px 10px -5px rgba(139, 92, 246, 0.04)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-orange': '0 0 20px rgba(251, 146, 60, 0.4)'
      },
      backgroundImage: {
        'gradient-admin': 'linear-gradient(135deg, #7C3AED 0%, #FB923C 100%)',
        'gradient-admin-dark': 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0f0a1f 0%, #1a0f2e 50%, #0f0a1f 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(251, 146, 60, 0.05) 100%)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: [],
}
