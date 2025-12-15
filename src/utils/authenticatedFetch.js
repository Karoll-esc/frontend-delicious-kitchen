/**
 * Utility para realizar peticiones HTTP autenticadas con token de Firebase
 * Agrega automáticamente el token JWT al header Authorization
 */

import { auth } from '../firebaseConfig';

/**
 * Realiza una petición fetch autenticada con el token de Firebase
 * @param {string} url - URL completa del endpoint
 * @param {Object} options - Opciones de fetch (method, body, headers, etc.)
 * @returns {Promise<Response>} Response de fetch
 */
export async function authenticatedFetch(url, options = {}) {
  try {
    // Obtener el usuario actual de Firebase
    const currentUser = auth.currentUser;
    let token = null;

    // Si hay un usuario autenticado, obtener su token
    if (currentUser) {
      token = await currentUser.getIdToken();
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
