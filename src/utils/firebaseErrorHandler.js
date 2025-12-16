import i18n from '../i18n';

/**
 * Traduce códigos de error de Firebase Authentication a mensajes amigables localizados.
 * Utiliza i18n para soportar múltiples idiomas según la configuración del usuario.
 * 
 * @param {string} errorCode - Código de error de Firebase (ej: 'auth/wrong-password')
 * @returns {string} Mensaje de error traducido y amigable para el usuario
 * 
 * @example
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const message = translateFirebaseError(error.code);
 *   setError(message);
 * }
 */
export function translateFirebaseError(errorCode) {
  // Mapeo de códigos de error Firebase a keys de traducción
  const errorMap = {
    'auth/wrong-password': 'auth.errors.wrongPassword',
    'auth/user-not-found': 'auth.errors.userNotFound',
    'auth/user-disabled': 'auth.errors.userDisabled',
    'auth/too-many-requests': 'auth.errors.tooManyRequests',
    'auth/invalid-email': 'auth.errors.invalidEmail',
    'auth/email-already-in-use': 'auth.errors.emailInUse',
    'auth/weak-password': 'auth.errors.weakPassword',
    'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
    'auth/invalid-credential': 'auth.errors.invalidCredentials',
    'auth/network-request-failed': 'auth.errors.networkError',
    'auth/popup-closed-by-user': 'auth.errors.popupClosed',
    'auth/cancelled-popup-request': 'auth.errors.popupCancelled',
    'auth/requires-recent-login': 'auth.errors.requiresRecentLogin',
  };

  // Obtener la key de traducción o usar genérica si no existe mapeo
  const translationKey = errorMap[errorCode] || 'auth.errors.generic';

  // Retornar mensaje traducido
  return i18n.t(translationKey);
}

/**
 * Maneja errores de Firebase Authentication mostrando mensajes apropiados.
 * Wrapper de conveniencia que extrae el código del error y traduce el mensaje.
 * 
 * @param {Error} error - Objeto Error de Firebase Authentication
 * @returns {string} Mensaje de error traducido
 * 
 * @example
 * catch (error) {
 *   console.error('Authentication error:', error);
 *   const message = handleFirebaseAuthError(error);
 *   toast.error(message);
 * }
 */
export function handleFirebaseAuthError(error) {
  console.error('Firebase Auth Error:', error);
  return translateFirebaseError(error.code);
}
