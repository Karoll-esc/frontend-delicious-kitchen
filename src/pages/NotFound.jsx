import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Componente para página 404 - Recurso no encontrado
 * 
 * Características:
 * - Mensaje traducido para usuarios sin rutas válidas
 * - Link de regreso al inicio
 * - Diseño limpio y centrado
 * 
 * @component
 * @returns {JSX.Element} Página 404 estilizada
 */
function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center px-6">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-500">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            {t('errors.pageNotFound')}
          </h2>
          <p className="text-gray-600 text-lg">
            {t('errors.pageNotFoundDescription')}
          </p>
        </div>

        <Link
          to="/"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200"
        >
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
