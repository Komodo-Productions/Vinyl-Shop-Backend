const OrderHeaderService = require('../services/orderHeaderService');

class OrderHeaderController {
    static async getAll(req, res) {
        try {
            const orders = await OrderHeaderService.getAllOrders();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const order = await OrderHeaderService.getOrderById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json(order);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getByCustomerId(req, res) {
        try {
            const orders = await OrderHeaderService.getOrdersByCustomerId(req.params.customerId);
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getByStatus(req, res) {
        try {
            const orders = await OrderHeaderService.getOrdersByStatus(req.params.status);
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Start date and end date are required as query parameters' 
                });
            }
            
            const orders = await OrderHeaderService.getOrdersByDateRange(startDate, endDate);
            res.json(orders);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const newOrder = {
                customer_id: req.body.customer_id,
                total: req.body.total,
                order_date: req.body.order_date,
                status: req.body.status,
                notes: req.body.notes
            };

            const createdOrder = await OrderHeaderService.createOrder(newOrder);
            res.status(201).json({ 
                message: 'Order created successfully', 
                data: createdOrder 
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { customer_id, total, order_date, status, notes } = req.body;

            const updatedOrder = await OrderHeaderService.updateOrder(id, {
                customer_id,
                total,
                order_date,
                status,
                notes
            });

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({ 
                message: 'Order updated successfully', 
                data: updatedOrder 
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedOrder = await OrderHeaderService.deleteOrder(id);

            if (!deletedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.json({ 
                message: 'Order deleted successfully', 
                data: deletedOrder 
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getStats(req, res) {
        try {
            const stats = await OrderHeaderService.getOrderStats();
            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getCustomerTotals(req, res) {
        try {
            const { customerId } = req.params;
            const totals = await OrderHeaderService.getCustomerTotals(customerId);
            res.json(totals);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getMonthlyStats(req, res) {
        try {
            const { year } = req.params;
            const stats = await OrderHeaderService.getMonthlyStats(year);
            res.json(stats);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = OrderHeaderController;