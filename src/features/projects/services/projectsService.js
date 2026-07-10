// src/features/projects/services/projectsService.js
//
// CRUD específico de la colección `projects`. Vive en features/projects/,
// NO en services/firebase/, siguiendo la separación que definimos desde
// la arquitectura inicial: services/firebase/ solo tiene helpers genéricos;
// el conocimiento de "qué es un proyecto y qué filtros le aplican" vive
// aquí, junto al resto del dominio.
//
// EXTENSIÓN Fase 3 — Eventos:
// Los documentos ahora pueden tener:
//   type: 'initiative' | 'event'    (ausente = se trata como 'initiative')
//   eventDate: Timestamp de Firestore (solo para type === 'event')
//   registrationOpen: boolean       (solo para type === 'event')
//
// DECISIÓN sobre índices compuestos:
// Las queries de eventos (type == 'event' + eventDate >= hoy + orderBy eventDate)
// REQUIEREN un índice compuesto en Firestore. Sin él, Firestore lanza un
// error con un link directo para crearlo. Cuando lo veas en la consola,
// haz clic en ese link — Firebase crea el índice automáticamente en ~1 min.
// Los índices necesarios son:
//   - Collection: projects | Fields: type ASC, eventDate ASC
//   - Collection: projects | Fields: status ASC, eventDate ASC (para eventos publicados)

import {
  addDoc, updateDoc, deleteDoc, doc,
  collection, serverTimestamp,
  query, where, orderBy, getDocs, Timestamp, limit,
} from 'firebase/firestore';
import { getCollection, getDocument, getDocumentByField } from '../../../services/firebase/firestore';
import { db } from '../../../services/firebase/config';

const COLLECTION = 'projects';

/* ════════════════════════════════════════════════════════════════════════════
   FUNCIONES PÚBLICAS — WEB PÚBLICA
══════════════════════════════════════════════════════════════════════════════ */

/**
 * Iniciativas publicadas para la web pública (portafolio general).
 * Incluye:
 *  - Documentos con type === 'initiative' o sin campo 'type' (legacy)
 *  - Eventos PASADOS con status === 'published' (ya realizados → portafolio)
 * Excluye: eventos futuros (esos van en fetchUpcomingEvents).
 *
 * "Pasado" se evalúa en el cliente comparando eventDate con Date.now(),
 * porque Firestore no permite hacer `eventDate < hoy` junto con los otros
 * filtros sin un índice muy específico. El trade-off es aceptable: la lista
 * pública de iniciativas no es tan grande como para que el filtro cliente
 * sea un problema de rendimiento real.
 */
export async function fetchPublishedProjects({ sedeId } = {}) {
  const filters = [['status', '==', 'published']];
  if (sedeId && sedeId !== 'todos') {
    filters.push(['sedeId', '==', sedeId]);
  }

  const all = await getCollection(COLLECTION, {
    filters,
    orderBy: ['date', 'desc'],
  });

  const now = Date.now();

  return all.filter((p) => {
    const isInitiative = !p.type || p.type === 'initiative';
    const isEvent      = p.type === 'event';
    const eventDate    = toMs(p.eventDate);

    // Incluir: iniciativas siempre + eventos ya realizados (fecha pasada)
    return isInitiative || (isEvent && eventDate !== null && eventDate < now);
  });
}

/**
 * Eventos futuros publicados, ordenados por fecha ascendente (el más
 * próximo primero). Esto es lo que alimenta la sección "Próximos Eventos"
 * en la web pública.
 *
 * REQUIERE índice compuesto en Firestore:
 *   projects | status ASC, type ASC, eventDate ASC
 * Firestore te mostrará el link para crearlo la primera vez que se ejecute.
 */
export async function fetchUpcomingEvents() {
  const now = Timestamp.now();

  const q = query(
    collection(db, COLLECTION),
    where('status',    '==', 'published'),
    where('type',      '==', 'event'),
    where('eventDate', '>=', now),
    orderBy('eventDate', 'asc'),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Un proyecto o evento por su slug (usado en ProjectDetailPage).
 * Devuelve null si no existe O si no está publicado.
 *
 * IMPORTANTE: el filtro `status == 'published'` va DENTRO de la query
 * (no se valida después, en el cliente). Las reglas de seguridad de
 * Firestore para lectura pública están escritas contra `resource.data.status`,
 * y para que un "list" query (que es lo que hace una búsqueda por slug)
 * pase esa regla, el propio query debe incluir esa misma condición.
 * Si solo se filtra por `slug` (como hacía la versión anterior, vía
 * getDocumentByField), Firestore no puede garantizar que únicamente se
 * devuelvan documentos publicados y responde con
 * "Missing or insufficient permissions" aunque el documento sí exista
 * y esté publicado — que era el bug que impedía ver el detalle de un
 * proyecto en la web pública.
 */
export async function fetchProjectBySlug(slug) {
  const q = query(
    collection(db, COLLECTION),
    where('slug', '==', slug),
    where('status', '==', 'published'),
    limit(1),
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/* ════════════════════════════════════════════════════════════════════════════
   FUNCIONES CMS — PANEL ADMIN
══════════════════════════════════════════════════════════════════════════════ */

/**
 * TODOS los proyectos y eventos (published Y draft), para el CMS.
 * Ordenados por fecha de creación descendente.
 */
export async function fetchAllProjects() {
  return getCollection(COLLECTION, {
    orderBy: ['date', 'desc'],
  });
}

/**
 * Solo eventos (type === 'event'), todos los estados, para el CMS.
 * Útil si en el futuro quieres una vista de "Gestión de Eventos" separada.
 */
export async function fetchAllEvents() {
  const q = query(
    collection(db, COLLECTION),
    where('type', '==', 'event'),
    orderBy('eventDate', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Un proyecto por su Firestore ID (CMS). NO filtra por status — el admin
 * necesita poder editar borradores.
 */
export async function fetchProjectById(id) {
  return getDocument(COLLECTION, id);
}

/**
 * Crea un nuevo proyecto o evento.
 *
 * Para eventos, `data` debe incluir:
 *   type: 'event'
 *   eventDate: string ISO (ej. "2025-07-20") — se convierte a Timestamp aquí
 *   registrationOpen: boolean
 *
 * Para iniciativas:
 *   type: 'initiative' (o ausente)
 */
export async function createProject(data) {
  const slug = await generateUniqueSlug(data.title);

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...normalizeEventFields(data),
    slug,
    date:      data.date ?? serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, ...data, slug };
}

/**
 * Actualiza un proyecto o evento existente.
 * NO regenera el slug aunque cambie el título (ver nota en versión original).
 */
export async function updateProject(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...normalizeEventFields(data),
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}

/* ════════════════════════════════════════════════════════════════════════════
   HELPERS PRIVADOS
══════════════════════════════════════════════════════════════════════════════ */

/**
 * Convierte el campo eventDate de string ISO a Timestamp de Firestore,
 * y limpia los campos de evento si el tipo es 'initiative'.
 * Así el servicio siempre guarda tipos correctos sin importar lo que
 * venga del formulario.
 */
function normalizeEventFields(data) {
  const normalized = { ...data };

  if (normalized.type === 'event') {
    // El formulario entrega eventDate como string "YYYY-MM-DD"
    // Lo convertimos a Timestamp para poder hacer queries de rango con él
    if (normalized.eventDate && typeof normalized.eventDate === 'string') {
      normalized.eventDate = Timestamp.fromDate(new Date(normalized.eventDate));
    }
    // Asegurar booleano
    normalized.registrationOpen = Boolean(normalized.registrationOpen);
  } else {
    // Iniciativa: limpiar campos de evento para no dejar basura
    normalized.type             = 'initiative';
    normalized.eventDate        = null;
    normalized.registrationOpen = null;
  }

  return normalized;
}

/**
 * Convierte un Timestamp de Firestore (o Date, o ms) a milisegundos.
 * Devuelve null si el valor es falsy o no reconocible.
 */
function toMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis(); // Firestore Timestamp
  if (value instanceof Date)               return value.getTime();
  if (typeof value === 'number')           return value;
  return null;
}

/**
 * Genera un slug único verificando contra Firestore.
 * Si "biohuertos-escolares" ya existe, prueba "biohuertos-escolares-2", "-3", etc.
 */
async function generateUniqueSlug(title) {
  const baseSlug = slugify(title);
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (await getDocumentByField(COLLECTION, 'slug', candidateSlug)) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidateSlug;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}