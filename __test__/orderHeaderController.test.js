const OrderHeaderController = require('../controllers/orderHeaderController');
const OrderHeaderService = require('../services/orderHeaderService');

jest.mock('../services/orderHeaderService');

describe('OrderHeaderController', () => {
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

    describe('getAll', () => {
        it('should return all orders successfully', async () => {
            const mockOrders = [
                { id: 1, customer_id: 1, total: 100, status: 'pending' },
                { id: 2, customer_id: 2, total: 200, status: 'completed' }
            ];
            OrderHeaderService.getAllOrders.mockResolvedValue(mockOrders);

            await OrderHeaderController.getAll(req, res);

            expect(OrderHeaderService.getAllOrders).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle errors when getting all orders fails', async () => {
            const errorMessage = 'Database connection failed';
            OrderHeaderService.getAllOrders.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getAll(req, res);

            expect(OrderHeaderService.getAllOrders).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getById', () => {
        it('should return order by id successfully', async () => {
            const orderId = '1';
            const mockOrder = { id: 1, customer_id: 1, total: 100, status: 'pending' };
            req.params.id = orderId;
            OrderHeaderService.getOrderById.mockResolvedValue(mockOrder);

            await OrderHeaderController.getById(req, res);

            expect(OrderHeaderService.getOrderById).toHaveBeenCalledWith(orderId);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when order is not found', async () => {
            const orderId = '999';
            req.params.id = orderId;
            OrderHeaderService.getOrderById.mockResolvedValue(null);

            await OrderHeaderController.getById(req, res);

            expect(OrderHeaderService.getOrderById).toHaveBeenCalledWith(orderId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
        });

        it('should handle errors when getting order by id fails', async () => {
            const orderId = '1';
            const errorMessage = 'Database error';
            req.params.id = orderId;
            OrderHeaderService.getOrderById.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getByCustomerId', () => {
        it('should return orders by customer id successfully', async () => {
            const customerId = '1';
            const mockOrders = [
                { id: 1, customer_id: 1, total: 100 },
                { id: 2, customer_id: 1, total: 200 }
            ];
            req.params.customerId = customerId;
            OrderHeaderService.getOrdersByCustomerId.mockResolvedValue(mockOrders);

            await OrderHeaderController.getByCustomerId(req, res);

            expect(OrderHeaderService.getOrdersByCustomerId).toHaveBeenCalledWith(customerId);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should handle errors when getting orders by customer id fails', async () => {
            const customerId = '1';
            const errorMessage = 'Database error';
            req.params.customerId = customerId;
            OrderHeaderService.getOrdersByCustomerId.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getByCustomerId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getByStatus', () => {
        it('should return orders by status successfully', async () => {
            const status = 'pending';
            const mockOrders = [
                { id: 1, status: 'pending', total: 100 },
                { id: 2, status: 'pending', total: 200 }
            ];
            req.params.status = status;
            OrderHeaderService.getOrdersByStatus.mockResolvedValue(mockOrders);

            await OrderHeaderController.getByStatus(req, res);

            expect(OrderHeaderService.getOrdersByStatus).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should handle errors when getting orders by status fails', async () => {
            const status = 'pending';
            const errorMessage = 'Database error';
            req.params.status = status;
            OrderHeaderService.getOrdersByStatus.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getByStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getByDateRange', () => {
        it('should return orders by date range successfully', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            const mockOrders = [
                { id: 1, order_date: '2024-01-15', total: 100 }
            ];
            req.query.startDate = startDate;
            req.query.endDate = endDate;
            OrderHeaderService.getOrdersByDateRange.mockResolvedValue(mockOrders);

            await OrderHeaderController.getByDateRange(req, res);

            expect(OrderHeaderService.getOrdersByDateRange).toHaveBeenCalledWith(startDate, endDate);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should return 400 when start date is missing', async () => {
            req.query.endDate = '2024-01-31';

            await OrderHeaderController.getByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Start date and end date are required as query parameters' 
            });
            expect(OrderHeaderService.getOrdersByDateRange).not.toHaveBeenCalled();
        });

        it('should return 400 when end date is missing', async () => {
            req.query.startDate = '2024-01-01';

            await OrderHeaderController.getByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Start date and end date are required as query parameters' 
            });
            expect(OrderHeaderService.getOrdersByDateRange).not.toHaveBeenCalled();
        });

        it('should handle errors when getting orders by date range fails', async () => {
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            const errorMessage = 'Database error';
            req.query.startDate = startDate;
            req.query.endDate = endDate;
            OrderHeaderService.getOrdersByDateRange.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getByDateRange(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('create', () => {
        it('should create order successfully', async () => {
            const newOrderData = {
                customer_id: 1,
                total: 150,
                order_date: '2024-01-15',
                status: 'pending',
                notes: 'Test order'
            };
            const createdOrder = { id: 1, ...newOrderData };
            req.body = newOrderData;
            OrderHeaderService.createOrder.mockResolvedValue(createdOrder);

            await OrderHeaderController.create(req, res);

            expect(OrderHeaderService.createOrder).toHaveBeenCalledWith(newOrderData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Order created successfully',
                data: createdOrder
            });
        });

        it('should handle validation errors when creating order', async () => {
            const invalidOrderData = {
                customer_id: null,
                total: -100
            };
            const errorMessage = 'Customer ID is required';
            req.body = invalidOrderData;
            OrderHeaderService.createOrder.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.create(req, res);

            expect(OrderHeaderService.createOrder).toHaveBeenCalledWith(invalidOrderData);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('update', () => {
        it('should update order successfully', async () => {
            const orderId = '1';
            const updateData = {
                customer_id: 1,
                total: 250,
                order_date: '2024-01-20',
                status: 'completed',
                notes: 'Updated order'
            };
            const updatedOrder = { id: 1, ...updateData };
            req.params.id = orderId;
            req.body = updateData;
            OrderHeaderService.updateOrder.mockResolvedValue(updatedOrder);

            await OrderHeaderController.update(req, res);

            expect(OrderHeaderService.updateOrder).toHaveBeenCalledWith(orderId, updateData);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Order updated successfully',
                data: updatedOrder
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when updating non-existent order', async () => {
            const orderId = '999';
            const updateData = {
                total: 250
            };
            req.params.id = orderId;
            req.body = updateData;
            OrderHeaderService.updateOrder.mockResolvedValue(null);

            await OrderHeaderController.update(req, res);

            expect(OrderHeaderService.updateOrder).toHaveBeenCalledWith(orderId, updateData);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
        });

        it('should handle validation errors when updating order', async () => {
            const orderId = '1';
            const invalidUpdateData = {
                total: -100
            };
            const errorMessage = 'Total must be greater than 0';
            req.params.id = orderId;
            req.body = invalidUpdateData;
            OrderHeaderService.updateOrder.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('delete', () => {
        it('should delete order successfully', async () => {
            const orderId = '1';
            const deletedOrder = { id: 1, customer_id: 1, total: 100 };
            req.params.id = orderId;
            OrderHeaderService.deleteOrder.mockResolvedValue(deletedOrder);

            await OrderHeaderController.delete(req, res);

            expect(OrderHeaderService.deleteOrder).toHaveBeenCalledWith(orderId);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Order deleted successfully',
                data: deletedOrder
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when deleting non-existent order', async () => {
            const orderId = '999';
            req.params.id = orderId;
            OrderHeaderService.deleteOrder.mockResolvedValue(null);

            await OrderHeaderController.delete(req, res);

            expect(OrderHeaderService.deleteOrder).toHaveBeenCalledWith(orderId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Order not found' });
        });

        it('should handle errors when deleting order fails', async () => {
            const orderId = '1';
            const errorMessage = 'Database error';
            req.params.id = orderId;
            OrderHeaderService.deleteOrder.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getStats', () => {
        it('should return order statistics successfully', async () => {
            const mockStats = {
                total_orders: 100,
                total_revenue: 10000,
                average_order_value: 100
            };
            OrderHeaderService.getOrderStats.mockResolvedValue(mockStats);

            await OrderHeaderController.getStats(req, res);

            expect(OrderHeaderService.getOrderStats).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockStats);
        });

        it('should handle errors when getting stats fails', async () => {
            const errorMessage = 'Database error';
            OrderHeaderService.getOrderStats.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getCustomerTotals', () => {
        it('should return customer totals successfully', async () => {
            const customerId = '1';
            const mockTotals = {
                customer_id: 1,
                total_orders: 10,
                total_spent: 1000
            };
            req.params.customerId = customerId;
            OrderHeaderService.getCustomerTotals.mockResolvedValue(mockTotals);

            await OrderHeaderController.getCustomerTotals(req, res);

            expect(OrderHeaderService.getCustomerTotals).toHaveBeenCalledWith(customerId);
            expect(res.json).toHaveBeenCalledWith(mockTotals);
        });

        it('should handle errors when getting customer totals fails', async () => {
            const customerId = '1';
            const errorMessage = 'Database error';
            req.params.customerId = customerId;
            OrderHeaderService.getCustomerTotals.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getCustomerTotals(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getMonthlyStats', () => {
        it('should return monthly statistics successfully', async () => {
            const year = '2024';
            const mockStats = [
                { month: 1, total_orders: 10, total_revenue: 1000 },
                { month: 2, total_orders: 15, total_revenue: 1500 }
            ];
            req.params.year = year;
            OrderHeaderService.getMonthlyStats.mockResolvedValue(mockStats);

            await OrderHeaderController.getMonthlyStats(req, res);

            expect(OrderHeaderService.getMonthlyStats).toHaveBeenCalledWith(year);
            expect(res.json).toHaveBeenCalledWith(mockStats);
        });

        it('should handle errors when getting monthly stats fails', async () => {
            const year = '2024';
            const errorMessage = 'Database error';
            req.params.year = year;
            OrderHeaderService.getMonthlyStats.mockRejectedValue(new Error(errorMessage));

            await OrderHeaderController.getMonthlyStats(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });
});