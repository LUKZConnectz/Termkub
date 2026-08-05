import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#df0617',
        accent2: '#ff4057',
        ink: '#111216',
        muted: '#5a5c62',
        border: '#e7e7eb',
        soft: '#f7f7f8',
        panel: '#17171d',
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
