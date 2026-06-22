// src/features/headquarters/services/headquartersService.js

import { getCollection, getDocument } from '../../../services/firebase/firestore';

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
 * Una sede por su ID de documento (usado en HeadquartersDetailPage).
 * A diferencia de projectsService.fetchProjectBySlug, NO filtramos por
 * isActive aquí: si alguien tiene el link directo a una sede pausada,
 * mostrarla con su estado real es más honesto que un 404 confuso. El
 * filtro de isActive solo aplica al LISTADO, no al detalle individual.
 */
export async function fetchHeadquarterById(id) {
  return getDocument(COLLECTION, id);
}