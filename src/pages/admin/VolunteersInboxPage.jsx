// src/pages/admin/VolunteersInboxPage.jsx
import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import InboxList from '../../components/admin/InboxList';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Configuración de estados por colección ───────────────────────────────── */

const VOL_STATUS_MAP = {
  pending:  { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  reviewed: { label: 'Revisado',  cls: 'bg-green-100  text-green-700  border-green-200'  },
};

const MSG_STATUS_MAP = {
  unread: { label: 'No leído', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  read:   { label: 'Leído',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

/* ── Tabs ─────────────────────────────────────────────────────────────────── */

const TABS = [
  { key: 'volunteers', label: 'Postulaciones',       icon: <PeopleIcon /> },
  { key: 'messages',   label: 'Mensajes de contacto', icon: <MailIcon />   },
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */

export default function VolunteersInboxPage() {
  const [activeTab,  setActiveTab]  = useState('volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  /* ── Fetch inicial ────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [volSnap, msgSnap] = await Promise.all([
          getDocs(query(collection(db, 'volunteers'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'messages'),   orderBy('createdAt', 'desc'))),
        ]);
        setVolunteers(volSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setMessages(msgSnap.docs.map((d)  => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('[VolunteersInboxPage]', err);
        setError('No se pudieron cargar los datos. Verifica tu conexión.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Acciones genéricas ───────────────────────────────────────────────── */
  async function handleStatusChange(colName, setter, id, newStatus) {
    try {
      await updateDoc(doc(db, colName, id), { status: newStatus });
      setter((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error('[VolunteersInboxPage] Error al actualizar estado:', err);
      alert('No se pudo actualizar el estado.');
    }
  }

  async function handleDelete(colName, setter, item) {
    if (!window.confirm(`¿Eliminar este registro de "${item.name}"? No se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, colName, item.id));
      setter((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('[VolunteersInboxPage] Error al eliminar:', err);
      alert('No se pudo eliminar el registro.');
    }
  }

  /* ── Badges para tabs ─────────────────────────────────────────────────── */
  const pendingVols = volunteers.filter((v) => v.status === 'pending').length;
  const unreadMsgs  = messages.filter((m)   => m.status === 'unread').length;

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-1">
          Bandeja de entrada
        </p>
        <h1 className="text-3xl font-bold text-gray-800">Centro de mensajes</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gestiona postulaciones y mensajes de contacto en un solo lugar.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-8">
        {TABS.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          const count    = key === 'volunteers' ? pendingVols : unreadMsgs;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors ${
                isActive
                  ? 'border-[#7A1F2D] text-[#7A1F2D] bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={isActive ? 'text-[#7A1F2D]' : 'text-gray-400'}>{icon}</span>
              {label}
              {count > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pestaña: Postulaciones */}
      {activeTab === 'volunteers' && (
        <InboxList
          items={volunteers}
          loading={loading}
          error={error}
          searchFields={['name', 'email', 'phone', 'sede', 'area', 'profession']}
          statusMap={VOL_STATUS_MAP}
          pendingKey="pending"
          emptyText="No hay postulaciones registradas aún."
          onStatusChange={(id, status) => handleStatusChange('volunteers', setVolunteers, id, status)}
          onDelete={(item) => handleDelete('volunteers', setVolunteers, item)}
          renderCard={(vol, actions) => (
            <VolunteerCard key={vol.id} data={vol} actions={actions} />
          )}
        />
      )}

      {/* Pestaña: Mensajes de contacto */}
      {activeTab === 'messages' && (
        <InboxList
          items={messages}
          loading={loading}
          error={error}
          searchFields={['name', 'email', 'subject']}
          statusMap={MSG_STATUS_MAP}
          pendingKey="unread"
          emptyText="No hay mensajes de contacto aún."
          onStatusChange={(id, status) => handleStatusChange('messages', setMessages, id, status)}
          onDelete={(item) => handleDelete('messages', setMessages, item)}
          renderCard={(msg, actions) => (
            <MessageCard key={msg.id} data={msg} actions={actions} />
          )}
        />
      )}
    </div>
  );
}

/* ── VolunteerCard ────────────────────────────────────────────────────────── */

function VolunteerCard({ data, actions }) {
  const isPending = data.status === 'pending';

  return (
    <div className={`relative bg-white rounded-2xl border shadow-sm p-6 transition-all ${
      isPending ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'
    }`}>
      {isPending && <PulsingDot color="orange" />}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 text-lg">{data.name}</h3>
            <StatusBadge status={data.status} map={VOL_STATUS_MAP} />
          </div>
          {/* Contacto directo */}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(data.email)}`}
              target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {data.email}
            </a>
            {data.phone && (
              <a
                href={`https://wa.me/${data.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                {data.phone} ↗
              </a>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatDate(data.createdAt)}
        </p>
      </div>

      {/* Metadatos en chips */}
      <div className="space-y-4 mb-5">
        <div>
          <SectionLabel>Datos y Ubicación</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetaChip label="DNI / CE"       value={data.dni                ?? '—'} />
            <MetaChip label="F. Nacimiento"  value={data.birthdate          ?? '—'} />
            <MetaChip label="Género"         value={data.gender             ?? '—'} />
            <MetaChip label="Sede"           value={data.sede               ?? '—'} />
            <MetaChip label="Área"           value={data.area               ?? '—'} />
            <MetaChip label="Residencia"     value={data.location           ?? '—'} />
          </div>
        </div>
        <div>
          <SectionLabel>Perfil y Disponibilidad</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetaChip label="Profesión"      value={data.profession         ?? '—'} />
            <MetaChip label="Exp. Previa"    value={data.previousExperience ?? '—'} />
            <MetaChip label="Disponibilidad" value={data.availability       ?? '—'} />
            <MetaChip label="Fuente"         value={data.source             ?? '—'} />
          </div>
        </div>
      </div>

      {data.motivation && (
        <HighlightBox label="¿Por qué quiere unirse?">
          {data.motivation}
        </HighlightBox>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
        <div className="flex gap-3">
          {isPending && (
            <ActionLink onClick={() => actions.changeStatus('reviewed')} color="brand">
              ✓ Marcar como revisado
            </ActionLink>
          )}
          {!isPending && (
            <ActionLink onClick={() => actions.changeStatus('pending')} color="orange">
              ↩ Marcar pendiente
            </ActionLink>
          )}
        </div>
        <ActionLink onClick={actions.remove} color="danger">Eliminar</ActionLink>
      </div>
    </div>
  );
}

/* ── MessageCard ──────────────────────────────────────────────────────────── */

function MessageCard({ data, actions }) {
  const isUnread = data.status === 'unread';

  return (
    <div className={`relative bg-white rounded-2xl border shadow-sm p-6 transition-all ${
      isUnread ? 'border-blue-300 shadow-blue-100' : 'border-gray-100'
    }`}>
      {isUnread && <PulsingDot color="blue" />}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 text-base">{data.name}</h3>
            <StatusBadge status={data.status} map={MSG_STATUS_MAP} />
          </div>
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(data.email)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-0.5 block"
          >
            {data.email}
          </a>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatDate(data.createdAt)}
        </p>
      </div>

      {data.subject && (
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Asunto: <span className="font-normal">{data.subject}</span>
        </p>
      )}

      {data.message && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {data.message}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
        <div className="flex gap-3">
          {isUnread && (
            <ActionLink onClick={() => actions.changeStatus('read')} color="brand">
              ✓ Marcar como leído
            </ActionLink>
          )}
          {!isUnread && (
            <ActionLink onClick={() => actions.changeStatus('unread')} color="orange">
              ↩ Marcar no leído
            </ActionLink>
          )}
        </div>
        <ActionLink onClick={actions.remove} color="danger">Eliminar</ActionLink>
      </div>
    </div>
  );
}

/* ── Micro-componentes compartidos ───────────────────────────────────────── */

function StatusBadge({ status, map }) {
  const cfg = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function PulsingDot({ color }) {
  const ping = color === 'blue' ? 'bg-blue-400'   : 'bg-orange-400';
  const fill = color === 'blue' ? 'bg-blue-500'   : 'bg-orange-500';
  return (
    <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ping} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${fill}`} />
    </span>
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

function SectionLabel({ children }) {
  return (
    <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">
      {children}
    </p>
  );
}

function HighlightBox({ label, children }) {
  return (
    <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
      <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{children}</p>
    </div>
  );
}

function ActionLink({ onClick, color, children }) {
  const cls = {
    brand:  'text-[#7A1F2D] hover:text-[#5e1722]',
    orange: 'text-orange-600 hover:text-orange-700',
    danger: 'text-gray-400 hover:text-red-500',
  }[color] ?? 'text-gray-500 hover:text-gray-700';
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold hover:underline transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

/* ── Íconos ───────────────────────────────────────────────────────────────── */

function PeopleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}