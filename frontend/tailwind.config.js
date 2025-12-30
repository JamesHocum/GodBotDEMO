/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: '#030014',
                foreground: '#e2e8f0',
                card: {
                    DEFAULT: '#0a0a0f',
                    foreground: '#ffffff'
                },
                popover: {
                    DEFAULT: '#0a0a0f',
                    foreground: '#ffffff'
                },
                primary: {
                    DEFAULT: '#d946ef',
                    foreground: '#ffffff'
                },
                secondary: {
                    DEFAULT: '#06b6d4',
                    foreground: '#000000'
                },
                muted: {
                    DEFAULT: '#1e1b4b',
                    foreground: '#94a3b8'
                },
                accent: {
                    DEFAULT: '#22c55e',
                    foreground: '#000000'
                },
                destructive: {
                    DEFAULT: '#ff0055',
                    foreground: '#ffffff'
                },
                border: '#2e1065',
                input: '#1e1b4b',
                ring: '#d946ef',
                neon: {
                    magenta: '#d946ef',
                    cyan: '#06b6d4',
                    green: '#22c55e',
                    purple: '#8b5cf6'
                }
            },
            fontFamily: {
                heading: ['Unbounded', 'sans-serif'],
                body: ['JetBrains Mono', 'monospace'],
                mono: ['JetBrains Mono', 'monospace']
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'blink': 'blink 1s step-end infinite',
                'scanline': 'scanline 8s linear infinite'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(217, 70, 239, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(217, 70, 239, 0.8)' }
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' }
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                }
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
