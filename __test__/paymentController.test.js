// tests/paymentController.test.js
const PaymentController = require('../controllers/paymentController');
const PaymentService = require('../services/paymentService');

// Mock the PaymentService module
jest.mock('../services/paymentService');

describe('PaymentController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            query: {}
        };

        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('create', () => {
        it('should create payment successfully', async () => {
            const newPayment = { amount: 100, status: 'pending' };
            const createdPayment = { id: 1, ...newPayment };
            req.body = newPayment;
            PaymentService.createPayment.mockResolvedValue(createdPayment);

            await PaymentController.create(req, res);

            expect(PaymentService.createPayment).toHaveBeenCalledWith(newPayment);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment created successfully',
                data: createdPayment
            });
        });

        it('should handle errors when creating payment', async () => {
            const errorMessage = 'Invalid payment data';
            req.body = { amount: -100 };
            PaymentService.createPayment.mockRejectedValue(new Error(errorMessage));

            await PaymentController.create(req, res);

            expect(PaymentService.createPayment).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getAll', () => {
        it('should return all payments successfully', async () => {
            const mockPayments = [
                { id: 1, amount: 100, status: 'completed' },
                { id: 2, amount: 200, status: 'pending' }
            ];
            PaymentService.getAllPayments.mockResolvedValue(mockPayments);

            await PaymentController.getAll(req, res);

            expect(PaymentService.getAllPayments).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPayments
            });
        });

        it('should handle errors when fetching all payments', async () => {
            const errorMessage = 'Database error';
            PaymentService.getAllPayments.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getById', () => {
        it('should return a payment by id successfully', async () => {
            const id = '1';
            const mockPayment = { id: 1, amount: 150, status: 'completed' };
            req.params.id = id;
            PaymentService.getPaymentById.mockResolvedValue(mockPayment);

            await PaymentController.getById(req, res);

            expect(PaymentService.getPaymentById).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPayment
            });
        });

        it('should return 404 when payment is not found', async () => {
            req.params.id = '999';
            PaymentService.getPaymentById.mockResolvedValue(null);

            await PaymentController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(300);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Payment not found'
            });
        });

        it('should handle errors when getting payment by id fails', async () => {
            const errorMessage = 'Database error';
            req.params.id = '1';
            PaymentService.getPaymentById.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('update', () => {
        it('should update payment successfully', async () => {
            const id = '1';
            const updateData = { status: 'completed' };
            const updatedPayment = { id: 1, amount: 100, status: 'completed' };
            req.params.id = id;
            req.body = updateData;
            PaymentService.updatePayment.mockResolvedValue(updatedPayment);

            await PaymentController.update(req, res);

            expect(PaymentService.updatePayment).toHaveBeenCalledWith(id, updateData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment updated successfully',
                data: updatedPayment
            });
        });

        it('should return 404 when updating non-existent payment', async () => {
            const id = '999';
            req.params.id = id;
            req.body = { status: 'completed' };
            PaymentService.updatePayment.mockResolvedValue(null);

            await PaymentController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Payment not found'
            });
        });

        it('should handle errors when updating payment fails', async () => {
            const errorMessage = 'Invalid update data';
            req.params.id = '1';
            req.body = { status: 'invalid' };
            PaymentService.updatePayment.mockRejectedValue(new Error(errorMessage));

            await PaymentController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('delete', () => {
        it('should delete payment successfully', async () => {
            const id = '1';
            const deletedPayment = { id: 1, amount: 100, status: 'deleted' };
            req.params.id = id;
            PaymentService.deletePayment.mockResolvedValue(deletedPayment);

            await PaymentController.delete(req, res);

            expect(PaymentService.deletePayment).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment deleted successfully (soft delete)',
                data: deletedPayment
            });
        });

        it('should return 404 when deleting non-existent payment', async () => {
            req.params.id = '999';
            PaymentService.deletePayment.mockResolvedValue(null);

            await PaymentController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Payment not found'
            });
        });

        it('should handle errors when deleting payment fails', async () => {
            const errorMessage = 'Database error';
            req.params.id = '1';
            PaymentService.deletePayment.mockRejectedValue(new Error(errorMessage));

            await PaymentController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getByOrderId', () => {
        it('should return payments by order id successfully', async () => {
            const orderId = '5';
            const mockPayments = [
                { id: 1, order_id: 5, amount: 100 },
                { id: 2, order_id: 5, amount: 200 }
            ];
            req.params.orderId = orderId;
            PaymentService.getPaymentsByOrderId.mockResolvedValue(mockPayments);

            await PaymentController.getByOrderId(req, res);

            expect(PaymentService.getPaymentsByOrderId).toHaveBeenCalledWith(orderId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPayments
            });
        });

        it('should handle errors when getting payments by order id fails', async () => {
            const errorMessage = 'Order ID is required';
            req.params.orderId = null;
            PaymentService.getPaymentsByOrderId.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getByOrderId(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getByStatus', () => {
        it('should return payments by status successfully', async () => {
            const status = 'completed';
            const mockPayments = [
                { id: 1, status: 'completed', amount: 100 },
                { id: 2, status: 'completed', amount: 200 }
            ];
            req.params.status = status;
            PaymentService.getPaymentsByStatus.mockResolvedValue(mockPayments);

            await PaymentController.getByStatus(req, res);

            expect(PaymentService.getPaymentsByStatus).toHaveBeenCalledWith(status);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPayments
            });
        });

        it('should handle errors when getting payments by status fails', async () => {
            const errorMessage = 'Invalid payment status';
            req.params.status = 'invalid_status';
            PaymentService.getPaymentsByStatus.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getByDateRange', () => {
        it('should return payments by date range successfully', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            const mockPayments = [
                { id: 1, payment_date: '2024-01-15', amount: 100 }
            ];
            req.query.startDate = startDate;
            req.query.endDate = endDate;
            PaymentService.getPaymentsByDateRange.mockResolvedValue(mockPayments);

            await PaymentController.getByDateRange(req, res);

            expect(PaymentService.getPaymentsByDateRange).toHaveBeenCalledWith(startDate, endDate);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockPayments
            });
        });

        it('should handle errors when getting payments by date range fails', async () => {
            const errorMessage = 'Start date and end date are required';
            req.query.startDate = null;
            req.query.endDate = '2024-01-31';
            PaymentService.getPaymentsByDateRange.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getSummary', () => {
        it('should return payment summary successfully', async () => {
            const mockSummary = {
                total: 1000,
                completed: 5,
                pending: 3
            };
            PaymentService.getPaymentSummary.mockResolvedValue(mockSummary);

            await PaymentController.getSummary(req, res);

            expect(PaymentService.getPaymentSummary).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSummary
            });
        });

        it('should handle errors when getting summary fails', async () => {
            const errorMessage = 'Database error';
            PaymentService.getPaymentSummary.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getSummary(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });

    describe('getTotalByStatus', () => {
        it('should return total by status successfully', async () => {
            const status = 'completed';
            const mockTotal = 5000;
            req.params.status = status;
            PaymentService.getTotalByStatus.mockResolvedValue(mockTotal);

            await PaymentController.getTotalByStatus(req, res);

            expect(PaymentService.getTotalByStatus).toHaveBeenCalledWith(status);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    status,
                    total: mockTotal
                }
            });
        });

        it('should handle errors when getting total by status fails', async () => {
            const errorMessage = 'Invalid payment status';
            req.params.status = 'invalid_status';
            PaymentService.getTotalByStatus.mockRejectedValue(new Error(errorMessage));

            await PaymentController.getTotalByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: errorMessage
            });
        });
    });
});