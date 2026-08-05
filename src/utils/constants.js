// src/utils/constants.js
//
// Fuente única de verdad para enums y catálogos pequeños que se repiten
// en varios features. SEDES es temporal: cuando conectemos `headquarters`
// a Firestore, este array se reemplaza por el resultado de useSedes() y
// cualquier componente que importe SEDES desde aquí pasa a recibirlo
// como prop en su lugar — el cambio queda aislado a ese punto.

// Flag temporal: desactiva el botón/link de "Donar" en Navbar, Footer y
// el botón flotante mientras se corrige el nombre asociado al Yape.
// Para reactivar el flujo de donación, volver a poner esto en `true`.
export const DONATIONS_ENABLED = false;

export const SEDES = [
  { id: 'piura', name: 'Piura' },
  { id: 'cusco', name: 'Cusco' },
  { id: 'lima', name: 'Lima' },
  { id: 'iquitos', name: 'Iquitos' },
];

export const PROJECT_CATEGORIES = [
  { id: 'educacion', name: 'Educación' },
  { id: 'salud', name: 'Salud' },
  { id: 'medio-ambiente', name: 'Medio Ambiente' },
  { id: 'desarrollo-social', name: 'Desarrollo Social' },
];