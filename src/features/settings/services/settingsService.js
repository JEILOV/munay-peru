// src/features/settings/services/settingsService.js
//
// Configuración global del sitio. Un único documento en Firestore:
//   colección: settings  ·  documento: global
//
// Campos actuales:
//   volunteerFormUrl (string)  -> URL del Google Form de voluntarios.
//                                 Vacío = el botón del Hero se oculta.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';
import { isValidHttpUrl } from '../../../utils/url';

const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'global';

const settingsRef = () => doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

/** Devuelve todo el documento de configuración ({} si aún no existe). */
export async function getSettings() {
  const snap = await getDoc(settingsRef());
  return snap.exists() ? snap.data() : {};
}

// Caché en memoria (por carga de página): Hero, Footer y /voluntarios comparten
// UNA sola lectura a Firestore en vez de una por componente. Se invalida al
// guardar y si la lectura falla (para poder reintentar).
let volunteerUrlPromise = null;

/**
 * Lee `volunteerFormUrl`. Devuelve '' si no existe o si no es una URL válida,
 * así el consumidor solo tiene que preguntar `if (url)`.
 */
export function getVolunteerFormUrl() {
  if (!volunteerUrlPromise) {
    volunteerUrlPromise = getSettings()
      .then(({ volunteerFormUrl }) =>
        isValidHttpUrl(volunteerFormUrl) ? volunteerFormUrl.trim() : '',
      )
      .catch((err) => {
        volunteerUrlPromise = null;
        throw err;
      });
  }
  return volunteerUrlPromise;
}

/**
 * Actualiza `volunteerFormUrl`. Cadena vacía = desactivar el botón.
 * Usa setDoc + merge para que funcione aunque el documento aún no exista
 * (updateDoc fallaría en el primer guardado).
 * @returns {Promise<string>} la URL guardada (normalizada con trim)
 */
export async function updateVolunteerFormUrl(url) {
  const clean = (url ?? '').trim();

  if (clean && !isValidHttpUrl(clean)) {
    throw new Error('Ingresa una URL válida que empiece con http:// o https://');
  }

  await setDoc(
    settingsRef(),
    { volunteerFormUrl: clean, updatedAt: serverTimestamp() },
    { merge: true },
  );
  volunteerUrlPromise = null; // la próxima lectura pública trae el valor nuevo
  return clean;
}