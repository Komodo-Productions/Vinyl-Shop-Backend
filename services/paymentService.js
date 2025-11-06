// services/paymentService.js
const PaymentModel = require('../models/paymentModel');

class PaymentService {
    static async getAllPayments() {
        try {
            return await PaymentModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching payments: ${error.message}`);
        }
    }

    static async getPaymentById(id) {
        try {
            if (!id) {
                throw new Error('Payment ID is required');
            }
            
            const payment = await PaymentModel.findById(id);
            return payment || null;
        } catch (error) {
            throw new Error(`Error fetching payment: ${error.message}`);
        }
    }

    static async getPaymentsByOrderId(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }
            
            return await PaymentModel.findByOrderId(orderId);
        } catch (error) {
            throw new Error(`Error fetching payments by order: ${error.message}`);
        }
    }

    static async getPaymentsByStatus(status) {
        try {
            if (!status) {
                throw new Error('Status is required');
            }
            
            const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid payment status');
            }
            
            return await PaymentModel.findByStatus(status);
        } catch (error) {
            throw new Error(`Error fetching payments by status: ${error.message}`);
        }
    }

    static async getPaymentsByDateRange(startDate, endDate) {
        try {
            if (!startDate || !endDate) {
                throw new Error('Start date and end date are required');
            }
            
            return await PaymentModel.findByDateRange(startDate, endDate);
        } catch (error) {
            throw new Error(`Error fetching payments by date range: ${error.message}`);
        }
    }

    static async createPayment({ order_id, method, amount, payment_date, status }) {
        try {
            // Validate required fields
            if (!order_id || !method || !amount) {
                throw new Error('Order ID, method, and amount are required fields');
            }

            // Validate order_id is a number
            if (isNaN(Number(order_id))) {
                throw new Error('Order ID must be a valid number');
            }

            // Validate amount
            if (amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            // Validate payment method
            const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'check'];
            if (!validMethods.includes(method)) {
                throw new Error('Invalid payment method');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    throw new Error('Invalid payment status');
                }
            }

            // Set default payment date if not provided
            const paymentData = {
                order_id: Number(order_id),
                method,
                amount: Number(amount),
                payment_date: payment_date || new Date().toISOString().split('T')[0],
                status: status || 'pending'
            };

            const createdPayment = await PaymentModel.create(paymentData);
            return createdPayment;
        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

    static async updatePayment(id, { order_id, method, amount, payment_date, status }) {
        try {
            if (!id) {
                throw new Error('Payment ID is required for update');
            }
            
            // Check if payment exists
            const existingPayment = await PaymentModel.findById(id);
            if (!existingPayment) {
                return null;
            }

            // Validate amount if provided
            if (amount !== undefined && amount <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            // Validate order_id if provided
            if (order_id !== undefined && isNaN(Number(order_id))) {
                throw new Error('Order ID must be a valid number');
            }

            // Validate payment method if provided
            if (method) {
                const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'check'];
                if (!validMethods.includes(method)) {
                    throw new Error('Invalid payment method');
                }
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    throw new Error('Invalid payment status');
                }
            }

            const updateData = {};
            if (order_id !== undefined) updateData.order_id = Number(order_id);
            if (method !== undefined) updateData.method = method;
            if (amount !== undefined) updateData.amount = Number(amount);
            if (payment_date !== undefined) updateData.payment_date = payment_date;
            if (status !== undefined) updateData.status = status;

            const updated = await PaymentModel.update(id, updateData);
            if (!updated) {
                throw new Error('Failed to update payment');
            }

            return await PaymentModel.findById(id);
        } catch (error) {
            throw new Error(`Error updating payment: ${error.message}`);
        }
    }

    static async deletePayment(id) {
        try {
            if (!id) {
                throw new Error('Payment ID is required for delete');
            }
            
            const existingPayment = await PaymentModel.findById(id);
            if (!existingPayment) {
                return null;
            }
            
            const deleted = await PaymentModel.softDelete(id);
            if (!deleted) {
                throw new Error('Failed to delete payment');
            }
            
            return existingPayment;
        } catch (error) {
            throw new Error(`Error deleting payment: ${error.message}`);
        }
    }

    static async getPaymentSummary() {
        try {
            return await PaymentModel.getPaymentSummary();
        } catch (error) {
            throw new Error(`Error getting payment summary: ${error.message}`);
        }
    }

    static async getTotalByStatus(status) {
        try {
            if (!status) {
                throw new Error('Status is required');
            }
            
            const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid payment status');
            }
            
            return await PaymentModel.getTotalByStatus(status);
        } catch (error) {
            throw new Error(`Error getting total by status: ${error.message}`);
        }
    }
}

module.exports = PaymentService;