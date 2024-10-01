import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "pgmt-blue": "#03A9F4",
      },
      backgroundImage: {
        "radial-gradient-text-home":
          "radial-gradient(circle, rgba(255,255,255,1) 0%, #999999 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
