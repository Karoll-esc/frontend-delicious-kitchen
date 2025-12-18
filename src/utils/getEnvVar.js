// src/utils/getEnvVar.js

// Utilidad para obtener variables de entorno compatible con Jest, Node y Vite
export function getEnvVar(key) {
  // Si estamos en entorno de test (Jest)
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined) {
    // Usa el mock
    return require('../__mocks__/importMetaEnv').env[key];
  }
  // Si estamos en Node (no Vite)
  if (typeof process !== 'undefined' && process.env[key] !== undefined) {
    return process.env[key];
  }
  // Si estamos en el navegador con Vite, usar import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Valor por defecto
  return undefined;
}
