// src/features/testimonials/services/testimonialsService.js
import {
  collection, query, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

const COL = 'testimonials';

/** Obtiene todos los testimonios ordenados por `order` ascendente. */
export async function fetchTestimonials() {
  const snap = await getDocs(query(collection(db, COL), orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Crea un nuevo testimonio.
 * @param {{ name, role, content, photo, order }} data
 */
export async function addTestimonial(data) {
  await addDoc(collection(db, COL), {
    ...data,
    order: Number(data.order) || 0,
    createdAt: serverTimestamp(),
  });
}

/**
 * Actualiza los campos de un testimonio existente.
 * @param {string} id
 * @param {{ name, role, content, photo, order }} data
 */
export async function updateTestimonial(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    order: Number(data.order) || 0,
  });
}

/** Elimina un testimonio. */
export async function deleteTestimonial(id) {
  await deleteDoc(doc(db, COL, id));
}