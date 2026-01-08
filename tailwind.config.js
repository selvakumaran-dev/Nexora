export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexora: {
          primary: '#2563EB', // Professional Blue (Blue 600)
          'primary-hover': '#1D4ED8', // Blue 700
          secondary: '#475569', // Slate 600
          accent: '#0EA5E9', // Sky 500
          navy: '#0F172A', // Slate 900 (Deep background)
          paper: '#FFFFFF',
          background: '#F8FAFC', // Slate 50
          surface: '#F1F5F9', // Slate 100
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          border: '#E2E8F0', // Slate 200
          muted: '#94A3B8', // Slate 400
        }
      },
      fontFamily: {
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
      },
      borderRadius: {
        'lg-md': '10px',
        '2xl': '16px',
        '3xl': '24px'
      }
    }
  },
  plugins: [],
}
