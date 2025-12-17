import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import StarRating from './StarRating';

/**
 * Modal para enviar encuestas de proceso (durante preparación)
 * HU-013: Sistema de Encuestas de Proceso
 *
 * Props:
 * - isOpen: Boolean para mostrar/ocultar modal
 * - onClose: Callback para cerrar modal (encuesta no obligatoria)
 * - orderData: Objeto con { orderNumber, customerName, customerEmail }
 * - onSubmit: Callback opcional al enviar encuesta exitosamente
 *
 * Diferencias con ReviewModal:
 * - Se activa en estados "preparing" o "ready" (no post-entrega)
 * - Evalúa tiempo de espera y servicio (no comida)
 * - NO es obligatoria, el cliente puede cerrar sin responder
 * - No requiere moderación admin
 *
 * Paleta de colores:
 * - Primario: #FF6B35 (naranja vibrante)
 * - Fondo: #F5F5F5, #FFFFFF
 * - Texto: #222222, #666666
 */
export default function SurveyModal({
  isOpen,
  onClose,
  orderData,
  onSubmit
}) {
  const { t } = useTranslation();
  const [waitTimeRating, setWaitTimeRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  // Validación del formulario
  const validate = () => {
    const newErrors = {};

    if (!waitTimeRating || waitTimeRating < 1 || waitTimeRating > 5) {
      newErrors.waitTime = t('surveyModal.errors.waitTimeRequired');
    }

    if (!serviceRating || serviceRating < 1 || serviceRating > 5) {
      newErrors.service = t('surveyModal.errors.serviceRequired');
    }

    if (comment && comment.length > 500) {
      newErrors.comment = t('surveyModal.errors.commentMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar encuesta
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      const surveyData = {
        orderNumber: orderData.orderNumber,
        customerName: orderData.customerName || orderData.customer,
        customerEmail: orderData.customerEmail || 'customer@example.com',
        waitTimeRating,
        serviceRating,
        comment: comment.trim()
      };

      const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData)
      });

      if (!response.ok) {
        let errorMessage = t('surveyModal.errors.submitFailed');
        try {
          const errorData = await response.json();
          // Manejo de errores específicos
          if (response.status === 409) {
            errorMessage = t('surveyModal.errors.duplicateSurvey');
          } else if (response.status === 400) {
            errorMessage = errorData.message || t('surveyModal.errors.invalidRatings');
          } else {
            errorMessage = errorData.message || errorMessage;
          }
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Mostrar mensaje de éxito
      setSubmitSuccess(true);

      // Esperar 2 segundos y cerrar modal (no redirige, el cliente sigue con su pedido)
      setTimeout(() => {
        setSubmitSuccess(false);
        resetForm();
        if (onSubmit) onSubmit(data.data);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting survey:', error);
      const errorMessage = error.message || t('surveyModal.errors.submitFailedRetry');
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setWaitTimeRating(0);
    setServiceRating(0);
    setComment('');
    setErrors({});
  };

  // Cerrar modal (la encuesta no es obligatoria)
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  // Caracteres restantes del comentario
  const remainingChars = 500 - comment.length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FF6B35] text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center gap-1 text-white hover:text-[#F5F5F5] transition-colors disabled:opacity-50"
              aria-label={t('surveyModal.closeButton')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-xl font-bold">{t('surveyModal.title')}</h2>
            <div className="w-8"></div>
          </div>
          {orderData?.orderNumber && (
            <p className="text-sm text-white/90 mt-2 text-center">
              {t('surveyModal.orderNumberPrefix')}{orderData.orderNumber}
            </p>
          )}
        </div>

        {/* Success Message */}
        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl">
                  check_circle
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#222222] mb-2">
              {t('surveyModal.thankYouTitle')}
            </h3>
            <p className="text-[#666666]">
              {t('surveyModal.successMessage')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Mensaje introductorio */}
            <p className="text-sm text-[#666666] mb-6 text-center">
              {t('surveyModal.introMessage')}
            </p>

            {/* Wait Time Rating */}
            <div className="mb-6">
              <StarRating
                label={t('surveyModal.waitTimeLabel')}
                rating={waitTimeRating}
                onChange={(value) => setWaitTimeRating(value)}
                size="md"
              />
              {errors.waitTime && (
                <p className="text-sm text-red-500 mt-1">{errors.waitTime}</p>
              )}
            </div>

            {/* Service Rating */}
            <div className="mb-6">
              <StarRating
                label={t('surveyModal.serviceLabel')}
                rating={serviceRating}
                onChange={(value) => setServiceRating(value)}
                size="md"
              />
              {errors.service && (
                <p className="text-sm text-red-500 mt-1">{errors.service}</p>
              )}
            </div>

            {/* Comment (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#222222] mb-2">
                {t('surveyModal.commentsLabel')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('surveyModal.commentsPlaceholder')}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-[#222222] placeholder-[#CCCCCC]"
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs ${remainingChars < 50 ? 'text-[#FF6B35]' : 'text-[#666666]'}`}>
                  {remainingChars} {t('surveyModal.charactersRemaining')}
                </p>
                {errors.comment && (
                  <p className="text-xs text-red-500">{errors.comment}</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#F5F5F5] text-[#666666] font-semibold rounded-lg hover:bg-[#CCCCCC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('surveyModal.skipButton')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    {t('surveyModal.submittingButton')}
                  </>
                ) : (
                  t('surveyModal.submitButton')
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
