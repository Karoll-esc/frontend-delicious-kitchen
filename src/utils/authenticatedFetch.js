/**
 * Utility para realizar peticiones HTTP autenticadas con token de Firebase (HU-005).
 * Agrega automáticamente el token JWT al header Authorization.
 * Maneja errores 401 redirigiendo al login cuando el token expira.
 * Integrado con sistema de navegación SPA y traducciones i18n.
 */

import { auth } from '../firebaseConfig';
import i18n from '../i18n';

/**
 * Maneja sesión expirada de forma centralizada (HU-005).
 * Cierra sesión, limpia estado y redirige con parámetro de sesión expirada.
 * 
 * @private
 */
const handleSessionExpired = async () => {
  console.warn(i18n.t('auth.sessionExpired'));
  
  try {
    // 1. Cerrar sesión en Firebase
    await auth.signOut();
    
    // 2. Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // 3. Redirigir con indicador de sesión expirada
    // Nota: Usamos window.location.href para forzar recarga completa
    // Esto asegura que el AuthContext detecte el logout correctamente
    window.location.href = '/login?session_expired=true';
  } catch (error) {
    console.error('Error al manejar sesión expirada:', error);
    // Forzar redirección incluso si signOut falla
    window.location.href = '/login?session_expired=true';
  }
};

/**
 * Realiza una petición fetch autenticada con el token de Firebase (HU-005, HU-012).
 * Maneja automáticamente errores 401 con retry inteligente antes de redirigir al login.
 * 
 * Estrategia de retry (HU-012 TC-012-N01):
 * - Primer 401: Intenta refrescar token y reintentar request
 * - Segundo 401: Token realmente inválido, redirigir a login
 * 
 * Casos de prueba cubiertos:
 * - TC-005-N01: Bloqueo después de logout
 * - TC-005-B01: Logout con token expirado
 * - TC-012-N01: Token expira después de 1 hora de inactividad
 * 
 * @param {string} url - URL completa del endpoint
 * @param {Object} options - Opciones de fetch (method, body, headers, etc.)
 * @param {boolean} isRetry - Uso interno para evitar retry infinito
 * @returns {Promise<Response>} Response de fetch
 * @throws {Error} Si la petición falla o el token es inválido
 */
export async function authenticatedFetch(url, options = {}, isRetry = false) {
  try {
    // Obtener el usuario actual de Firebase
    const currentUser = auth.currentUser;
    let token = null;

    // Si hay un usuario autenticado, obtener su token
    if (currentUser) {
      // En retry, forzar refresh del token (HU-012)
      token = await currentUser.getIdToken(isRetry);
    }

    // Configurar headers con el token
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar Authorization header solo si hay token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Realizar la petición con el token incluido
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Manejo de error 401: token expirado o inválido (HU-005, HU-012)
    if (response.status === 401) {
      // Si es el primer intento, intentar refrescar token y reintentar (TC-012-N01)
      if (!isRetry && currentUser) {
        console.warn('[Auth] Token expirado, intentando renovación automática...');
        
        try {
          // Reintentar request con token renovado (isRetry=true evita loop infinito)
          return await authenticatedFetch(url, options, true);
        } catch (retryError) {
          console.error('[Auth] Falló renovación automática del token:', retryError);
          // Si falla el retry, continuar con logout
        }
      }
      
      // Si es segundo intento o no hay usuario, token realmente inválido
      console.warn('[Auth] Token inválido después de retry, cerrando sesión...');
      await handleSessionExpired();
      throw new Error(i18n.t('auth.sessionExpired'));
    }

    return response;
  } catch (error) {
    console.error('Error en authenticatedFetch:', error);
    throw error;
  }
}

/**
 * Helper para peticiones GET autenticadas
 * @param {string} url - URL del endpoint
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function authenticatedGet(url) {
  const response = await authenticatedFetch(url, { method: 'GET' });
  if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  return await response.json();
}

/**
 * Helper para peticiones POST autenticadas
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar en el body
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function authenticatedPost(url, data) {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  return await response.json();
}

/**
 * Helper para peticiones PUT autenticadas
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar en el body
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function authenticatedPut(url, data) {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  return await response.json();
}

/**
 * Helper para peticiones PATCH autenticadas
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar en el body
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function authenticatedPatch(url, data) {
  const response = await authenticatedFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  return await response.json();
}

/**
 * Helper para peticiones DELETE autenticadas
 * @param {string} url - URL del endpoint
 * @returns {Promise<any>} Datos parseados de la respuesta
 */
export async function authenticatedDelete(url) {
  const response = await authenticatedFetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  return await response.json();
}
