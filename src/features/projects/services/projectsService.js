// src/features/projects/services/projectsService.js
//
// CRUD específico de la colección `projects`. Vive en features/projects/,
// NO en services/firebase/, siguiendo la separación que definimos desde
// la arquitectura inicial: services/firebase/ solo tiene helpers genéricos;
// el conocimiento de "qué es un proyecto y qué filtros le aplican" vive
// aquí, junto al resto del dominio.
//
// DECISIÓN: "Estado Activo/Inactivo" del formulario se mapea a nuestro
// campo real `status: 'draft' | 'published'` (definido desde la primera
// sesión), NO a un booleano nuevo. Un proyecto no necesita dos campos de
// estado potencialmente contradictorios — "Activo" en el formulario
// significa exactamente "published" en Firestore.

import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { getCollection, getDocument, getDocumentByField } from '../../../services/firebase/firestore';
import { db } from '../../../services/firebase/config';

const COLLECTION = 'projects';

/**
 * Proyectos publicados para la web pública, opcionalmente filtrados por sede.
 * SIEMPRE filtra status === 'published' — un visitante de la web pública
 * nunca debe ver un proyecto en borrador, sin importar qué pase en el CMS.
 */
export async function fetchPublishedProjects({ sedeId } = {}) {
  const filters = [['status', '==', 'published']];
  if (sedeId && sedeId !== 'todos') {
    filters.push(['sedeId', '==', sedeId]);
  }

  return getCollection(COLLECTION, {
    filters,
    orderBy: ['date', 'desc'],
  });
}

/**
 * TODOS los proyectos (published Y draft), para el CMS. El admin necesita
 * ver y poder editar borradores, no solo lo ya publicado.
 */
export async function fetchAllProjects() {
  return getCollection(COLLECTION, {
    orderBy: ['date', 'desc'],
  });
}

/**
 * Un proyecto por su slug (usado en ProjectDetailPage). Devuelve null si
 * no existe O si existe pero no está publicado — un slug de borrador no
 * debe ser accesible públicamente solo por adivinar la URL.
 */
export async function fetchProjectBySlug(slug) {
  const project = await getDocumentByField(COLLECTION, 'slug', slug);
  if (!project || project.status !== 'published') return null;
  return project;
}

/**
 * Un proyecto por su Firestore ID (usado en el CMS, donde SÍ se necesita
 * poder editar/ver borradores — por eso NO filtra por status, a diferencia
 * de fetchProjectBySlug).
 */
export async function fetchProjectById(id) {
  return getDocument(COLLECTION, id);
}

/**
 * Crea un nuevo proyecto. Genera el `slug` automáticamente a partir del
 * título (el formulario del CMS no pide un slug manual) y verifica que
 * no choque con uno existente, agregando un sufijo numérico si es necesario
 * — sin esto, dos proyectos titulados igual ("Biohuertos escolares") en
 * sedes distintas generarían el mismo slug y el segundo pisaría
 * silenciosamente la URL del primero en fetchProjectBySlug.
 */
export async function createProject(data) {
  const slug = await generateUniqueSlug(data.title);

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    slug,
    date: data.date ?? serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data, slug };
}

/**
 * Actualiza un proyecto existente. NO regenera el slug aunque cambie el
 * título — cambiar la URL de un proyecto ya publicado rompería enlaces
 * compartidos (redes sociales, WhatsApp, etc.) sin que el admin lo pida
 * explícitamente. Si en el futuro quieres permitir editar el slug a
 * propósito, sería un campo separado y explícito en el formulario, no un
 * efecto secundario automático de editar el título.
 */
export async function updateProject(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
}

export async function deleteProject(id) {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Genera un slug a partir de un título, verificando unicidad contra
 * Firestore. Si "biohuertos-escolares" ya existe, prueba
 * "biohuertos-escolares-2", "-3", etc.
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
    .replace(/[\u0300-\u036f]/g, '') // quita acentos (á -> a, ñ se preserva aparte abajo)
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
