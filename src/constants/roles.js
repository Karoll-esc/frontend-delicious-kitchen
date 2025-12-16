/**
 * Roles del sistema Delicious Kitchen
 * 
 * @description
 * Define los roles válidos y sus configuraciones.
 * Este es el único lugar donde se definen los roles del sistema.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  KITCHEN: 'KITCHEN',
  WAITER: 'WAITER',
};

/**
 * Array de valores de roles válidos
 */
export const VALID_ROLES = Object.values(ROLES);

/**
 * Array de roles con metadata para formularios
 */
export const ROLE_OPTIONS = [
  { label: "Admin", value: ROLES.ADMIN, labelKey: "roles.ADMIN" },
  { label: "Kitchen", value: ROLES.KITCHEN, labelKey: "roles.KITCHEN" },
  { label: "Waiter", value: ROLES.WAITER, labelKey: "roles.WAITER" },
];
