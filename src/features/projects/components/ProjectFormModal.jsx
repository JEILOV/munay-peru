// src/features/projects/components/ProjectFormModal.jsx
//
// Mismo patrón que SedeFormModal: maneja crear/editar con un componente,
// coverImage puede ser URL existente (string) o File nuevo, onSubmit no
// toca ImgBB ni Firestore directamente.
//
// DIFERENCIA CLAVE respecto a SedeFormModal: recibe `sedes` como prop
// (no las consulta él mismo) para poblar el <select> de sede vinculada.
// El padre (ProjectsManagerPage) ya necesita cargar las sedes para otros
// propósitos (mostrar el nombre de sede en la tabla), así que se las
// pasamos en vez de duplicar esa consulta a Firestore dentro del modal.

import { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { PROJECT_CATEGORIES } from '../../../utils/constants';

const EMPTY_FORM = {
  title: '',
  description: '',
  content: '',
  sedeId: '',
  category: '',
  videoUrl: '',
  status: 'published', // "Activo" por defecto al crear — ver nota de status más abajo
};

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSaving,
  savingStage,
  sedes,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      const { coverImage, ...rest } = initialData ?? {};
      setForm({ ...EMPTY_FORM, ...rest });
      setExistingImageUrl(coverImage ?? '');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    // Límite más alto que en SedeFormModal a propósito: la imagen se va a
    // comprimir de todas formas antes de subir (maxSizeMB: 1), así que el
    // límite del cliente aquí solo previene archivos absurdamente pesados
    // que harían la compresión misma muy lenta en el navegador.
    const MAX_SIZE_MB = 20;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`La imagen no debe superar los ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setExistingImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      coverImageFile: selectedFile,
      coverImageUrl: selectedFile ? null : existingImageUrl,
    });
  }

  const displayedPreview = previewUrl ?? existingImageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Proyecto' : 'Agregar Proyecto'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <Field label="Sede" required>
          <select
            required
            value={form.sedeId}
            onChange={(e) => handleChange('sedeId', e.target.value)}
            className="input-base"
          >
            <option value="" disabled>
              Selecciona una sede…
            </option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.name}
              </option>
            ))}
          </select>
          {sedes.length === 0 && (
            <p className="mt-1.5 text-xs text-primary-600">
              No hay sedes registradas todavía. Crea una sede primero en
              Gestión de Sedes.
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
            <option value="" disabled>
              Selecciona una categoría…
            </option>
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </Field>

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
            rows={6}
            required
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Desarrollo completo del proyecto. Usa líneas en blanco para separar párrafos…"
            className="input-base resize-none"
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

        <Field label="Imagen de portada">
          <ImagePicker
            previewSrc={displayedPreview}
            onSelect={handleFileSelect}
            onRemove={displayedPreview ? handleRemoveImage : undefined}
            inputRef={fileInputRef}
          />
        </Field>

        {/* Estado: Activo = published, Inactivo = draft (ver nota en projectsService.js) */}
        <div className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-primary-900">Proyecto Activo</p>
            <p className="text-xs text-warm-600 mt-0.5">
              Inactivo = borrador, no visible en la web pública.
            </p>
          </div>
          <ToggleSwitch
            checked={form.status === 'published'}
            onChange={(value) => handleChange('status', value ? 'published' : 'draft')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-warm-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} disabled={sedes.length === 0}>
            {getSubmitLabel({ isSaving, savingStage, isEditMode })}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Mapea el estado actual de guardado al texto del botón. Solo entra en
 * juego mientras isSaving === true; si no se está guardando, muestra el
 * texto normal de crear/editar.
 *
 * Nota: si no hay imagen nueva seleccionada, savingStage salta directo a
 * 'saving' (nunca pasa por 'compressing'/'uploading') — ver el orquestador
 * en ProjectsManagerPage, que solo activa esos dos estados cuando
 * coverImageFile existe.
 */
function getSubmitLabel({ isSaving, savingStage, isEditMode }) {
  if (!isSaving) {
    return isEditMode ? 'Guardar cambios' : 'Crear proyecto';
  }
  if (savingStage === 'compressing') return 'Comprimiendo imagen…';
  if (savingStage === 'uploading') return 'Subiendo foto…';
  if (savingStage === 'saving') return 'Guardando datos…';
  return 'Guardando…'; // fallback por si isSaving es true pero savingStage aún no se actualizó
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
            className="h-40 w-full rounded-xl object-cover border border-warm-200"
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
          className="flex flex-col items-center justify-center gap-2 h-40 w-full rounded-xl
                     border-2 border-dashed border-warm-300 bg-warm-50 cursor-pointer
                     hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
        >
          <UploadIcon className="h-6 w-6 text-warm-500" />
          <span className="text-sm font-medium text-warm-600">
            Seleccionar imagen de la galería
          </span>
          <span className="text-xs text-warm-400">JPG, PNG · se comprime automáticamente</span>
        </label>
      )}
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
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
    </svg>
  );
}