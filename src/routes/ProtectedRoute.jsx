// src/routes/ProtectedRoute.jsx
//
// Barrera genérica para todo el dominio /admin.
// Tres estados posibles:
//   1. isLoading        -> spinner (aún no sabemos si hay sesión)
//   2. sin sesión        -> redirect a /admin/login
//   3. sesión + rol no permitido -> redirect a /admin (o página de "sin acceso")
//
// Uso:
//   <Route element={<ProtectedRoute />}>              // cualquier usuario autenticado
//   <Route element={<ProtectedRoute allowedRoles={['admin']} />} />  // solo admin

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from '../components/feedback/LoadingScreen';

export default function ProtectedRoute({ allowedRoles }) {
  const { firebaseUser, userProfile, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    // Guardamos la ruta de origen para redirigir de vuelta tras login exitoso
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // userProfile puede tardar un instante más en llegar que firebaseUser
  // (es un fetch a Firestore aparte) — esperamos a que esté listo antes
  // de evaluar permisos por rol.
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userProfile) {
      return <LoadingScreen />;
    }
    if (!allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
}
