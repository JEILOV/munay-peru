import {
  collection, query, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

const COL = 'team';

/**
 * Obtiene todos los miembros ordenados por `order` ascendente.
 */
export async function fetchTeam() {
  const snap = await getDocs(query(collection(db, COL), orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Crea un nuevo miembro del equipo.
 * @param {{ name, role, photo, order }} data
 */
export async function addMember(data) {
  await addDoc(collection(db, COL), {
    ...data,
    order: Number(data.order) || 0,
    createdAt: serverTimestamp(),
  });
}

/**
 * Actualiza los campos de un miembro existente.
 * @param {string} id
 * @param {{ name, role, photo, order }} data
 */
export async function updateMember(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    order: Number(data.order) || 0,
  });
}

/**
 * Elimina un miembro del equipo.
 * @param {string} id
 */
export async function deleteMember(id) {
  await deleteDoc(doc(db, COL, id));
}