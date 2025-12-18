/**
 * Suite de Tests E2E para HU-007
 * Deshabilitar Botón de Cancelación en Frontend Según Estado del Pedido
 * 
 * Valida que la opción de cancelación se muestre/oculte correctamente
 * según el estado del pedido, cumpliendo con los criterios de aceptación Gherkin.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { rest } from 'msw';
import { server } from '../tests/server';
import OrderStatus from '../components/OrderStatus';
import '../i18n';

// Mock básico del hook de notificaciones
jest.mock('../hooks/useNotification', () => ({
  useNotifications: jest.fn(() => {})
}));

describe('HU-007: Deshabilitar botón de cancelación según estado del pedido', () => {
  
  /**
   * TC-007.1: Opción de cancelación visible para pedido pendiente
   * Given: tengo un pedido en estado "pending"
   * When: accedo a la página de seguimiento de mi pedido
   * Then: debo ver la opción para cancelar el pedido
   * And: la opción debe estar habilitada y disponible para uso
   */
  test('TC-007.1: Muestra botón de cancelar habilitado cuando el estado es PENDING', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-pending-001',
          orderNumber: 'ORD-001',
          status: 'pending',
          customerName: 'Juan Pérez',
          customerEmail: 'juan@example.com',
          items: [
            { productId: '1', name: 'Hamburguesa', quantity: 1, price: 10 }
          ],
          total: 10,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-pending-001']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar que se cargue el pedido
    await waitFor(() => {
      expect(screen.getByText(/ORD-001/i)).toBeInTheDocument();
    });

    // Verificar que el botón de cancelar existe y está habilitado
    const cancelBtn = screen.getByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
  });

  /**
   * TC-007.2: Opción de cancelación visible para pedido recibido
   * Given: tengo un pedido en estado "received"
   * When: accedo a la página de seguimiento
   * Then: debo ver la opción para cancelar el pedido
   * And: la opción debe estar habilitada
   */
  test('TC-007.2: Muestra botón de cancelar habilitado cuando el estado es RECEIVED', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-received-002',
          orderNumber: 'ORD-002',
          status: 'received',
          customerName: 'María López',
          customerEmail: 'maria@example.com',
          items: [
            { productId: '2', name: 'Pizza', quantity: 1, price: 15 }
          ],
          total: 15,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-received-002']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-002/i)).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).not.toBeDisabled();
  });

  /**
   * TC-007.3: Opción de cancelación oculta para pedido en preparación
   * Given: tengo un pedido en estado "preparing"
   * When: accedo a la página de seguimiento
   * Then: la opción de cancelar no debe estar visible
   * And: debo ver un mensaje informativo indicando que el pedido está en preparación
   * And: debo ver el estado actual del pedido claramente
   */
  test('TC-007.3: NO muestra botón de cancelar cuando el estado es PREPARING y muestra mensaje informativo', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-preparing-003',
          orderNumber: 'ORD-003',
          status: 'preparing',
          customerName: 'Carlos Martínez',
          customerEmail: 'carlos@example.com',
          items: [
            { productId: '3', name: 'Pasta', quantity: 2, price: 12 }
          ],
          total: 24,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-preparing-003']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-003/i)).toBeInTheDocument();
    });

    // Verificar que el botón de cancelar NO existe
    const cancelBtn = screen.queryByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).not.toBeInTheDocument();

    // Verificar que existe mensaje informativo específico sobre restricción
    const infoMessage = screen.getByText(/no puedes cancelar.*preparado.*cocina/i);
    expect(infoMessage).toBeInTheDocument();
  });

  /**
   * TC-007.4: Opción de cancelación no disponible para pedido listo
   * Given: tengo un pedido en estado "ready"
   * When: visualizo el seguimiento del pedido
   * Then: no debe aparecer ninguna opción de cancelación
   * And: debo ver un mensaje indicando que el pedido está listo para recoger
   * And: debo ver el estado "Listo" claramente
   */
  test('TC-007.4: NO muestra botón de cancelar cuando el estado es READY y muestra mensaje informativo', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-ready-004',
          orderNumber: 'ORD-004',
          status: 'ready',
          customerName: 'Ana García',
          customerEmail: 'ana@example.com',
          items: [
            { productId: '4', name: 'Ensalada', quantity: 1, price: 8 }
          ],
          total: 8,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-ready-004']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-004/i)).toBeInTheDocument();
    });

    // Verificar que el botón de cancelar NO existe
    const cancelBtn = screen.queryByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).not.toBeInTheDocument();

    // Verificar que existe mensaje informativo específico sobre restricción
    const infoMessage = screen.getByText(/no puedes cancelar.*listo.*recoger/i);
    expect(infoMessage).toBeInTheDocument();
  });

  /**
   * TC-007.5: Opción de cancelación no disponible para pedido completado
   * Given: tengo un pedido en estado "completed"
   * When: visualizo el seguimiento del pedido
   * Then: no debe aparecer ninguna opción de cancelación
   * And: debo ver un mensaje indicando que el pedido está completado
   */
  test('TC-007.5: NO muestra botón de cancelar cuando el estado es COMPLETED y muestra mensaje informativo', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-completed-005',
          orderNumber: 'ORD-005',
          status: 'completed',
          customerName: 'Pedro Sánchez',
          customerEmail: 'pedro@example.com',
          items: [
            { productId: '5', name: 'Bebida', quantity: 2, price: 3 }
          ],
          total: 6,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-completed-005']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-005/i)).toBeInTheDocument();
    });

    // Verificar que el botón de cancelar NO existe
    const cancelBtn = screen.queryByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).not.toBeInTheDocument();

    // Verificar que existe mensaje informativo específico sobre restricción
    const infoMessage = screen.getByText(/completado.*no puede cancelarse/i);
    expect(infoMessage).toBeInTheDocument();
  });

  /**
   * TC-007.6: Pedido ya cancelado no muestra botón ni mensajes
   * Given: tengo un pedido en estado "cancelled"
   * When: visualizo el seguimiento
   * Then: no debe aparecer ni el botón ni los mensajes informativos
   */
  test('TC-007.6: NO muestra botón ni mensajes cuando el pedido ya está CANCELLED', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-cancelled-006',
          orderNumber: 'ORD-006',
          status: 'cancelled',
          customerName: 'Laura Fernández',
          customerEmail: 'laura@example.com',
          items: [
            { productId: '6', name: 'Postre', quantity: 1, price: 5 }
          ],
          total: 5,
          createdAt: new Date().toISOString(),
          cancelledAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-cancelled-006']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-006/i)).toBeInTheDocument();
    });

    // Verificar que el botón de cancelar NO existe
    const cancelBtn = screen.queryByRole('button', { name: /cancelar.*pedido/i });
    expect(cancelBtn).not.toBeInTheDocument();

    // Verificar que tampoco aparecen los mensajes informativos de restricción
    const infoMessagePreparing = screen.queryByText(/no puedes cancelar.*preparado/i);
    const infoMessageReady = screen.queryByText(/no puedes cancelar.*listo/i);
    const infoMessageCompleted = screen.queryByText(/completado.*no puede cancelarse/i);
    
    expect(infoMessagePreparing).not.toBeInTheDocument();
    expect(infoMessageReady).not.toBeInTheDocument();
    expect(infoMessageCompleted).not.toBeInTheDocument();
  });

  /**
   * TC-007.7: Validación de accesibilidad del botón de cancelar
   * Given: veo el botón de cancelar en un pedido pendiente
   * When: inspecciono los atributos de accesibilidad
   * Then: debe tener aria-label descriptivo
   */
  test('TC-007.7: Botón de cancelar tiene atributos de accesibilidad (aria-label)', async () => {
    server.use(
      rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
        return res(ctx.json({
          orderId: 'test-a11y-007',
          orderNumber: 'ORD-007',
          status: 'pending',
          customerName: 'Usuario Test',
          customerEmail: 'test@example.com',
          items: [
            { productId: '1', name: 'Item', quantity: 1, price: 10 }
          ],
          total: 10,
          createdAt: new Date().toISOString()
        }));
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/test-a11y-007']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-007/i)).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /cancelar.*pedido/i });
    
    // Verificar que tiene aria-label
    expect(cancelBtn).toHaveAttribute('aria-label');
    expect(cancelBtn.getAttribute('aria-label')).toBeTruthy();
  });
});
