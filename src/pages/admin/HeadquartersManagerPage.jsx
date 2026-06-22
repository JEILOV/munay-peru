// src/pages/admin/HeadquartersManagerPage.jsx
//
// CRUD real. Ya no hay mock data ni useState local simulando la base de
// datos — carga inicial vía useEffect + fetchAllHeadquarters(), y cada
// operación (crear/editar/eliminar) llama directamente al servicio y
// recarga la lista para reflejar el estado real de Firestore.
//
// FLUJO DE GUARDADO (la parte delicada de esta iteración):
//   1. Usuario llena el formulario y, opcionalmente, selecciona una imagen.
//   2. Si seleccionó un archivo nuevo (coverImageFile), lo subimos PRIMERO
//      a ImgBB y esperamos la URL resultante.
//   3. SOLO entonces escribimos en Firestore, usando esa URL (o la URL
//      existente si no se cambió la imagen).
//   4. Si la subida a ImgBB falla, NO tocamos Firestore — no queremos un
//      documento de sede a medio crear sin imagen por un error de red.

import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/ui/Button';
import SedeFormModal from '../../features/headquarters/components/SedeFormModal';
import {
  fetchAllHeadquarters,
  createSede,
  updateSede,
  deleteSede,
} from '../../features/headquarters/services/headquartersService';
import { compressImage, uploadImageToImgBB } from '../../services/imgbb/imgbbService';

export default function HeadquartersManagerPage() {
  const [sedes, setSedes] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadSedes = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await fetchAllHeadquarters();
      setSedes(data);
    } catch (err) {
      console.error('[HeadquartersManagerPage] Error al cargar sedes:', err);
      setListError(err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadSedes();
  }, [loadSedes]);

  function openCreateModal() {
    setEditingSede(null);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function openEditModal(sede) {
    setEditingSede(sede);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return; // evita cerrar el modal a mitad de un guardado en curso
    setIsModalOpen(false);
    setEditingSede(null);
  }

  /**
   * Orquestación principal: imagen primero (si hay una nueva), Firestore después.
   */
  async function handleSubmit({ coverImageFile, coverImageUrl, ...sedeData }) {
    setIsSaving(true);
    setSaveError(null);

    try {
      let finalImageUrl = coverImageUrl;

      // Paso 1: si el usuario seleccionó un archivo nuevo, comprimirlo y
      // subirlo a ImgBB ANTES de tocar Firestore. Si cualquiera de los dos
      // pasos falla, lanzamos y el catch de abajo detiene todo el flujo —
      // nunca llegamos a escribir un documento con una imagen rota o ausente.
      if (coverImageFile) {
        const compressedFile = await compressImage(coverImageFile);
        finalImageUrl = await uploadImageToImgBB(compressedFile);
      }

      const payload = { ...sedeData, coverImage: finalImageUrl ?? '' };

      if (editingSede) {
        await updateSede(editingSede.id, payload);
      } else {
        await createSede(payload);
      }

      await loadSedes(); // refleja el estado real de Firestore, no un patch optimista
      setIsModalOpen(false);
      setEditingSede(null);
    } catch (err) {
      console.error('[HeadquartersManagerPage] Error al guardar la sede:', err);
      setSaveError(
        err.message || 'Ocurrió un error al guardar la sede. Intenta nuevamente.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(sede) {
    const confirmed = window.confirm(
      `¿Eliminar la sede "${sede.name}"? Esta acción no se puede deshacer.\n\n` +
        `Nota: los proyectos ya asociados a esta sede NO se eliminarán ni reasignarán automáticamente.`,
    );
    if (!confirmed) return;

    try {
      await deleteSede(sede.id);
      await loadSedes();
    } catch (err) {
      console.error('[HeadquartersManagerPage] Error al eliminar la sede:', err);
      // Mostramos err.message tal cual: deleteSede ahora lanza mensajes
      // específicos y legibles (ej. "tiene 3 proyectos vinculados"), no
      // solo errores técnicos genéricos de Firestore.
      alert(err.message || 'No se pudo eliminar la sede. Intenta nuevamente.');
    }
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            Gestión de Sedes
          </h1>
          <p className="mt-1 text-sm text-warm-600">
            {isLoadingList
              ? 'Cargando…'
              : `${sedes.length} ${sedes.length === 1 ? 'sede registrada' : 'sedes registradas'}`}
          </p>
        </div>
        <Button variant="primary" icon={<PlusIcon />} onClick={openCreateModal}>
          Agregar Sede
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-soft">
        {isLoadingList ? (
          <TableSkeleton />
        ) : listError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-primary-900 font-medium">No pudimos cargar las sedes</p>
            <p className="mt-1 text-sm text-warm-600">{listError.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadSedes}>
              Reintentar
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Sede
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Región
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Estado
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-200">
              {sedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-warm-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-warm-100">
                        {sede.coverImage && (
                          <img
                            src={sede.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-primary-900">{sede.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-warm-700">{sede.region}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge isActive={sede.isActive} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Editar" onClick={() => openEditModal(sede)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        label="Eliminar"
                        tone="danger"
                        onClick={() => handleDelete(sede)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}

              {sedes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-warm-500">
                    No hay sedes registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de formulario (crear/editar) */}
      <SedeFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingSede}
        isSaving={isSaving}
      />

      {/* Error de guardado — fuera del modal para que sea visible aunque
          el modal use overflow-y-auto y el error quede "scrolleado" fuera
          de vista en formularios largos. */}
      {saveError && isModalOpen && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-medium text-red-700">{saveError}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-warm-200 text-warm-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-warm-500'}`} />
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
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
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
          <div className="h-10 w-10 rounded-lg bg-warm-200 shrink-0" />
          <div className="h-3 w-32 bg-warm-200 rounded" />
          <div className="h-3 w-24 bg-warm-100 rounded ml-8" />
          <div className="h-5 w-16 bg-warm-100 rounded-full ml-auto" />
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
