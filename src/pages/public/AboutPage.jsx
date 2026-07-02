// src/pages/public/AboutPage.jsx
//
// Rediseño completo con contenido oficial de Munay Perú.
// La sección de Equipo consume Firestore vía useEffect + fetchTeam() —
// el resto del contenido (Misión/Visión, Impacto, Ejes, Valores) es
// estático por naturaleza: son definiciones institucionales que no
// cambian con frecuencia y no justifican una colección en Firestore.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../../components/layout/Section';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import quienesSomosImg from '../../assets/quienes-somos.jpg';
import eduImg from '../../assets/edu.jpg';
import ecoImg from '../../assets/eco.jpg';
import ddhhImg from '../../assets/ddhh.jpg';
import TestimonialsSection from '../../features/testimonials/components/TestimonialsSection';

// ---------- datos estáticos institucionales ----------

const MISION_VISION = [
  {
    id: 'mision',
    eyebrow: 'Misión',
   
    text:
      'Trabajamos en las comunidades vulnerables del Perú a través de proyectos sostenibles en educación, derechos humanos, medio ambiente y salud y bienestar. Fomentamos la participación activa, el empoderamiento y la solidaridad, promoviendo el desarrollo integral con un enfoque inclusivo y sostenible.',
  },
  {
    id: 'vision',
    eyebrow: 'Visión',
    text:
      'Ser una organización líder en la promoción del desarrollo social en Perú, basada en la solidaridad, el respeto y el amor por nuestra comunidad. Aspiramos a empoderar a las poblaciones vulnerables contribuyendo a un país más justo, inclusivo y próspero.',
  },
];

const EJES = [
  {
    id: 'educacion',
    title: 'Educación',
    description:
      'Busca transformar la educación en una herramienta de cambio social, promoviendo el acceso a conocimientos y oportunidades para comunidades vulnerables.',
    image: eduImg,
  },
  {
    id: 'medio-ambiente',
    title: 'Medio Ambiente',
    description:
      'Trabaja en la protección y conservación mediante iniciativas de educación ambiental, reforestación y promoción de prácticas sostenibles.',
    image: ecoImg,
  },
  {
    id: 'derechos-humanos',
    title: 'Derechos Humanos',
    description:
      'Se dedica a la promoción y defensa, con énfasis en la igualdad de género, la inclusión social y el empoderamiento de comunidades marginadas.',
    image: ddhhImg,
  },
];

const VALUES = [
  'Respeto', 'Justicia', 'Igualdad / Equidad', 'Libertad',
  'Integridad', 'Orden', 'Tolerancia', 'Responsabilidad',
  'Lealtad', 'Verdad', 'Solidaridad', 'Moralidad',
];

// ---------- página principal ----------

export default function AboutPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      setLoading(true);
      setError(null);
      try {
        // fetchTeam() se importará cuando exista el servicio real.
        // Por ahora lanzamos un import dinámico defensivo para no romper
        // la build si el archivo aún no existe.
        const { fetchTeam } = await import('../../features/about/services/teamService');
        const data = await fetchTeam();
        if (!cancelled) setTeam(data);
      } catch (err) {
        console.error('[AboutPage] Error al cargar el equipo:', err);
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTeam();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-warm-50">

      {/* ── HERO: Quiénes somos ── */}
      <Section
        variant="primary"
        backgroundImage="https://i.pinimg.com/736x/4f/85/f7/4f85f740cc5a66fe95c57d2cb8466604.jpg" // Pega aquí tu URL de imgbb para el fondo del hero
        containerClassName="relative"
      >
        {/* patrón de puntos sutil, coherente con HeroSection */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />

        <div className="relative">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-warm-50/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-300 border border-warm-50/10">
              Munay Perú Organization
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold text-warm-50 leading-tight">
              Quiénes somos
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <img
              src={quienesSomosImg}
              alt="Voluntarios de Munay Perú trabajando en comunidad"
              className="w-full h-[420px] lg:h-[480px] object-cover rounded-2xl shadow-soft-lg"
            />

            <MisionVisionAccordion />
          </div>
        </div>
      </Section>

      {/* ── IMPACTO ── */}
      <Section variant="accent" containerClassName="max-w-4xl text-center">
        <p className="font-display text-6xl sm:text-7xl font-bold text-primary-900">
          <AnimatedCounter value={3000} prefix="+" />
        </p>
        <p className="mt-3 text-xl font-semibold text-primary-800">
          Personas impactadas
        </p>
        <p className="mt-2 text-sm text-primary-700 max-w-md mx-auto">
          A través de actividades, alianzas estratégicas y proyectos sostenibles
          en todo el territorio peruano.
        </p>
      </Section>

      {/* ── EJES DE ACCIÓN ── */}
      <Section variant="warm">
        <SectionHeader
          eyebrow="Lo que hacemos"
          title="Nuestros ejes de acción"
        />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {EJES.map((eje) => (
            <AxisCard key={eje.id} {...eje} />
          ))}
        </div>
      </Section>

      {/* ── VALORES ── */}
      <Section variant="white" containerClassName="max-w-4xl">
        <style>{`
          @keyframes float-organic {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-8px) rotate(-1.5deg); }
            66% { transform: translateY(5px) rotate(1.5deg); }
          }
        `}</style>
        <SectionHeader
          eyebrow="Lo que nos guía"
          title="Nuestros 12 valores"
          centered
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {VALUES.map((value, index) => (
            <ValueBadge key={value} label={value} index={index} />
          ))}
        </div>
      </Section>

      {/* ── EQUIPO ── */}
      <Section variant="warm">
        <SectionHeader
          eyebrow="Quiénes lo hacemos posible"
          title="Nuestro equipo"
          centered
        />

        {loading ? (
          <TeamSkeleton />
        ) : error ? (
          <div className="mt-10 text-center text-warm-600 text-sm">
            No pudimos cargar el equipo en este momento.
          </div>
        ) : team.length === 0 ? (
          <div className="mt-10 text-center text-warm-500 text-sm">
            Próximamente presentaremos a nuestro equipo.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {team.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </Section>

      {/* ── TESTIMONIOS ── */}
      <TestimonialsSection />

    </div>
  );
}

// ---------- sub-componentes ----------

function SectionHeader({ eyebrow, title, centered = false }) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-primary-900">
        {title}
      </h2>
    </div>
  );
}

/**
 * MisionVisionAccordion — reemplaza los dos bloques estáticos de antes.
 * Un solo item permanece expandido a la vez; pasar el mouse por encima
 * de un item lo expande (no hace falta clic), y cada tarjeta entra con
 * un fade+slide escalonado cuando la sección aparece en el viewport.
 * La barra dorada lateral crece/encoge según el estado, reforzando
 * visualmente cuál es el item activo.
 */
function MisionVisionAccordion() {
  const [openId, setOpenId] = useState(MISION_VISION[0].id);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {MISION_VISION.map((item) => {
        const isOpen = openId === item.id;

        return (
          <motion.div
            key={item.id}
            variants={itemVariants}
            onHoverStart={() => setOpenId(item.id)}
            onClick={() => setOpenId(item.id)}
            className="relative overflow-hidden rounded-2xl bg-warm-50/10 backdrop-blur-sm border border-warm-50/15 cursor-pointer"
          >
            {/* Barra lateral dorada: crece cuando el item está activo */}
            <motion.div
              className="absolute top-0 left-0 w-1.5 h-full bg-accent-400 origin-top"
              animate={{ scaleY: isOpen ? 1 : 0.35, opacity: isOpen ? 1 : 0.5 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />

            <div className="p-8 pl-10">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-3 font-display text-lg font-bold tracking-widest text-accent-400 uppercase">
                  {item.icon}
                  {item.eyebrow}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-accent-400 text-2xl leading-none shrink-0"
                  aria-hidden="true"
                >
                  +
                </motion.span>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-warm-100 leading-relaxed text-[0.95rem]">
                      {item.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * AxisCard — fondo fotográfico a sangre completa, overlay oscuro inferior
 * por defecto, y la descripción revelada al hover. group-hover controla
 * tres cosas a la vez: zoom de la imagen, intensidad del overlay y
 * aparición del texto, para que se sienta como un solo gesto, no tres
 * animaciones sueltas.
 */
function AxisCard({ title, description, image }) {
  return (
    <div className="group relative h-96 overflow-hidden rounded-2xl shadow-soft hover:shadow-soft-xl transition-shadow duration-500">
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      {/* Overlay oscuro que se intensifica al hacer hover */}
      <div className="absolute inset-0 bg-primary-900/40 transition-colors duration-500 group-hover:bg-primary-900/80" />

      {/* Título: Centrado por defecto, sube un poco al hacer hover */}
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-12">
        <h3 className="font-display text-2xl lg:text-3xl font-bold text-warm-50 tracking-wide text-center px-4 drop-shadow-md">
          {title}
        </h3>
      </div>

      {/* Descripción: Oculta abajo, aparece deslizando hacia arriba */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
        <p className="text-sm text-warm-50 leading-relaxed text-center">
          {description}
        </p>
      </div>
    </div>
  );
}

/**
 * ValueBadge — float sutil tipo burbuja orgánica. El keyframe se inyecta
 * una sola vez en la sección de Valores (ver <style> arriba); aquí solo
 * se aplica con un animationDelay distinto por índice para que no floten
 * todos sincronizados, que se vería mecánico en vez de orgánico.
 * motion-reduce desactiva la animación para personas con esa preferencia
 * de accesibilidad activada en su sistema.
 */
function ValueBadge({ label, index }) {
  // Alternamos la duración de la animación (3s, 4s, 5s) para crear un efecto orgánico desfasado
  const duration = 3 + (index % 3);
  const delay = index * 0.2;

  return (
    <span
      className="rounded-full border border-warm-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary-800 shadow-sm hover:shadow-md hover:border-accent-300 transition-all cursor-default"
      style={{
        animation: `float-organic ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {label}
    </span>
  );
}

function TeamMemberCard({ member }) {
  return (
    <div className="text-center group">
      <div className="relative aspect-square overflow-hidden rounded-2xl shadow-soft">
        <img
          src={member.photo}
          alt={member.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-primary-900">
        {member.name}
      </h3>
      <p className="mt-0.5 text-sm text-warm-600">{member.role}</p>
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-2xl bg-warm-200" />
          <div className="mt-4 h-3 w-3/4 mx-auto bg-warm-200 rounded" />
          <div className="mt-2 h-2.5 w-1/2 mx-auto bg-warm-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// ---------- iconos SVG (Heroicons outline) ----------

function MisionIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function VisionIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}