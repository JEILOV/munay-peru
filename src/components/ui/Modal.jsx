// src/components/ui/Modal.jsx
//
// Modal genérico, agnóstico de contenido — no sabe nada de "sedes" o
// "proyectos". SedeFormModal (y luego ProjectFormModal) se construyen
// ENCIMA de este, pasándole su propio formulario como children.

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Cerrar con tecla Escape — accesibilidad básica esperada en cualquier modal.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloquear scroll del body mientras el modal está abierto — sin esto,
  // el contenido detrás del overlay se desplaza junto con el modal,
  // lo cual se siente roto.
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-primary-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-soft-lg animate-slide-up`}
      >
        <div className="sticky top-0 flex items-center justify-between bg-white border-b border-warm-200 px-6 py-4 rounded-t-2xl">
          <h2 id="modal-title" className="font-display text-lg font-semibold text-primary-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-warm-500 hover:bg-warm-100 hover:text-primary-900 transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
