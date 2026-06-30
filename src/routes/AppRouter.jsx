// src/routes/AppRouter.jsx
//
// Árbol de rutas completo. Tres grupos claramente separados:
//
//   1. Rutas públicas      -> envueltas en <PublicLayout />
//   2. /admin/login         -> standalone, SIN layout de admin (no tiene sentido
//                              mostrar un sidebar a alguien que aún no inició sesión)
//   3. /admin/*  (resto)    -> protegidas por <ProtectedRoute />, envueltas en <AdminLayout />
//
// La separación de /admin/login fuera de ProtectedRoute es intencional:
// si lo metiéramos adentro, un usuario sin sesión nunca podría LLEGAR al login
// porque ProtectedRoute lo redirigiría... a /admin/login, generando un loop.

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Páginas públicas
import HomePage from '../pages/public/HomePage';
import ProjectsPage from '../pages/public/ProjectsPage';
import ProjectDetailPage from '../pages/public/ProjectDetailPage';
import HeadquartersPage from '../pages/public/HeadquartersPage';
import HeadquartersDetailPage from '../pages/public/HeadquartersDetailPage';
import VolunteerPage from '../pages/public/VolunteerPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Páginas admin
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import ProjectsManagerPage from '../pages/admin/ProjectsManagerPage';
import ProjectEditorPage from '../pages/admin/ProjectEditorPage';
import HeadquartersManagerPage from '../pages/admin/HeadquartersManagerPage';
import VolunteersInboxPage from '../pages/admin/VolunteersInboxPage';
import TeamManagerPage from '../pages/admin/TeamManagerPage';
import TestimonialsManagerPage from '../pages/admin/TestimonialsManagerPage'; // <-- NUEVA IMPORTACIÓN

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ───────────── WEB PÚBLICA ───────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/proyectos/:slug" element={<ProjectDetailPage />} />
          <Route path="/sedes" element={<HeadquartersPage />} />
          <Route path="/sedes/:id" element={<HeadquartersDetailPage />} />
          <Route path="/voluntarios" element={<VolunteerPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          {/* Ruta explícita para redirects intencionales (ej. slug no
              encontrado en ProjectDetailPage). El catch-all "*" más abajo
              sigue cubriendo cualquier URL que el usuario escriba mal. */}
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* ───────────── LOGIN (fuera del guard, sin AdminLayout) ───────────── */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ───────────── CMS PROTEGIDO ───────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />

            {/* Gestión de proyectos */}
            <Route path="/admin/proyectos" element={<ProjectsManagerPage />} />
            <Route path="/admin/proyectos/nuevo" element={<ProjectEditorPage />} />
            <Route path="/admin/proyectos/:id/editar" element={<ProjectEditorPage />} />
            
            {/* Gestión de equipo */}
            <Route path="/admin/equipo" element={<TeamManagerPage />} />

            {/* Gestión de testimonios */}
            <Route path="/admin/testimonios" element={<TestimonialsManagerPage />} /> {/* <-- NUEVA RUTA */}

            {/* Gestión de sedes */}
            <Route path="/admin/sedes" element={<HeadquartersManagerPage />} />

            {/* Bandeja de entrada */}
            <Route path="/admin/voluntarios" element={<VolunteersInboxPage />} />
          </Route>
        </Route>

        {/* ───────────── 404 ───────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}