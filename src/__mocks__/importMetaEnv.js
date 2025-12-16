/**
 * Mock para import.meta.env en Jest
 * Define todas las variables de entorno necesarias para testing
 * @see .env.example para la lista completa de variables
 */
export const env = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_NOTIFICATION_URL: 'http://localhost:3003/notifications/stream',
  
  // Firebase Configuration (valores de prueba)
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test-project.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: '1:123456789:web:test',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST123'
};

export const meta = { env };

// Para usarlo en los tests:
// jest.mock('import.meta', () => require('../__mocks__/importMetaEnv'));
