// src/features/home/components/ImpactCounters.jsx
import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { useCountUp } from '../../../hooks/useCountUp';

const COUNTER_DEFINITIONS = [
  {
    id:       'beneficiaries',
    label:    'Personas Beneficiadas',
    target:   2000,
    prefix:   '+',
    isStatic: true,
  },
  {
    id:       'volunteers',
    label:    'Voluntarios a Nivel Nacional',
    base:     150,           // Base inicial estática
    key:      'volunteers',  // Fuente dinámica
    prefix:   '+',
    isStatic: false,
  },
  {
    id:       'headquarters',
    label:    'Sedes Operativas',
    target:   4,
    prefix:   '',
    sublabel: 'Piura · Cusco · Lima · Iquitos',
    isStatic: true,
  },
];

export default function ImpactCounters() {
  const [dbVolunteers, setDbVolunteers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const snap = await getCountFromServer(collection(db, 'volunteers'));
        setDbVolunteers(snap.data().count);
      } catch (err) {
        console.error('ImpactCounters: error al obtener voluntarios', err);
        setDbVolunteers(0); // Fallback seguro si falla
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Lógica de resolución de contadores
  const resolvedCounters = COUNTER_DEFINITIONS.map((c) => {
    if (c.isStatic) return c;
    
    // Si está cargando y es dinámico, regresamos null para activar el skeleton
    if (loading) return { ...c, target: null };
    
    // Cálculo: Base fija (150) + dinámicos de Firebase
    return { ...c, target: c.base + (dbVolunteers ?? 0) };
  });

  return (
    <section className="bg-warm-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">
            Nuestro impacto
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-primary-900">
            Resultados que se sienten en cada sede
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {resolvedCounters.map((counter) => (
            <CounterCard key={counter.id} {...counter} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CounterCard({ target, prefix, label, sublabel }) {
  const isLoading = target === null;
  const { value, ref } = useCountUp({ target: target ?? 0, duration: 2000 });

  return (
    <div
      ref={ref}
      className="animate-count-up rounded-2xl bg-white shadow-soft hover:shadow-soft-lg
                 transition-shadow duration-500 px-8 py-10 text-center border border-warm-200"
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-14 w-28 rounded-xl bg-warm-200" />
          <div className="h-4  w-40 rounded-lg  bg-warm-100" />
        </div>
      ) : (
        <>
          <p className="font-display text-5xl sm:text-6xl font-bold text-primary-700 tabular-nums">
            {prefix}{value.toLocaleString('es-PE')}
          </p>
          <p className="mt-3 text-base font-medium text-primary-900">{label}</p>
          {sublabel && (
            <p className="mt-1 text-sm text-warm-600">{sublabel}</p>
          )}
        </>
      )}
    </div>
  );
}