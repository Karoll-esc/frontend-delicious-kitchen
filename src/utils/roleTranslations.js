/**
 * Utilidad para obtener traducciones de roles del sistema
 * 
 * @description
 * Proporciona funciones helper para traducir nombres de roles
 * según el idioma activo en i18n.
 */

/**
 * Obtiene la traducción de un rol según el idioma activo
 * 
 * @param {string} roleValue - Valor del rol (ADMIN, KITCHEN, WAITER)
 * @param {Function} t - Función de traducción de i18next
 * @returns {string} Nombre del rol traducido
 * 
 * @example
 * const roleName = getRoleTranslation('ADMIN', t);
 * // Retorna "Admin" en inglés o "Administrador" en español
 */
export const getRoleTranslation = (roleValue, t) => {
  // Validar que el valor del rol sea válido
  const validRoles = ['ADMIN', 'KITCHEN', 'WAITER'];
  
  if (!roleValue || !validRoles.includes(roleValue)) {
    console.warn(`Invalid role value: ${roleValue}`);
    return roleValue || 'Unknown';
  }

  // Retornar traducción usando el namespace 'roles'
  return t(`roles.${roleValue}`);
};

/**
 * Obtiene todas las traducciones de roles disponibles
 * 
 * @param {Function} t - Función de traducción de i18next
 * @returns {Array<{value: string, label: string}>} Array de objetos con valor y etiqueta traducida
 * 
 * @example
 * const roleOptions = getAllRoleTranslations(t);
 * // Retorna [
 * //   { value: 'ADMIN', label: 'Admin' },
 * //   { value: 'KITCHEN', label: 'Kitchen' },
 * //   { value: 'WAITER', label: 'Waiter' }
 * // ]
 */
export const getAllRoleTranslations = (t) => {
  const roles = ['ADMIN', 'KITCHEN', 'WAITER'];
  
  return roles.map(role => ({
    value: role,
    label: t(`roles.${role}`)
  }));
};
