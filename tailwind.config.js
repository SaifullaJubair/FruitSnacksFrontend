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
  			primary: {
  				'50': '#E7ECF2',
  				'100': '#C3CFDD',
  				'200': '#9AB0C6',
  				'300': '#6D8DAF',
  				'400': '#456F97',
  				'500': '#234E7C',
  				'600': '#183C63',
  				'700': '#122D4A',
  				'800': '#0D1F34',
  				'900': '#0A1524',
  				DEFAULT: '#0D1B2A'
  			},
  			secondary: {
  				'50': '#F0E9E8',
  				'100': '#D7C3C0',
  				'200': '#BC9D98',
  				'300': '#9F7973',
  				'400': '#82554F',
  				'500': '#673E39',
  				'600': '#53312D',
  				'700': '#402521',
  				'800': '#2D1815',
  				'900': '#1D0E0B',
  				DEFAULT: '#3E2723'
  			},
  			accent: {
  				'50': '#FDF9F4',
  				'100': '#FAF4EC',
  				'200': '#F5E9DD',
  				'300': '#EFDECD',
  				'400': '#E9D3BE',
  				'500': '#E2C8AE',
  				'600': '#D5B08C',
  				'700': '#C79869',
  				'800': '#B88146',
  				'900': '#A96923',
  				DEFAULT: '#EDE0D4'
  			},
  			neutral: {
  				'50': '#F5F5F5',
  				'100': '#E9E9E9',
  				'200': '#D2D2D2',
  				'300': '#BCBCBC',
  				'400': '#A5A5A5',
  				'500': '#8F8F8F',
  				'600': '#787878',
  				'700': '#626262',
  				'800': '#4B4B4B',
  				'900': '#353535',
  				DEFAULT: '#8F8F8F'
  			},
  			complementary: {
  				'50': '#F9EEED',
  				'100': '#F2D9D7',
  				'200': '#E6B3AF',
  				'300': '#D98D87',
  				'400': '#CD675F',
  				'500': '#C04137',
  				'600': '#9A342C',
  				'700': '#732721',
  				'800': '#4D1A16',
  				'900': '#260D0B',
  				DEFAULT: '#C04137'
  			},
  			text: {
  				light: '#F9F5F0',
  				default: '#3A2C1E',
  				dark: '#1A1209'
  			},
  			success: {
  				'50': '#D9FBE6',
  				'100': '#B7FFD1',
  				'200': '#4ADE80',
  				'300': '#22C55E',
  				'400': '#16A34A'
  			},
  			warning: {
  				'100': '#FDE047',
  				'200': '#FACC15',
  				'300': '#EAB308'
  			},
  			error: {
  				'50': '#FCDEDE',
  				'100': '#FF7171',
  				'200': '#FF4747',
  				'300': '#DD3333',
  				'400': '#B91C1C'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwind-scrollbar"),
    require("tailwindcss-animate"),
    [require("tailwindcss-motion")],
  ],
};
