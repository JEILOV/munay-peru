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

  if (loading) return null; // evita parpadeo de skeleton para una sección secundaria
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
            <p className="text-warm-700 text-sm leading-relaxed flex-1">
              “{item.content}”
            </p>
            <footer className="mt-4 flex items-center gap-3">
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-primary-900 text-sm">{item.name}</p>
                <p className="text-xs text-warm-500">{item.role}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}