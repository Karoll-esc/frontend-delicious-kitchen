import { useState } from 'react';
import StarRating from './StarRating';

/**
 * Formulario público para crear reseñas sin vinculación obligatoria a pedidos
 * HU-014: Sistema de Reseñas Públicas
 * 
 * Permite a clientes dejar reseñas de forma flexible:
 * - Con orderNumber (si lo recuerdan)
 * - Sin orderNumber (se asigna "N/A" automáticamente)
 * - Múltiples reseñas por cliente permitidas
 */
export default function PublicReviewForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    foodRating: 0,
    tasteRating: 0,
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  /**
   * Validación de campos del formulario
   * Campos requeridos: customerName, customerEmail, foodRating, tasteRating
   * Campos opcionales: orderNumber, comment
   */
  const validateForm = () => {
    const newErrors = {};

    // customerName: requerido, min 2 caracteres
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'El nombre debe tener al menos 2 caracteres';
    }

    // customerEmail: requerido, formato email
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'El correo electrónico es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Formato de correo inválido';
    }

    // foodRating: requerido, entre 1-5
    if (!formData.foodRating || formData.foodRating < 1) {
      newErrors.foodRating = 'Debes calificar la comida (1-5 estrellas)';
    }

    // tasteRating: requerido, entre 1-5
    if (!formData.tasteRating || formData.tasteRating < 1) {
      newErrors.tasteRating = 'Debes calificar el sabor (1-5 estrellas)';
    }

    // comment: opcional, max 500 caracteres
    if (formData.comment && formData.comment.length > 500) {
      newErrors.comment = 'El comentario no debe exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: formData.orderNumber.trim() || undefined, // Si está vacío, se envía undefined
          customerName: formData.customerName.trim(),
          customerEmail: formData.customerEmail.trim().toLowerCase(),
          foodRating: formData.foodRating,
          tasteRating: formData.tasteRating,
          comment: formData.comment.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: '¡Gracias por tu reseña! Será visible una vez aprobada por el administrador.'
        });

        // Resetear formulario
        setFormData({
          orderNumber: '',
          customerName: '',
          customerEmail: '',
          foodRating: 0,
          tasteRating: 0,
          comment: ''
        });

        // Callback opcional para notificar al componente padre
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        setSubmitMessage({
          type: 'error',
          text: data.message || 'Error al enviar la reseña. Por favor, intenta nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Deja tu Reseña
      </h2>
      <p className="text-gray-600 mb-6">
        Comparte tu experiencia con nosotros. Tu opinión nos ayuda a mejorar.
      </p>

      {submitMessage.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            submitMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Número de Pedido (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Pedido <span className="text-gray-500 text-xs">(Opcional)</span>
          </label>
          <input
            type="text"
            value={formData.orderNumber}
            onChange={(e) => handleChange('orderNumber', e.target.value)}
            placeholder="Ej: ORD-1234567890-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si recuerdas tu número de pedido, ingrésalo aquí. Si no, puedes dejarlo en blanco.
          </p>
        </div>

        {/* Nombre del Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="Ej: Juan Pérez"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Correo Electrónico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            placeholder="Ej: juan@example.com"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
          )}
        </div>

        {/* Calificación de Comida */}
        <div>
          <StarRating
            rating={formData.foodRating}
            onChange={(value) => handleChange('foodRating', value)}
            label="Calificación de Comida"
            size="md"
          />
          {errors.foodRating && (
            <p className="text-red-500 text-sm mt-1">{errors.foodRating}</p>
          )}
        </div>

        {/* Calificación de Sabor */}
        <div>
          <StarRating
            rating={formData.tasteRating}
            onChange={(value) => handleChange('tasteRating', value)}
            label="Calificación de Sabor"
            size="md"
          />
          {errors.tasteRating && (
            <p className="text-red-500 text-sm mt-1">{errors.tasteRating}</p>
          )}
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario <span className="text-gray-500 text-xs">(Opcional, máx 500 caracteres)</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia..."
            rows="4"
            maxLength="500"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              errors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment ? (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            ) : (
              <span></span>
            )}
            <p className="text-xs text-gray-500">
              {formData.comment.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Botón de Envío */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
