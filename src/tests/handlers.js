import { rest } from 'msw';

// URL base del API para mocks de MSW
const API_BASE = process.env.VITE_API_URL;

export const handlers = [
  // GET /orders/:orderId -> devuelve pedido en estado "pending" por defecto
  rest.get(`${API_BASE}/orders/:orderId`, (req, res, ctx) => {
    const { orderId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        orderId,
        orderNumber: '0001',
        customerName: 'Test User',
        status: 'pending',
        items: [
          { name: 'Cheeseburger', quantity: 1, price: 20000 }
        ],
        createdAt: new Date().toISOString()
      })
    );
  }),

  // POST /orders/:orderId/cancel -> simula cancelación exitosa
  rest.post(`${API_BASE}/orders/:orderId/cancel`, (req, res, ctx) => {
    const { orderId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        orderId,
        orderNumber: '0001',
        customerName: 'Test User',
        status: 'cancelled',
        items: [
          { name: 'Cheeseburger', quantity: 1, price: 20000 }
        ],
        createdAt: new Date().toISOString()
      })
    );
  }),

  // GET /kitchen/orders -> handler genérico para vistas de cocina
  rest.get(`${API_BASE}/kitchen/orders`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([])
    );
  }),
];
