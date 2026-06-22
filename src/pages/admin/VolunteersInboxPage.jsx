// src/pages/admin/VolunteersInboxPage.jsx
import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, getDocs, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── Constantes de pestaña ──────────────────────────────────────────────── */

const TABS = [
  { key: 'volunteers', label: 'Postulaciones',      icon: <PeopleIcon /> },
  { key: 'messages',   label: 'Mensajes de contacto', icon: <MailIcon />   },
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

const VolunteersInboxPage = () => {
  const [activeTab,  setActiveTab]  = useState('volunteers');
  const [volunteers, setVolunteers] = useState([]);
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  /* ── Fetch inicial ──────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchAll = async () => {
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
        console.error(err);
        setError('No se pudieron cargar los datos. Verifica tu conexión o los índices de Firestore.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Acción: marcar como revisado ───────────────────────────────────── */
  const markAsReviewed = async (type, id) => {
    const newStatus = type === 'volunteers' ? 'reviewed' : 'read';
    try {
      await updateDoc(doc(db, type, id), { status: newStatus });
      const setter = type === 'volunteers' ? setVolunteers : setMessages;
      setter((prev) =>
        prev.map((item) => item.id === id ? { ...item, status: newStatus } : item)
      );
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
    }
  };

  /* ── Contadores de badge ─────────────────────────────────────────────── */
  const pendingVols = volunteers.filter((v) => v.status === 'pending').length;
  const unreadMsgs  = messages.filter((m)   => m.status === 'unread').length;

  const badgeCount = { volunteers: pendingVols, messages: unreadMsgs };

  /* ── Render ──────────────────────────────────────────────────────────── */
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
          const count    = badgeCount[key];
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors
                ${isActive
                  ? 'border-[#7A1F2D] text-[#7A1F2D] bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
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

      {/* Estados globales */}
      {loading && <SkeletonList />}
      {error   && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
          <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Contenido por pestaña */}
      {!loading && !error && (
        <>
          {activeTab === 'volunteers' && (
            <TabContent
              items={volunteers}
              emptyText="No hay postulaciones registradas aún."
              renderCard={(vol) => (
                <VolunteerCard
                  key={vol.id}
                  data={vol}
                  onMark={() => markAsReviewed('volunteers', vol.id)}
                />
              )}
            />
          )}

          {activeTab === 'messages' && (
            <TabContent
              items={messages}
              emptyText="No hay mensajes de contacto aún."
              renderCard={(msg) => (
                <MessageCard
                  key={msg.id}
                  data={msg}
                  onMark={() => markAsReviewed('messages', msg.id)}
                />
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ── TabContent ─────────────────────────────────────────────────────────── */

function TabContent({ items, emptyText, renderCard }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <InboxIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{emptyText}</p>
      </div>
    );
  }
  return <div className="space-y-4">{items.map(renderCard)}</div>;
}


/* ── VolunteerCard ──────────────────────────────────────────────────────── */

function VolunteerCard({ data, onMark }) {
  const isPending = data.status === 'pending';

  return (
    <div className={`
      relative bg-white rounded-2xl border shadow-sm p-6 transition-all
      ${isPending ? 'border-orange-300 shadow-orange-100' : 'border-gray-100'}
    `}>
      {/* Indicador nuevo */}
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
            <h3 className="font-semibold text-gray-800 text-lg">{data.name}</h3>
            <StatusBadge status={data.status} type="volunteer" />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{data.email}</p>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatDate(data.createdAt)}
        </p>
      </div>

      {/* Metadatos - Agrupados en 2 bloques para no saturar la vista */}
      <div className="space-y-4 mb-5">
        
        {/* Bloque 1: Personal y Ubicación */}
        <div>
          <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Datos y Ubicación</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetaChip label="DNI / CE"       value={data.dni        ?? '—'} />
            <MetaChip label="F. Nacimiento"  value={data.birthdate  ?? '—'} />
            <MetaChip label="Género"         value={data.gender     ?? '—'} />
            <MetaChip label="Teléfono"       value={data.phone      ?? '—'} />
            <MetaChip label="Sede"           value={data.sede       ?? '—'} />
            <MetaChip label="Residencia"     value={data.location   ?? '—'} />
          </div>
        </div>

        {/* Bloque 2: Perfil */}
        <div>
          <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">Perfil y Disponibilidad</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetaChip label="Profesión"      value={data.profession         ?? '—'} />
            <MetaChip label="Exp. Previa"    value={data.previousExperience ?? '—'} />
            <MetaChip label="Disponibilidad" value={data.availability       ?? '—'} />
            <MetaChip label="Fuente"         value={data.source             ?? '—'} />
          </div>
        </div>
      </div>

      {/* Motivación (Destacada sutilmente) */}
      {data.motivation && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-1">
            ¿Por qué quiere unirse?
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {data.motivation}
          </p>
        </div>
      )}

      {/* Acción */}
      {isPending && (
        <div className="pt-1">
          <button
            onClick={onMark}
            className="text-sm font-semibold text-[#7A1F2D] hover:text-[#5e1722] hover:underline transition-colors flex items-center gap-1"
          >
            ✓ Marcar como revisado
          </button>
        </div>
      )}
    </div>
  );
}

/* ── MessageCard ────────────────────────────────────────────────────────── */

function MessageCard({ data, onMark }) {
  const isUnread = data.status === 'unread';

  return (
    <div className={`
      relative bg-white rounded-2xl border shadow-sm p-6 transition-all
      ${isUnread ? 'border-blue-300 shadow-blue-100' : 'border-gray-100'}
    `}>
      {/* Indicador nuevo */}
      {isUnread && (
        <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      )}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 text-base">{data.name}</h3>
            <StatusBadge status={data.status} type="message" />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{data.email}</p>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
          {formatDate(data.createdAt)}
        </p>
      </div>

      {/* Asunto */}
      {data.subject && (
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Asunto: <span className="font-normal">{data.subject}</span>
        </p>
      )}

      {/* Mensaje */}
      {data.message && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {data.message}
          </p>
        </div>
      )}

      {/* Acción */}
      {isUnread && (
        <button
          onClick={onMark}
          className="text-xs font-semibold text-[#7A1F2D] hover:text-[#5e1722] hover:underline transition-colors"
        >
          ✓ Marcar como leído
        </button>
      )}
    </div>
  );
}

/* ── Sub-componentes menores ────────────────────────────────────────────── */

function MetaChip({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 font-semibold truncate">{value}</p>
    </div>
  );
}

function StatusBadge({ status, type }) {
  const map = {
    pending:  { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700' },
    reviewed: { label: 'Revisado',  cls: 'bg-green-100  text-green-700'  },
    unread:   { label: 'No leído',  cls: 'bg-blue-100   text-blue-700'   },
    read:     { label: 'Leído',     cls: 'bg-gray-100   text-gray-500'   },
  };
  const cfg = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 rounded-lg" />
              <div className="h-3 w-48 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-3 w-20 bg-gray-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-12 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* ── Íconos ─────────────────────────────────────────────────────────────── */

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

function InboxIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
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

export default VolunteersInboxPage;