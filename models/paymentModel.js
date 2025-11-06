const db = require('../db');

class PaymentModel {
    static async findAll() {
        return db('payment')
            .whereNull('deleted_at')
            .select('id_payment', 'order_id', 'method', 'amount', 'date', 'created_at', 'updated_at');
    }

    static async findById(id) {
        return db('payment')
            .where({ id_payment: id })
            .whereNull('deleted_at')
            .select('id_payment', 'order_id', 'method', 'amount', 'date', 'created_at', 'updated_at')
            .first();
    }

    static async findByOrderId(orderId) {
        return db('payment')
            .where({ order_id: orderId })
            .whereNull('deleted_at')
            .select('id_payment', 'order_id', 'method', 'amount', 'date', 'created_at', 'updated_at');
    }

    static async findByStatus(status) {
        return db('payment')
            .where({ status })
            .whereNull('deleted_at')
            .select('id_payment', 'order_id', 'method', 'amount', 'date', 'created_at', 'updated_at');
    }

    static async findByDateRange(startDate, endDate) {
        return db('payment')
            .whereBetween('date', [startDate, endDate])
            .whereNull('deleted_at')
            .select('id_payment', 'order_id', 'method', 'amount', 'date', 'created_at', 'updated_at')
            .orderBy('date', 'desc');
    }

    static async create(payment) {
        const [id] = await db('payment').insert({
            order_id: payment.order_id,
            method: payment.method,
            amount: payment.amount,
            date: payment.date,
            status: payment.status || 'pending'
        });
        
        return this.findById(id);
    }

    static async update(id, payment) {
        const updateData = {};
        
        if (payment.order_id !== undefined) updateData.order_id = payment.order_id;
        if (payment.method !== undefined) updateData.method = payment.method;
        if (payment.amount !== undefined) updateData.amount = payment.amount;
        if (payment.date !== undefined) updateData.date = payment.date;
        if (payment.status !== undefined) updateData.status = payment.status;
        
        const affectedRows = await db('payment')
            .where({ id_payment: id })
            .whereNull('deleted_at')
            .update(updateData);
            
        return affectedRows > 0;
    }

    static async softDelete(id) {
        const affectedRows = await db('payment')
            .where({ id_payment: id })
            .whereNull('deleted_at')
            .update({ deleted_at: db.fn.now() });
            
        return affectedRows > 0;
    }

    static async hardDelete(id) {
        const affectedRows = await db('payment')
            .where({ id_payment: id })
            .del();
            
        return affectedRows > 0;
    }

    static async getTotalByStatus(status) {
        const result = await db('payment')
            .where({ status })
            .whereNull('deleted_at')
            .sum('amount as total')
            .first();
        
        return result.total || 0;
    }

    static async getPaymentSummary() {
        return db('payment')
            .whereNull('deleted_at')
            .select('status')
            .count('* as count')
            .sum('amount as total')
            .groupBy('status');
    }
}

module.exports = PaymentModel;