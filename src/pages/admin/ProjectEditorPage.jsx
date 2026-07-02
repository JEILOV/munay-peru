// src/pages/admin/ProjectEditorPage.jsx
//
// Editor de página completa para crear y editar proyectos e iniciativas.
// Va como página standalone en lugar de modal porque:
//   1. El formulario es largo (título, contenido, imagen, campos de evento).
//   2. Los campos condicionales de evento necesitan espacio vertical cómodo.
//   3. ProjectFormModal existente queda disponible para operaciones rápidas
//      desde ProjectsManagerPage si en el futuro se quiere esa UX dual.
//
// Flujo de navegación:
//   Crear: /admin/proyectos/nuevo
//   Editar: /admin/proyectos/:id/editar
//   Ambas redirigen a /admin/proyectos al guardar o cancelar.

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import { compressAndUploadImage } from '../../services/imgbb/imgbbService';
import {
  fetchProjectById,
  createProject,
  updateProject,
} from '../../features/projects/services/projectsService';
import { getCollection } from '../../services/firebase/firestore';

/* ── Estado inicial del formulario ────────────────────────────────────────── */

const EMPTY_FORM = {
  title:            '',
  description:      '',
  content:          '',
  sedeId:           '',
  category:         '',
  videoUrl:         '',
  status:           'published',
  // Campos de evento (solo se guardan cuando type === 'event')
  type:             'initiative',
  eventDate:        '',        // string "YYYY-MM-DD" en el formulario
  registrationOpen: false,
};

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════════ */

export default function ProjectEditorPage() {
  const { id }   = useParams();            // undefined en modo "nuevo"
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form,         setForm]         = useState(EMPTY_FORM);
  const [sedes,        setSedes]        = useState([]);
  const [imagePreview, setImagePreview] = useState('');  // URL actual o preview local
  const [imageFile,    setImageFile]    = useState(null); // File nuevo a subir
  const [loadingData,  setLoadingData]  = useState(isEditMode);
  const [savingStage,  setSavingStage]  = useState(null); // null | 'compressing' | 'uploading' | 'saving'
  const [error,        setError]        = useState(null);
  const fileInputRef = useRef(null);

  /* ── Carga inicial: sedes + datos del proyecto si es edición ─────────── */
  useEffect(() => {
    async function load() {
      try {
        const [sedesData, projectData] = await Promise.all([
          getCollection('headquarters', { orderBy: ['name', 'asc'] }),
          isEditMode ? fetchProjectById(id) : Promise.resolve(null),
        ]);

        setSedes(sedesData);

        if (projectData) {
          // eventDate llega como Timestamp de Firestore → lo convertimos
          // a string "YYYY-MM-DD" para que el <input type="date"> lo muestre
          const { coverImage, eventDate, ...rest } = projectData;
          setForm({
            ...EMPTY_FORM,
            ...rest,
            type:      rest.type ?? 'initiative',
            eventDate: timestampToDateString(eventDate),
          });
          setImagePreview(coverImage ?? '');
        }
      } catch (err) {
        console.error('[ProjectEditorPage] Error al cargar:', err);
        setError('No se pudo cargar el proyecto. Verifica tu conexión.');
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [id, isEditMode]);

  /* ── Handlers de formulario ───────────────────────────────────────────── */
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(newType) {
    setForm((prev) => ({
      ...prev,
      type:             newType,
      // Limpiar campos de evento al volver a iniciativa
      eventDate:        newType === 'initiative' ? '' : prev.eventDate,
      registrationOpen: newType === 'initiative' ? false : prev.registrationOpen,
    }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('La imagen no debe superar los 20MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── Submit ───────────────────────────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validación de campos de evento
    if (form.type === 'event' && !form.eventDate) {
      setError('Los eventos requieren una fecha. Por favor selecciona una fecha.');
      return;
    }

    let coverImage = imagePreview; // URL existente o vacío

    try {
      // Paso 1: Comprimir y subir imagen nueva si hay una seleccionada
      if (imageFile) {
        setSavingStage('compressing');
        // compressAndUploadImage ya hace ambas cosas internamente
        setSavingStage('uploading');
        coverImage = await compressAndUploadImage(imageFile);
      }

      // Paso 2: Guardar en Firestore
      setSavingStage('saving');
      const payload = { ...form, coverImage };

      if (isEditMode) {
        await updateProject(id, payload);
      } else {
        await createProject(payload);
      }

      navigate('/admin/proyectos');
    } catch (err) {
      console.error('[ProjectEditorPage] Error al guardar:', err);
      setError(err.message || 'No se pudo guardar el proyecto. Inténtalo de nuevo.');
      setSavingStage(null);
    }
  }

  const isSaving = savingStage !== null;
  const isEvent  = form.type === 'event';

  /* ── Loading state ────────────────────────────────────────────────────── */
  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-warm-200 rounded-xl" />
        <div className="h-40 bg-warm-100 rounded-2xl" />
        <div className="h-40 bg-warm-100 rounded-2xl" />
      </div>
    );
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/admin/proyectos')}
          className="p-2 rounded-lg text-warm-500 hover:bg-warm-100 hover:text-primary-900 transition-colors"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-900">
            {isEditMode ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h1>
          <p className="text-sm text-warm-600 mt-0.5">
            {isEditMode
              ? 'Los cambios se guardan en Firestore al hacer clic en "Guardar cambios".'
              : 'Completa los campos y publica o guarda como borrador.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Tarjeta 1: Tipo de publicación ──────────────────────────── */}
        <FormCard title="Tipo de publicación">
          <div className="flex gap-3">
            <TypePill
              label="Iniciativa / Proyecto"
              description="Se muestra en el portafolio general."
              selected={form.type === 'initiative'}
              onClick={() => handleTypeChange('initiative')}
            />
            <TypePill
              label="Evento"
              description="Aparece en Próximos Eventos hasta que pase la fecha."
              selected={isEvent}
              onClick={() => handleTypeChange('event')}
            />
          </div>

          {/* ── Campos condicionales de evento ─────────────────────────── */}
          {isEvent && (
            <div className="mt-5 pt-5 border-t border-warm-200 space-y-4">
              <Field label="Fecha del evento" required>
                <input
                  type="date"
                  required={isEvent}
                  value={form.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className="input-base"
                />
                <p className="mt-1 text-xs text-warm-500">
                  Cuando esta fecha pase, el evento se archivará automáticamente
                  en el portafolio de proyectos realizados — sin que tengas que
                  hacer nada.
                </p>
              </Field>

              {/* Toggle: inscripciones abiertas */}
              <div className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    Inscripciones abiertas
                  </p>
                  <p className="text-xs text-warm-600 mt-0.5">
                    Si está activo, la web pública mostrará el botón de inscripción.
                  </p>
                </div>
                <ToggleSwitch
                  checked={Boolean(form.registrationOpen)}
                  onChange={(value) => handleChange('registrationOpen', value)}
                />
              </div>
            </div>
          )}
        </FormCard>

        {/* ── Tarjeta 2: Información principal ─────────────────────────── */}
        <FormCard title="Información principal">
          <div className="space-y-5">
            <Field label="Título" required>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej. Biohuertos escolares para seguridad alimentaria"
                className="input-base"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Sede" required>
                <select
                  required
                  value={form.sedeId}
                  onChange={(e) => handleChange('sedeId', e.target.value)}
                  className="input-base"
                >
                  <option value="" disabled>Selecciona una sede…</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>{sede.name}</option>
                  ))}
                </select>
                {sedes.length === 0 && (
                  <p className="mt-1.5 text-xs text-primary-600">
                    No hay sedes registradas. Crea una en Gestión de Sedes.
                  </p>
                )}
              </Field>

              <Field label="Categoría" required>
                <select
                  required
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input-base"
                >
                  <option value="" disabled>Selecciona una categoría…</option>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Descripción corta" required>
              <textarea
                rows={2}
                required
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Resumen breve que aparece en las tarjetas del listado…"
                className="input-base resize-none"
              />
            </Field>

            <Field label="Contenido detallado" required>
              <textarea
                rows={7}
                required
                value={form.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Desarrollo completo del proyecto. Usa líneas en blanco para separar párrafos…"
                className="input-base resize-none"
              />
            </Field>
          </div>
        </FormCard>

        {/* ── Tarjeta 3: Multimedia ─────────────────────────────────────── */}
        <FormCard title="Multimedia">
          <div className="space-y-5">
            <Field label="Imagen de portada">
              <ImagePicker
                previewSrc={imagePreview}
                onSelect={handleFileSelect}
                onRemove={imagePreview ? handleRemoveImage : undefined}
                inputRef={fileInputRef}
              />
            </Field>

            <Field label="URL de video de YouTube (opcional)">
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="input-base"
              />
            </Field>
          </div>
        </FormCard>

        {/* ── Tarjeta 4: Visibilidad ───────────────────────────────────── */}
        <FormCard title="Visibilidad">
          <div className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-primary-900">
                {isEvent ? 'Evento Activo' : 'Proyecto Activo'}
              </p>
              <p className="text-xs text-warm-600 mt-0.5">
                Inactivo = borrador, no visible en la web pública.
              </p>
            </div>
            <ToggleSwitch
              checked={form.status === 'published'}
              onChange={(value) => handleChange('status', value ? 'published' : 'draft')}
            />
          </div>
        </FormCard>

        {/* ── Error global ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <WarningIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Botones ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/admin/proyectos')}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={isSaving || sedes.length === 0}
          >
            {getSaveLabel(savingStage, isEditMode)}
          </Button>
        </div>

      </form>
    </div>
  );
}

/* ── Helpers de label del botón ──────────────────────────────────────────── */

function getSaveLabel(stage, isEdit) {
  if (!stage) return isEdit ? 'Guardar cambios' : 'Crear proyecto';
  if (stage === 'compressing') return 'Comprimiendo imagen…';
  if (stage === 'uploading')   return 'Subiendo imagen…';
  if (stage === 'saving')      return 'Guardando…';
  return 'Guardando…';
}

/* ── Conversión Timestamp → "YYYY-MM-DD" para <input type="date"> ─────────── */

function timestampToDateString(ts) {
  if (!ts) return '';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return '';
  // Usamos el ajuste de timezone local para que "julio 20" no aparezca
  // como "julio 19" en zonas UTC-5 (Perú)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ── Sub-componentes de UI ───────────────────────────────────────────────── */

function FormCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-soft p-6">
      <h3 className="font-display text-base font-semibold text-primary-900 mb-5">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-primary-900">
        {label}
        {required && <span className="text-primary-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TypePill({ label, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-left rounded-xl border-2 px-4 py-3 transition-all ${
        selected
          ? 'border-primary-700 bg-primary-50'
          : 'border-warm-200 bg-warm-50 hover:border-warm-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`inline-block h-3 w-3 rounded-full border-2 ${
          selected
            ? 'border-primary-700 bg-primary-700'
            : 'border-warm-400 bg-white'
        }`} />
        <span className={`text-sm font-semibold ${
          selected ? 'text-primary-900' : 'text-warm-700'
        }`}>
          {label}
        </span>
      </div>
      <p className={`text-xs leading-relaxed ${
        selected ? 'text-primary-700' : 'text-warm-500'
      }`}>
        {description}
      </p>
    </button>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary-700' : 'bg-warm-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

function ImagePicker({ previewSrc, onSelect, onRemove, inputRef }) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
        id="project-image-input"
      />
      {previewSrc ? (
        <div className="relative group">
          <img
            src={previewSrc}
            alt="Previsualización"
            className="h-48 w-full rounded-xl object-cover border border-warm-200"
          />
          <div className="absolute inset-0 rounded-xl bg-primary-900/0 group-hover:bg-primary-900/40 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <label
              htmlFor="project-image-input"
              className="cursor-pointer rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-primary-900 hover:bg-white"
            >
              Cambiar
            </label>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-white"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
      ) : (
        <label
          htmlFor="project-image-input"
          className="flex flex-col items-center justify-center gap-2 h-48 w-full rounded-xl border-2 border-dashed border-warm-300 bg-warm-50 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
        >
          <UploadIcon className="h-6 w-6 text-warm-500" />
          <span className="text-sm font-medium text-warm-600">
            Seleccionar imagen de portada
          </span>
          <span className="text-xs text-warm-400">JPG, PNG · se comprime automáticamente</span>
        </label>
      )}
    </div>
  );
}

/* ── Íconos ───────────────────────────────────────────────────────────────── */

function BackIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
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