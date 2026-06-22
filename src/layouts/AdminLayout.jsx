// src/layouts/AdminLayout.jsx
//
// onLogout es un no-op por defecto a propósito: en /admin-preview no hay
// sesión real que cerrar. Cuando conectemos esto a /admin real y al
// ProtectedRoute, pasamos un onLogout real (authService.logout() +
// navigate a /admin/login) sin tocar este archivo — basta con pasar la prop.

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

export default function AdminLayout({ basePath = '/admin', onLogout }) {
  const handleLogout =
    onLogout ??
    (() => {
      // Placeholder explícito: en /admin-preview no existe sesión que cerrar.
      // Esto se reemplaza por authService.logout() + redirect cuando este
      // layout se monte detrás de ProtectedRoute.
      console.warn('[AdminLayout] onLogout no implementado en este contexto (preview).');
      alert('Cerrar sesión estará disponible cuando conectemos el login real.');
    });

  return (
    <div className="min-h-screen flex bg-warm-50">
      <Sidebar basePath={basePath} onLogout={handleLogout} />
      <main className="flex-1 min-w-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
