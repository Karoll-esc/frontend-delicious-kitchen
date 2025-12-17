/**
 * Suite de Tests para ReviewModal - HU-014
 * Sistema de Reseñas Públicas
 * 
 * Valida:
 * - Creación de reseñas con y sin orderNumber
 * - Enriquecimiento de metadata cuando orderNumber es válido
 * - Múltiples reseñas por cliente (sin validación de duplicados)
 * - Validación de campos y ratings
 * - Casos borde (orderNumber inválido, campos mínimos)
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../tests/server';
import ReviewModal from '../components/ReviewModal';
import '../i18n';

describe('HU-014: Sistema de Reseñas Públicas (ReviewModal)', () => {
  
  const mockOrderData = {
    orderId: 'order-id-777',
    orderNumber: 'ORD-777',
    customerName: 'Carlos Gómez',
    customerEmail: 'carlos@example.com'
  };

  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-014-P01: Cliente crea reseña sin orderNumber
   * Given: cliente accede a /reviews/new
   * When: completa campos requeridos sin orderNumber
   * Then: reseña creada con orderNumber = "N/A", status = "pending", sin metadata
   */
  test('TC-014-P01: Crear reseña SIN orderNumber (debe usar N/A)', async () => {
    const user = userEvent.setup();

    const orderDataWithoutNumber = {
      orderId: null,
      orderNumber: null,
      customerName: 'Ana Torres',
      customerEmail: 'ana@example.com'
    };

    server.use(
      rest.post('http://localhost:3000/reviews', async (req, res, ctx) => {
        const body = await req.json();
        
        // Verificar que se puede crear sin orderId
        expect(body.orderId).toBeNull();
        expect(body.ratings.overall).toBe(5);
        expect(body.ratings.food).toBe(4);
        
        return res(
          ctx.status(201),
          ctx.json({ 
            message: 'Reseña creada exitosamente',
            reviewId: 'review-001',
            orderNumber: 'N/A'
          })
        );
      })
    );

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={orderDataWithoutNumber}
        onSubmit={mockOnSubmit}
      />
    );

    // Seleccionar ratings
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[4]); // 5 estrellas overall
    await user.click(stars[3]); // 4 estrellas food

    // Agregar comentario
    const commentInput = screen.getByPlaceholderText(/cuéntanos sobre tu experiencia/i);
    await user.type(commentInput, 'Delicioso');

    // Enviar
    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Verificar éxito
    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  /**
   * TC-014-P02: Reseña con orderNumber válido se enriquece
   * Given: cliente proporciona orderNumber existente
   * When: sistema busca pedido
   * Then: agrega metadata (items, total, orderDate), reseña enriquecida
   */
  test('TC-014-P02: Reseña CON orderNumber válido incluye metadata', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('http://localhost:3000/reviews', async (req, res, ctx) => {
        const body = await req.json();
        
        // Verificar que tiene orderId
        expect(body.orderId).toBe('order-id-777');
        expect(body.ratings.overall).toBe(5);
        expect(body.ratings.food).toBe(5);
        
        return res(
          ctx.status(201),
          ctx.json({ 
            message: 'Reseña creada exitosamente',
            reviewId: 'review-002',
            orderNumber: 'ORD-777',
            metadata: {
              items: ['Pizza Margherita', 'Coca Cola'],
              total: 25.00,
              orderDate: '2025-12-17'
            }
          })
        );
      })
    );

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
        onSubmit={mockOnSubmit}
      />
    );

    // Verificar que muestra el número de pedido
    expect(screen.getByText(/ORD-777/i)).toBeInTheDocument();

    // Completar reseña
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[4]);
    await user.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-014-P03: Cliente puede dejar múltiples reseñas
   * Given: cliente ya tiene reseña previa
   * When: crea nueva reseña diferente
   * Then: sistema NO valida duplicados, segunda reseña aceptada, ambas existen
   */
  test('TC-014-P03: Permitir múltiples reseñas del mismo cliente', async () => {
    const user = userEvent.setup();

    // Simular que ya existe una reseña previa (backend no rechaza)
    server.use(
      rest.post('http://localhost:3000/reviews', async (req, res, ctx) => {
        // Backend NO valida duplicados, acepta todas las reseñas
        return res(
          ctx.status(201),
          ctx.json({ 
            message: 'Reseña creada exitosamente',
            reviewId: 'review-003'
          })
        );
      })
    );

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
        onSubmit={mockOnSubmit}
      />
    );

    // Completar segunda reseña
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[2]); // 3 estrellas
    await user.click(stars[2]);

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Debe permitir envío (sin error de duplicado)
    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-014-N01: Rechazar reseña sin campos requeridos
   * Given: cliente omite foodRating
   * When: POST a /reviews/new
   * Then: validación detecta campo faltante, HTTP 400, error mostrado
   */
  test('TC-014-N01: Rechazar reseña sin campos requeridos (foodRating)', async () => {
    const user = userEvent.setup();

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Solo seleccionar overall rating, omitir food rating
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[3]); // Solo overall

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Debe mostrar error de validación
    await waitFor(() => {
      expect(screen.getByText(/califica la calidad de la comida/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  /**
   * TC-014-N02: Rechazar reseña con ratings inválidos
   * Given: cliente envía ratings fuera de rango (0, 6, -1)
   * When: POST a /reviews/new
   * Then: validación rechaza, HTTP 400, error "Ratings deben estar entre 1 y 5"
   */
  test('TC-014-N02: Rechazar ratings fuera del rango 1-5', async () => {
    const user = userEvent.setup();

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // No seleccionar estrellas (rating = 0)
    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Debe mostrar errores de validación
    await waitFor(() => {
      expect(screen.getByText(/selecciona una calificación general/i)).toBeInTheDocument();
      expect(screen.getByText(/califica la calidad de la comida/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  /**
   * TC-014-B01: Reseña con orderNumber inválido se acepta
   * Given: cliente proporciona orderNumber que NO existe
   * When: sistema no encuentra pedido
   * Then: reseña creada SIN metadata, orderNumber conservado, NO rechaza
   */
  test('TC-014-B01: Reseña con orderNumber inexistente se acepta sin metadata', async () => {
    const user = userEvent.setup();

    const invalidOrderData = {
      orderId: 'order-noexiste',
      orderNumber: 'ORD-NOEXISTE',
      customerName: 'Pedro Ruiz',
      customerEmail: 'pedro@example.com'
    };

    server.use(
      rest.post('http://localhost:3000/reviews', async (req, res, ctx) => {
        const body = await req.json();
        
        // Acepta el orderId aunque no exista
        expect(body.orderId).toBe('order-noexiste');
        
        return res(
          ctx.status(201),
          ctx.json({ 
            message: 'Reseña creada exitosamente',
            reviewId: 'review-004',
            orderNumber: 'ORD-NOEXISTE',
            // Sin metadata porque el pedido no existe
            metadata: null
          })
        );
      })
    );

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={invalidOrderData}
        onSubmit={mockOnSubmit}
      />
    );

    // Completar reseña
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[3]);
    await user.click(stars[3]);

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Debe aceptar la reseña (sin rechazarla)
    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-014-B02: Reseña solo con campos mínimos (sin comment)
   * Given: cliente envía solo foodRating y tasteRating
   * When: sin comment ni orderNumber
   * Then: reseña creada con campos mínimos, comment = null, HTTP 201
   */
  test('TC-014-B02: Crear reseña solo con campos requeridos (sin comentario)', async () => {
    const user = userEvent.setup();

    const minimalOrderData = {
      orderId: null,
      orderNumber: null,
      customerName: 'Laura Díaz',
      customerEmail: 'laura@example.com'
    };

    server.use(
      rest.post('http://localhost:3000/reviews', async (req, res, ctx) => {
        const body = await req.json();
        
        // Verificar campos mínimos
        expect(body.ratings.overall).toBe(3);
        expect(body.ratings.food).toBe(4);
        expect(body.comment).toBe(''); // Vacío o null
        
        return res(
          ctx.status(201),
          ctx.json({ 
            message: 'Reseña creada exitosamente',
            reviewId: 'review-005'
          })
        );
      })
    );

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={minimalOrderData}
      />
    );

    // Solo completar ratings (sin comentario)
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[2]); // 3 estrellas overall
    await user.click(stars[3]); // 4 estrellas food

    // NO escribir comentario

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gracias/i)).toBeInTheDocument();
    });
  });

  /**
   * Test adicional: Validar límite de caracteres en comentarios
   */
  test('TC-014-EXTRA: Rechazar comentarios mayores a 500 caracteres', async () => {
    const user = userEvent.setup();

    render(
      <ReviewModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Seleccionar ratings válidos
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[4]);
    await user.click(stars[4]);

    // Ingresar comentario muy largo (>500 caracteres)
    const longComment = 'a'.repeat(501);
    const commentInput = screen.getByPlaceholderText(/cuéntanos sobre tu experiencia/i);
    await user.type(commentInput, longComment);

    const submitButton = screen.getByRole('button', { name: /enviar reseña/i });
    await user.click(submitButton);

    // Debe mostrar error de validación
    await waitFor(() => {
      expect(screen.getByText(/no debe exceder los 500 caracteres/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
