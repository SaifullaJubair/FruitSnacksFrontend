/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌰 Primary Leather Brown
        primary: "#5A3A1E",
        primaryVariant: {
          50: "#EFE8E2",
          100: "#DCCDBF",
          200: "#B89785",
          300: "#946F5C",
          400: "#6F4F39",
          500: "#5A3A1E", // Main
          600: "#4A2F18",
          700: "#3B2412",
          800: "#2B190C",
          900: "#1B0E06",
        },

        // ⚫ Deep Espresso Brown (Dark Secondary)
        secondary: "#2B1C17",
        secondaryVariant: {
          100: "#D9D0CB",
          200: "#B8A79E",
          300: "#8F7567",
          400: "#5F4D43",
          500: "#2B1C17",
          600: "#231611",
          700: "#1C110D",
          800: "#150C09",
          900: "#0D0604",
        },

        // 🍷 Burgundy Accent
        accent: {
          100: "#EDE6E5",
          200: "#CBB3B0",
          300: "#A46B68",
          400: "#782D2C", // Oxblood
          500: "#4B1918", // Deep burgundy
        },

        // ☁️ Warm Neutral / Cream
        neutral: {
          50: "#F5F3F1",
          100: "#E6E1DC",
          200: "#CFC5BD",
          300: "#B3A293",
          400: "#8C7D6F",
          500: "#5A5147",
          600: "#403C35",
          700: "#2D2925",
          800: "#1A1816",
          900: "#0E0D0C",
        },

        // ⚫ Black Variants
        blackVariant: {
          charcoal: "#1A1A1A",
          matte: "#0D0D0D",
        },

        text: {
          light: "#B9A89A",
          default: "#E9E2DA",
          dark: "#FDFBF9",
        },
        darkblack: {
          300: "#747681",
          400: "#2A313C",
          500: "#23262B",
          600: "#1D1E24",
          700: "#151515",
        },
        success: {
          50: "#D9FBE6",
          100: "#B7FFD1",
          200: "#4ADE80",
          300: "#22C55E",
          400: "#16A34A",
        },
        warning: {
          100: "#FDE047",
          200: "#FACC15",
          300: "#EAB308",
        },
        error: {
          50: "#FCDEDE",
          100: "#FF7171",
          200: "#FF4747",
          300: "#DD3333",
          400: "#B91C1C",
          500: "#d22e2e",
          600: "#a82525",
          700: "#7e1c1c",
          800: "#541212",
        },
        bgray: {
          50: "#FAFAFA",
          100: "#F7FAFC",
          200: "#EDF2F7",
          300: "#E2E8F0",
          400: "#CBD5E0",
          500: "#A0AEC0",
          600: "#718096",
          700: "#4A5568",
          800: "#2D3748",
          900: "#1A202C",
        },
        bamber: {
          50: "#FFFBEB",
          100: "#FFC837",
          500: "#F6A723",
        },
        purple: "#936DFF",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("tailwindcss-animate"),
    [require("tailwindcss-motion")],
  ],
};
