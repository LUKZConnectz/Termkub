import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#df0617',
        accent2: '#ff4057',
        surface: '#171319',
        bg: '#0e0b0f',
        border: '#2a2430',
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
