// src/features/volunteers/services/volunteerService.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase/config'; // <-- RUTA CORREGIDA

/**
 * Guarda una postulación de voluntario en la colección `volunteers`.
 * @param {{ name, email, phone, age, profession, sede, motivation }} data
 */
export async function submitVolunteerForm(data) {
  await addDoc(collection(db, 'volunteers'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}