// src/features/recognitions/components/RecognitionFormModal.jsx
import { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { compressAndUploadImage } from '../../../services/imgbb/imgbbService';

const EMPTY_FORM = { title: '', description: '', date: '', imageUrl: '' };

/** Convierte un Timestamp de Firestore al formato 'YYYY-MM-DD' que espera <input type="date">. */
function toDateInputValue(timestamp) {
  if (!timestamp) return '';
  const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function RecognitionFormModal({ isOpen, onClose, onSubmit, initialData, isSaving }) {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialData
          ? {
              title:       initialData.title       ?? '',
              description: initialData.description ?? '',
              date:        toDateInputValue(initialData.date),
              imageUrl:    initialData.imageUrl     ?? '',
            }
          : EMPTY_FORM,
      );
      setIsUploading(false);
      setUploadError(null);
    }
  }, [isOpen, initialData]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await compressAndUploadImage(file);
      handleChange('imageUrl', url);
    } catch (err) {
      console.error('[RecognitionFormModal] Error procesando imagen:', err);
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

  const isBusy = isSaving || isUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Reconocimiento' : 'Agregar Reconocimiento'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Preview de imagen ───────────────────────────────────────── */}
        <div className="flex justify-center">
          {isUploading ? (
            <div className="h-32 w-full max-w-xs rounded-xl border-4 border-warm-200 bg-warm-50 flex items-center justify-center shadow-soft">
              <SpinnerIcon className="h-6 w-6 text-primary-500 animate-spin" />
            </div>
          ) : form.imageUrl ? (
            <img
              src={form.imageUrl}
              alt="Preview"
              className="h-32 w-full max-w-xs rounded-xl object-cover border-4 border-warm-200 shadow-soft"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
        </div>

        {/* ── Título ──────────────────────────────────────────────────── */}
        <Field label="Título" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej. Reconocimiento Municipal de Piura 2026"
            className="input-base"
          />
        </Field>

        {/* ── Fecha ───────────────────────────────────────────────────── */}
        <Field label="Fecha" required>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="input-base"
          />
        </Field>

        {/* ── Descripción ─────────────────────────────────────────────── */}
        <Field label="Descripción breve" required>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Cuenta en 1-2 líneas de qué se trata este reconocimiento…"
            className="input-base resize-none"
          />
        </Field>

        {/* ── Imagen: selector de archivo ─────────────────────────────── */}
        <Field label="Foto" required={!isEditMode}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="recognition-photo-input"
            disabled={isUploading}
          />
          <label
            htmlFor="recognition-photo-input"
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
                : form.imageUrl
                  ? 'Cambiar foto'
                  : 'Seleccionar foto desde galería'}
            </span>
          </label>
          {uploadError && <p className="mt-1.5 text-xs text-red-500">{uploadError}</p>}
        </Field>

        {/* ── Acciones ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-warm-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isBusy}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isBusy}
            disabled={isBusy || !form.imageUrl}
          >
            {isSaving
              ? 'Guardando…'
              : isUploading
                ? 'Subiendo imagen…'
                : isEditMode
                  ? 'Guardar cambios'
                  : 'Agregar reconocimiento'}
          </Button>
        </div>

      </form>
    </Modal>
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