// src/features/auth/services/authService.js
//
// Lógica de negocio de autenticación. A diferencia de services/firebase/auth.js
// (que solo tendrá helpers genéricos tipo "signIn", "signOut"), este archivo
// sabe específicamente cómo se relaciona un usuario de Firebase Auth con su
// documento de perfil en la colección `users` de Firestore.

import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../services/firebase/config';

/**
 * Obtiene el documento de perfil extendido (role, sedeId, name) asociado
 * a un usuario autenticado. El uid del doc en `users` DEBE coincidir con
 * el uid de Firebase Auth (se crea así manualmente o vía Cloud Function
 * al dar de alta un nuevo miembro de la directiva).
 */
export async function fetchUserProfile(uid) {
  const userDocRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) {
    console.warn(`[authService] No existe perfil en Firestore para uid: ${uid}`);
    return null;
  }

  return { uid: snapshot.id, ...snapshot.data() };
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await firebaseSignOut(auth);
}
