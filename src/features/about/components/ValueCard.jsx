// src/features/about/components/ValueCard.jsx
//
// Signature visual: en vez de iconos de stock (mano con corazón, gente
// tomada de manos, etc. — el cliché de toda web de ONG), cada valor se
// representa con una forma geométrica simple en dorado sobre un fondo de
// puntos guinda, ecoando el patrón de fondo que ya usamos en HeroSection
// de Home. Mismo lenguaje visual, sin repetir el componente literal.

import clsx from 'clsx';

export default function ValueCard({ shape, title, description }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft hover:shadow-soft-lg transition-shadow duration-500 p-8 text-center border border-warm-200">
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #6F1A28 1px, transparent 0)',
            backgroundSize: '8px 8px',
          }}
          aria-hidden="true"
        />
        <ShapeIcon shape={shape} />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-primary-900">{title}</h3>
      <p className="mt-2 text-sm text-warm-700 leading-relaxed">{description}</p>
    </div>
  );
}

function ShapeIcon({ shape }) {
  const baseClass = 'relative w-10 h-10 bg-accent-500';

  if (shape === 'circle') {
    return <div className={clsx(baseClass, 'rounded-full')} aria-hidden="true" />;
  }
  if (shape === 'square') {
    return <div className={clsx(baseClass, 'rounded-lg rotate-45')} aria-hidden="true" />;
  }
  if (shape === 'triangle') {
    return (
      <div
        className="relative w-10 h-10"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          backgroundColor: '#F0B100',
        }}
        aria-hidden="true"
      />
    );
  }
  return null;
}
