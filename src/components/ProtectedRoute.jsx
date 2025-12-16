import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Usa tu contexto real de autenticación
import { AuthContext } from '../context/AuthContext';

/**
 * Componente para proteger rutas según autenticación y roles.
 * Integrado con AuthContext que usa Firebase Auth SDK.
 * Maneja estado de carga inicial para evitar flashes de pantalla de login.
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes a renderizar si el acceso es permitido
 * @param {Array<string>} props.allowedRoles - Lista de roles permitidos (ej: ['ADMIN', 'KITCHEN'])
 * @param {boolean} props.requireAdmin - Si es true, solo permite rol ADMIN
 */
function ProtectedRoute({ children, allowedRoles, requireAdmin }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, loading } = useContext(AuthContext);

  // Si requireAdmin está activado, solo permitir rol ADMIN
  const effectiveAllowedRoles = requireAdmin 
    ? ['ADMIN']
    : allowedRoles;

  // Normaliza roles permitidos a mayúsculas
  const normalizedAllowedRoles = effectiveAllowedRoles ? 
    effectiveAllowedRoles.map(r => r.toUpperCase()) : null;
  const userRole = (user?.role || '').toUpperCase();

  useEffect(() => {
    // No redirigir si aún está cargando la sesión inicial
    if (loading) return;

    if (!isLoggedIn) {
      navigate('/login');
    } else if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
      navigate('/');
    }
  }, [isLoggedIn, userRole, normalizedAllowedRoles, navigate, loading]);

  // Mostrar loading mientras se verifica la sesión inicial
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) return null;
  return children;
}

export default ProtectedRoute;
