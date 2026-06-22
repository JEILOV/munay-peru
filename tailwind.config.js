/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARIO — Guinda/Vino institucional
        // Uso: Navbar, Footer, títulos H1/H2, fondos de secciones "serias"
        primary: {
          50:  '#FBF1F2',
          100: '#F4DCDF',
          200: '#E7B3BA',
          300: '#D8848F',
          400: '#C04F5F',
          500: '#9E2E3D',
          600: '#85222F', // tono intermedio para hovers sobre fondo claro
          700: '#6F1A28', // BASE — el guinda que definiste originalmente
          800: '#5A1521',
          900: '#43101A', // casi negro-vino, para texto sobre fondo claro o footer oscuro
          950: '#2C0A11',
        },
        // ACENTO — Dorado/Amarillo
        // Uso ESTRICTO: CTAs, botón "Donar", botón "Ser Voluntario", badges de conversión
        // No usar como color decorativo libre — reservar su impacto visual
        accent: {
          50:  '#FFFBEB',
          100: '#FFF3C4',
          200: '#FFE588',
          300: '#FFD43B', // hover claro / estados disabled-light
          400: '#FFC700', // BASE clara
          500: '#F0B100', // BASE — equivalente a yellow-500 ajustado
          600: '#D69800', // hover principal de botones CTA
          700: '#AD7A00',
          800: '#8A6200',
          900: '#714F00',
        },
        // FONDOS — Neutros cálidos (NUNCA blanco puro)
        warm: {
          50:  '#FDFBF7', // fondo base de toda la app
          100: '#F8F3EA',
          200: '#F0E8D8',
          300: '#E5D8C0',
          400: '#D3C0A0',
          500: '#B8A37D',
          600: '#9C8761',
          700: '#7D6B4D',
          800: '#5F513B',
          900: '#3D3327',
        },
      },
      fontFamily: {
        // Display: títulos institucionales — geométrica, moderna, coherente con el logo oficial
        display: ['"Poppins"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        // Sans: cuerpo de texto, UI del CMS — máxima legibilidad
        sans: ['"Inter"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        // Refuerzo del sistema de "bordes redondeados" del proyecto
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        // Sombra suave institucional, más cálida que el shadow-lg por defecto
        'soft': '0 4px 20px -2px rgba(67, 16, 26, 0.08)',
        'soft-lg': '0 10px 40px -4px rgba(67, 16, 26, 0.12)',
        'glow-accent': '0 0 0 4px rgba(240, 177, 0, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'count-up': 'countUp 2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      aspectRatio: {
        'card': '4 / 3',
      },
    },
  },
  plugins: [
    // Se añadirán según necesidad real al construir componentes:
    // require('@tailwindcss/forms')      -> cuando construyamos el formulario multi-step
    // require('@tailwindcss/typography') -> para renderizar el HTML del WYSIWYG en /noticias/:slug
  ],
}
