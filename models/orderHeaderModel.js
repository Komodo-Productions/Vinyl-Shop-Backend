const db = require('../db');

class OrderHeaderModel {
    static async findAll() {
        return db('order_header')
            .whereNull('deleted_at')
            .select('id_order_header', 'customer_id', 'total', 'order_date', 'status', 'notes', 'created_at', 'updated_at')
            .orderBy('created_at', 'desc');
    }

    static async findById(id) {
        return db('order_header')
            .where({ id_order_header: id })
            .whereNull('deleted_at')
            .select('id_order_header', 'customer_id', 'total', 'order_date', 'status', 'notes', 'created_at', 'updated_at')
            .first();
    }

    static async findByCustomerId(customerId) {
        return db('order_header')
            .where({ customer_id: customerId })
            .whereNull('deleted_at')
            .select('id_order_header', 'customer_id', 'total', 'order_date', 'status', 'notes', 'created_at', 'updated_at')
            .orderBy('order_date', 'desc');
    }

    static async findByStatus(status) {
        return db('order_header')
            .where({ status })
            .whereNull('deleted_at')
            .select('id_order_header', 'customer_id', 'total', 'order_date', 'status', 'notes', 'created_at', 'updated_at')
            .orderBy('order_date', 'desc');
    }

    static async findByDateRange(startDate, endDate) {
        return db('order_header')
            .whereBetween('order_date', [startDate, endDate])
            .whereNull('deleted_at')
            .select('id_order_header', 'customer_id', 'total', 'order_date', 'status', 'notes', 'created_at', 'updated_at')
            .orderBy('order_date', 'desc');
    }

    static async create(orderHeader) {
        const [id] = await db('order_header').insert({
            customer_id: orderHeader.customer_id,
            total: orderHeader.total,
            order_date: orderHeader.order_date,
            status: orderHeader.status || 'pending',
            notes: orderHeader.notes
        });
        
        return this.findById(id);
    }

    static async update(id, orderHeader) {
        const updateData = {};
        
        if (orderHeader.customer_id !== undefined) updateData.customer_id = orderHeader.customer_id;
        if (orderHeader.total !== undefined) updateData.total = orderHeader.total;
        if (orderHeader.order_date !== undefined) updateData.order_date = orderHeader.order_date;
        if (orderHeader.status !== undefined) updateData.status = orderHeader.status;
        if (orderHeader.notes !== undefined) updateData.notes = orderHeader.notes;
        
        const affectedRows = await db('order_header')
            .where({ id_order_header: id })
            .whereNull('deleted_at')
            .update(updateData);
            
        return affectedRows > 0;
    }

    static async softDelete(id) {
        const affectedRows = await db('order_header')
            .where({ id_order_header: id })
            .whereNull('deleted_at')
            .update({ deleted_at: db.fn.now() });
            
        return affectedRows > 0;
    }

    static async hardDelete(id) {
        const affectedRows = await db('order_header')
            .where({ id_order_header: id })
            .del();
            
        return affectedRows > 0;
    }

    static async getTotalsByStatus() {
        return db('order_header')
            .whereNull('deleted_at')
            .select('status')
            .count('* as count')
            .sum('total as total_amount')
            .groupBy('status');
    }

    static async getTotalsByCustomer(customerId) {
        const result = await db('order_header')
            .where({ customer_id: customerId })
            .whereNull('deleted_at')
            .sum('total as total_amount')
            .count('* as order_count')
            .first();
        
        return {
            customer_id: customerId,
            total_amount: result.total_amount || 0,
            order_count: result.order_count || 0
        };
    }

    static async getMonthlyStats(year) {
        return db('order_header')
            .whereNull('deleted_at')
            .whereRaw('YEAR(order_date) = ?', [year])
            .select(db.raw('MONTH(order_date) as month'))
            .count('* as order_count')
            .sum('total as total_amount')
            .groupByRaw('MONTH(order_date)')
            .orderByRaw('MONTH(order_date)');
    }
}

module.exports = OrderHeaderModel;