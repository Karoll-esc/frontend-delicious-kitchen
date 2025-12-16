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
