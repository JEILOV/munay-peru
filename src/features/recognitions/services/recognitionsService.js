// src/features/recognitions/services/recognitionsService.js
import {
  collection, query, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

const COL = 'recognitions';

/** Obtiene todos los reconocimientos ordenados por fecha descendente (el más reciente primero). */
export async function fetchRecognitions() {
  const snap = await getDocs(query(collection(db, COL), orderBy('date', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Crea un nuevo reconocimiento.
 * @param {{ title, description, imageUrl, date }} data - `date` en formato 'YYYY-MM-DD'
 */
export async function addRecognition(data) {
  await addDoc(collection(db, COL), {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    date: Timestamp.fromDate(new Date(`${data.date}T00:00:00`)),
    createdAt: serverTimestamp(),
  });
}

/**
 * Actualiza los campos de un reconocimiento existente.
 * @param {string} id
 * @param {{ title, description, imageUrl, date }} data
 */
export async function updateRecognition(id, data) {
  await updateDoc(doc(db, COL, id), {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    date: Timestamp.fromDate(new Date(`${data.date}T00:00:00`)),
  });
}

/** Elimina un reconocimiento. */
export async function deleteRecognition(id) {
  await deleteDoc(doc(db, COL, id));
}