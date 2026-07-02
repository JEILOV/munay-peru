// src/components/admin/InboxList.jsx
//
// Componente genérico para listas de solicitudes entrantes (inbox).
// Cubre: volunteers, messages, partnerships — y cualquier colección futura
// con el mismo patrón: formulario público → bandeja admin con estados.
//
// Props:
//   items        {Array}    Lista de documentos ya cargados desde Firestore.
//   loading      {boolean}  Muestra skeleton mientras se cargan datos.
//   error        {string}   Mensaje de error si el fetch falló.
//   searchFields {string[]} Campos del documento sobre los que opera el filtro
//                           de búsqueda local (ej. ['name', 'email', 'orgName']).
//   statusMap    {Object}   { [statusKey]: { label, cls } } — define los badges
//                           y controles de estado disponibles para esta colección.
//   pendingKey   {string}   Valor de status que cuenta como "nuevo" (para el
//                           punto de notificación pulsante). Default: 'pending'.
//   renderCard   {Function} (item, actions) => JSX — renderiza cada tarjeta.
//                           Recibe el item y un objeto `actions` con helpers.
//   onStatusChange {Function} (id, newStatus) => Promise — llamada al cambiar estado.
//   onDelete       {Function} (item) => Promise — llamada al eliminar.
//   emptyText    {string}   Texto cuando no hay items tras filtrar.

import { useState, useMemo } from 'react';

export default function InboxList({
  items        = [],
  loading      = false,
  error        = null,
  searchFields = ['name', 'email'],
  statusMap    = {},
  pendingKey   = 'pending',
  renderCard,
  onStatusChange,
  onDelete,
  emptyText    = 'No hay registros todavía.',
}) {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ── Filtrado local (sin llamadas a Firestore) ──────────────────────── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        searchFields.some((field) =>
          String(item[field] ?? '').toLowerCase().includes(q)
        );
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter, searchFields]);

  /* ── Contadores por estado para las pills de filtro ─────────────────── */
  const counts = useMemo(
    () =>
      items.reduce(
        (acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }),
        {}
      ),
    [items]
  );

  /* ── Objeto de acciones que se pasa a renderCard ─────────────────────── */
  // Así renderCard no necesita importar ni saber cómo funciona onStatusChange/onDelete —
  // solo usa actions.changeStatus('approved') o actions.remove().
  function buildActions(item) {
    return {
      changeStatus: (newStatus) => onStatusChange?.(item.id, newStatus),
      remove:       ()          => onDelete?.(item),
    };
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div>

      {/* ── Barra de filtros ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Búsqueda de texto */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por nombre, correo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
          />
        </div>

        {/* Filtro por estado */}
        {Object.keys(statusMap).length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label={`Todos (${items.length})`}
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            {Object.entries(statusMap).map(([key, { label, cls }]) => (
              <FilterPill
                key={key}
                label={`${label} (${counts[key] ?? 0})`}
                active={statusFilter === key}
                activeCls={cls}
                onClick={() => setStatusFilter(key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Estados globales ─────────────────────────────────────────────── */}
      {loading && <SkeletonList />}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
          <WarningIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Lista filtrada ───────────────────────────────────────────────── */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <InboxIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {search || statusFilter !== 'all'
                ? 'Ningún registro coincide con los filtros activos.'
                : emptyText}
            </p>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="mt-3 text-xs text-orange-600 hover:underline font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => renderCard(item, buildActions(item)))}
          </div>
        )
      )}
    </div>
  );
}

/* ── Sub-componentes internos ────────────────────────────────────────────── */

function FilterPill({ label, active, activeCls, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? activeCls ?? 'bg-orange-100 text-orange-700 border-orange-200'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
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
              <div className="h-3 w-28 bg-gray-100 rounded-lg" />
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

/* ── Íconos ──────────────────────────────────────────────────────────────── */

function SearchIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
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