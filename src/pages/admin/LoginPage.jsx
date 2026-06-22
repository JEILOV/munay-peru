// src/pages/admin/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase/config'; // Asegúrate de que esta ruta sea correcta

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intenta iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si el login es exitoso, redirige al panel de control
      navigate('/admin');
    } catch (err) {
      console.error('Error de autenticación:', err);
      // Mensajes de error amigables
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error al intentar iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary-900 rounded-b-[4rem] sm:rounded-b-[8rem] shadow-xl" />

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-soft-xl relative z-10 border border-warm-100">
        
        {/* Encabezado */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-primary-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-900">
            Panel de Control
          </h2>
          <p className="mt-2 text-sm text-warm-600">
            Acceso exclusivo para el equipo de Munay Perú
          </p>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition"
                placeholder="admin@munayperu.org"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-3 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-900 bg-accent-500 hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors disabled:opacity-70"
          >
            {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs font-medium text-warm-500 hover:text-primary-900 transition-colors">
            ← Volver al sitio público
          </a>
        </div>
      </div>
    </div>
  );
}