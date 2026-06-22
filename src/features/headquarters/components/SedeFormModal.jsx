// src/features/headquarters/components/SedeFormModal.jsx
//
// Maneja tanto "crear" como "editar" con el mismo componente: si recibe
// `initialData`, precarga el formulario (modo edición); si no, arranca
// vacío (modo creación).
//
// CAMBIO IMPORTANTE (subida de archivos): coverImage ahora puede ser DOS
// cosas distintas según el contexto:
//   - Un string (URL) cuando editamos una sede existente y el usuario
//     todavía no tocó el selector de archivo — es la URL que ya vive en
//     Firestore, solo para PREVISUALIZAR.
//   - Un objeto File cuando el usuario seleccionó una imagen nueva desde
//     su galería/explorador — esto es lo que el padre debe subir a ImgBB
//     antes de guardar en Firestore.
//
// onSubmit sigue sin tocar ImgBB ni Firestore directamente — solo entrega
// { name, region, description, isActive, phone, whatsapp, facebook,
//   instagram, coverImageFile, coverImageUrl } al padre, que decide qué
// hacer con cada uno.

import { useState, useEffect, useRef } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const EMPTY_FORM = {
  name: '',
  region: '',
  description: '',
  isActive: true,
  phone: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
};

export default function SedeFormModal({ isOpen, onClose, onSubmit, initialData, isSaving }) {
  const [form, setForm] = useState(EMPTY_FORM);
  // URL existente (modo edición) — viene de Firestore, es un string.
  const [existingImageUrl, setExistingImageUrl] = useState('');
  // Archivo NUEVO seleccionado por el usuario en esta sesión del modal.
  const [selectedFile, setSelectedFile] = useState(null);
  // Preview local del archivo nuevo (generada con URL.createObjectURL).
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(initialData);

  // Resetea/precarga el formulario cada vez que el modal se abre.
  useEffect(() => {
    if (isOpen) {
      const { coverImage, ...rest } = initialData ?? {};
      setForm({ ...EMPTY_FORM, ...rest });
      setExistingImageUrl(coverImage ?? '');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, initialData]);

  // Genera (y limpia) el object URL de preview cada vez que cambia el
  // archivo seleccionado. revokeObjectURL es necesario para no acumular
  // memoria — sin esto, cada imagen seleccionada queda "viva" en memoria
  // del navegador aunque el usuario elija otra después.
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

    // Validación básica en el cliente — no reemplaza la validación que
    // ImgBB hace del lado del servidor, pero evita que el usuario espere
    // una subida que sabemos que va a fallar (ej. un PDF renombrado a .jpg
    // pasaría el `accept` del input pero no es una imagen real).
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    const MAX_SIZE_MB = 10;
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
      // El padre decide: si coverImageFile existe, sube eso a ImgBB.
      // Si no, y coverImageUrl tiene valor, mantiene esa URL tal cual
      // (caso: editar una sede sin cambiar su foto).
      coverImageFile: selectedFile,
      coverImageUrl: selectedFile ? null : existingImageUrl,
    });
  }

  const displayedPreview = previewUrl ?? existingImageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Sede' : 'Agregar Sede'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Nombre de la sede" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ej. Piura"
            className="input-base"
          />
        </Field>

        <Field label="Región" required>
          <input
            type="text"
            required
            value={form.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="Ej. Piura, Perú"
            className="input-base"
          />
        </Field>

        <Field label="Descripción">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Breve descripción del trabajo de esta sede…"
            className="input-base resize-none"
          />
        </Field>

        {/* Contacto y Redes — todos opcionales: una sede puede no tener
            WhatsApp habilitado aún o no manejar Instagram. */}
        <div>
          <p className="text-sm font-medium text-primary-900 mb-2">Contacto y Redes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Ej. +51 999 999 999"
                className="input-base"
              />
            </Field>

            <Field label="WhatsApp (enlace wa.me)">
              <input
                type="url"
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="https://wa.me/51999999999"
                className="input-base"
              />
            </Field>

            <Field label="Facebook">
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/munayperu"
                className="input-base"
              />
            </Field>

            <Field label="Instagram">
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/munayperu"
                className="input-base"
              />
            </Field>
          </div>
        </div>

        {/* Selector de imagen + preview */}
        <Field label="Foto de portada">
          <ImagePicker
            previewSrc={displayedPreview}
            onSelect={handleFileSelect}
            onRemove={displayedPreview ? handleRemoveImage : undefined}
            inputRef={fileInputRef}
          />
        </Field>

        {/* Toggle de Sede Activa */}
        <div className="flex items-center justify-between rounded-xl bg-warm-50 border border-warm-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-primary-900">Sede Activa</p>
            <p className="text-xs text-warm-600 mt-0.5">
              Las sedes inactivas no aparecen en la web pública.
            </p>
          </div>
          <ToggleSwitch
            checked={form.isActive}
            onChange={(value) => handleChange('isActive', value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-warm-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {isSaving ? 'Guardando…' : isEditMode ? 'Guardar cambios' : 'Crear sede'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Selector de archivo + preview en miniatura. Click en la tarjeta completa
 * abre el explorador de archivos (no solo un botón pequeño) — en móvil,
 * esto naturalmente ofrece "Galería / Cámara / Archivos" gracias al
 * atributo `accept="image/*"` del input nativo.
 */
function ImagePicker({ previewSrc, onSelect, onRemove, inputRef }) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="hidden"
        id="sede-image-input"
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
              htmlFor="sede-image-input"
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
          htmlFor="sede-image-input"
          className="flex flex-col items-center justify-center gap-2 h-40 w-full rounded-xl
                     border-2 border-dashed border-warm-300 bg-warm-50 cursor-pointer
                     hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
        >
          <UploadIcon className="h-6 w-6 text-warm-500" />
          <span className="text-sm font-medium text-warm-600">
            Seleccionar imagen de la galería
          </span>
          <span className="text-xs text-warm-400">JPG, PNG · máx. 10MB</span>
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