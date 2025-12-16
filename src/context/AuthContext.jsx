import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTranslation } from 'react-i18next';

/**
 * Contexto de autenticación integrado con Firebase Authentication SDK.
 * Proporciona estado de autenticación y métodos para gestionar la sesión del usuario.
 * 
 * @property {boolean} isLoggedIn - Indica si el usuario está autenticado
 * @property {Object|null} user - Datos del usuario autenticado (email, role, claims)
 * @property {boolean} loading - Indica si se está verificando la sesión inicial
 * @property {Function} logout - Función para cerrar sesión y limpiar estado
 */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  loading: true,
  logout: () => {},
});

/**
 * Keys de localStorage relacionadas con la sesión del usuario.
 * Whitelist de keys que deben preservarse al cerrar sesión (preferencias de usuario).
 */
const SESSION_STORAGE_KEYS = ['user', 'authToken', 'refreshToken'];
const PRESERVE_KEYS = ['i18nextLng', 'theme']; // Preferencias que se mantienen

/**
 * Provider del contexto de autenticación con Firebase Auth SDK.
 * Escucha cambios de estado de autenticación automáticamente usando onAuthStateChanged.
 * Proporciona persistencia automática de sesión y sincronización entre pestañas.
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    /**
     * Listener de cambios de estado de autenticación de Firebase.
     * Se ejecuta automáticamente cuando:
     * - El usuario inicia sesión
     * - El usuario cierra sesión
     * - La aplicación se recarga (detecta sesión persistente)
     * - El token expira o es revocado
     * - Se cierra sesión en otra pestaña (sincronización vía Firebase)
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado - obtener custom claims (rol, permisos, etc.)
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: tokenResult.claims.role || (tokenResult.claims.admin ? 'admin' : undefined),
            displayName: firebaseUser.displayName,
            ...tokenResult.claims
          };

          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error al obtener claims del usuario:', error);
          // En caso de error, establecer datos básicos sin claims
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          });
          setIsLoggedIn(true);
        }
      } else {
        // No hay usuario autenticado
        setUser(null);
        setIsLoggedIn(false);
      }
      
      // Finalizar estado de carga inicial
      setLoading(false);
    });

    // Cleanup: desuscribirse del listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    /**
     * Listener de sincronización entre pestañas mediante storage event.
     * Detecta cuando se cierra sesión en otra pestaña del navegador y sincroniza el estado.
     * 
     * Casos de uso (HU-005 TC-005-P02):
     * - Usuario cierra sesión en Pestaña A
     * - Pestaña B detecta cambio en localStorage
     * - Pestaña B actualiza estado a no autenticado
     * - Ambas pestañas redirigen a /login
     */
    const handleStorageChange = (event) => {
      // Detectar eliminación de key 'user' (logout en otra pestaña)
      if (event.key === 'user' && event.newValue === null) {
        console.log(t('auth.sessionClosed'));
        
        // Actualizar estado local para reflejar logout
        setUser(null);
        setIsLoggedIn(false);
        
        // Firebase también detectará esto con onAuthStateChanged,
        // pero actualizamos inmediatamente para mejor UX
      }
    };

    // Escuchar eventos de cambio en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup: remover listener al desmontar
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [t]);

  useEffect(() => {
    /**
     * Auto-renovación proactiva del token antes de expirar (HU-012 TC-012-B01).
     * 
     * Firebase ID Tokens tienen duración fija de 1 hora (3600 segundos).
     * Este efecto programa una renovación automática 5 minutos antes de expirar
     * para evitar que el usuario pierda trabajo por sesión expirada.
     * 
     * Estrategia:
     * - Token expira a los 60 minutos
     * - Renovamos a los 55 minutos (300 segundos antes)
     * - getIdToken(true) fuerza refresh con Firebase Auth
     * - Proceso es transparente para el usuario
     * 
     * Casos de uso:
     * - TC-012-B01: Renovación automática 5 min antes de expirar
     * - TC-012-P02: Usuario trabaja 55 min sin desconexión
     */
    let refreshTimerId = null;

    const scheduleTokenRefresh = async () => {
      try {
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          return; // No hay usuario, no programar refresh
        }

        // Obtener token actual y extraer tiempo de expiración
        const tokenResult = await firebaseUser.getIdTokenResult(false);
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const currentTime = Date.now();
        
        // Calcular tiempo hasta expiración
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Programar refresh 5 minutos (300,000 ms) antes de expirar
        const FIVE_MINUTES_MS = 5 * 60 * 1000;
        const timeUntilRefresh = timeUntilExpiration - FIVE_MINUTES_MS;

        // Solo programar si faltan más de 5 minutos
        if (timeUntilRefresh > 0) {
          console.log(`[Token Refresh] Programado para dentro de ${Math.round(timeUntilRefresh / 1000 / 60)} minutos`);
          
          refreshTimerId = setTimeout(async () => {
            try {
              console.log('[Token Refresh] Renovando token...');
              
              // Forzar refresh del token
              await firebaseUser.getIdToken(true);
              
              console.log('[Token Refresh] Token renovado exitosamente');
              
              // Re-programar siguiente refresh
              scheduleTokenRefresh();
            } catch (refreshError) {
              console.error('[Token Refresh] Error al renovar token:', refreshError);
              // Si falla el refresh, el usuario será redirigido al login en el próximo request
            }
          }, timeUntilRefresh);
        } else {
          // Token ya está próximo a expirar o expirado
          console.warn('[Token Refresh] Token expira en menos de 5 minutos, renovando ahora...');
          
          try {
            await firebaseUser.getIdToken(true);
            console.log('[Token Refresh] Token renovado inmediatamente');
            // Re-programar siguiente refresh
            scheduleTokenRefresh();
          } catch (refreshError) {
            console.error('[Token Refresh] Error al renovar token inmediatamente:', refreshError);
          }
        }
      } catch (error) {
        console.error('[Token Refresh] Error al programar renovación:', error);
      }
    };

    // Programar refresh cuando haya usuario autenticado
    if (isLoggedIn && user) {
      scheduleTokenRefresh();
    }

    // Cleanup: cancelar timer al desmontar o cuando cambie estado de autenticación
    return () => {
      if (refreshTimerId) {
        clearTimeout(refreshTimerId);
        console.log('[Token Refresh] Timer cancelado');
      }
    };
  }, [isLoggedIn, user]);

  /**
   * Limpia todas las keys de sesión en localStorage excepto preferencias de usuario.
   * Preserva: idioma (i18nextLng), tema, etc.
   * 
   * @private
   */
  const clearSessionStorage = () => {
    SESSION_STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  /**
   * Cierra la sesión del usuario de forma segura y completa (HU-005).
   * 
   * Acciones ejecutadas:
   * 1. Cierra sesión en Firebase Auth (signOut)
   * 2. Limpia todas las keys de sesión en localStorage
   * 3. Actualiza estado local (via onAuthStateChanged)
   * 4. Sincroniza con otras pestañas (via storage event)
   * 
   * Casos de prueba cubiertos:
   * - TC-005-P01: Logout exitoso desde interfaz
   * - TC-005-P02: Sincronización logout entre pestañas
   * - TC-005-B01: Logout con token ya expirado
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Si falla el cierre de sesión en Firebase
   */
  const logout = async () => {
    try {
      // 1. Cerrar sesión en Firebase Auth (invalida token)
      await signOut(auth);
      
      // 2. Limpiar localStorage de forma exhaustiva
      clearSessionStorage();
      
      // 3. El estado se actualizará automáticamente por onAuthStateChanged
      // 4. Otras pestañas detectarán el cambio via storage event
      
      console.log(t('auth.logoutSuccess'));
    } catch (error) {
      console.error(t('auth.logoutError'), error);
      
      // Incluso si falla signOut, limpiar estado local
      // (caso: token ya expirado - TC-005-B01)
      clearSessionStorage();
      setUser(null);
      setIsLoggedIn(false);
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
