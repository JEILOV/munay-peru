// src/App.jsx
//
// Deliberadamente delgado: App.jsx NO debe acumular lógica. Su única
// responsabilidad es montar el árbol de rutas. La hidratación de auth
// vive en main.jsx porque debe ocurrir UNA sola vez, antes de cualquier render.

import AppRouter from './routes/AppRouter';

function App() {
  return <AppRouter />;
}

export default App;
