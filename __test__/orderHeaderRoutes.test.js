const request = require('supertest');
const express = require('express');
const orderHeaderRoutes = require('../routes/orderHeaderRoutes');
const OrderHeaderService = require('../services/orderHeaderService');

// Crear una app de Express solo para las rutas de prueba
const app = express();
app.use(express.json());
app.use('/orders', orderHeaderRoutes);

// Mockear el servicio para evitar acceso real a DB
jest.mock('../services/orderHeaderService');

describe('OrderHeader Routes', () => {

  // --- GET /orders ---
  describe('GET /orders', () => {
    it('debería devolver todas las órdenes', async () => {
      const mockOrders = [
        { id: 1, customer_id: 5, total: 100 },
        { id: 2, customer_id: 6, total: 200 },
      ];

      OrderHeaderService.getAllOrders.mockResolvedValue(mockOrders);

      const res = await request(app).get('/orders');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockOrders);
      expect(OrderHeaderService.getAllOrders).toHaveBeenCalled();
    });

    it('debería devolver error 500 si el servicio lanza una excepción', async () => {
      OrderHeaderService.getAllOrders.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/orders');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'DB error');
    });
  });

  // --- GET /orders/:id ---
  describe('GET /orders/:id', () => {
    it('debería devolver una orden por ID', async () => {
      const mockOrder = { id: 1, customer_id: 5, total: 150 };

      OrderHeaderService.getOrderById.mockResolvedValue(mockOrder);

      const res = await request(app).get('/orders/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockOrder);
    });

    it('debería devolver 404 si no se encuentra la orden', async () => {
      OrderHeaderService.getOrderById.mockResolvedValue(null);

      const res = await request(app).get('/orders/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });

  // --- POST /orders ---
  describe('POST /orders', () => {
    it('debería crear una nueva orden', async () => {
      const newOrder = {
        customer_id: 10,
        total: 250,
        order_date: '2025-10-01',
        status: 'Pending',
        notes: 'Test note'
      };

      const createdOrder = { id: 1, ...newOrder };

      OrderHeaderService.createOrder.mockResolvedValue(createdOrder);

      const res = await request(app)
        .post('/orders')
        .send(newOrder);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Order created successfully');
      expect(res.body.data).toEqual(createdOrder);
    });

    it('debería devolver 400 si ocurre un error al crear', async () => {
      OrderHeaderService.createOrder.mockRejectedValue(new Error('Invalid data'));

      const res = await request(app)
        .post('/orders')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid data');
    });
  });

  // --- PUT /orders/:id ---
  describe('PUT /orders/:id', () => {
    it('debería actualizar una orden existente', async () => {
      const updatedOrder = { id: 1, total: 300, status: 'Completed' };
      OrderHeaderService.updateOrder.mockResolvedValue(updatedOrder);

      const res = await request(app)
        .put('/orders/1')
        .send(updatedOrder);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Order updated successfully');
      expect(res.body.data).toEqual(updatedOrder);
    });

    it('debería devolver 404 si no existe la orden', async () => {
      OrderHeaderService.updateOrder.mockResolvedValue(null);

      const res = await request(app)
        .put('/orders/999')
        .send({ total: 100 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });

  // --- DELETE /orders/:id ---
  describe('DELETE /orders/:id', () => {
    it('debería eliminar una orden existente', async () => {
      const deletedOrder = { id: 1, message: 'deleted' };
      OrderHeaderService.deleteOrder.mockResolvedValue(deletedOrder);

      const res = await request(app).delete('/orders/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Order deleted successfully');
      expect(res.body.data).toEqual(deletedOrder);
    });

    it('debería devolver 404 si no se encuentra la orden', async () => {
      OrderHeaderService.deleteOrder.mockResolvedValue(null);

      const res = await request(app).delete('/orders/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Order not found');
    });
  });
});

