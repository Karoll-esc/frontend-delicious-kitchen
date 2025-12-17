/**
 * Servicio para consumir la API de usuarios (HU-001 a HU-004)
 * Todas las operaciones requieren autenticación de administrador.
 */

import { authenticatedFetch } from '../../utils/authenticatedFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene la lista de usuarios con filtros opcionales
 * @param {Object} params - Parámetros de filtro (name, email, role, page, limit)
 * @returns {Promise<Object>} Lista de usuarios
 */
export async function getUsers(params) {
  const url = new URL(`${API_BASE_URL}/users`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }
  const res = await authenticatedFetch(url.toString(), {
    method: 'GET',
  });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return await res.json();
}

/**
 * Crea un nuevo usuario
 * @param {Object} data - Datos del usuario (email, password, displayName, role)
 * @returns {Promise<Object>} Usuario creado
 */
export async function createUser(data) {
  const res = await authenticatedFetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return await res.json();
}

/**
 * Actualiza un usuario existente
 * @param {string} id - UID del usuario
 * @param {Object} data - Datos a actualizar (displayName, role)
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function updateUser(id, data) {
  const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return await res.json();
}

/**
 * Desactiva un usuario
 * @param {string} id - UID del usuario
 * @returns {Promise<Object>} Confirmación de desactivación
 */
export async function deactivateUser(id) {
  const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}/disable`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Error al desactivar usuario');
  return await res.json();
}

/**
 * Restablece la contraseña de un usuario
 * @param {string} id - UID del usuario
 * @returns {Promise<Object>} Confirmación de restablecimiento
 */
export async function resetPassword(id) {
  const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Error al resetear contraseña');
  return await res.json();
}

/**
 * Elimina un usuario
 * @param {string} id - UID del usuario
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export async function deleteUser(id) {
  const res = await authenticatedFetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return await res.json();
}
