import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { translateFirebaseError } from "../utils/firebaseErrorHandler";
import { useTranslation } from "react-i18next";

/**
 * Componente de Login integrado con Firebase Authentication (HU-005).
 * Gestiona la autenticación de usuarios administradores y personal de cocina.
 * El estado de autenticación se maneja automáticamente por AuthContext via onAuthStateChanged.
 * Soporta query params para mostrar mensajes contextuales y redirección post-login.
 */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  /**
   * Detecta query params al montar el componente (HU-005).
   * Muestra mensajes contextuales según parámetros:
   * - session_expired=true: "Tu sesión ha expirado"
   * - redirect=/ruta: Guarda ruta para volver después del login
   */
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired');
    const redirectPath = searchParams.get('redirect');

    if (sessionExpired === 'true') {
      setInfoMessage(t('auth.sessionExpired'));
    } else if (redirectPath) {
      setInfoMessage(t('auth.loginRequired'));
    }
  }, [searchParams, t]);

  /**
   * Valida que el usuario tenga un rol permitido (ADMIN o KITCHEN).
   * 
   * @param {Object} claims - Custom claims del token de Firebase
   * @returns {boolean} true si el rol está permitido, false en caso contrario
   */
  const validateAllowedRole = (claims) => {
    const role = (claims.role || '').toUpperCase();
    return role === "ADMIN" || role === "KITCHEN";
  };

  /**
   * Maneja errores de autenticación traduciendo códigos de Firebase a mensajes amigables.
   * 
   * @param {Error} error - Error de Firebase Authentication
   */
  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    const message = translateFirebaseError(error.code);
    setError(message);
  };

  /**
   * Maneja el caso de acceso no autorizado (rol no permitido).
   * 
   * @param {Object} claims - Custom claims del usuario
   */
  const handleUnauthorizedAccess = (claims) => {
    const claimsString = JSON.stringify(claims);
    setError(`Acceso denegado: no tienes permisos para acceder. Claims: ${claimsString}`);
  };

  /**
   * Redirige al usuario según su rol después de una autenticación exitosa (HU-005).
   * Si existe query param 'redirect', redirige a esa ruta en lugar de la ruta por defecto.
   * 
   * @param {Object} claims - Custom claims del token de Firebase
   */
  const handleSuccessfulLogin = (claims) => {
    const redirectPath = searchParams.get('redirect');
    
    if (redirectPath) {
      // Redirigir a la ruta solicitada originalmente
      navigate(redirectPath);
      return;
    }

    // Redirección por defecto según rol
    const role = (claims.role || '').toUpperCase();
    
    if (role === 'ADMIN') {
      navigate("/users");
    } else if (role === 'KITCHEN') {
      navigate("/kitchen");
    } else {
      navigate("/");
    }
  };

  /**
   * Autentica al usuario con Firebase Authentication.
   * 
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Token result con claims del usuario
   */
  const authenticateUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const tokenResult = await userCredential.user.getIdTokenResult(true);
    
    return tokenResult;
  };

  /**
   * Maneja el envío del formulario de login.
   * No actualiza localStorage ni llama a login() del contexto.
   * El AuthContext detectará automáticamente la autenticación via onAuthStateChanged.
   * 
   * @param {Event} e - Evento de submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokenResult = await authenticateUser(email, password);
      const isAllowed = validateAllowedRole(tokenResult.claims);

      if (isAllowed) {
        // No se necesita localStorage ni login() del contexto
        // onAuthStateChanged del AuthContext detectará la autenticación automáticamente
        handleSuccessfulLogin(tokenResult.claims);
      } else {
        // Usuario autenticado pero sin permisos - cerrar sesión
        await auth.signOut();
        handleUnauthorizedAccess(tokenResult.claims);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f6f5]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <svg className="text-primary" fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
            <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <p className="text-2xl font-bold text-[#222222]">Admin Panel</p>
        </div>

        {/* Mensajes contextuales (HU-005) */}
        {infoMessage && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            <p className="text-sm">{infoMessage}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col w-full">
            <span className="text-[#222222] text-sm font-medium pb-2">Username or Email</span>
            <input
              className="form-input rounded-lg border border-[#e7deda] bg-white h-12 p-3 text-base"
              type="email"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-[#222222] text-sm font-medium pb-2">Password</span>
            <input
              className="form-input rounded-lg border border-[#e7deda] bg-white h-12 p-3 text-base"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Login"}
        </button>
        <a className="text-[#666666] text-sm text-center underline hover:text-primary" href="#">Forgot Password?</a>
      </form>
    </div>
  );
}

export default Login;
