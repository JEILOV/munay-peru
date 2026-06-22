// src/components/feedback/LoadingScreen.jsx
//
// Placeholder mínimo — lo rediseñaremos cuando construyamos componentes UI.
// Por ahora solo necesita existir para que ProtectedRoute sea funcional.

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
    </div>
  );
}
