import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Phala Network Brand Colors
        phala: {
          lime: '#CDFA50',
          'lime-hover': '#BAE730',
          'lime-active': '#A8D520',
          g00: '#FCFDFA',
          g01: '#F7FBF1',
          g02: '#EBF9D0',
          g03: '#DFF4B5',
          g04: '#D1EB9C',
          g05: '#C2DD88',
          g06: '#B0CB72',
          g07: '#97B748',
          g08: '#647D1C',
          g09: '#36411D',
        },
        // Semantic color mappings for shadcn/ui
        border: "var(--border)",
        'border-strong': "var(--border-strong)",
        input: "var(--border)",
        ring: "var(--focus)",
        background: "var(--bg)",
        'background-subtle': "var(--bg-subtle)",
        'background-card': "var(--bg-card)",
        'background-hover': "var(--bg-hover)",
        'background-active': "var(--bg-active)",
        foreground: "var(--fg)",
        'foreground-muted': "var(--fg-muted)",
        'foreground-subtle': "var(--fg-subtle)",
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "var(--button-primary-text)",
          hover: "var(--brand-hover)",
          active: "var(--brand-active)",
        },
        secondary: {
          DEFAULT: "var(--button-secondary)",
          foreground: "var(--button-secondary-text)",
          hover: "var(--button-secondary-hover)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--badge)",
          foreground: "var(--fg-muted)",
        },
        accent: {
          DEFAULT: "var(--brand)",
          foreground: "var(--fg)",
        },
        popover: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--fg)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--fg)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        badge: "var(--badge)",
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
        'glow-hover': 'var(--shadow-glow-hover)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #F7FBF1 0%, #EBF9D0 100%)',
        'gradient-lime-black': 'linear-gradient(135deg, #CDFA50 0%, #000000 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config