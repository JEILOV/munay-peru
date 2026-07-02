// src/pages/admin/PartnershipsManagerPage.jsx
import { useState, useEffect } from 'react';
import {
  fetchPartnerships,
  updatePartnershipStatus,
  deletePartnership,
} from '../../features/partnerships/services/partnershipsService';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_MAP = {
  pending:  { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700' },
  approved: { label: 'Aprobada',  cls: 'bg-green-100  text-green-700'  },
  rejected: { label: 'Rechazada', cls: 'bg-red-100    text-red-700'    },
};

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */

export default function PartnershipsManagerPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchPartnerships()
      .then(setItems)
      .catch((err) => {
        console.error('[PartnershipsManagerPage] Error al cargar:', err);
        setError('No se pudieron cargar las solicitudes.');
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Cambiar estado ───────────────────────────────────────────────────── */
  async function handleStatusChange(id, newStatus) {
    try {
      await updatePartnershipStatus(id, newStatus);
      setItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, status: newStatus } : item)
      );
    } catch (err) {
      console.error('[PartnershipsManagerPage] Error al actualizar estado:', err);
      alert('No se pudo actualizar el estado. Inténtalo de nuevo.');
    }
  }

  /* ── Eliminar ─────────────────────────────────────────────────────────── */
  async function handleDelete(item) {
    const confirmed = window.confirm(
      `¿Eliminar la solicitud de "${item.orgName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      await deletePartnership(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('[PartnershipsManagerPage] Error al eliminar:', err);
      alert('No se pudo eliminar la solicitud.');
    }
  }

  /* ── Contadores por estado ────────────────────────────────────────────── */
  const counts = items.reduce(
    (acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }),
    {}
  );

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-1">
          Alianzas estratégicas
        </p>
        <h1 className="text-3xl font-bold text-gray-800">Solicitudes de alianza</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona las organizaciones que quieren colaborar con Munay Perú.
        </p>

        {/* Resumen rápido de estados */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mt-4">
            {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => (
              <span key={key} className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
                {counts[key] ?? 0} {label}{(counts[key] ?? 0) !== 1 ? 's' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Estados globales */}
      {loading && <SkeletonList />}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
          <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Lista */}
      {!loading && !error && (
        items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <HandshakeIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay solicitudes de alianza todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <PartnershipCard
                key={item.id}
                data={item}
                onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

/* ── Tarjeta de solicitud ──────────────────────────────────────────────────── */

function PartnershipCard({ data, onStatusChange, onDelete }) {
  const isPending  = data.status === 'pending';
  const isApproved = data.status === 'approved';
  const cfg        = STATUS_MAP[data.status] ?? STATUS_MAP.pending;

  return (
    <div className={`
      relative bg-white rounded-2xl border shadow-sm p-6 transition-all
      ${isPending ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'}
    `}>

      {/* Indicador de nuevo */}
      {isPending && (
        <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
        </span>
      )}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 text-lg">{data.orgName}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{data.orgType}</p>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatDate(data.createdAt)}
        </p>
      </div>

      {/* Datos de la organización */}
      <div className="mb-4">
        <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Datos de contacto
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetaChip label="Representante" value={data.representative ?? '—'} />

          {/* Correo con acción directa → abre Gmail */}
          <MetaChip label="Correo">
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(data.email)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline truncate block"
              title="Abrir en Gmail"
            >
              {data.email}
            </a>
          </MetaChip>

          {/* Teléfono con acción directa → abre WhatsApp Web */}
          <MetaChip label="Teléfono / WhatsApp">
            <a
              href={`https://wa.me/${data.phone?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-green-600 hover:underline truncate block"
              title="Abrir en WhatsApp Web"
            >
              {data.phone}
            </a>
          </MetaChip>
        </div>
      </div>

      {/* Propuesta */}
      {data.proposal && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
            Propuesta de colaboración
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {data.proposal}
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">

        {/* Cambio de estado */}
        <div className="flex items-center gap-2">
          {!isApproved && (
            <button
              onClick={() => onStatusChange('approved')}
              className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline transition-colors flex items-center gap-1"
            >
              <CheckIcon className="h-4 w-4" /> Aprobar
            </button>
          )}
          {data.status !== 'rejected' && (
            <button
              onClick={() => onStatusChange('rejected')}
              className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors flex items-center gap-1"
            >
              <XIcon className="h-4 w-4" /> Rechazar
            </button>
          )}
          {!isPending && (
            <button
              onClick={() => onStatusChange('pending')}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors flex items-center gap-1"
            >
              <RefreshIcon className="h-4 w-4" /> Marcar pendiente
            </button>
          )}
        </div>

        {/* Eliminar */}
        <button
          onClick={onDelete}
          className="text-xs text-gray-400 hover:text-red-500 hover:underline transition-colors"
        >
          Eliminar registro
        </button>
      </div>
    </div>
  );
}

/* ── Sub-componentes ──────────────────────────────────────────────────────── */

function MetaChip({ label, value, children }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      {children ?? (
        <p className="text-sm text-gray-700 font-semibold truncate">{value}</p>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded-lg" />
              <div className="h-3 w-24 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-3 w-20 bg-gray-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* ── Íconos ───────────────────────────────────────────────────────────────── */

function CheckIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function XIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function RefreshIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
function HandshakeIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56-5.84a14.98 14.98 0 00-2.58 5.84m2.699 2.7a6 6 0 11-8.485-8.485" />
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