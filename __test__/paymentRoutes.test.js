const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../routes/paymentRoutes');
const paymentController = require('../controllers/paymentController');

jest.mock('../controllers/paymentController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/payments', paymentRoutes);

describe('Payment Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should call paymentController.getAll and return payments successfully', async () => {
            const mockPayments = [
                { id: 1, order_id: 1, method: 'cash', amount: 100 },
                { id: 2, order_id: 2, method: 'credit_card', amount: 200 }
            ];

            paymentController.getAll.mockImplementation((req, res) => {
                res.json(mockPayments);
            });

            const response = await request(app)
                .get('/payments')
                .expect(200);

            expect(paymentController.getAll).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockPayments);
        });

        it('should handle errors when paymentController.getAll fails', async () => {
            const errorMessage = 'Database connection failed';
            
            paymentController.getAll.mockImplementation((req, res) => {
                res.status(500).json({ error: errorMessage });
            });

            const response = await request(app)
                .get('/payments')
                .expect(500);

            expect(paymentController.getAll).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('GET /:id', () => {
        it('should call paymentController.getById and return payment successfully', async () => {
            const paymentId = '1';
            const mockPayment = { id: 1, order_id: 1, method: 'cash', amount: 100 };

            paymentController.getById.mockImplementation((req, res) => {
                res.json(mockPayment);
            });

            const response = await request(app)
                .get(`/payments/${paymentId}`)
                .expect(200);

            expect(paymentController.getById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockPayment);
        });

        it('should handle payment not found error', async () => {
            const paymentId = '999';
            const errorMessage = 'Payment not found';

            paymentController.getById.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .get(`/payments/${paymentId}`)
                .expect(404);

            expect(paymentController.getById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('POST /', () => {
        it('should call paymentController.create and create payment successfully', async () => {
            const newPaymentData = {
                order_id: 1,
                method: 'cash',
                amount: 150,
                status: 'completed'
            };
            const createdPayment = { id: 1, ...newPaymentData };
            const successResponse = {
                message: 'Payment created successfully',
                data: createdPayment
            };

            paymentController.create.mockImplementation((req, res) => {
                res.status(201).json(successResponse);
            });

            const response = await request(app)
                .post('/payments')
                .send(newPaymentData)
                .expect(201);

            expect(paymentController.create).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle validation errors when creating payment', async () => {
            const invalidPaymentData = {
                order_id: 1,
                method: 'invalid_method',
                amount: -50
            };
            const errorMessage = 'Invalid payment method';

            paymentController.create.mockImplementation((req, res) => {
                res.status(400).json({ error: errorMessage });
            });

            const response = await request(app)
                .post('/payments')
                .send(invalidPaymentData)
                .expect(400);

            expect(paymentController.create).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('PUT /:id', () => {
        it('should call paymentController.update and update payment successfully', async () => {
            const paymentId = '1';
            const updateData = {
                amount: 250,
                status: 'completed'
            };
            const updatedPayment = { id: 1, order_id: 1, method: 'cash', ...updateData };
            const successResponse = {
                message: 'Payment updated successfully',
                data: updatedPayment
            };

            paymentController.update.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .put(`/payments/${paymentId}`)
                .send(updateData)
                .expect(200);

            expect(paymentController.update).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle payment not found when updating', async () => {
            const paymentId = '999';
            const updateData = {
                amount: 250
            };
            const errorMessage = 'Payment not found';

            paymentController.update.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .put(`/payments/${paymentId}`)
                .send(updateData)
                .expect(404);

            expect(paymentController.update).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('DELETE /:id', () => {
        it('should call paymentController.delete and delete payment successfully', async () => {
            const paymentId = '1';
            const deletedPayment = { id: 1, order_id: 1, method: 'cash', amount: 100 };
            const successResponse = {
                message: 'Payment deleted successfully',
                data: deletedPayment
            };

            paymentController.delete.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .delete(`/payments/${paymentId}`)
                .expect(200);

            expect(paymentController.delete).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle payment not found when deleting', async () => {
            const paymentId = '999';
            const errorMessage = 'Payment not found';

            paymentController.delete.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .delete(`/payments/${paymentId}`)
                .expect(404);

            expect(paymentController.delete).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('Route Integration', () => {
        it('should pass correct request parameters to controller methods', async () => {
            const paymentId = '123';
            paymentController.getById.mockImplementation((req, res) => {
                expect(req.params.id).toBe(paymentId);
                res.json({ id: paymentId });
            });

            await request(app)
                .get(`/payments/${paymentId}`)
                .expect(200);

            expect(paymentController.getById).toHaveBeenCalledTimes(1);
        });

        it('should pass correct request body to controller methods', async () => {
            const paymentData = {
                order_id: 1,
                method: 'cash',
                amount: 100
            };

            paymentController.create.mockImplementation((req, res) => {
                expect(req.body).toEqual(paymentData);
                res.status(201).json({ message: 'Payment created successfully' });
            });

            await request(app)
                .post('/payments')
                .send(paymentData)
                .expect(201);

            expect(paymentController.create).toHaveBeenCalledTimes(1);
        });
    });
});