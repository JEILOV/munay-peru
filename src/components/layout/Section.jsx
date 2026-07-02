// src/components/layout/Section.jsx
//
// Contenedor base y único punto de entrada para el "ritmo visual" del sitio.
// Centraliza 3 cosas que antes se repetían a mano en cada página:
//
//   1. Fondo (variant)        → obliga a elegir conscientemente entre
//                                primary / white / warm en vez de repetir
//                                bg-primary-900 en todas las secciones.
//   2. Imagen dinámica         → backgroundImage acepta cualquier URL
//      (backgroundImage)         (ej. imgbb) vía style inline, con overlay
//                                automático para garantizar contraste.
//   3. Scroll-reveal            → initial/whileInView consistente con
//      (Framer Motion)           MunayDesignSystem, on por defecto,
//                                desactivable con animate={false}.
//
// Requiere: npm install framer-motion

import { motion } from 'framer-motion';
import clsx from 'clsx';

// Diccionario de fondos sólidos. "hero" es el fallback de texto/color
// cuando hay backgroundImage — el fondo visual real lo pone la imagen.
const VARIANTS = {
  primary: 'bg-primary-900 text-warm-50',
  white: 'bg-white text-primary-900',
  warm: 'bg-warm-50 text-primary-900',
  hero: 'text-warm-50',
};

// Patrón de animación definido por MunayDesignSystem — un solo lugar,
// nadie más en el proyecto debería volver a escribir estas líneas.
const REVEAL_MOTION = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export default function Section({
  variant = 'white',
  backgroundImage,
  overlay,
  animate = true,
  fullBleed = false,
  className,
  containerClassName,
  children,
  ...rest
}) {
  const hasImage = Boolean(backgroundImage);
  // El overlay se activa solo automáticamente si hay imagen de fondo,
  // salvo que se indique overlay={false} explícitamente.
  const showOverlay = hasImage && overlay !== false;

  const backgroundStyle = hasImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : undefined;

  const sectionClasses = clsx(
    'relative isolate overflow-hidden',
    hasImage ? clsx(VARIANTS.hero, 'bg-primary-900') : VARIANTS[variant],
    className,
  );

  const body = (
    <>
      {showOverlay && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/60 to-primary-900/80"
        />
      )}
      <div
        className={clsx(
          'relative z-10',
          !fullBleed && 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24',
          containerClassName,
        )}
      >
        {children}
      </div>
    </>
  );

  if (!animate) {
    return (
      <section className={sectionClasses} style={backgroundStyle} {...rest}>
        {body}
      </section>
    );
  }

  return (
    <motion.section
      className={sectionClasses}
      style={backgroundStyle}
      {...REVEAL_MOTION}
      {...rest}
    >
      {body}
    </motion.section>
  );
}