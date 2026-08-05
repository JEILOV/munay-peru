// src/layouts/PublicLayout.jsx
//
// Shell de la web pública con Navbar y Footer ya implementados.

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DonationModal from "../components/ui/DonationModal";
import { DONATIONS_ENABLED } from "../utils/constants";

export default function PublicLayout() {
  // Estado para controlar la visibilidad del modal de donación
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Pasamos la función al Navbar por si tienes un botón de donar ahí también */}
      <Navbar onOpenDonation={() => setIsDonationModalOpen(true)} />
      
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* ── BOTÓN FLOTANTE DE DONAR ──────────────────────────────────────── */}
      {/* Desactivado temporalmente (DONATIONS_ENABLED) mientras se corrige
          el nombre asociado al Yape. Reactivar el flag en constants.js. */}
      {DONATIONS_ENABLED && (
        <button
          onClick={() => setIsDonationModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          DONAR
        </button>
      )}

      {/* ── MODAL DE DONACIÓN ────────────────────────────────────────────── */}
      {DONATIONS_ENABLED && (
        <DonationModal 
          isOpen={isDonationModalOpen} 
          onClose={() => setIsDonationModalOpen(false)} 
        />
      )}
    </div>
  );
}