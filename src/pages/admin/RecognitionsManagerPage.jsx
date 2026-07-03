// src/pages/admin/RecognitionsManagerPage.jsx
import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/ui/Button';
import RecognitionFormModal from '../../features/recognitions/components/RecognitionFormModal';
import {
  fetchRecognitions,
  addRecognition,
  updateRecognition,
  deleteRecognition,
} from '../../features/recognitions/services/recognitionsService';

function formatDate(ts) {
  if (!ts) return '—';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecognitionsManagerPage() {
  const [items,         setItems]         = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError,     setListError]     = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saveError,   setSaveError]   = useState(null);

  const loadItems = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      setItems(await fetchRecognitions());
    } catch (err) {
      console.error('[RecognitionsManagerPage] Error al cargar:', err);
      setListError(err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreateModal() {
    setEditingItem(null);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingItem(null);
  }

  async function handleSubmit(formData) {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (editingItem) {
        await updateRecognition(editingItem.id, formData);
      } else {
        await addRecognition(formData);
      }
      await loadItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('[RecognitionsManagerPage] Error al guardar:', err);
      setSaveError(err.message || 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      await deleteRecognition(item.id);
      await loadItems();
    } catch (err) {
      console.error('[RecognitionsManagerPage] Error al eliminar:', err);
      alert(err.message || 'No se pudo eliminar el reconocimiento.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            Reconocimientos y Noticias
          </h1>
          <p className="mt-1 text-sm text-warm-600">
            {isLoadingList
              ? 'Cargando…'
              : `${items.length} ${items.length === 1 ? 'reconocimiento registrado' : 'reconocimientos registrados'}`}
          </p>
        </div>
        <Button variant="primary" icon={<PlusIcon />} onClick={openCreateModal}>
          Agregar Reconocimiento
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-soft">
        {isLoadingList ? (
          <TableSkeleton />
        ) : listError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-primary-900 font-medium">No pudimos cargar los reconocimientos</p>
            <p className="mt-1 text-sm text-warm-600">{listError.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadItems}>
              Reintentar
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">Reconocimiento</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">Descripción</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600 text-center">Fecha</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-warm-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded-lg overflow-hidden shrink-0 bg-warm-100 border border-warm-200">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-warm-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-primary-900 line-clamp-1">{item.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-warm-700 max-w-xs">
                    <p className="line-clamp-2">{item.description}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-xs font-medium text-warm-600 whitespace-nowrap">
                      {formatDate(item.date)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Editar" onClick={() => openEditModal(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton label="Eliminar" tone="danger" onClick={() => handleDelete(item)}>
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-warm-500">
                    No hay reconocimientos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <RecognitionFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isSaving={isSaving}
      />

      {saveError && isModalOpen && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-medium text-red-700">{saveError}</p>
        </div>
      )}
    </div>
  );
}

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
          <div className="h-10 w-14 rounded-lg bg-warm-200 shrink-0" />
          <div className="h-3 w-36 bg-warm-200 rounded" />
          <div className="h-3 w-28 bg-warm-100 rounded ml-8" />
          <div className="h-6 w-6 rounded-full bg-warm-100 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

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
function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z" />
    </svg>
  );
}