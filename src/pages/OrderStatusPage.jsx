import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import OrderStatus from '../components/OrderStatus';
import ReviewModal from '../components/ReviewModal';
import SurveyModal from '../components/SurveyModal';

/**
 * Página para ver el estado de un pedido específico
 * Ruta: /orders/:orderId
 */
function OrderStatusPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [orderData, setOrderData] = useState(null);
  const [refreshFunction, setRefreshFunction] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [hasSurvey, setHasSurvey] = useState(false);

  // Estados válidos para mostrar la encuesta de proceso
  const SURVEY_VALID_STATES = ['preparing', 'ready'];

  /**
   * Verifica si ya existe una encuesta para el pedido actual
   * Se ejecuta cuando cambia el orderData
   */
  const checkSurveyExists = useCallback(async (orderNumber) => {
    if (!orderNumber) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}/surveys/check/${orderNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        setHasSurvey(data.hasSurvey);
      }
    } catch (error) {
      console.error('Error checking survey:', error);
      // En caso de error, asumimos que no hay encuesta para no bloquear la funcionalidad
      setHasSurvey(false);
    }
  }, []);

  // Verificar si existe encuesta cuando se carga el pedido
  useEffect(() => {
    if (orderData?.orderNumber) {
      checkSurveyExists(orderData.orderNumber);
    }
  }, [orderData?.orderNumber, checkSurveyExists]);

  /**
   * Determina si se debe mostrar el botón de encuesta
   * Condiciones: estado preparing/ready Y no existe encuesta previa
   */
  const canShowSurvey = orderData && 
    SURVEY_VALID_STATES.includes(orderData.status) && 
    !hasSurvey;

  /**
   * Callback cuando se envía la encuesta exitosamente
   */
  const handleSurveySubmit = () => {
    setHasSurvey(true);
    setShowSurveyModal(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 pb-2 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        {/* Botón atrás */}
        <div className="flex items-center justify-start w-12 h-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
            aria-label={t('common.back', 'Atrás')}
          >
            <span className="material-symbols-outlined text-text-light dark:text-text-dark text-2xl">arrow_back</span>
          </button>
        </div>
        {/* Título */}
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">
          {t('orderStatus.trackOrder')}
        </h2>
        {/* Botón cambio de idioma */}
        <div className="flex items-center justify-end w-12 h-12">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-primary text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
            aria-label={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 pb-28 pt-4">
        <OrderStatus
          onOrderLoad={setOrderData}
          onRefreshRequest={setRefreshFunction}
          onOpenReviewModal={() => setShowReviewModal(true)}
        />
      </main>

      {/* Bottom Bar / Footer */}
      <OrderStatusFooter
        order={orderData}
        onRefresh={refreshFunction}
      />

      {/* Review Modal */}
      {showReviewModal && orderData && (
        <ReviewModal
          key={i18n.language}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderData={{
            orderId: orderData.orderId || orderData._id,
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName || orderData.customer,
            customerEmail: orderData.customerEmail || ''
          }}
          onSubmit={() => {
            setShowReviewModal(false);
          }}
        />
      )}

      {/* Survey Modal - Encuesta de proceso (no obligatoria) */}
      {showSurveyModal && orderData && (
        <SurveyModal
          key={`survey-${i18n.language}`}
          isOpen={showSurveyModal}
          onClose={() => setShowSurveyModal(false)}
          orderData={{
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName || orderData.customer,
            customerEmail: orderData.customerEmail || ''
          }}
          onSubmit={handleSurveySubmit}
        />
      )}

      {/* Floating Survey Button - Solo visible cuando es posible enviar encuesta */}
      {canShowSurvey && (
        <button
          onClick={() => setShowSurveyModal(true)}
          className="fixed bottom-24 right-4 z-20 flex items-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-full shadow-lg hover:bg-[#FF6B35]/90 transition-all transform hover:scale-105"
          aria-label={t('surveyModal.openSurvey')}
        >
          <span className="material-symbols-outlined">rate_review</span>
          <span className="font-medium text-sm">{t('surveyModal.giveFeedback')}</span>
        </button>
      )}
    </div>
  );
}

/**
 * Componente del footer con tiempo estimado y botón de refresh
 * @param {Object} order - Datos del pedido
 * @param {Function} onRefresh - Función para refrescar el estado del pedido
 */
function OrderStatusFooter({ order, onRefresh }) {
  const { t } = useTranslation();
  // Calcular tiempo estimado basado en el estado del pedido
  const calculateEstimatedTime = () => {
    if (!order) {
      return t('orderStatusFooter.calculating');
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));

    // Tiempo estimado según el estado (ya normalizado por el servicio API)
    let estimatedMinutes;
    switch (order.status) {
      case 'pending':
        estimatedMinutes = Math.max(0, 15 - elapsedMinutes);
        break;
      case 'cooking':
      case 'preparing':
        estimatedMinutes = Math.max(0, 10 - elapsedMinutes);
        break;
      case 'ready':
        return t('orderStatus.stepReady');
      case 'delivered':
        return t('orderStatusFooter.delivered');
      case 'cancelled':
        return t('orderStatusFooter.cancelled');
      default:
        estimatedMinutes = 12;
    }

    if (estimatedMinutes <= 0) {
      return t('orderStatusFooter.soon');
    }

    return `${estimatedMinutes} ${t(estimatedMinutes === 1 ? 'orderStatusFooter.minute' : 'orderStatusFooter.minutes')}`;
  };

  const estimatedTime = calculateEstimatedTime();

  const handleRefresh = () => {
    // Si hay una función de refresh disponible, usarla; sino, recargar la página
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    } else {
      // Fallback: recargar la página si no hay función de refresh
      globalThis.location.reload();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border-light dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-subtext-light dark:text-subtext-dark">{t('orderStatusFooter.estimatedTime')}</p>
            <p className="text-2xl font-bold text-primary">{estimatedTime}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-3 text-base font-bold leading-normal text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>{t('orderStatusFooter.refresh')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

OrderStatusFooter.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onRefresh: PropTypes.func,
};

export default OrderStatusPage;
