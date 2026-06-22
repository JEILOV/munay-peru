// src/services/firebase/firestore.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config'; // Ajusta si tu config tiene otro nombre

/**
 * Obtiene todos los documentos de una colección, soportando filtros de los nuevos servicios.
 */
export const getCollection = async (collectionName, options = {}) => {
  let q = collection(db, collectionName);
  const constraints = [];

  if (options.filters) {
    options.filters.forEach(([field, op, val]) => {
      constraints.push(where(field, op, val));
    });
  }
  if (options.orderBy) {
    constraints.push(orderBy(options.orderBy[0], options.orderBy[1] || 'asc'));
  }
  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Obtiene un documento por su ID.
 */
export const getDocument = async (collectionName, docId) => {
  const ref = doc(db, collectionName, docId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

/**
 * Consulta documentos con filtros opcionales (versión original).
 */
export const queryCollection = async (
  collectionName,
  filters = [],
  sortBy = null,
  limitTo = null
) => {
  let q = collection(db, collectionName);
  const constraints = [];

  filters.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });

  if (sortBy) constraints.push(orderBy(sortBy));
  if (limitTo) constraints.push(limit(limitTo));

  const snapshot = await getDocs(query(q, ...constraints));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Agrega un nuevo documento a una colección.
 */
export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
};

/**
 * Actualiza campos de un documento existente.
 */
export const updateDocument = async (collectionName, docId, data) => {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, data);
};

/**
 * Elimina un documento.
 */
export const deleteDocument = async (collectionName, docId) => {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
};

/**
 * Obtiene un único documento buscando por un campo específico (ej. slug).
 * Devuelve null si no hay coincidencias.
 */
export const getDocumentByField = async (collectionName, field, value) => {
  const q = query(collection(db, collectionName), where(field, '==', value), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};