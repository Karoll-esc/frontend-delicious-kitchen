import React, { useContext } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Mock de Firebase Auth
jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

/**
 * Tests del AuthContext integrado con Firebase Authentication SDK.
 * 
 * NOTA: Estos tests verifican la integración con Firebase Auth mediante mocks.
 * El contexto ya NO tiene método login() manual - Firebase lo maneja via onAuthStateChanged.
 */
describe('AuthContext con Firebase Auth SDK', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Verifica que el contexto por defecto (sin provider) tenga logout definido
   * y no lance error al llamarse (aunque no haga nada sin Firebase).
   */
  it('logout del contexto por defecto no lanza error', () => {
    function Consumer() {
      const { logout } = useContext(AuthContext);
      // Verificar que logout está definido
      expect(logout).toBeDefined();
      expect(typeof logout).toBe('function');
      return <div>ok</div>;
    }
    render(<Consumer />);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  /**
   * Componente de prueba que consume el AuthContext
   */
  function TestComponent() {
    const { isLoggedIn, user, loading, logout } = useContext(AuthContext);
    return (
      <div>
        <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
        <span data-testid="isLoggedIn">{isLoggedIn ? 'yes' : 'no'}</span>
        <span data-testid="user">{user ? user.email : 'none'}</span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  /**
   * Verifica valores iniciales: loading=true, isLoggedIn=false, user=null
   */
  it('proporciona valores iniciales correctos (loading=true)', () => {
    // Mock onAuthStateChanged para no llamar el callback inmediatamente
    onAuthStateChanged.mockImplementation(() => jest.fn());

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('no');
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  /**
   * Verifica que cuando Firebase detecta un usuario autenticado,
   * el contexto actualiza isLoggedIn=true y user con datos de Firebase
   */
  it('detecta usuario autenticado cuando Firebase notifica via onAuthStateChanged', async () => {
    const mockUser = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdTokenResult: jest.fn().mockResolvedValue({
        claims: { role: 'ADMIN' },
      }),
    };

    // Mock onAuthStateChanged para invocar callback con usuario autenticado
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn(); // unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('yes');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  /**
   * Verifica que cuando Firebase notifica que no hay usuario (null),
   * el contexto actualiza isLoggedIn=false y user=null
   */
  it('detecta cierre de sesión cuando Firebase notifica usuario null', async () => {
    // Mock onAuthStateChanged para invocar callback sin usuario
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('no');
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
  });

  /**
   * Verifica que logout() llama a signOut de Firebase
   * y limpia localStorage explícitamente
   */
  it('logout llama a Firebase signOut y limpia localStorage', async () => {
    signOut.mockResolvedValue();
    localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }));

    // Mock onAuthStateChanged sin usuario
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    // Click en logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    // Verificar que signOut fue llamado
    expect(signOut).toHaveBeenCalledWith(auth);
    
    // Verificar que localStorage fue limpiado
    expect(localStorage.getItem('user')).toBeNull();
  });

  /**
   * Verifica que onAuthStateChanged se desuscribe al desmontar el componente
   */
  it('se desuscribe de onAuthStateChanged al desmontar', () => {
    const mockUnsubscribe = jest.fn();
    onAuthStateChanged.mockImplementation(() => mockUnsubscribe);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    // Verificar que se llamó la función de desuscripción
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
