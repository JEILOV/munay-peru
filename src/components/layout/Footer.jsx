// src/components/layout/Footer.jsx
//
// Tono "institucional y limpio" tal como se pidió: sin gradientes vistosos
// ni saturación de íconos sociales gigantes — primary-900 sólido, jerarquía
// tipográfica clara, y el dorado reservado únicamente para el link de Donar
// (consistente con la regla de uso del Button).
//
// Nota: "Donar" ya no navega a /donar (esa página no existe todavía) —
// abre un modal con las categorías de donación y un CTA directo a WhatsApp.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import logoMunay from '../../assets/logo-munay.png'; // Mismo asset que Navbar/Sidebar, para consistencia real de marca

const SEDES = ['Piura', 'Cusco', 'Lima', 'Iquitos'];

const NAV_COLUMNS = [
  {
    title: 'Organización',
    links: [
      { label: 'Nosotros', to: '/nosotros' },
      { label: 'Eventos', to: '/eventos' },
      { label: 'Proyectos', to: '/proyectos' },
      { label: 'Sedes', to: '/sedes' },
    ],
  },
  {
    title: 'Participa',
    links: [
      { label: 'Ser voluntario', to: '/voluntarios' },
      { label: 'Donar', action: 'donation-modal' }, // sin ruta: abre el modal
    ],
  },
];

const DONATION_CATEGORIES = [
  {
    title: 'Educación',
    icon: <BookIcon />,
    items: ['Libros', 'Materiales educativos', 'Útiles escolares'],
  },
  {
    title: 'Ropa',
    icon: <ShirtIcon />,
    items: ['Ropa para niños', 'Ropa para jóvenes', 'Ropa para adultos'],
  },
  {
    title: 'Otros',
    icon: <GiftIcon />,
    items: ['Monetario', 'Juguetes'],
  },
];

const WHATSAPP_DONATION_URL = `https://wa.me/51939389478?text=${encodeURIComponent(
  'Hola, quisiera coordinar una donación para Munay Perú.'
)}`;

export default function Footer() {
  const year = new Date().getFullYear();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <footer className="bg-primary-900 text-warm-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca + misión breve */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src={logoMunay}
                alt="Logo Munay Perú Organization"
                className="h-14 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
            <p className="mt-3 text-sm text-warm-300 leading-relaxed">
              Trabajamos junto a comunidades de todo el país para construir
              futuro desde la identidad y la cercanía.
            </p>
          </div>

          {/* Columnas de navegación */}
          {NAV_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-semibold text-warm-50 uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.action === 'donation-modal' ? (
                      <button
                        type="button"
                        onClick={() => setIsDonationModalOpen(true)}
                        className="text-sm text-warm-300 hover:text-accent-400 transition-colors duration-200"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-sm text-warm-300 hover:text-accent-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Sedes */}
          <div>
            <h3 className="font-display text-sm font-semibold text-warm-50 uppercase tracking-wider">
              Sedes
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SEDES.map((sede) => (
                <li key={sede} className="text-sm text-warm-300">
                  {sede}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-12 pt-8 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-warm-400 text-center sm:text-left">
            © {year} Munay Perú Organization. Todos los derechos reservados.
          </p>
          <Link to="/contacto">
            <Button variant="accent" size="md">
              Contáctanos
            </Button>
          </Link>
        </div>
      </div>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </footer>
  );
}

/**
 * DonationModal — reemplazo temporal de la página /donar mientras no
 * exista. Cierra con la X, con click en el backdrop, o con Escape.
 * Las categorías van en grid para que se pueda escanear rápido qué se
 * recibe, y todo converge en un único CTA de WhatsApp.
 */
function DonationModal({ isOpen, onClose }) {
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

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DONATION_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="rounded-xl border border-warm-200 bg-warm-50 p-4"
                >
                  <div className="h-10 w-10 rounded-full bg-accent-500/15 flex items-center justify-center text-accent-600">
                    {category.icon}
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold text-primary-900">
                    {category.title}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {category.items.map((item) => (
                      <li key={item} className="text-xs text-warm-600 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <a
              href={WHATSAPP_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex items-center justify-center gap-2 w-full rounded-xl bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-3 transition-colors"
            >
              <WhatsappIcon className="h-5 w-5" />
              Coordinar mi donación por WhatsApp
            </a>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Íconos ──────────────────────────────────────────────────────────────── */

function BookIcon(props) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ShirtIcon(props) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4l4 2 4-2 4 4-3 3v10H7V11L4 8l4-4z" />
    </svg>
  );
}

function GiftIcon(props) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 10-2-2c0 1.105 2 2 2 2zm0 0V6a2 2 0 112 2c0-1.105-2-2-2-2zm-9 5h18M5 8h14a1 1 0 011 1v3H4V9a1 1 0 011-1zm-1 4h16v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7z" />
    </svg>
  );
}

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