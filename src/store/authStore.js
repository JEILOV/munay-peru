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
  userProfile: null,

  // true mientras se resuelve el estado inicial de auth (evita parpadeo
  // de "redirect a login" antes de saber si hay sesión activa)
  isLoading: true,

  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),

  setUserProfile: (userProfile) => set({ userProfile }),

  setLoading: (isLoading) => set({ isLoading }),

  // Se llama en authService.logout()
  clearAuth: () => set({ firebaseUser: null, userProfile: null, isLoading: false }),
}));
