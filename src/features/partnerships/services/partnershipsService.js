// src/features/partnerships/services/partnershipsService.js
import {
  collection, query, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

const COL = 'partnerships';

/** Obtiene todas las solicitudes ordenadas por fecha descendente. */
export async function fetchPartnerships() {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Envía una solicitud de alianza desde el formulario público.
 * @param {{ orgName, orgType, representative, email, phone, proposal }} data
 */
export async function submitPartnershipForm(data) {
  await addDoc(collection(db, COL), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/**
 * Cambia el estado de una solicitud (pending → approved | rejected).
 * @param {string} id
 * @param {'pending'|'approved'|'rejected'} status
 */
export async function updatePartnershipStatus(id, status) {
  await updateDoc(doc(db, COL, id), { status });
}

/** Elimina una solicitud de alianza. */
export async function deletePartnership(id) {
  await deleteDoc(doc(db, COL, id));
}