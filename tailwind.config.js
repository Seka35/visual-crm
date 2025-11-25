/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: '#3B82F6', // Deep Blue
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#8B5CF6', // Purple
  				foreground: '#FFFFFF'
  			},
  			success: {
  				DEFAULT: '#10B981', // Mint Green
  				foreground: '#FFFFFF'
  			},
  			warning: {
  				DEFAULT: '#F59E0B', // Soft Orange
  				foreground: '#FFFFFF'
  			},
  			danger: {
  				DEFAULT: '#EF4444', // Coral Red
  				foreground: '#FFFFFF'
  			},
  			background: '#F8FAFC', // Very pale blue/off-white
  			surface: '#FFFFFF',
  			border: '#E2E8F0',
  			muted: '#64748B'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
