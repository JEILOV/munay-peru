// src/pages/public/EventsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchUpcomingEvents } from '../../features/projects/services/projectsService';

/* ── Helper: Timestamp de Firestore → fecha legible en español ──────────── */

function formatEventDate(ts) {
  if (!ts) return null;
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return null;

  const weekday = date.toLocaleDateString('es-PE', { weekday: 'long' });
  const day     = date.getDate();
  const month   = date.toLocaleDateString('es-PE', { month: 'long' });
  const year    = date.getFullYear();

  // "sábado 20 de julio de 2025"
  return `${capitalize(weekday)}, ${day} de ${month} de ${year}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */

export default function EventsPage() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchUpcomingEvents()
      .then(setEvents)
      .catch((err) => {
        console.error('[EventsPage] Error al cargar eventos:', err);
        // Si Firestore pide crear un índice compuesto, el error
        // incluye el link directo — se loguea en consola para que
        // el admin lo vea y lo cree con un clic.
        setError('No pudimos cargar los eventos. Inténtalo de nuevo.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-warm-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-primary-900 overflow-hidden">
        {/* Decoración geométrica de fondo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-warm-50 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500 rounded-full" />
          <div className="absolute -bottom-16 -right-10 w-96 h-96 bg-primary-600 rounded-full" />
        </div>

        <div className="relative container mx-auto max-w-5xl px-4 py-16 md:py-24 text-center">
          <span className="inline-block bg-accent-500/20 text-accent-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Agenda Munay Perú
          </span>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-warm-50 leading-tight mb-4">
            Próximos Eventos
          </h1>

          <p className="text-warm-200 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            Conferencias, talleres y actividades donde el cambio ocurre en tiempo real.
            Únete y forma parte de la acción.
          </p>

          {/* Pills de contexto */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: <CalendarIcon />, text: 'Fechas confirmadas' },
              { icon: <MapPinIcon />,   text: 'Piura · Cusco · Lima · Iquitos' },
              { icon: <TicketIcon />,   text: 'Inscripción gratuita' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 bg-warm-50/10 text-warm-200 text-sm px-3 py-1.5 rounded-full"
              >
                <span className="text-accent-400">{icon}</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div className="container mx-auto max-w-5xl px-4 py-14">

        {/* ── Estado: cargando ────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white shadow-soft overflow-hidden animate-pulse">
                <div className="aspect-video bg-warm-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-32 bg-warm-200 rounded" />
                  <div className="h-4 w-3/4 bg-warm-200 rounded" />
                  <div className="h-3 w-full bg-warm-100 rounded" />
                  <div className="h-3 w-2/3 bg-warm-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Estado: error ────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-warm-600 text-sm">{error}</p>
          </div>
        )}

        {/* ── Estado: sin eventos ───────────────────────────────────────────── */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 gap-4">
            <div className="h-16 w-16 rounded-full bg-warm-100 flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-warm-400" />
            </div>
            <h2 className="font-display text-xl font-semibold text-primary-900">
              Pronto anunciaremos nuevas actividades
            </h2>
            <p className="text-warm-600 text-sm max-w-sm">
              Estamos preparando la próxima temporada de eventos. Síguenos en
              redes sociales para enterarte primero.
            </p>
            <Link to="/proyectos" className="mt-2">
              <Button variant="outline">Ver proyectos realizados</Button>
            </Link>
          </div>
        )}

        {/* ── Grid de eventos ───────────────────────────────────────────────── */}
        {!loading && !error && events.length > 0 && (
          <>
            <p className="text-sm text-warm-500 mb-6">
              {events.length} {events.length === 1 ? 'evento próximo' : 'eventos próximos'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ── EventCard ────────────────────────────────────────────────────────────── */

function EventCard({ event }) {
  const dateLabel = formatEventDate(event.eventDate);

  return (
    <Link to={`/proyectos/${event.slug}`} className="block group">
      <Card>
        {/* Imagen con badge de inscripciones abiertas */}
        <Card.Header
          src={event.coverImage}
          alt={event.title}
          badge={event.registrationOpen ? '✦ Inscripciones abiertas' : undefined}
        />

        <Card.Body>
          {/* Fecha — es el dato más importante, va primero y destacado */}
          {dateLabel && (
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarIcon className="h-3.5 w-3.5 text-accent-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide">
                {dateLabel}
              </span>
            </div>
          )}

          <Card.Title className="line-clamp-2">{event.title}</Card.Title>

          {event.description && (
            <Card.Description className="line-clamp-3">
              {event.description}
            </Card.Description>
          )}

          {/* CTA inline */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-primary-700 group-hover:text-primary-900 transition-colors flex items-center gap-1">
              Ver más
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>

            {event.registrationOpen && (
              <span className="inline-flex items-center gap-1 bg-accent-500/15 text-accent-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <PulsingDot />
                Abiertas
              </span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
}

/* ── Micro-componentes ────────────────────────────────────────────────────── */

function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-600" />
    </span>
  );
}

/* ── Íconos ───────────────────────────────────────────────────────────────── */

function CalendarIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function MapPinIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function TicketIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
function ArrowRightIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}