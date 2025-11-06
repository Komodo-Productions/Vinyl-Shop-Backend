// controllers/paymentController.js
const PaymentService = require('../services/paymentService');

exports.create = async (req, res) => {
    try {
        const payment = await PaymentService.createPayment(req.body);
        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const payments = await PaymentService.getAllPayments();
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentService.getPaymentById(id);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPayment = await PaymentService.updatePayment(id, req.body);
        
        if (!updatedPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Payment updated successfully',
            data: updatedPayment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPayment = await PaymentService.deletePayment(id);
        
        if (!deletedPayment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Payment deleted successfully (soft delete)',
            data: deletedPayment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Additional controller methods for specific payment operations
exports.getByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payments = await PaymentService.getPaymentsByOrderId(orderId);
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const payments = await PaymentService.getPaymentsByStatus(status);
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const payments = await PaymentService.getPaymentsByDateRange(startDate, endDate);
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const summary = await PaymentService.getPaymentSummary();
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getTotalByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const total = await PaymentService.getTotalByStatus(status);
        res.status(200).json({
            success: true,
            data: {
                status,
                total
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};