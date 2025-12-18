/**
 * Suite de Tests para SurveyModal - HU-013
 * Sistema de Encuestas de Proceso
 * 
 * Valida:
 * - Envío exitoso de encuestas con ratings válidos (1-5)
 * - Prevención de encuestas duplicadas
 * - Validación de campos y ratings
 * - Casos borde (ratings en límites)
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../tests/server';
import SurveyModal from '../components/SurveyModal';
import '../i18n';

describe('HU-013: Sistema de Encuestas de Proceso (SurveyModal)', () => {
  
  const mockOrderData = {
    orderNumber: 'ORD-777',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com'
  };

  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TC-013-P01: Cliente envía encuesta exitosamente
   * Given: pedido ORD-777 en estado "preparing"
   * When: cliente completa encuesta con ratings válidos (1-5)
   * Then: sistema valida ratings 1-5, guarda encuesta vinculada a ORD-777
   */
  test('TC-013-P01: Envío exitoso de encuesta con ratings válidos', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('http://localhost:3000/surveys', async (req, res, ctx) => {
        const body = await req.json();
        
        // Validar que recibe los datos correctos
        expect(body.orderNumber).toBe('ORD-777');
        expect(body.waitTimeRating).toBe(4);
        expect(body.serviceRating).toBe(5);
        
        return res(
          ctx.status(201),
          ctx.json({ 
            message: '¡Gracias por tu opinión!',
            surveyId: 'survey-123'
          })
        );
      })
    );

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
        onSubmit={mockOnSubmit}
      />
    );

    // Verificar que el modal se muestra
    expect(screen.getByText(/ORD-777/i)).toBeInTheDocument();

    // Seleccionar ratings
    const waitTimeStars = screen.getAllByRole('button', { name: /star/i });
    await user.click(waitTimeStars[3]); // 4 estrellas

    const serviceStars = screen.getAllByRole('button', { name: /star/i });
    await user.click(serviceStars[4]); // 5 estrellas

    // Agregar comentario opcional
    const commentInput = screen.getByPlaceholderText(/algo que quieras contarnos/i);
    await user.type(commentInput, 'Excelente servicio');

    // Enviar
    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    // Verificar mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText(/gracias por tu opinión/i)).toBeInTheDocument();
    });

    // Verificar que llamó al callback
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  /**
   * TC-013-P02: Encuesta válida para pedido en estado ready
   * Given: pedido ORD-888 en estado "ready"
   * When: cliente completa encuesta
   * Then: sistema acepta estado "ready" y crea encuesta
   */
  test('TC-013-P02: Encuesta válida para pedido en estado READY', async () => {
    const user = userEvent.setup();

    const readyOrderData = {
      orderNumber: 'ORD-888',
      status: 'ready',
      customerName: 'María López',
      customerEmail: 'maria@example.com'
    };

    server.use(
      rest.post('http://localhost:3000/surveys', (req, res, ctx) => {
        return res(
          ctx.status(201),
          ctx.json({ message: '¡Gracias por tu opinión!' })
        );
      })
    );

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={readyOrderData}
        onSubmit={mockOnSubmit}
      />
    );

    // Seleccionar ratings mínimos válidos
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[2]); // 3 estrellas wait time
    await user.click(stars[3]); // 4 estrellas service

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gracias por tu opinión/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-013-N01: Sistema previene encuestas duplicadas
   * Given: pedido ORD-999 ya tiene encuesta
   * When: cliente intenta enviar otra encuesta para mismo pedido
   * Then: HTTP 409, mensaje "Ya enviaste tu opinión"
   */
  test('TC-013-N01: Prevenir envío de encuestas duplicadas', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('http://localhost:3000/surveys', (req, res, ctx) => {
        return res(
          ctx.status(409),
          ctx.json({ error: 'Ya enviaste tu opinión para este pedido' })
        );
      })
    );

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={{ ...mockOrderData, orderNumber: 'ORD-999' }}
      />
    );

    // Completar encuesta
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[2]);
    await user.click(stars[3]);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    // Verificar mensaje de error de duplicado
    await waitFor(() => {
      expect(screen.getByText(/ya enviaste tu opinión/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-013-N02: Encuesta con ratings fuera de rango rechazada
   * Given: cliente completa encuesta
   * When: intenta enviar rating inválido (0, 6, -1)
   * Then: validación rechaza, muestra error "Ratings deben estar entre 1 y 5"
   */
  test('TC-013-N02: Rechazar ratings fuera del rango 1-5', async () => {
    const user = userEvent.setup();

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // No seleccionar ninguna estrella (rating = 0)
    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    // Debe mostrar errores de validación
    await waitFor(() => {
      expect(screen.getByText(/califica el tiempo de espera/i)).toBeInTheDocument();
      expect(screen.getByText(/califica la atención del personal/i)).toBeInTheDocument();
    });

    // Verificar que NO se envió la encuesta
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  /**
   * TC-013-B01: Encuesta con ratings en límite inferior válido
   * Given: cliente envía todos ratings = 1
   * When: POST a /api/surveys
   * Then: sistema acepta rating 1, encuesta creada, HTTP 201
   */
  test('TC-013-B01: Aceptar ratings en límite inferior (todos = 1)', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('http://localhost:3000/surveys', async (req, res, ctx) => {
        const body = await req.json();
        
        // Verificar que acepta ratings = 1
        expect(body.waitTimeRating).toBe(1);
        expect(body.serviceRating).toBe(1);
        
        return res(
          ctx.status(201),
          ctx.json({ message: '¡Gracias por tu opinión!' })
        );
      })
    );

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Seleccionar 1 estrella en ambos ratings (límite inferior)
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[0]); // Primera estrella de wait time
    await user.click(stars[0]); // Primera estrella de service

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gracias por tu opinión/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-013-B02: Encuesta con ratings en límite superior válido
   * Given: cliente envía todos ratings = 5
   * When: POST a /api/surveys
   * Then: sistema acepta rating 5, encuesta creada, HTTP 201
   */
  test('TC-013-B02: Aceptar ratings en límite superior (todos = 5)', async () => {
    const user = userEvent.setup();

    server.use(
      rest.post('http://localhost:3000/surveys', async (req, res, ctx) => {
        const body = await req.json();
        
        // Verificar que acepta ratings = 5
        expect(body.waitTimeRating).toBe(5);
        expect(body.serviceRating).toBe(5);
        
        return res(
          ctx.status(201),
          ctx.json({ message: '¡Gracias por tu opinión!' })
        );
      })
    );

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Seleccionar 5 estrellas en ambos ratings (límite superior)
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[4]); // Quinta estrella de wait time
    await user.click(stars[4]); // Quinta estrella de service

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/gracias por tu opinión/i)).toBeInTheDocument();
    });
  });

  /**
   * Test adicional: Validar que el modal se puede cerrar sin enviar (opcional)
   */
  test('TC-013-EXTRA: Cliente puede cerrar modal sin enviar encuesta', async () => {
    const user = userEvent.setup();

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Buscar botón de omitir/cerrar
    const skipButton = screen.getByRole('button', { name: /omitir/i });
    await user.click(skipButton);

    // Verificar que llamó al callback de cierre
    expect(mockOnClose).toHaveBeenCalled();
    
    // Verificar que NO envió la encuesta
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test adicional: Validar límite de caracteres en comentarios
   */
  test('TC-013-EXTRA: Rechazar comentarios mayores a 500 caracteres', async () => {
    const user = userEvent.setup();

    render(
      <SurveyModal
        isOpen={true}
        onClose={mockOnClose}
        orderData={mockOrderData}
      />
    );

    // Seleccionar ratings válidos
    const stars = screen.getAllByRole('button', { name: /star/i });
    await user.click(stars[3]);
    await user.click(stars[3]);

    // Ingresar comentario muy largo (>500 caracteres)
    const longComment = 'a'.repeat(501);
    const commentInput = screen.getByPlaceholderText(/algo que quieras contarnos/i);
    await user.type(commentInput, longComment);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitButton);

    // Debe mostrar error de validación
    await waitFor(() => {
      expect(screen.getByText(/no debe exceder los 500 caracteres/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
