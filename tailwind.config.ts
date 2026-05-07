import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}", // Adicionamos os nossos módulos aqui!
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}", // E a pasta shared!
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Nossa paleta de cores principal
        'brand-pink': '#FBCFE8',  // Rosa claro suave
        'brand-blue': '#BAE6FD',  // Azul claro suave
        'brand-green': '#BBF7D0', // Verde claro suave
        // Variações ainda mais claras para fundos
        'brand-pink-light': '#FDF2F8',
        'brand-blue-light': '#F0F9FF',
        'brand-green-light': '#F0FDF4',
      },
    },
  },
  plugins: [],
};
export default config;