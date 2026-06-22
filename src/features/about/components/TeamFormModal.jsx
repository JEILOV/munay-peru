// src/features/about/components/TeamFormModal.jsx
import { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { compressAndUploadImage } from '../../../services/imgbb/imgbbService';

const EMPTY_FORM = { name: '', role: '', photo: '', order: '' };

export default function TeamFormModal({ isOpen, onClose, onSubmit, initialData, isSaving }) {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(initialData);

  // Precarga o resetea el formulario cada vez que el modal se abre.
  // ── Sin cambios respecto al original ──
  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              name:  initialData.name  ?? '',
              role:  initialData.role  ?? '',
              photo: initialData.photo ?? '',
              order: initialData.order ?? '',
            }
          : EMPTY_FORM,
      );
      // Limpia estados de subida al (re)abrir el modal.
      setIsUploading(false);
      setUploadError(null);
    }
  }, [isOpen, initialData]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Sube el archivo seleccionado a ImgBB y actualiza form.photo.
// Dentro de src/features/about/components/TeamFormModal.jsx

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Usamos tu servicio existente que ya incluye compresión
      const url = await compressAndUploadImage(file);
      handleChange('photo', url);
    } catch (err) {
      console.error('[TeamFormModal] Error procesando imagen:', err);
      setUploadError(err.message || 'No se pudo procesar la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  // El botón de guardar se bloquea si el padre está guardando O si hay
  // una subida de imagen en curso — ambos son operaciones asíncronas
  // que deben terminar antes de poder enviar el formulario.
  const isBusy = isSaving || isUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Miembro' : 'Agregar Miembro'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Preview de foto ─────────────────────────────────────────── */}
        {/* Muestra spinner mientras sube, imagen cuando ya hay URL       */}
        <div className="flex justify-center">
          {isUploading ? (
            <div className="h-24 w-24 rounded-full border-4 border-warm-200 bg-warm-50 flex items-center justify-center shadow-soft">
              <SpinnerIcon className="h-6 w-6 text-primary-500 animate-spin" />
            </div>
          ) : form.photo ? (
            <img
              src={form.photo}
              alt="Preview"
              className="h-24 w-24 rounded-full object-cover border-4 border-warm-200 shadow-soft"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
        </div>

        {/* ── Nombre ──────────────────────────────────────────────────── */}
        <Field label="Nombre completo" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej. María García"
            className="input-base"
          />
        </Field>

        {/* ── Cargo ───────────────────────────────────────────────────── */}
        <Field label="Cargo / Rol" required>
          <input
            type="text"
            required
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Ej. Coordinadora de Voluntariado"
            className="input-base"
          />
        </Field>

        {/* ── Foto: selector de archivo (reemplaza el input de URL) ───── */}
        <Field label="Foto del miembro">
          {/* Input de archivo oculto — se activa desde el botón de abajo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="team-photo-input"
            disabled={isUploading}
          />

          <label
            htmlFor="team-photo-input"
            className={`
              flex items-center gap-3 w-full rounded-xl border border-warm-200 bg-warm-50
              px-4 py-2.5 text-sm cursor-pointer transition-colors duration-200
              ${isUploading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-primary-400 hover:bg-primary-50'}
            `}
          >
            <UploadIcon className="h-4 w-4 text-warm-500 shrink-0" />
            <span className="text-warm-600 truncate">
              {isUploading
                ? 'Subiendo imagen…'
                : form.photo
                  ? 'Cambiar foto'
                  : 'Seleccionar foto desde galería'}
            </span>
          </label>

          {/* Error de subida */}
          {uploadError && (
            <p className="mt-1.5 text-xs text-red-500">{uploadError}</p>
          )}

          {/* URL resultante (solo lectura, para transparencia) */}
          {form.photo && !isUploading && (
            <p className="mt-1 text-xs text-warm-400 truncate" title={form.photo}>
              {form.photo}
            </p>
          )}
        </Field>

        {/* ── Orden ───────────────────────────────────────────────────── */}
        <Field label="Orden de aparición" required>
          <input
            type="number"
            required
            min={0}
            value={form.order}
            onChange={(e) => handleChange('order', e.target.value)}
            placeholder="1"
            className="input-base"
          />
          <p className="mt-1 text-xs text-warm-500">
            Número menor = aparece primero en la web pública.
          </p>
        </Field>

        {/* ── Acciones ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-warm-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isBusy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isBusy} disabled={isBusy}>
            {isSaving
              ? 'Guardando…'
              : isUploading
                ? 'Subiendo imagen…'
                : isEditMode
                  ? 'Guardar cambios'
                  : 'Agregar miembro'}
          </Button>
        </div>

      </form>
    </Modal>
  );
}

/* ── Sub-componentes ────────────────────────────────────────────────────── */

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

function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3" />
    </svg>
  );
}

function SpinnerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}