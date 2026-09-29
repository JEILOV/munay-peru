// src/pages/public/VolunteerRedirectPage.jsx
//
// Ruta legacy /voluntarios (links viejos, redes sociales, marcadores).
// Cada proyecto/evento tiene ahora su propia inscripción, así que:
//   - si existe un formulario general opcional (settings/global) -> redirige a él
//   - si no                                                      -> /proyectos,
//     donde el usuario elige en qué iniciativa participar
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '../../components/feedback/LoadingScreen';
import { useVolunteerFormUrl } from '../../hooks/useVolunteerFormUrl';

export default function VolunteerRedirectPage() {
  const { url, isLoading } = useVolunteerFormUrl();

  useEffect(() => {
    // replace(): /voluntarios no queda en el historial, así "Atrás" no rebota.
    if (url) window.location.replace(url);
  }, [url]);

  if (isLoading || url) return <LoadingScreen />;
  return <Navigate to="/proyectos" replace />;
}