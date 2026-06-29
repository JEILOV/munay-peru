// src/components/feedback/UnauthorizedScreen.jsx
//
// Se muestra cuando un usuario tiene sesión válida de Firebase Auth pero
// NO tiene un documento correspondiente en la colección `users` de Firestore.
// Esto es distinto de "rol incorrecto" (ese caso ya redirige a /admin):
// aquí Firestore directamente no tiene registro de quién es este usuario,
// así que no podemos saber su rol ni nada — es un caso de "cuenta no
// configurada", típicamente porque a alguien le crearon el login en
// Firebase Auth pero falta darlo de alta en Firestore.

import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/services/authService';

export default function UnauthorizedScreen() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Cuenta sin perfil configurado
      </h1>
      <p className="text-gray-500 max-w-md mb-6">
        Tu cuenta inició sesión correctamente, pero no tiene un perfil
        asociado en el sistema. Contacta a un administrador para que
        
        configure tu acceso.
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
  );
}