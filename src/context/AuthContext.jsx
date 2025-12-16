import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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

  useEffect(() => {
    /**
     * Listener de cambios de estado de autenticación de Firebase.
     * Se ejecuta automáticamente cuando:
     * - El usuario inicia sesión
     * - El usuario cierra sesión
     * - La aplicación se recarga (detecta sesión persistente)
     * - El token expira o es revocado
     * - Se cierra sesión en otra pestaña (sincronización)
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

  /**
   * Cierra la sesión del usuario de forma segura.
   * Ejecuta signOut de Firebase y limpia localStorage explícitamente.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Si falla el cierre de sesión en Firebase
   */
  const logout = async () => {
    try {
      // Cerrar sesión en Firebase Auth
      await signOut(auth);
      
      // Limpiar localStorage explícitamente (alineado con HU-005)
      localStorage.removeItem('user');
      
      // El estado se actualizará automáticamente por onAuthStateChanged
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
