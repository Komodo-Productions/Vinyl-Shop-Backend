const db = require('../db');

class UserModel {
    static async findAll() {
        return db('user')
            .whereNull('deleted_at')
            .select('id_user', 'name', 'last_name', 'phone', 'email', 'created_at', 'updated_at');
    }

    static async findById(id) {
        return db('user')
            .where({ id_user: id })
            .whereNull('deleted_at')
            .select('id_user', 'name', 'last_name', 'phone', 'email', 'created_at', 'updated_at')
            .first();
    }

    static async findByEmail(email) {
        return db('user')
            .where({ email })
            .whereNull('deleted_at')
            .first();
    }

    static async create(user) {
        // Insertar y obtener id de forma robusta para distintos DBs
        const result = await db('user').insert({
            name: user.name,
            last_name: user.last_name,
            phone: user.phone,
            email: user.email,
            password: user.password
        });

        // result puede ser: [id] o [{id_user: id}] dependiendo del dialecto
        let insertedId = null;
        if (Array.isArray(result) && result.length > 0) {
            const first = result[0];
            if (typeof first === 'object') {
                // ej. [{ id_user: 1 }] o [{ id: 1 }]
                insertedId = first.id_user ?? first.id ?? null;
            } else {
                // ej. [1]
                insertedId = first;
            }
        }

        if (!insertedId) {
            // Si no obtuvimos id, intentar buscar por email (fallback)
            const created = await this.findByEmail(user.email);
            return created;
        }

        // Devolver el usuario creado (usando findById)
        return this.findById(insertedId);
    }

    static async update(id, user) {
        const updateData = {};
        
        if (user.name !== undefined) updateData.name = user.name;
        if (user.last_name !== undefined) updateData.last_name = user.last_name;
        if (user.phone !== undefined) updateData.phone = user.phone;
        if (user.email !== undefined) updateData.email = user.email;
        if (user.password !== undefined) updateData.password = user.password;
        
        const affectedRows = await db('user')
            .where({ id_user: id })
            .whereNull('deleted_at')
            .update(updateData);
            
        return affectedRows > 0;
    }

    static async softDelete(id) {
        const affectedRows = await db('user')
            .where({ id_user: id })
            .whereNull('deleted_at')
            .update({ deleted_at: db.fn.now() });
            
        return affectedRows > 0;
    }

    static async hardDelete(id) {
        const affectedRows = await db('user')
            .where({ id_user: id })
            .del();
            
        return affectedRows > 0;
    }
}

module.exports = UserModel;