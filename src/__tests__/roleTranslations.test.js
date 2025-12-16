/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { getRoleTranslation, getAllRoleTranslations } from '../utils/roleTranslations';
import i18n from '../i18n';

/**
 * Suite de pruebas para traducciones de roles
 * 
 * Valida los criterios de aceptación de HU-017:
 * - Traducciones definidas para cada rol en inglés y español
 * - Nombres de roles se muestran en el idioma seleccionado
 * - Cambio de idioma actualiza nombres inmediatamente
 */
describe('Role Translations (HU-017)', () => {
  
  beforeEach(async () => {
    // Resetear idioma antes de cada prueba
    await i18n.changeLanguage('es');
  });

  /**
   * Scenario: Traducciones de roles definidas
   * Given el sistema maneja múltiples roles de usuario
   * When se configuran las traducciones
   * Then cada rol debe tener su traducción correspondiente en cada idioma soportado
   */
  describe('TC-017-01: Traducciones de roles definidas', () => {
    
    it('debe tener traducciones para todos los roles en español', async () => {
      await i18n.changeLanguage('es');
      
      expect(i18n.t('roles.ADMIN')).toBe('Administrador');
      expect(i18n.t('roles.KITCHEN')).toBe('Cocina');
      expect(i18n.t('roles.WAITER')).toBe('Mesero');
    });

    it('debe tener traducciones para todos los roles en inglés', async () => {
      await i18n.changeLanguage('en');
      
      expect(i18n.t('roles.ADMIN')).toBe('Admin');
      expect(i18n.t('roles.KITCHEN')).toBe('Kitchen');
      expect(i18n.t('roles.WAITER')).toBe('Waiter');
    });

    it('no debe retornar claves de traducción sin resolver', async () => {
      await i18n.changeLanguage('es');
      
      // Las traducciones no deben retornar la clave misma
      expect(i18n.t('roles.ADMIN')).not.toBe('roles.ADMIN');
      expect(i18n.t('roles.KITCHEN')).not.toBe('roles.KITCHEN');
      expect(i18n.t('roles.WAITER')).not.toBe('roles.WAITER');
    });
  });

  /**
   * Scenario: Traducciones en inglés para roles configuradas
   * Given se requiere soporte en inglés
   * When se configuran las traducciones de roles
   * Then cada rol debe tener su nombre en inglés definido
   * And las traducciones deben ser claras y profesionales
   */
  describe('TC-017-02: Traducciones en inglés configuradas', () => {
    
    beforeEach(async () => {
      await i18n.changeLanguage('en');
    });

    it('debe mostrar "Admin" para el rol ADMIN en inglés', () => {
      const translation = getRoleTranslation('ADMIN', i18n.t);
      expect(translation).toBe('Admin');
    });

    it('debe mostrar "Kitchen" para el rol KITCHEN en inglés', () => {
      const translation = getRoleTranslation('KITCHEN', i18n.t);
      expect(translation).toBe('Kitchen');
    });

    it('debe mostrar "Waiter" para el rol WAITER en inglés', () => {
      const translation = getRoleTranslation('WAITER', i18n.t);
      expect(translation).toBe('Waiter');
    });

    it('las traducciones deben ser profesionales (primera letra mayúscula)', async () => {
      const roles = ['ADMIN', 'KITCHEN', 'WAITER'];
      
      roles.forEach(role => {
        const translation = getRoleTranslation(role, i18n.t);
        // Verificar que la primera letra sea mayúscula
        expect(translation.charAt(0)).toBe(translation.charAt(0).toUpperCase());
        // Verificar que no esté todo en mayúsculas
        expect(translation).not.toBe(translation.toUpperCase());
      });
    });
  });

  /**
   * Scenario: Traducciones en español para roles configuradas
   * Given se requiere soporte en español
   * When se configuran las traducciones de roles
   * Then cada rol debe tener su nombre en español definido
   * And deben mantener consistencia con el resto del sistema
   */
  describe('TC-017-03: Traducciones en español configuradas', () => {
    
    beforeEach(async () => {
      await i18n.changeLanguage('es');
    });

    it('debe mostrar "Administrador" para el rol ADMIN en español', () => {
      const translation = getRoleTranslation('ADMIN', i18n.t);
      expect(translation).toBe('Administrador');
    });

    it('debe mostrar "Cocina" para el rol KITCHEN en español', () => {
      const translation = getRoleTranslation('KITCHEN', i18n.t);
      expect(translation).toBe('Cocina');
    });

    it('debe mostrar "Mesero" para el rol WAITER en español', () => {
      const translation = getRoleTranslation('WAITER', i18n.t);
      expect(translation).toBe('Mesero');
    });

    it('las traducciones deben ser consistentes (primera letra mayúscula)', async () => {
      const roles = ['ADMIN', 'KITCHEN', 'WAITER'];
      
      roles.forEach(role => {
        const translation = getRoleTranslation(role, i18n.t);
        // Verificar que la primera letra sea mayúscula
        expect(translation.charAt(0)).toBe(translation.charAt(0).toUpperCase());
      });
    });
  });

  /**
   * Scenario: Roles mostrados en idioma seleccionado
   * Given estoy en la gestión de usuarios como administrador
   * When visualizo los roles de los usuarios
   * Then los nombres de roles deben mostrarse en el idioma actual del sistema
   * And al cambiar el idioma, los nombres deben actualizarse inmediatamente
   */
  describe('TC-017-04: Cambio dinámico de idioma', () => {
    
    it('debe cambiar traducción de ADMIN de español a inglés', async () => {
      await i18n.changeLanguage('es');
      let translation = getRoleTranslation('ADMIN', i18n.t);
      expect(translation).toBe('Administrador');

      await i18n.changeLanguage('en');
      translation = getRoleTranslation('ADMIN', i18n.t);
      expect(translation).toBe('Admin');
    });

    it('debe cambiar traducción de KITCHEN de inglés a español', async () => {
      await i18n.changeLanguage('en');
      let translation = getRoleTranslation('KITCHEN', i18n.t);
      expect(translation).toBe('Kitchen');

      await i18n.changeLanguage('es');
      translation = getRoleTranslation('KITCHEN', i18n.t);
      expect(translation).toBe('Cocina');
    });

    it('debe cambiar traducción de WAITER al alternar idiomas múltiples veces', async () => {
      // Español → Inglés → Español
      await i18n.changeLanguage('es');
      expect(getRoleTranslation('WAITER', i18n.t)).toBe('Mesero');

      await i18n.changeLanguage('en');
      expect(getRoleTranslation('WAITER', i18n.t)).toBe('Waiter');

      await i18n.changeLanguage('es');
      expect(getRoleTranslation('WAITER', i18n.t)).toBe('Mesero');
    });

    it('debe actualizar todas las traducciones al cambiar idioma', async () => {
      const roles = ['ADMIN', 'KITCHEN', 'WAITER'];
      const expectedES = ['Administrador', 'Cocina', 'Mesero'];
      const expectedEN = ['Admin', 'Kitchen', 'Waiter'];

      // Verificar en español
      await i18n.changeLanguage('es');
      roles.forEach((role, index) => {
        expect(getRoleTranslation(role, i18n.t)).toBe(expectedES[index]);
      });

      // Verificar en inglés
      await i18n.changeLanguage('en');
      roles.forEach((role, index) => {
        expect(getRoleTranslation(role, i18n.t)).toBe(expectedEN[index]);
      });
    });
  });

  /**
   * TC-017-05: Manejo de casos de borde
   * Validar comportamiento con valores inválidos o desconocidos
   */
  describe('TC-017-05: Manejo de casos de borde', () => {
    
    it('debe manejar rol desconocido retornando el valor original', () => {
      const translation = getRoleTranslation('UNKNOWN_ROLE', i18n.t);
      expect(translation).toBe('UNKNOWN_ROLE');
    });

    it('debe manejar valor null retornando "Unknown"', () => {
      const translation = getRoleTranslation(null, i18n.t);
      expect(translation).toBe('Unknown');
    });

    it('debe manejar valor undefined retornando "Unknown"', () => {
      const translation = getRoleTranslation(undefined, i18n.t);
      expect(translation).toBe('Unknown');
    });

    it('debe manejar valor vacío retornando "Unknown"', () => {
      const translation = getRoleTranslation('', i18n.t);
      expect(translation).toBe('Unknown');
    });

    it('debe mostrar advertencia en consola para rol inválido', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      getRoleTranslation('INVALID', i18n.t);
      
      expect(consoleSpy).toHaveBeenCalledWith('Invalid role value: INVALID');
      consoleSpy.mockRestore();
    });
  });

  /**
   * TC-017-06: Función getAllRoleTranslations
   * Validar que la función helper retorna todas las traducciones
   */
  describe('TC-017-06: Función getAllRoleTranslations', () => {
    
    it('debe retornar array con todos los roles traducidos en español', async () => {
      await i18n.changeLanguage('es');
      const roles = getAllRoleTranslations(i18n.t);
      
      expect(roles).toHaveLength(3);
      expect(roles).toEqual([
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'KITCHEN', label: 'Cocina' },
        { value: 'WAITER', label: 'Mesero' }
      ]);
    });

    it('debe retornar array con todos los roles traducidos en inglés', async () => {
      await i18n.changeLanguage('en');
      const roles = getAllRoleTranslations(i18n.t);
      
      expect(roles).toHaveLength(3);
      expect(roles).toEqual([
        { value: 'ADMIN', label: 'Admin' },
        { value: 'KITCHEN', label: 'Kitchen' },
        { value: 'WAITER', label: 'Waiter' }
      ]);
    });

    it('debe mantener valores constantes pero etiquetas traducidas', async () => {
      await i18n.changeLanguage('es');
      const rolesES = getAllRoleTranslations(i18n.t);
      
      await i18n.changeLanguage('en');
      const rolesEN = getAllRoleTranslations(i18n.t);
      
      // Los values deben ser iguales en ambos idiomas
      expect(rolesES.map(r => r.value)).toEqual(rolesEN.map(r => r.value));
      
      // Los labels deben ser diferentes
      expect(rolesES.map(r => r.label)).not.toEqual(rolesEN.map(r => r.label));
    });
  });

  /**
   * TC-017-07: Integración con componentes
   * Validar que los componentes UserForm y UserManagement pueden usar las traducciones
   */
  describe('TC-017-07: Uso en componentes', () => {
    
    it('debe retornar valores compatibles con dropdown de UserForm', async () => {
      await i18n.changeLanguage('es');
      const roles = getAllRoleTranslations(i18n.t);
      
      // Verificar estructura compatible con <option>
      roles.forEach(role => {
        expect(role).toHaveProperty('value');
        expect(role).toHaveProperty('label');
        expect(typeof role.value).toBe('string');
        expect(typeof role.label).toBe('string');
      });
    });

    it('debe retornar traducción válida para celda de tabla en UserManagement', () => {
      const roleValue = 'ADMIN';
      const translation = getRoleTranslation(roleValue, i18n.t);
      
      // La traducción debe ser un string no vacío
      expect(typeof translation).toBe('string');
      expect(translation.length).toBeGreaterThan(0);
      expect(translation).not.toBe(roleValue); // No debe retornar el valor original
    });
  });
});
