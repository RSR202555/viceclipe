import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vice: {
          bg: '#070611',
          bgSecondary: '#100B1D',
          card: '#151027',
          cardHover: '#1B1433',
          pink: '#FF1493',
          pinkHover: '#FF2A9D',
          purple: '#8B2EFF',
          purpleHover: '#9D47FF',
          blue: '#00D9FF',
          blueHover: '#2CE0FF',
          textMuted: '#A7A1B8',
          border: 'rgba(139, 46, 255, 0.18)',
          borderHover: 'rgba(255, 20, 147, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 20px -3px rgba(255, 20, 147, 0.45)',
        'neon-purple': '0 0 20px -3px rgba(139, 46, 255, 0.45)',
        'neon-blue': '0 0 20px -3px rgba(0, 217, 255, 0.45)',
        'neon-subtle': '0 8px 32px 0 rgba(16, 11, 29, 0.7)',
        'card-glow': '0 4px 20px -2px rgba(139, 46, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-vice': 'linear-gradient(135deg, #FF1493 0%, #8B2EFF 100%)',
        'gradient-vice-cyan': 'linear-gradient(135deg, #8B2EFF 0%, #00D9FF 100%)',
        'gradient-vice-full': 'linear-gradient(135deg, #FF1493 0%, #8B2EFF 50%, #00D9FF 100%)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(139, 46, 255, 0.15), transparent 70%)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};

export default config;
