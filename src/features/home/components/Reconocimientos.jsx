// src/features/home/components/Reconocimientos.jsx
//
// Sección "Reconocimientos y Noticias" del Home. Usa un <section> nativo
// (en vez de <Section>) porque necesita un tono warm-100 + borde superior
// para diferenciarse del warm-50 de ImpactCounters justo arriba — Section
// solo ofrece primary/white/warm/accent, y "warm" ya está tomado por esa
// sección vecina. El scroll-reveal de framer-motion se replica a mano con
// motion.section para no perder el efecto que traía Section por defecto.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchRecognitions } from '../../recognitions/services/recognitionsService';

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function formatDate(ts) {
  if (!ts) return null;
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Reconocimientos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecognitions()
      .then(setItems)
      .catch((err) => console.error('[Reconocimientos]', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <motion.section
      className="bg-warm-100 border-t border-warm-200 py-16 lg:py-24"
      {...sectionMotion}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
            Nuestra trayectoria
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-primary-900">
            Reconocimientos y Noticias
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {items.map((item) => (
            <RecognitionCard key={item.id} item={item} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

function RecognitionCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const dateLabel = formatDate(item.date);

  return (
    <motion.article
      variants={cardVariants}
      onClick={() => setExpanded((prev) => !prev)}
      className="group bg-white rounded-2xl border border-warm-200 shadow-soft hover:shadow-soft-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer select-none"
    >
      <div className="aspect-[4/3] overflow-hidden bg-warm-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-warm-400">
            <TrophyIcon className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {dateLabel && (
          <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide">
            {dateLabel}
          </span>
        )}
        <h3 className="mt-1.5 font-display text-base font-semibold text-primary-900 leading-snug">
          {item.title}
        </h3>
        {item.description && (
          <>
            <p
              className={`mt-2 text-sm text-warm-600 leading-relaxed flex-1 ${
                expanded ? '' : 'line-clamp-3 group-hover:line-clamp-none'
              }`}
            >
              {item.description}
            </p>
            <span className="mt-2 text-xs font-semibold text-accent-700 group-hover:underline">
              {expanded ? 'Leer menos' : 'Leer más'}
            </span>
          </>
        )}
      </div>
    </motion.article>
  );
}

function TrophyIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.29 0 4.544.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  );
}