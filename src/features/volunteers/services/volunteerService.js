// src/features/volunteers/services/volunteerService.js
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase/config';

/**
 * Guarda una postulación de voluntario y actualiza el contador global de forma atómica.
 * @param {{ name, email, phone, age, profession, sede, motivation }} data
 */
export async function submitVolunteerForm(data) {
  // runTransaction garantiza que ambas escrituras (crear voluntario + incrementar contador)
  // ocurran juntas. Si una falla, todo se revierte, evitando desincronizaciones.
  await runTransaction(db, async (transaction) => {
    // 1. Referencia al documento del contador
    const statsRef = doc(db, 'stats', 'volunteerCount');
    const statsSnap = await transaction.get(statsRef);

    // Obtenemos el valor actual (si por algún motivo no existe en la app, empieza en 0)
    const currentCount = statsSnap.exists() ? statsSnap.data().count : 0;

    // 2. Referencia para el nuevo voluntario (generamos un ID único en el cliente)
    const volunteerRef = doc(collection(db, 'volunteers'));

    // 3. Ejecutamos las operaciones en la transacción
    // Guardamos los datos completos del voluntario
    transaction.set(volunteerRef, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    // Incrementamos exactamente en 1 el campo 'count' (requerido por la regla de seguridad)
    transaction.set(statsRef, { count: currentCount + 1 });
  });
}