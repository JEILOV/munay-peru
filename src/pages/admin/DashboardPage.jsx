// src/pages/admin/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const INITIAL_METRICS = {
  headquarters: null,
  projects:     null,
  unreadMsgs:   null,
  pendingVols:  null,
};

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [hqSnap, projSnap, msgSnap, volSnap] = await Promise.all([
          getCountFromServer(collection(db, 'headquarters')),
          getCountFromServer(collection(db, 'projects')),
          getCountFromServer(query(collection(db, 'messages'),   where('status', '==', 'unread'))),
          getCountFromServer(query(collection(db, 'volunteers'), where('status', '==', 'pending'))),
        ]);

        setMetrics({
          headquarters: hqSnap.data().count,
          projects:     projSnap.data().count,
          unreadMsgs:   msgSnap.data().count,
          pendingVols:  volSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError('No se pudieron cargar las métricas. Verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">

      {/* ── Encabezado ───────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-1">
          Panel de Control
        </p>
        <h1 className="text-3xl font-bold text-gray-800">Resumen de tu impacto</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aquí tienes una vista rápida del estado actual de la plataforma.
        </p>
      </div>

      {/* ── Estados: cargando / error / contenido ────────────────────── */}
      {loading && <LoadingState />}
      {error   && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* ── Grid de métricas ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard
              label="Sedes registradas"
              value={metrics.headquarters}
              icon={<LocationIcon />}
              color="blue"
            />
            <MetricCard
              label="Proyectos publicados"
              value={metrics.projects}
              icon={<FolderIcon />}
              color="green"
            />
            <MetricCard
              label="Mensajes sin leer"
              value={metrics.unreadMsgs}
              icon={<MailIcon />}
              color={metrics.unreadMsgs > 0 ? 'orange' : 'gray'}
              highlight={metrics.unreadMsgs > 0}
            />
            <MetricCard
              label="Voluntarios pendientes"
              value={metrics.pendingVols}
              icon={<PeopleIcon />}
              color={metrics.pendingVols > 0 ? 'red' : 'gray'}
              highlight={metrics.pendingVols > 0}
            />
          </div>

          {/* ── Aviso de acciones pendientes ───────────────────────────── */}
          {(metrics.unreadMsgs > 0 || metrics.pendingVols > 0) && (
            <div className="mt-8 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
              <BellIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">
                Tienes{' '}
                {metrics.unreadMsgs > 0 && (
                  <strong>{metrics.unreadMsgs} mensaje{metrics.unreadMsgs > 1 ? 's' : ''} sin leer</strong>
                )}
                {metrics.unreadMsgs > 0 && metrics.pendingVols > 0 && ' y '}
                {metrics.pendingVols > 0 && (
                  <strong>{metrics.pendingVols} postulación{metrics.pendingVols > 1 ? 'es' : ''} pendiente{metrics.pendingVols > 1 ? 's' : ''}</strong>
                )}
                . Revísalos para mantener la plataforma al día.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── MetricCard ─────────────────────────────────────────────────────────── */

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100  text-blue-600',   value: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600',  value: 'text-green-700'  },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', value: 'text-orange-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100   text-red-600',    value: 'text-red-600'    },
  gray:   { bg: 'bg-gray-50',   icon: 'bg-gray-100  text-gray-500',   value: 'text-gray-700'   },
};

function MetricCard({ label, value, icon, color = 'gray', highlight = false }) {
  const c = COLOR_MAP[color];

  return (
    <div className={`relative rounded-2xl border ${highlight ? 'border-orange-200' : 'border-gray-100'} ${c.bg} p-6 flex flex-col gap-4 shadow-sm`}>
      {highlight && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
        </span>
      )}

      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${c.icon}`}>
        {icon}
      </div>

      <div>
        <p className={`text-4xl font-bold ${c.value}`}>
          {value ?? '—'}
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Estados auxiliares ─────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 h-36 animate-pulse">
          <div className="w-11 h-11 rounded-xl bg-gray-200 mb-4" />
          <div className="h-7 w-16 rounded-lg bg-gray-200 mb-2" />
          <div className="h-4 w-28 rounded-lg bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
      <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
      {message}
    </div>
  );
}

/* ── Íconos ─────────────────────────────────────────────────────────────── */

function LocationIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function WarningIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

export default DashboardPage;