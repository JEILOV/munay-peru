// src/routes/ProtectedRoute.jsx
//
// Barrera genérica para todo el dominio /admin.
// Estados posibles:
//   1. isLoading                  -> spinner (aún no sabemos si hay sesión)
//   2. sin sesión                  -> redirect a /admin/login
//   3. sesión + profileStatus
//      'loading' o 'idle'          -> spinner (Firestore aún resolviendo el perfil)
//      'not_found'                 -> usuario autenticado pero SIN documento
//                                     en Firestore: no es un loading, es un
//                                     estado terminal de "no autorizado"
//      'found' + rol no permitido  -> redirect a /admin
//
// Uso:
//   <Route element={<ProtectedRoute />}>              // cualquier usuario autenticado
//   <Route element={<ProtectedRoute allowedRoles={['admin']} />} />  // solo admin

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from '../components/feedback/LoadingScreen';
import UnauthorizedScreen from '../components/feedback/UnauthorizedScreen';

export default function ProtectedRoute({ allowedRoles }) {
  const { firebaseUser, userProfile, profileStatus, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    // Guardamos la ruta de origen para redirigir de vuelta tras login exitoso
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Caso clave que antes faltaba: si ya se confirmó que NO existe el
  // documento en Firestore, esto es un estado terminal — no un "todavía
  // cargando". Mostrar UnauthorizedScreen en vez de quedarse esperando
  // para siempre un dato que nunca va a llegar.
  if (profileStatus === 'not_found') {
    return <UnauthorizedScreen />;
  }

  // Esta ruta no exige roles específicos (ej. <ProtectedRoute /> sin props):
  // cualquier usuario CON documento en Firestore puede pasar. El caso
  // 'not_found' ya quedó cubierto arriba, así que aquí solo falta cubrir
  // el loading legítimo antes de dejar pasar.
  if (profileStatus === 'loading' || profileStatus === 'idle') {
    return <LoadingScreen />;
  }

  // A partir de aquí, profileStatus === 'found' y userProfile tiene datos.
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
}