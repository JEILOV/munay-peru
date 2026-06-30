// src/features/testimonials/components/TestimonialsSection.jsx
import { useEffect, useState } from 'react';
import { fetchTestimonials } from '../services/testimonialsService';

export default function TestimonialsSection() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials()
      .then(setItems)
      .catch((err) => console.error('[TestimonialsSection]', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center text-primary-900 mb-10">
        Lo que dicen de nosotros
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {items.map((item) => (
          <blockquote
            key={item.id}
            className="bg-white rounded-2xl border border-warm-200 shadow-soft p-6 flex flex-col"
          >
            {/* Comilla decorativa */}
            <span className="text-4xl leading-none text-primary-200 font-serif select-none mb-2">
              "
            </span>

            {/* Contenido del testimonio
                - break-words: rompe strings continuos sin espacios (fix del desborde)
                - overflow-hidden: segunda línea de defensa para el contenedor */}
            <p className="text-warm-700 text-sm leading-relaxed flex-1 break-words overflow-hidden">
              {item.content}
            </p>

            {/* Footer: avatar más grande + datos del autor */}
            <footer className="mt-6 flex items-center gap-4 pt-4 border-t border-warm-100">
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="h-14 w-14 rounded-full object-cover shrink-0 border-2 border-warm-200 shadow-sm"
                />
              ) : (
                // Fallback con inicial del nombre cuando no hay foto
                <div className="h-14 w-14 rounded-full shrink-0 bg-primary-100 border-2 border-primary-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600">
                    {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                {/* min-w-0 en el contenedor es necesario para que
                    truncate funcione correctamente dentro de un flex */}
                <p className="font-semibold text-primary-900 text-sm truncate">
                  {item.name}
                </p>
                <p className="text-xs text-warm-500 truncate">{item.role}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}