/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0D7377',
        'primary-light': '#14919B',
        'primary-dark': '#095759',
        'accent': '#C9A227',
        'background': '#FAFAFA',
        'surface': '#FFFFFF',
        'text': '#1A1A2E',
        'text-secondary': '#6B7280',
        'success': '#2ECC71',
        'error': '#E74C3C',
        'warning': '#F39C12',
        'border': '#E5E7EB',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}