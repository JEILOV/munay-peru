// src/pages/admin/TeamManagerPage.jsx
import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/ui/Button';
import TeamFormModal from '../../features/about/components/TeamFormModal';
import {
  fetchTeam,
  addMember,
  updateMember,
  deleteMember,
} from '../../features/about/services/teamService';

export default function TeamManagerPage() {
  const [members,       setMembers]       = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError,     setListError]     = useState(null);

  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSaving,      setIsSaving]      = useState(false);
  const [saveError,     setSaveError]     = useState(null);

  /* ── Carga de datos ─────────────────────────────────────────────────── */

  const loadMembers = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      setMembers(await fetchTeam());
    } catch (err) {
      console.error('[TeamManagerPage] Error al cargar equipo:', err);
      setListError(err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  /* ── Apertura / cierre del modal ────────────────────────────────────── */

  function openCreateModal() {
    setEditingMember(null);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function openEditModal(member) {
    setEditingMember(member);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingMember(null);
  }

  /* ── Guardar (crear o actualizar) ───────────────────────────────────── */

  async function handleSubmit(formData) {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
      } else {
        await addMember(formData);
      }
      await loadMembers();
      setIsModalOpen(false);
      setEditingMember(null);
    } catch (err) {
      console.error('[TeamManagerPage] Error al guardar:', err);
      setSaveError(err.message || 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  /* ── Eliminar ───────────────────────────────────────────────────────── */

  async function handleDelete(member) {
    const confirmed = window.confirm(
      `¿Eliminar a "${member.name}" del equipo? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      await deleteMember(member.id);
      await loadMembers();
    } catch (err) {
      console.error('[TeamManagerPage] Error al eliminar:', err);
      alert(err.message || 'No se pudo eliminar el miembro.');
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div>

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            Gestión de Equipo
          </h1>
          <p className="mt-1 text-sm text-warm-600">
            {isLoadingList
              ? 'Cargando…'
              : `${members.length} ${members.length === 1 ? 'miembro registrado' : 'miembros registrados'}`}
          </p>
        </div>
        <Button variant="primary" icon={<PlusIcon />} onClick={openCreateModal}>
          Agregar Miembro
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-soft">
        {isLoadingList ? (
          <TableSkeleton />
        ) : listError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-primary-900 font-medium">No pudimos cargar el equipo</p>
            <p className="mt-1 text-sm text-warm-600">{listError.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadMembers}>
              Reintentar
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Miembro
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Cargo
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600 text-center">
                  Orden
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-warm-50/60 transition-colors">

                  {/* Foto + Nombre */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-warm-100 border border-warm-200">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-warm-400" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-primary-900 line-clamp-1">
                        {member.name}
                      </span>
                    </div>
                  </td>

                  {/* Cargo */}
                  <td className="px-5 py-3.5 text-sm text-warm-700">
                    {member.role ?? '—'}
                  </td>

                  {/* Orden */}
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-warm-100 text-xs font-semibold text-warm-600">
                      {member.order ?? '—'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Editar" onClick={() => openEditModal(member)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton label="Eliminar" tone="danger" onClick={() => handleDelete(member)}>
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </td>

                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-warm-500">
                    No hay miembros registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <TeamFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingMember}
        isSaving={isSaving}
      />

      {/* Toast de error de guardado */}
      {saveError && isModalOpen && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-medium text-red-700">{saveError}</p>
        </div>
      )}

    </div>
  );
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */

function IconButton({ children, label, onClick, tone = 'default' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg transition-colors ${
        tone === 'danger'
          ? 'text-warm-500 hover:bg-red-50 hover:text-red-600'
          : 'text-warm-500 hover:bg-primary-50 hover:text-primary-700'
      }`}
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-warm-200">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-warm-200 shrink-0" />
          <div className="h-3 w-36 bg-warm-200 rounded" />
          <div className="h-3 w-28 bg-warm-100 rounded ml-8" />
          <div className="h-6 w-6 rounded-full bg-warm-100 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ── Íconos ─────────────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}