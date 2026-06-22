// src/pages/admin/ProjectsManagerPage.jsx
//
// Mismo patrón de orquestación que HeadquartersManagerPage, con dos
// diferencias estructurales:
//   1. Carga DOS fuentes de datos en paralelo (proyectos Y sedes) — el
//      modal necesita la lista de sedes para el <select>, y la tabla
//      necesita mostrar el NOMBRE de la sede, no su sedeId crudo.
//   2. El flujo de imagen tiene un paso extra: comprimir -> subir -> guardar
//      (en HeadquartersManagerPage agregamos compressImage en la iteración
//      anterior; aquí nace ya completo desde el principio).

import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/ui/Button';
import ProjectFormModal from '../../features/projects/components/ProjectFormModal';
import {
  fetchAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../../features/projects/services/projectsService';
import { fetchAllHeadquarters } from '../../features/headquarters/services/headquartersService';
import { compressImage, uploadImageToImgBB } from '../../services/imgbb/imgbbService';

export default function ProjectsManagerPage() {
  const [projects, setProjects] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStage, setSavingStage] = useState(null); // 'compressing' | 'uploading' | 'saving'
  const [saveError, setSaveError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      // Promise.all: cargamos proyectos y sedes EN PARALELO, no en
      // secuencia — no hay dependencia entre ambas consultas, así que
      // esperar una y luego la otra solo agregaría latencia innecesaria.
      const [projectsData, sedesData] = await Promise.all([
        fetchAllProjects(),
        fetchAllHeadquarters(),
      ]);
      setProjects(projectsData);
      setSedes(sedesData);
    } catch (err) {
      console.error('[ProjectsManagerPage] Error al cargar datos:', err);
      setListError(err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateModal() {
    setEditingProject(null);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function openEditModal(project) {
    setEditingProject(project);
    setSaveError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingProject(null);
  }

  /**
   * Orquestación: comprimir -> subir -> guardar. Cada paso actualiza
   * `savingStage` para que el modal pueda (opcionalmente) mostrar un
   * mensaje específico de qué está pasando, en vez de un "Guardando…"
   * genérico durante lo que puede ser varios segundos con una imagen grande.
   */
  async function handleSubmit({ coverImageFile, coverImageUrl, ...projectData }) {
    setIsSaving(true);
    setSaveError(null);

    try {
      let finalImageUrl = coverImageUrl;

      if (coverImageFile) {
        setSavingStage('compressing');
        const compressedFile = await compressImage(coverImageFile);

        setSavingStage('uploading');
        finalImageUrl = await uploadImageToImgBB(compressedFile);
      }

      setSavingStage('saving');
      const payload = { ...projectData, coverImage: finalImageUrl ?? '' };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }

      await loadData();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error('[ProjectsManagerPage] Error al guardar el proyecto:', err);
      setSaveError(
        err.message || 'Ocurrió un error al guardar el proyecto. Intenta nuevamente.',
      );
    } finally {
      setIsSaving(false);
      setSavingStage(null);
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `¿Eliminar el proyecto "${project.title}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      await loadData();
    } catch (err) {
      console.error('[ProjectsManagerPage] Error al eliminar el proyecto:', err);
      alert(err.message || 'No se pudo eliminar el proyecto. Intenta nuevamente.');
    }
  }

  function sedeName(sedeId) {
    return sedes.find((s) => s.id === sedeId)?.name ?? '—';
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            Gestión de Proyectos
          </h1>
          <p className="mt-1 text-sm text-warm-600">
            {isLoadingList
              ? 'Cargando…'
              : `${projects.length} ${projects.length === 1 ? 'proyecto registrado' : 'proyectos registrados'}`}
          </p>
        </div>
        <Button variant="primary" icon={<PlusIcon />} onClick={openCreateModal}>
          Agregar Proyecto
        </Button>
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-soft">
        {isLoadingList ? (
          <TableSkeleton />
        ) : listError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-primary-900 font-medium">No pudimos cargar los proyectos</p>
            <p className="mt-1 text-sm text-warm-600">{listError.message}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
              Reintentar
            </Button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Proyecto
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-warm-600">
                  Sede
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
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-warm-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-warm-100">
                        {project.coverImage && (
                          <img
                            src={project.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-primary-900 line-clamp-1">
                        {project.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-warm-700">
                    {sedeName(project.sedeId)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Editar" onClick={() => openEditModal(project)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        label="Eliminar"
                        tone="danger"
                        onClick={() => handleDelete(project)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-warm-500">
                    No hay proyectos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editingProject}
        isSaving={isSaving}
        savingStage={savingStage}
        sedes={sedes}
      />

      {saveError && isModalOpen && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-soft-lg">
          <p className="text-sm font-medium text-red-700">{saveError}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-warm-200 text-warm-600'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-warm-500'}`} />
      {isPublished ? 'Publicado' : 'Borrador'}
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
          <div className="h-3 w-40 bg-warm-200 rounded" />
          <div className="h-3 w-20 bg-warm-100 rounded ml-8" />
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
