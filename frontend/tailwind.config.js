/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic energy surfaces
        energy: {
          surface: {
            light: '#FFFFFF',
            dark: '#111827',
          },
          canvas: {
            light: '#F8FAFC',
            dark: '#0B0F19',
          },
          border: {
            light: '#E2E8F0',
            dark: '#1E293B',
          },
        },
        // Restrained accents
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        slate: {
          750: '#283548',
          850: '#151F30',
          950: '#090D16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated-dark': '0 4px 12px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
