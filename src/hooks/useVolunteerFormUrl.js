// src/hooks/useVolunteerFormUrl.js
//
// Devuelve la URL externa de inscripción de voluntarios (Firestore:
// settings/global.volunteerFormUrl). Usar en Hero, Footer y /voluntarios.
//
//   url === ''  y  isLoading === false  ->  no hay convocatoria configurada
//   Mientras carga (o si la lectura falla) url es '' — los consumidores
//   ocultan el enlace en vez de mostrar uno que luego desaparezca.
import { useEffect, useState } from 'react';
import { getVolunteerFormUrl } from '../features/settings/services/settingsService';

export function useVolunteerFormUrl() {
  const [state, setState] = useState({ url: '', isLoading: true });

  useEffect(() => {
    let cancelled = false;
    getVolunteerFormUrl()
      .then((url) => { if (!cancelled) setState({ url, isLoading: false }); })
      .catch((err) => {
        console.error('[useVolunteerFormUrl] No se pudo leer volunteerFormUrl:', err);
        if (!cancelled) setState({ url: '', isLoading: false });
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}