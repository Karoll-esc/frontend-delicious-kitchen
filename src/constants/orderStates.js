/**
 * @file orderStates.js
 * @description Definición centralizada de estados de pedidos para Frontend
 * 
 * Este archivo contiene la única fuente de verdad para los estados de pedidos
 * en el frontend. Sincronizado con la nomenclatura del backend.
 * 
 * @see ORDER_STATES.md - Documentación completa de estados y transiciones
 */

/**
 * Estados oficiales del sistema (sincronizados con backend)
 * Nomenclatura: minúsculas, formato snake_case
 */
export const ORDER_STATUS = {
  /** Pedido creado, esperando ser enviado a cocina */
  PENDING: 'pending',
  
  /** Kitchen Service ha recibido y registrado el pedido */
  RECEIVED: 'received',
  
  /** El equipo de cocina está preparando activamente el pedido */
  PREPARING: 'preparing',
  
  /** Pedido completamente preparado, esperando entrega al cliente */
  READY: 'ready',
  
  /** Pedido entregado exitosamente al cliente (estado final) */
  COMPLETED: 'completed',
  
  /** Pedido cancelado por cliente o administrador (estado final) */
  CANCELLED: 'cancelled'
};

/**
 * Array de todos los estados válidos
 */
export const ALL_ORDER_STATES = Object.values(ORDER_STATUS);

/**
 * Estados desde los cuales el cliente puede cancelar
 */
export const CUSTOMER_CANCELLABLE_STATES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.RECEIVED
];

/**
 * Estados finales del sistema
 */
export const FINAL_STATES = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED
];

/**
 * Mapeo de estados del backend (legacy/mayúsculas) a estados oficiales
 * Para mantener compatibilidad durante migración
 */
export const BACKEND_STATUS_MAP = {
  'PENDING': ORDER_STATUS.PENDING,
  'RECEIVED': ORDER_STATUS.RECEIVED,
  'PREPARING': ORDER_STATUS.PREPARING,
  'READY': ORDER_STATUS.READY,
  'COMPLETED': ORDER_STATUS.COMPLETED,
  'DELIVERED': ORDER_STATUS.COMPLETED, // Legacy: mapped to completed
  'CANCELLED': ORDER_STATUS.CANCELLED,
  // Minúsculas (ya estandarizado)
  'pending': ORDER_STATUS.PENDING,
  'received': ORDER_STATUS.RECEIVED,
  'preparing': ORDER_STATUS.PREPARING,
  'ready': ORDER_STATUS.READY,
  'completed': ORDER_STATUS.COMPLETED,
  'delivered': ORDER_STATUS.COMPLETED, // Legacy
  'cancelled': ORDER_STATUS.CANCELLED
};

/**
 * Mapeo de estados internos de UI (legacy "cooking") a estados oficiales
 * Para compatibilidad con componentes que usaban "cooking"
 */
export const UI_STATUS_MAP = {
  'cooking': ORDER_STATUS.PREPARING,
  'delivered': ORDER_STATUS.COMPLETED
};

/**
 * Normaliza un estado del backend al formato oficial
 * @param {string} status - Estado del backend (puede estar en mayúsculas o ser legacy)
 * @returns {string} Estado oficial normalizado
 */
export function normalizeOrderStatus(status) {
  if (!status) return ORDER_STATUS.PENDING;
  
  // Intentar mapeo directo
  const normalized = BACKEND_STATUS_MAP[status] || UI_STATUS_MAP[status];
  if (normalized) return normalized;
  
  // Si ya está en formato correcto, retornar
  if (ALL_ORDER_STATES.includes(status)) return status;
  
  // Fallback: intentar minúsculas
  const lowerStatus = status.toLowerCase();
  return BACKEND_STATUS_MAP[lowerStatus] || ORDER_STATUS.PENDING;
}

/**
 * Verifica si un pedido puede ser cancelado por el cliente
 * @param {string} status - Estado del pedido
 * @returns {boolean} true si se puede cancelar
 */
export function isCustomerCancellable(status) {
  const normalized = normalizeOrderStatus(status);
  return CUSTOMER_CANCELLABLE_STATES.includes(normalized);
}

/**
 * Verifica si un estado es final (no se puede modificar)
 * @param {string} status - Estado del pedido
 * @returns {boolean} true si es final
 */
export function isFinalState(status) {
  const normalized = normalizeOrderStatus(status);
  return FINAL_STATES.includes(normalized);
}

/**
 * Obtiene la key de traducción i18n para un estado
 * @param {string} status - Estado del pedido
 * @returns {string} Key para i18n (ej: "orderStatus.pending")
 */
export function getStatusTranslationKey(status) {
  const normalized = normalizeOrderStatus(status);
  return `orderStatus.${normalized}`;
}

/**
 * Obtiene la clase CSS para un estado
 * @param {string} status - Estado del pedido
 * @returns {string} Clase CSS
 */
export function getStatusClassName(status) {
  const normalized = normalizeOrderStatus(status);
  return `status-${normalized}`;
}
