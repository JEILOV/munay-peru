// src/features/home/components/HeroSection.jsx
import { Link } from 'react-router-dom';
import heroBg from '../../../assets/hero.jpg';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden py-24 sm:py-32">
      
      {/* ── 1. Imagen de Fondo ── */}
      <img
        src={heroBg}
        alt="Niños y voluntarios de Munay Perú"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* ── 2. Overlay Oscuro (Capa protectora) ── */}
      {/* Usamos un fondo guinda/negro semitransparente para que la foto se vea, pero el texto resalte */}
      <div className="absolute inset-0 bg-primary-900/70" />
      {/* Un ligero gradiente extra en la parte inferior para fundirse con la siguiente sección */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/40 to-transparent" />

      {/* ── 3. Contenido Principal ── */}
      {/* relative z-10 asegura que el texto esté por encima de la foto y el overlay */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Etiqueta Superior */}
        <div className="mb-8 flex justify-center">
          <span className="inline-block rounded-full border border-warm-50/20 bg-warm-50/10 px-4 py-1.5 text-sm font-medium text-warm-200 backdrop-blur-sm">
            Munay Perú Organization
          </span>
        </div>

        {/* Título */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-warm-50 leading-tight">
          Donde otros ven problemas, un voluntario Munay ve{' '}
          <span className="text-accent-400">oportunidades.</span>
        </h1>

        {/* Párrafo descriptivo */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-warm-100 leading-relaxed">
          Trabajamos junto a comunidades de Piura, Cusco, Lima e Iquitos para construir futuro desde la identidad y la cercanía.
        </p>

        {/* Botones de acción */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/voluntarios"
            className="w-full sm:w-auto rounded-full bg-accent-500 px-8 py-3.5 text-base font-semibold text-primary-900 shadow-sm hover:bg-accent-400 transition-colors duration-200"
          >
            Únete al cambio
          </Link>
          <Link
            to="/proyectos"
            className="w-full sm:w-auto rounded-full border border-warm-50/30 bg-transparent px-8 py-3.5 text-base font-semibold text-warm-50 hover:bg-warm-50/10 transition-colors duration-200 backdrop-blur-sm"
          >
            Conoce nuestros proyectos
          </Link>
        </div>
      </div>
    </section>
  );
}