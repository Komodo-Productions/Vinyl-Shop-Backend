const request = require('supertest');
const express = require('express');
const productRoutes = require('../routes/productRoutes');
const ProductController = require('../controllers/productController');

jest.mock('../controllers/productController');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should call ProductController.getAllProducts and return products successfully', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1', price: 100 },
                { id: 2, name: 'Product 2', price: 200 }
            ];

            ProductController.getAllProducts.mockImplementation((req, res) => {
                res.json(mockProducts);
            });

            const response = await request(app)
                .get('/products')
                .expect(200);

            expect(ProductController.getAllProducts).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockProducts);
        });

        it('should handle errors when ProductController.getAllProducts fails', async () => {
            const errorMessage = 'Database connection failed';
            
            ProductController.getAllProducts.mockImplementation((req, res) => {
                res.status(500).json({ error: errorMessage });
            });

            const response = await request(app)
                .get('/products')
                .expect(500);

            expect(ProductController.getAllProducts).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('GET /:id', () => {
        it('should call ProductController.getProductById and return product successfully', async () => {
            const productId = '1';
            const mockProduct = { id: 1, name: 'Product 1', price: 100 };

            ProductController.getProductById.mockImplementation((req, res) => {
                res.json(mockProduct);
            });

            const response = await request(app)
                .get(`/products/${productId}`)
                .expect(200);

            expect(ProductController.getProductById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(mockProduct);
        });

        it('should handle product not found error', async () => {
            const productId = '999';
            const errorMessage = 'Product not found';

            ProductController.getProductById.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .get(`/products/${productId}`)
                .expect(404);

            expect(ProductController.getProductById).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('POST /', () => {
        it('should call ProductController.createProduct and create product successfully', async () => {
            const newProductData = {
                name: 'New Product',
                description: 'Product description',
                price: 150,
                stock: 50
            };
            const createdProduct = { id: 1, ...newProductData };
            const successResponse = {
                message: 'Product created successfully',
                data: createdProduct
            };

            ProductController.createProduct.mockImplementation((req, res) => {
                res.status(201).json(successResponse);
            });

            const response = await request(app)
                .post('/products')
                .send(newProductData)
                .expect(201);

            expect(ProductController.createProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle validation errors when creating product', async () => {
            const invalidProductData = {
                name: 'Product',
                price: -10
            };
            const errorMessage = 'Price must be greater than 0';

            ProductController.createProduct.mockImplementation((req, res) => {
                res.status(400).json({ error: errorMessage });
            });

            const response = await request(app)
                .post('/products')
                .send(invalidProductData)
                .expect(400);

            expect(ProductController.createProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('PUT /:id', () => {
        it('should call ProductController.updateProduct and update product successfully', async () => {
            const productId = '1';
            const updateData = {
                name: 'Updated Product',
                price: 200,
                stock: 100
            };
            const updatedProduct = { id: 1, ...updateData };
            const successResponse = {
                message: 'Product updated successfully',
                data: updatedProduct
            };

            ProductController.updateProduct.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .put(`/products/${productId}`)
                .send(updateData)
                .expect(200);

            expect(ProductController.updateProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle product not found when updating', async () => {
            const productId = '999';
            const updateData = {
                name: 'Updated Product',
                price: 200
            };
            const errorMessage = 'Product not found';

            ProductController.updateProduct.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .put(`/products/${productId}`)
                .send(updateData)
                .expect(404);

            expect(ProductController.updateProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('DELETE /:id', () => {
        it('should call ProductController.deleteProduct and delete product successfully', async () => {
            const productId = '1';
            const deletedProduct = { id: 1, name: 'Product 1', price: 100 };
            const successResponse = {
                message: 'Product deleted successfully',
                data: deletedProduct
            };

            ProductController.deleteProduct.mockImplementation((req, res) => {
                res.json(successResponse);
            });

            const response = await request(app)
                .delete(`/products/${productId}`)
                .expect(200);

            expect(ProductController.deleteProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(successResponse);
        });

        it('should handle product not found when deleting', async () => {
            const productId = '999';
            const errorMessage = 'Product not found';

            ProductController.deleteProduct.mockImplementation((req, res) => {
                res.status(404).json({ error: errorMessage });
            });

            const response = await request(app)
                .delete(`/products/${productId}`)
                .expect(404);

            expect(ProductController.deleteProduct).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({ error: errorMessage });
        });
    });

    describe('Route Integration', () => {
        it('should pass correct request parameters to controller methods', async () => {
            const productId = '123';
            ProductController.getProductById.mockImplementation((req, res) => {
                expect(req.params.id).toBe(productId);
                res.json({ id: productId });
            });

            await request(app)
                .get(`/products/${productId}`)
                .expect(200);

            expect(ProductController.getProductById).toHaveBeenCalledTimes(1);
        });

        it('should pass correct request body to controller methods', async () => {
            const productData = {
                name: 'Test Product',
                price: 100
            };

            ProductController.createProduct.mockImplementation((req, res) => {
                expect(req.body).toEqual(productData);
                res.status(201).json({ message: 'Product created successfully' });
            });

            await request(app)
                .post('/products')
                .send(productData)
                .expect(201);

            expect(ProductController.createProduct).toHaveBeenCalledTimes(1);
        });
    });
});