// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // Certifique-se que estes caminhos correspondem à sua estrutura de pastas
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}', // Mantenha se estiver usando Pages Router, remova se for só App Router
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Seus temas customizados aqui
    },
  },
  plugins: [
    // Seus plugins (como o de line-clamp) aqui
  ],
};