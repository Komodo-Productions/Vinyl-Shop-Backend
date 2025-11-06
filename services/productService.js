const ProductModel = require('../models/productModel');

class ProductService {
    static async getProducts() {
        try {
            return await ProductModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching products: ${error.message}`);
        }
    }

    static async getProductById(id) {
        try {
            if (!id) {
                throw new Error('Product ID is required');
            }
            
            const product = await ProductModel.findById(id);
            return product || null;
        } catch (error) {
            throw new Error(`Error fetching product: ${error.message}`);
        }
    }

    static async getProductsByGenre(genreId) {
        try {
            if (!genreId) {
                throw new Error('Genre ID is required');
            }
            
            return await ProductModel.findByGenre(genreId);
        } catch (error) {
            throw new Error(`Error fetching products by genre: ${error.message}`);
        }
    }

    static async createProduct({ name, artist, genre_id, price, publication_date }) {
        try {
            // Validate required fields
            if (!name || !artist || !genre_id || price === undefined) {
                throw new Error('Name, artist, genre_id, and price are required fields');
            }

            // Validate genre_id is a number
            if (isNaN(Number(genre_id))) {
                throw new Error('Genre ID must be a valid number');
            }

            // Validate price
            if (price <= 0) {
                throw new Error('Price must be greater than 0');
            }

            // Check if product name already exists
            const existingProduct = await ProductModel.findByName(name);
            if (existingProduct) {
                throw new Error('Product name already exists');
            }

            // Set default publication date if not provided
            const productData = {
                name,
                artist,
                genre_id: Number(genre_id),
                price: Number(price),
                publication_date: publication_date || new Date().toISOString().split('T')[0]
            };

            const createdProduct = await ProductModel.create(productData);
            return createdProduct;
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    static async updateProduct(id, { name, artist, genre_id, price, publication_date }) {
        try {
            if (!id) {
                throw new Error('Product ID is required for update');
            }
            
            // Check if product exists
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return null;
            }

            // Validate price if provided
            if (price !== undefined && price <= 0) {
                throw new Error('Price must be greater than 0');
            }

            // Validate genre_id if provided
            if (genre_id !== undefined && isNaN(Number(genre_id))) {
                throw new Error('Genre ID must be a valid number');
            }

            // Check for duplicate name if name is being updated
            if (name && name !== existingProduct.name) {
                const duplicateName = await ProductModel.findByName(name);
                if (duplicateName) {
                    throw new Error('Product name already exists');
                }
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (artist !== undefined) updateData.artist = artist;
            if (genre_id !== undefined) updateData.genre_id = Number(genre_id);
            if (price !== undefined) updateData.price = Number(price);
            if (publication_date !== undefined) updateData.publication_date = publication_date;

            const updated = await ProductModel.update(id, updateData);
            if (!updated) {
                throw new Error('Failed to update product');
            }

            return await ProductModel.findById(id);
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    static async deleteProduct(id) {
        try {
            if (!id) {
                throw new Error('Product ID is required for delete');
            }
            
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return null;
            }
            
            const deleted = await ProductModel.softDelete(id);
            if (!deleted) {
                throw new Error('Failed to delete product');
            }
            
            return existingProduct;
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    static async hardDeleteProduct(id) {
        try {
            if (!id) {
                throw new Error('Product ID is required for hard delete');
            }
            
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return null;
            }
            
            const deleted = await ProductModel.hardDelete(id);
            if (!deleted) {
                throw new Error('Failed to permanently delete product');
            }
            
            return existingProduct;
        } catch (error) {
            throw new Error(`Error permanently deleting product: ${error.message}`);
        }
    }
}

module.exports = ProductService;