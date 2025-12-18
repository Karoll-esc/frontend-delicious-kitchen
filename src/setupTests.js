import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock manual de getEnvVar para evitar problemas con import.meta en Jest
jest.mock('./utils/getEnvVar', () => ({
  getEnvVar: (key) => {
    const mockEnv = require('./__mocks__/importMetaEnv').env;
    return mockEnv[key];
  }
}));

// Mock de firebaseConfig para tests
jest.mock('./firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
  app: {},
}));

// Mock de Firebase Auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simular que no hay usuario autenticado por defecto
    setTimeout(() => callback(null), 0);
    return jest.fn(); // unsubscribe function
  }),
  signOut: jest.fn(() => Promise.resolve()),
}));

// Polyfill para TextEncoder / TextDecoder usado por algunas dependencias (react-router, etc.)
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock mínimo para EventSource en entorno de Node/Jest
if (typeof global.EventSource === 'undefined') {
  class MockEventSource {
    constructor(url) {
      this.url = url;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.readyState = 0;
    }
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.EventSource = MockEventSource;
}

// Iniciar MSW server (handlers por defecto)
import { server } from './tests/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
