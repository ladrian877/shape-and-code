/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  safelist: [
    'col-span-1','col-span-2','col-span-4',
    'sm:col-span-2','lg:col-span-2','lg:col-span-4',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        archivo: ['Archivo', 'sans-serif'],
        'space-mono': ['"Space Mono"', 'monospace'],
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        jetbrains: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
