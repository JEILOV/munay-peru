import { Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; // Importamos la función de cierre de sesión
import { auth } from '../services/firebase/config'; // Asegúrate de que esta ruta sea correcta hacia tu config
import Sidebar from '../components/layout/Sidebar';

export default function AdminLayout({ basePath = '/admin', onLogout }) {
  const navigate = useNavigate();

  // Si onLogout no se pasa desde el router, usamos la función real por defecto
  const handleLogout = onLogout ?? (async () => {
    try {
      await signOut(auth); // Cierra sesión en Firebase
      navigate('/admin/login'); // Te manda al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un error al cerrar sesión. Inténtalo de nuevo.");
    }
  });

  return (
    <div className="min-h-screen flex bg-warm-50">
      <Sidebar basePath={basePath} onLogout={handleLogout} />
      <main className="flex-1 min-w-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}