// src/store/authStore.js
//
// Estado global de autenticación. Se hidrata UNA vez en main.jsx mediante
// el listener onAuthStateChanged de Firebase (ver main.jsx).
//
// Por qué Zustand y no Context API: necesitamos leer/escribir este estado
// desde fuera de árboles de React (ej. interceptores, servicios) sin prop-drilling
// ni re-renders innecesarios de toda la app en cada cambio.

import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Usuario de Firebase Auth (null = no autenticado, undefined = aún resolviendo)
  firebaseUser: undefined,

  // Documento extendido de Firestore: { uid, name, email, role, sedeId }
  // Es lo que realmente determina permisos — el rol NO vive en Firebase Auth.
  // IMPORTANTE: null aquí es ambiguo por sí solo ("no resuelto" vs "no existe").
  // Usar SIEMPRE junto con profileStatus para saber cuál de los dos es.
  userProfile: null,

  // Distingue explícitamente entre "aún no se buscó/está buscando" y
  // "se buscó y no existe documento en Firestore". Sin esto, ProtectedRoute
  // no puede diferenciar un loading legítimo de un usuario sin perfil,
  // y termina mostrando LoadingScreen para siempre en el segundo caso.
  //   'idle'      -> no se ha intentado buscar el perfil todavía
  //   'loading'   -> fetchUserProfile está en curso
  //   'found'     -> el documento existe, userProfile tiene datos
  //   'not_found' -> se confirmó que el documento NO existe en Firestore
  profileStatus: 'idle',

  // true mientras se resuelve el estado inicial de auth (evita parpadeo
  // de "redirect a login" antes de saber si hay sesión activa)
  isLoading: true,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

  // profile puede ser el objeto del perfil o null (no existe el doc).
  // Esta acción decide profileStatus automáticamente a partir de ese valor,
  // así main.jsx no tiene que acordarse de setear ambos campos por separado.
  setUserProfile: (profile) =>
    set({
      userProfile: profile,
      profileStatus: profile ? 'found' : 'not_found',
    }),

  // Llamar ANTES de iniciar el fetch a Firestore, para que ProtectedRoute
  // sepa que la búsqueda está en curso y no confunda esto con 'not_found'.
  setProfileLoading: () => set({ profileStatus: 'loading' }),

  setLoading: (isLoading) => set({ isLoading }),

  // Se llama en authService.logout()
  clearAuth: () =>
    set({
      firebaseUser: null,
      userProfile: null,
      profileStatus: 'idle',
      isLoading: false,
    }),
}));