// src/features/headquarters/services/headquartersService.js

import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { getCollection, getDocument } from '../../../services/firebase/firestore';
import { db } from '../../../services/firebase/config';

const COLLECTION = 'headquarters';

/**
 * Sedes activas para la web pública. Una sede con isActive: false existe
 * en la base de datos (ej. una sede en pausa temporal o en planificación)
 * pero no debe aparecer en /sedes ni ser navegable públicamente.
 */
export async function fetchActiveHeadquarters() {
  return getCollection(COLLECTION, {
    filters: [['isActive', '==', true]],
    orderBy: ['name', 'asc'],
  });
}

/**
 * TODAS las sedes (activas E inactivas), para el CMS. A diferencia de
 * fetchActiveHeadquarters, el admin SÍ necesita ver las sedes pausadas —
 * de lo contrario no habría forma de reactivarlas desde el panel.
 */
export async function fetchAllHeadquarters() {
  return getCollection(COLLECTION, {
    orderBy: ['name', 'asc'],
  });
}

/**
 * Una sede por su ID de documento (usado en HeadquartersDetailPage).
 * A diferencia de projectsService.fetchProjectBySlug, NO filtramos por
 * isActive aquí: si alguien tiene el link directo a una sede pausada,
 * mostrarla con su estado real es más honesto que un 404 confuso. El
 * filtro de isActive solo aplica al LISTADO, no al detalle individual.
 */
export async function fetchHeadquarterById(id) {
  return getDocument(COLLECTION, id);
}

/**
 * Crea una nueva sede. `data` ya debe traer coverImage como URL (string)
 * — la subida del archivo físico a ImgBB ocurre ANTES de llamar a esto,
 * en la página, no aquí. Este servicio solo sabe hablar con Firestore.
 */
export async function createSede(data) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

/**
 * Actualiza una sede existente por su ID. `data` reemplaza solo los campos
 * incluidos (Firestore updateDoc hace merge a nivel de campo, no
 * sobreescribe el documento completo).
 */
export async function updateSede(id, data) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
}

/**
 * Elimina una sede, pero SOLO si no tiene proyectos vinculados.
 *
 * Usamos el helper genérico getCollection (no importamos projectsService
 * directamente) para evitar una dependencia circular entre features:
 * projectsService ya depende de constantes compartidas, y si
 * headquartersService importara projectsService, cualquier cambio futuro
 * en uno arriesgaría un ciclo de imports. getCollection('projects', ...)
 * es el mismo helper genérico que projectsService usa internamente —
 * solo consultamos, no escribimos, así que no hay razón para pasar por
 * la capa de negocio del otro feature.
 *
 * @throws {Error} con mensaje legible si existen proyectos vinculados.
 */
export async function deleteSede(id) {
  const linkedProjects = await getCollection('projects', {
    filters: [['sedeId', '==', id]],
  });

  if (linkedProjects.length > 0) {
    throw new Error(
      `No se puede eliminar esta sede: tiene ${linkedProjects.length} ` +
        `${linkedProjects.length === 1 ? 'proyecto vinculado' : 'proyectos vinculados'}. ` +
        `Reasigna o elimina esos proyectos primero.`,
    );
  }

  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}
