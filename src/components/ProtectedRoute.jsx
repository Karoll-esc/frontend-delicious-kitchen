import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Usa tu contexto real de autenticación
import { AuthContext } from '../context/AuthContext';

/**
 * Componente para proteger rutas según autenticación y roles (HU-005).
 * Integrado con AuthContext que usa Firebase Auth SDK.
 * Maneja estado de carga inicial para evitar flashes de pantalla de login.
 * Proporciona feedback visual antes de redirigir al usuario.
 * 
 * Casos de prueba cubiertos:
 * - TC-005-N01: Bloqueo de rutas protegidas post-logout
 * - TC-005-P01: Redirección a /login después de logout
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes a renderizar si el acceso es permitido
 * @param {Array<string>} props.allowedRoles - Lista de roles permitidos (ej: ['ADMIN', 'KITCHEN'])
 * @param {boolean} props.requireAdmin - Si es true, solo permite rol ADMIN
 */
function ProtectedRoute({ children, allowedRoles, requireAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
      // Usuario no autenticado: redirigir a login con URL de retorno (HU-005 TC-005-N01)
      // El parámetro 'redirect' permite volver a esta ruta después del login
      
      // Mostrar feedback visual antes de redirigir (placeholder para toast/notification)
      console.log(t('auth.loginRequired'));
      
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    } else if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
      // Usuario autenticado pero sin permisos: redirigir a home con feedback
      console.log(t('auth.noPermissions'));
      
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, userRole, normalizedAllowedRoles, navigate, loading, location.pathname, t]);

  // Mostrar loading mientras se verifica la sesión inicial
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('auth.verifyingSession')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) return null;
  return children;
}

export default ProtectedRoute;
