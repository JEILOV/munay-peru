// src/components/ui/DonationModal.jsx
//
// Reemplazo temporal de la página /donar mientras no exista. Se usa desde
// el Navbar y el Footer — un solo componente, una sola fuente de verdad
// para las categorías y el link de WhatsApp. Cierra con la X, con click
// en el backdrop, o con Escape.
//
// Incluye un sistema de pestañas (Tabs):
//   - "Bienes / Servicios": formulario corto que arma un mensaje de WhatsApp.
//   - "Yape": QR + datos de la cuenta para transferencia directa.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const WHATSAPP_PHONE = '51939389478';

// Datos de Yape — reemplazar por los reales cuando estén disponibles.
const YAPE_NUMBER = '939 389 478';
const YAPE_HOLDER = 'Munay Perú';

const TABS = {
  GOODS: 'goods',
  YAPE: 'yape',
};

export default function DonationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(TABS.GOODS);
  const [form, setForm] = useState({ nombre: '', celular: '', detalle: '' });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Al cerrar el modal reseteamos a la pestaña y formulario iniciales,
  // para que la próxima apertura empiece limpia.
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(TABS.GOODS);
      setForm({ nombre: '', celular: '', detalle: '' });
    }
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const goodsWhatsappUrl = buildGoodsWhatsappUrl(form);
  const yapeWhatsappUrl = buildYapeWhatsappUrl();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Contenido del modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-soft-lg"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-5 right-5 text-warm-400 hover:text-primary-900 transition-colors"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <h2
              id="donation-modal-title"
              className="font-display text-2xl font-bold text-primary-900 pr-8"
            >
              ¿Cómo puedes ayudar a Munay Perú?
            </h2>
            <p className="mt-2 text-sm text-warm-600">
              Cada aporte llega directo a las comunidades con las que trabajamos.
            </p>

            {/* Tabs */}
            <div className="mt-6 flex rounded-xl border border-warm-200 bg-warm-50 p-1">
              <TabButton
                label="Bienes / Servicios"
                isActive={activeTab === TABS.GOODS}
                onClick={() => setActiveTab(TABS.GOODS)}
              />
              <TabButton
                label="Yape"
                isActive={activeTab === TABS.YAPE}
                onClick={() => setActiveTab(TABS.YAPE)}
              />
            </div>

            {/* Contenido de cada pestaña */}
            <div className="mt-6">
              {activeTab === TABS.GOODS ? (
                <div>
                  <p className="text-sm text-warm-600">
                    Cuéntanos qué puedes donar y coordinamos por WhatsApp.
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="donation-nombre" className="block text-xs font-semibold text-primary-900 mb-1">
                        Nombre
                      </label>
                      <input
                        id="donation-nombre"
                        type="text"
                        value={form.nombre}
                        onChange={handleChange('nombre')}
                        placeholder="Tu nombre completo"
                        className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-primary-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="donation-celular" className="block text-xs font-semibold text-primary-900 mb-1">
                        Celular
                      </label>
                      <input
                        id="donation-celular"
                        type="tel"
                        value={form.celular}
                        onChange={handleChange('celular')}
                        placeholder="+51 9XX XXX XXX"
                        className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-primary-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="donation-detalle" className="block text-xs font-semibold text-primary-900 mb-1">
                        ¿Qué deseas donar?
                      </label>
                      <textarea
                        id="donation-detalle"
                        rows={3}
                        value={form.detalle}
                        onChange={handleChange('detalle')}
                        placeholder="Ej: Ropa de niño, libros escolares, útiles..."
                        className="w-full resize-none rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-primary-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500 transition-colors"
                      />
                    </div>
                  </div>

                  <a
                    href={goodsWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-3 transition-colors"
                  >
                    <WhatsappIcon className="h-5 w-5" />
                    Enviar solicitud por WhatsApp
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-warm-600">
                    Escanea el QR o usa el número.
                  </p>

                  {/* Placeholder del QR — reemplazar por la imagen real */}
                  <div className="mt-4 mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-warm-300 bg-warm-50">
                    <div className="text-center px-4">
                      <QrIcon className="mx-auto h-8 w-8 text-warm-400" />
                      <p className="mt-2 text-xs text-warm-500">
                        Aquí va el QR de Yape
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div>
                      <label htmlFor="yape-numero" className="block text-xs font-semibold text-primary-900 mb-1">
                        Número
                      </label>
                      <input
                        id="yape-numero"
                        type="text"
                        readOnly
                        value={YAPE_NUMBER}
                        className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="yape-titular" className="block text-xs font-semibold text-primary-900 mb-1">
                        Nombre del titular
                      </label>
                      <input
                        id="yape-titular"
                        type="text"
                        readOnly
                        value={YAPE_HOLDER}
                        className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <a
                    href={yapeWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-3 transition-colors"
                  >
                    <WhatsappIcon className="h-5 w-5" />
                    Enviar comprobante por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function buildGoodsWhatsappUrl({ nombre, celular, detalle }) {
  const lines = ['Hola, quisiera donar lo siguiente a Munay Perú:'];
  if (nombre.trim()) lines.push(`Nombre: ${nombre.trim()}`);
  if (celular.trim()) lines.push(`Celular: ${celular.trim()}`);
  if (detalle.trim()) lines.push(`Deseo donar: ${detalle.trim()}`);

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function buildYapeWhatsappUrl() {
  const text = 'Hola, acabo de hacer una donación por Yape a Munay Perú. Aquí adjunto mi comprobante.';
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

/* ── Subcomponentes ──────────────────────────────────────────────────────── */

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-white text-primary-900 shadow-soft'
          : 'text-warm-600 hover:text-primary-900'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Íconos ──────────────────────────────────────────────────────────────── */

function CloseIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function WhatsappIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 10-3.8 7.1L21 20l-1.4-3.7a8.46 8.46 0 001.4-4.8z" />
    </svg>
  );
}

function QrIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5A.75.75 0 014.5 3.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM3.75 14.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM13.5 4.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5zM13.5 13.5h2.25v2.25H13.5V13.5zM18 13.5h2.25v2.25H18V13.5zM13.5 18h2.25v2.25H13.5V18zM18 18h2.25v2.25H18V18z" />
    </svg>
  );
}