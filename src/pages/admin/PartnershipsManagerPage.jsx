// src/pages/admin/PartnershipsManagerPage.jsx
import { useState, useEffect } from 'react';
import InboxList from '../../components/admin/InboxList';
import {
  fetchPartnerships,
  updatePartnershipStatus,
  deletePartnership,
} from '../../features/partnerships/services/partnershipsService';

function formatDate(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_MAP = {
  pending:  { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  approved: { label: 'Aprobada',  cls: 'bg-green-100  text-green-700  border-green-200'  },
  rejected: { label: 'Rechazada', cls: 'bg-red-100    text-red-700    border-red-200'    },
};

export default function PartnershipsManagerPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchPartnerships()
      .then(setItems)
      .catch((err) => {
        console.error('[PartnershipsManagerPage]', err);
        setError('No se pudieron cargar las solicitudes.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id, newStatus) {
    try {
      await updatePartnershipStatus(id, newStatus);
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error('[PartnershipsManagerPage] Error al actualizar:', err);
      alert('No se pudo actualizar el estado.');
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar la solicitud de "${item.orgName}"? No se puede deshacer.`)) return;
    try {
      await deletePartnership(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('[PartnershipsManagerPage] Error al eliminar:', err);
      alert('No se pudo eliminar la solicitud.');
    }
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-1">
          Alianzas estratégicas
        </p>
        <h1 className="text-3xl font-bold text-gray-800">Solicitudes de alianza</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona las organizaciones que quieren colaborar con Munay Perú.
          {!loading && pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">
              {pendingCount}
            </span>
          )}
        </p>
      </div>

      <InboxList
        items={items}
        loading={loading}
        error={error}
        searchFields={['orgName', 'representative', 'email', 'phone', 'orgType']}
        statusMap={STATUS_MAP}
        pendingKey="pending"
        emptyText="No hay solicitudes de alianza todavía."
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        renderCard={(item, actions) => (
          <PartnershipCard key={item.id} data={item} actions={actions} />
        )}
      />
    </div>
  );
}

function PartnershipCard({ data, actions }) {
  const isPending  = data.status === 'pending';
  const isApproved = data.status === 'approved';
  const cfg        = STATUS_MAP[data.status] ?? STATUS_MAP.pending;

  return (
    <div className={`relative bg-white rounded-2xl border shadow-sm p-6 transition-all ${
      isPending ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'
    }`}>
      {isPending && (
        <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
        </span>
      )}

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

      <div className="mb-4">
        <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Datos de contacto
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetaChip label="Representante" value={data.representative ?? '—'} />
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Correo</p>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(data.email)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 hover:underline truncate block"
            >
              {data.email}
            </a>
          </div>
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-400 font-medium mb-0.5">WhatsApp</p>
            <a
              href={`https://wa.me/${data.phone?.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-green-600 hover:underline truncate block"
            >
              {data.phone}
            </a>
          </div>
        </div>
      </div>

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

      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <div className="flex items-center gap-3">
          {!isApproved && (
            <ActionLink onClick={() => actions.changeStatus('approved')} color="green">
              ✓ Aprobar
            </ActionLink>
          )}
          {data.status !== 'rejected' && (
            <ActionLink onClick={() => actions.changeStatus('rejected')} color="red">
              ✕ Rechazar
            </ActionLink>
          )}
          {!isPending && (
            <ActionLink onClick={() => actions.changeStatus('pending')} color="orange">
              ↩ Pendiente
            </ActionLink>
          )}
        </div>
        <ActionLink onClick={actions.remove} color="danger">
          Eliminar registro
        </ActionLink>
      </div>
    </div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 font-semibold truncate">{value}</p>
    </div>
  );
}

function ActionLink({ onClick, color, children }) {
  const cls = {
    green:  'text-green-700 hover:text-green-800',
    red:    'text-red-600   hover:text-red-700',
    orange: 'text-orange-600 hover:text-orange-700',
    danger: 'text-gray-400  hover:text-red-500',
  }[color] ?? 'text-gray-500 hover:text-gray-700';
  return (
    <button onClick={onClick} className={`text-sm font-semibold hover:underline transition-colors ${cls}`}>
      {children}
    </button>
  );
}