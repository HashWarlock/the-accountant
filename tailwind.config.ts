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
          lime: 'var(--phala-lime)',
          'lime-hover': 'var(--brand-hover)',
          'lime-active': 'var(--brand-active)',
          g00: 'var(--phala-g00)',
          g01: 'var(--phala-g01)',
          g02: 'var(--phala-g02)',
          g03: 'var(--phala-g03)',
          g04: 'var(--phala-g04)',
          g05: 'var(--phala-g05)',
          g06: 'var(--phala-g06)',
          g07: 'var(--phala-g07)',
          g08: 'var(--phala-g08)',
          g09: 'var(--phala-g09)',
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
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-subtle': 'var(--gradient-subtle)',
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config