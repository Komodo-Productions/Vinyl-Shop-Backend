const db = require('../db');

class ProductModel {
    static async findAll() {
        return db('product')
            .whereNull( 'deleted_at' )
            .select('id_product', 'name', 'artist', 'genre_id', 'price', 'publication_date', 'created_at', 'updated_at');
    }

    static async findById(id) {
        return db('product')
            .where({ id_product: id })
            .whereNull( 'deleted_at' )
            .select('id_product', 'name', 'artist', 'genre_id', 'price', 'publication_date', 'created_at', 'updated_at')
            .first();
    }

    static async findByName(name) {
        return db('product')
            .where({ name })
            .whereNull( 'deleted_at' )
            .first();
    }

    static async create(product) {
        const [id] = await db('product').insert({
            name: product.name,
            artist: product.artist,
            genre_id: product.genre_id,
            price: product.price,
            publication_date: product.publication_date
        });
        
        return this.findById(id);
    }

    static async update(id, product) {
        const updateData = {};
        
        if (product.name !== undefined) updateData.name = product.name;
        if (product.artist !== undefined) updateData.artist = product.artist;
        if (product.genre_id !== undefined) updateData.genre_id = product.genre_id;
        if (product.price !== undefined) updateData.price = product.price;
        if (product.publication_date !== undefined) updateData.publication_date = product.publication_date;
        
        const affectedRows = await db('product')
            .where({ id_product: id }) 
            .where({ deleted_at: null })
            .update(updateData);
            
        return affectedRows > 0;
    }

    static async softDelete(id) {
        const affectedRows = await db('product')
            .where({ id_product: id })
            .whereNull('deleted_at') 
            .update({ deleted_at: db.fn.now() });
        
        return affectedRows > 0;
    }

    static async hardDelete(id) {
        const affectedRows = await db('product')
            .where({ id_product: id })
            .del();
            
        return affectedRows > 0;
    }

    static async findByGenre(genreId) {
        return db('product')
            .where({ genre_id: genreId })
            .whereNull( 'deleted_at' )
            .select('id_product', 'name', 'artist', 'genre_id', 'price', 'publication_date', 'created_at', 'updated_at');
    }
}

module.exports = ProductModel;