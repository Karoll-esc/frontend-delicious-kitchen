import { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import Sidebar from '../components/analytics/Sidebar';
import { useTranslation } from 'react-i18next';
import { getAllSurveys } from '../services/api';

/**
 * AdminSurveysPage Component - HU-013
 *
 * Panel de administración para visualizar encuestas de proceso.
 * Las encuestas NO requieren moderación, solo visualización del feedback.
 *
 * Features:
 * - Fetch de todas las encuestas desde GET /surveys (protegido admin)
 * - Visualización de ratings: tiempo de espera y servicio
 * - Estadísticas de promedios
 * - Paginación básica
 *
 * Color Palette:
 * - #FF6B35: Elementos principales
 * - #F5F5F5: Fondo de página
 * - #222222: Texto principal
 */
const AdminSurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, i18n } = useTranslation();
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchSurveys(1);
  }, []);

  /**
   * Obtiene las encuestas desde el backend usando authenticatedFetch
   * @param {number} page - Número de página
   */
  const fetchSurveys = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAllSurveys(page, 20);
      
      // El backend responde con { success, surveys, total, page, totalPages }
      const surveysList = data.surveys || [];
      setSurveys(surveysList);
      setPagination({
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || surveysList.length
      });
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err.message || 'Error al cargar las encuestas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula el promedio de una propiedad de ratings
   * @param {string} prop - waitTimeRating o serviceRating
   */
  const calculateAverage = (prop) => {
    if (surveys.length === 0) return 0;
    const sum = surveys.reduce((acc, s) => acc + (s[prop] || 0), 0);
    return (sum / surveys.length).toFixed(1);
  };

  /**
   * Formatea una fecha para visualización
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-[#222222] text-lg">{t('surveys.loading', 'Cargando encuestas...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error</span>
            <h2 className="text-2xl font-bold text-[#222222] mb-2">{t('surveys.error', 'Error')}</h2>
            <p className="text-[#666666] mb-6">{error}</p>
            <button
              onClick={() => fetchSurveys(1)}
              className="bg-[#FF6B35] hover:bg-[#e55d2e] text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {t('surveys.retry', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#F5F5F5] dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#222222] mb-2">
                {t('surveys.managementTitle', 'Panel de Encuestas de Proceso')}
              </h1>
              <p className="text-[#666666] text-lg">
                {t('surveys.managementSubtitle', 'Feedback de clientes sobre tiempos de espera y atención')}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-[#666666] text-sm mb-1">{t('surveys.total', 'Total Encuestas')}</p>
                <p className="text-3xl font-bold text-[#222222]">{pagination.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-[#666666] text-sm mb-1">{t('surveys.avgWaitTime', 'Promedio Tiempo de Espera')}</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-[#FF6B35]">{calculateAverage('waitTimeRating')}</p>
                  <span className="material-symbols-outlined text-[#FF6B35]">star</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-[#666666] text-sm mb-1">{t('surveys.avgService', 'Promedio Servicio')}</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-[#FF6B35]">{calculateAverage('serviceRating')}</p>
                  <span className="material-symbols-outlined text-[#FF6B35]">star</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-[#666666] text-sm mb-1">{t('surveys.withComments', 'Con Comentarios')}</p>
                <p className="text-3xl font-bold text-green-600">
                  {surveys.filter((s) => s.comment && s.comment.trim()).length}
                </p>
              </div>
            </div>

            {/* Surveys List */}
            {surveys.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <span className="material-symbols-outlined text-[#CCCCCC] text-6xl mb-4">rate_review</span>
                <h2 className="text-2xl font-bold text-[#222222] mb-2">
                  {t('surveys.noSurveys', 'No hay encuestas')}
                </h2>
                <p className="text-[#666666]">
                  {t('surveys.noSurveysText', 'Las encuestas aparecerán aquí cuando los clientes las envíen')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div
                    key={survey._id || survey.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#222222]">
                            {survey.customerName}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
                            {survey.orderNumber}
                          </span>
                        </div>
                        <p className="text-sm text-[#666666]">
                          {formatDate(survey.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-[#666666] mb-2">{t('surveys.waitTimeRating', 'Tiempo de Espera')}</p>
                        <StarRating rating={survey.waitTimeRating || 0} readonly size="sm" />
                      </div>
                      <div>
                        <p className="text-sm text-[#666666] mb-2">{t('surveys.serviceRating', 'Atención del Personal')}</p>
                        <StarRating rating={survey.serviceRating || 0} readonly size="sm" />
                      </div>
                    </div>

                    {/* Comment */}
                    {survey.comment && survey.comment.trim() && (
                      <div className="border-t border-[#F5F5F5] pt-4">
                        <p className="text-sm text-[#666666] mb-1 font-medium">{t('surveys.comment', 'Comentario:')}</p>
                        <p className="text-[#222222]">{survey.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => fetchSurveys(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {t('common.previous', 'Anterior')}
                </button>
                <span className="px-4 py-2 text-[#666666]">
                  {t('common.pageOf', 'Página {{current}} de {{total}}', { 
                    current: pagination.page, 
                    total: pagination.totalPages 
                  })}
                </span>
                <button
                  onClick={() => fetchSurveys(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {t('common.next', 'Siguiente')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSurveysPage;
