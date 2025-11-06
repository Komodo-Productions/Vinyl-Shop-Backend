const ProductService = require('../services/productService');

class ProductController {
    static async getAllProducts(req, res) {
        try {
            const products = await ProductService.getProducts();
            res.json(products);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getProductsByGenre(req, res) {
        try {
            const products = await ProductService.getProductsByGenre(req.params.genreId);
            res.json(products);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async createProduct(req, res) {
        try {
            const newProduct = {
                name: req.body.name,
                artist: req.body.artist,
                genre_id: req.body.genre_id,
                price: req.body.price,
                publication_date: req.body.publication_date
            };

            const createdProduct = await ProductService.createProduct(newProduct);
            res.status(201).json({ 
                message: 'Product created successfully', 
                data: createdProduct 
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, artist, genre_id, price, publication_date } = req.body;

            const updatedProduct = await ProductService.updateProduct(id, {
                name,
                artist,
                genre_id,
                price,
                publication_date
            });

            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ 
                message: 'Product updated successfully', 
                data: updatedProduct 
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedProduct = await ProductService.deleteProduct(id);

            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ 
                message: 'Product deleted successfully', 
                data: deletedProduct 
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async hardDeleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedProduct = await ProductService.hardDeleteProduct(id);

            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ 
                message: 'Product permanently deleted', 
                data: deletedProduct 
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = ProductController;