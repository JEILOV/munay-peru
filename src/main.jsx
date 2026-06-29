// src/main.jsx
//
// Punto de entrada. Responsabilidad extra respecto a un main.jsx genérico:
// suscribirse a onAuthStateChanged ANTES/EN PARALELO al primer render, para
// que ProtectedRoute siempre tenga un estado de auth confiable (no un falso
// "no autenticado" mientras Firebase aún resuelve la sesión persistida).

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { onAuthStateChanged } from 'firebase/auth';

import App from './App.jsx';
import './index.css';

import { auth } from './services/firebase/config';
import { useAuthStore } from './store/authStore';
import { fetchUserProfile } from './features/auth/services/authService';

// Suscripción global de auth. Vive fuera del árbol de React a propósito:
// debe iniciarse una sola vez por carga de la app, nunca re-suscribirse
// por un re-render de algún componente.
onAuthStateChanged(auth, async (firebaseUser) => {
  const { setFirebaseUser, setUserProfile, setProfileLoading, setLoading, clearAuth } = useAuthStore.getState();

  if (!firebaseUser) {
    clearAuth();
    return;
  }

  setFirebaseUser(firebaseUser);
  setProfileLoading(); // ← nueva línea: marca explícitamente "buscando perfil"

  try {
    const profile = await fetchUserProfile(firebaseUser.uid);
    setUserProfile(profile); // ya decide 'found' o 'not_found' internamente
  } catch (error) {
    console.error('[main.jsx] Error al obtener el perfil de usuario:', error);
    setUserProfile(null); // esto también marcará 'not_found', lo cual es razonable: si falló el fetch, tratamos como "no autorizado" en vez de loading infinito
  } finally {
    setLoading(false);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
