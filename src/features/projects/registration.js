// src/features/projects/registration.js
//
// Única fuente de verdad para decidir qué mostrar de las inscripciones de un
// proyecto/evento en la web pública (detalle, tarjetas).
//
//   status 'open'   -> inscripciones abiertas Y hay URL válida: mostrar botón
//   status 'closed' -> es un evento sin inscripción disponible: "cerradas"
//   status 'none'   -> iniciativa sin inscripción: no mostrar nada
//
// Un evento cuya fecha ya pasó cuenta como cerrado aunque el switch siga
// activo. Se da 24 h de margen porque eventDate se guarda a medianoche UTC
// (en Perú, UTC-5, eso cae la tarde anterior).
import { isValidHttpUrl } from '../../utils/url';

const EVENT_GRACE_MS = 24 * 60 * 60 * 1000;

function toMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return null;
}

export function getRegistration(project) {
  if (!project) return { status: 'none', url: '' };

  const isEvent = project.type === 'event';
  const url = isValidHttpUrl(project.registrationFormUrl)
    ? project.registrationFormUrl.trim()
    : '';

  const eventMs = toMs(project.eventDate);
  const expired = isEvent && eventMs !== null && eventMs + EVENT_GRACE_MS < Date.now();

  if (project.registrationOpen === true && url && !expired) {
    return { status: 'open', url };
  }
  return { status: isEvent ? 'closed' : 'none', url: '' };
}