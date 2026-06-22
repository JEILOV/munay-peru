// src/features/contact/services/contactService.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

/**
 * Guarda un mensaje de contacto en la colección `messages`.
 * @param {{ name: string, email: string, subject: string, message: string }} data
 */
export async function submitContactForm(data) {
  await addDoc(collection(db, 'messages'), {
    ...data,
    status: 'unread',
    createdAt: serverTimestamp(),
  });
}