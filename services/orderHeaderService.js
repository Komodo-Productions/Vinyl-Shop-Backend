const OrderHeaderModel = require('../models/orderHeaderModel');

class OrderHeaderService {
    static async getAllOrders() {
        try {
            return await OrderHeaderModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching orders: ${error.message}`);
        }
    }

    static async getOrderById(id) {
        try {
            if (!id) {
                throw new Error('Order ID is required');
            }
            
            const order = await OrderHeaderModel.findById(id);
            return order || null;
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`);
        }
    }

    static async getOrdersByCustomerId(customerId) {
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }
            
            return await OrderHeaderModel.findByCustomerId(customerId);
        } catch (error) {
            throw new Error(`Error fetching orders by customer: ${error.message}`);
        }
    }

    static async getOrdersByStatus(status) {
        try {
            if (!status) {
                throw new Error('Status is required');
            }
            
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid order status');
            }
            
            return await OrderHeaderModel.findByStatus(status);
        } catch (error) {
            throw new Error(`Error fetching orders by status: ${error.message}`);
        }
    }

    static async getOrdersByDateRange(startDate, endDate) {
        try {
            if (!startDate || !endDate) {
                throw new Error('Start date and end date are required');
            }
            
            return await OrderHeaderModel.findByDateRange(startDate, endDate);
        } catch (error) {
            throw new Error(`Error fetching orders by date range: ${error.message}`);
        }
    }

    static async createOrder({ customer_id, total, order_date, status, notes }) {
        try {
            // Validate required fields
            if (customer_id === undefined || customer_id === null || total === undefined || total === null) {
                throw new Error('Customer ID and total are required fields');
            }


            // Validate customer_id is a number
            if (isNaN(Number(customer_id))) {
                throw new Error('Customer ID must be a valid number');
            }

            // Validate total
            if (total <= 0) {
                throw new Error('Total must be greater than 0');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    throw new Error('Invalid order status');
                }
            }

            // Set default order date if not provided
            const orderData = {
                customer_id: Number(customer_id),
                total: Number(total),
                order_date: order_date || new Date().toISOString().split('T')[0],
                status: status || 'pending',
                notes: notes || null
            };

            const createdOrder = await OrderHeaderModel.create(orderData);
            return createdOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    static async updateOrder(id, { customer_id, total, order_date, status, notes }) {
        try {
            if (!id) {
                throw new Error('Order ID is required for update');
            }
            
            // Check if order exists
            const existingOrder = await OrderHeaderModel.findById(id);
            if (!existingOrder) {
                return null;
            }

            // Validate total if provided
            if (total !== undefined && total <= 0) {
                throw new Error('Total must be greater than 0');
            }

            // Validate customer_id if provided
            if (customer_id !== undefined && isNaN(Number(customer_id))) {
                throw new Error('Customer ID must be a valid number');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    throw new Error('Invalid order status');
                }
            }

            const updateData = {};
            if (customer_id !== undefined) updateData.customer_id = Number(customer_id);
            if (total !== undefined) updateData.total = Number(total);
            if (order_date !== undefined) updateData.order_date = order_date;
            if (status !== undefined) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;

            const updated = await OrderHeaderModel.update(id, updateData);
            if (!updated) {
                throw new Error('Failed to update order');
            }

            return await OrderHeaderModel.findById(id);
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`);
        }
    }

    static async deleteOrder(id) {
        try {
            if (!id) {
                throw new Error('Order ID is required for delete');
            }
            
            const existingOrder = await OrderHeaderModel.findById(id);
            if (!existingOrder) {
                return null;
            }
            
            const deleted = await OrderHeaderModel.softDelete(id);
            if (!deleted) {
                throw new Error('Failed to delete order');
            }
            
            return existingOrder;
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`);
        }
    }

    static async getOrderStats() {
        try {
            return await OrderHeaderModel.getTotalsByStatus();
        } catch (error) {
            throw new Error(`Error getting order statistics: ${error.message}`);
        }
    }

    static async getCustomerTotals(customerId) {
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }
            
            if (isNaN(Number(customerId))) {
                throw new Error('Customer ID must be a valid number');
            }
            
            return await OrderHeaderModel.getTotalsByCustomer(Number(customerId));
        } catch (error) {
            throw new Error(`Error getting customer totals: ${error.message}`);
        }
    }

    static async getMonthlyStats(year) {
        try {
            if (!year) {
                throw new Error('Year is required');
            }
            
            if (isNaN(Number(year)) || year < 2000 || year > 2100) {
                throw new Error('Invalid year provided');
            }
            
            return await OrderHeaderModel.getMonthlyStats(Number(year));
        } catch (error) {
            throw new Error(`Error getting monthly statistics: ${error.message}`);
        }
    }
}

module.exports = OrderHeaderService;