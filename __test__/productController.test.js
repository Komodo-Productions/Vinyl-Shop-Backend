const ProductController = require('../controllers/productController');
const ProductService = require('../services/productService');

jest.mock('../services/productService');

describe('ProductController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            params: {},
            body: {},
            query: {}
        };
        
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('getAllProducts', () => {
        it('should return all products successfully', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1', price: 100 },
                { id: 2, name: 'Product 2', price: 200 }
            ];
            ProductService.getProducts.mockResolvedValue(mockProducts);

            await ProductController.getAllProducts(req, res);

            expect(ProductService.getProducts).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockProducts);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle errors when getting all products fails', async () => {
            const errorMessage = 'Database connection failed';
            ProductService.getProducts.mockRejectedValue(new Error(errorMessage));

            await ProductController.getAllProducts(req, res);

            expect(ProductService.getProducts).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getProductById', () => {
        it('should return product by id successfully', async () => {
            const productId = '1';
            const mockProduct = { id: 1, name: 'Product 1', price: 100 };
            req.params.id = productId;
            ProductService.getProductById.mockResolvedValue(mockProduct);

            await ProductController.getProductById(req, res);

            expect(ProductService.getProductById).toHaveBeenCalledWith(productId);
            expect(res.json).toHaveBeenCalledWith(mockProduct);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when product is not found', async () => {
            const productId = '999';
            req.params.id = productId;
            ProductService.getProductById.mockResolvedValue(null);

            await ProductController.getProductById(req, res);

            expect(ProductService.getProductById).toHaveBeenCalledWith(productId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        it('should handle errors when getting product by id fails', async () => {
            const productId = '1';
            const errorMessage = 'Database error';
            req.params.id = productId;
            ProductService.getProductById.mockRejectedValue(new Error(errorMessage));

            await ProductController.getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('getProductsByGenre', () => {
        it('should return products by genre successfully', async () => {
            const genreId = '1';
            const mockProducts = [
                { id: 1, name: 'Product 1', genre_id: 1 },
                { id: 2, name: 'Product 2', genre_id: 1 }
            ];
            req.params.genreId = genreId;
            ProductService.getProductsByGenre.mockResolvedValue(mockProducts);

            await ProductController.getProductsByGenre(req, res);

            expect(ProductService.getProductsByGenre).toHaveBeenCalledWith(genreId);
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });

        it('should handle errors when getting products by genre fails', async () => {
            const genreId = '1';
            const errorMessage = 'Database error';
            req.params.genreId = genreId;
            ProductService.getProductsByGenre.mockRejectedValue(new Error(errorMessage));

            await ProductController.getProductsByGenre(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('createProduct', () => {
        it('should create product successfully', async () => {
            const newProductData = {
                name: 'New Product',
                artist: 'Artist Name',
                genre_id: 1,
                price: 150,
                publication_date: '2024-01-01'
            };
            const createdProduct = { id: 1, ...newProductData };
            req.body = newProductData;
            ProductService.createProduct.mockResolvedValue(createdProduct);

            await ProductController.createProduct(req, res);

            expect(ProductService.createProduct).toHaveBeenCalledWith(newProductData);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Product created successfully',
                data: createdProduct
            });
        });

        it('should handle validation errors when creating product', async () => {
            const invalidProductData = {
                name: 'Product',
                artist: 'Artist',
                genre_id: 1,
                price: -10,
                publication_date: '2024-01-01'
            };
            const errorMessage = 'Price must be greater than 0';
            req.body = invalidProductData;
            ProductService.createProduct.mockRejectedValue(new Error(errorMessage));

            await ProductController.createProduct(req, res);

            expect(ProductService.createProduct).toHaveBeenCalledWith(invalidProductData);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('updateProduct', () => {
        it('should update product successfully', async () => {
            const productId = '1';
            const updateData = {
                name: 'Updated Product',
                artist: 'Updated Artist',
                genre_id: 2,
                price: 200,
                publication_date: '2024-02-01'
            };
            const updatedProduct = { id: 1, ...updateData };
            req.params.id = productId;
            req.body = updateData;
            ProductService.updateProduct.mockResolvedValue(updatedProduct);

            await ProductController.updateProduct(req, res);

            expect(ProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Product updated successfully',
                data: updatedProduct
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when updating non-existent product', async () => {
            const productId = '999';
            const updateData = {
                name: 'Product',
                price: 100
            };
            req.params.id = productId;
            req.body = updateData;
            ProductService.updateProduct.mockResolvedValue(null);

            await ProductController.updateProduct(req, res);

            expect(ProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        it('should handle validation errors when updating product', async () => {
            const productId = '1';
            const invalidUpdateData = {
                price: -50
            };
            const errorMessage = 'Price must be greater than 0';
            req.params.id = productId;
            req.body = invalidUpdateData;
            ProductService.updateProduct.mockRejectedValue(new Error(errorMessage));

            await ProductController.updateProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('deleteProduct', () => {
        it('should delete product successfully', async () => {
            const productId = '1';
            const deletedProduct = { id: 1, name: 'Product 1', price: 100 };
            req.params.id = productId;
            ProductService.deleteProduct.mockResolvedValue(deletedProduct);

            await ProductController.deleteProduct(req, res);

            expect(ProductService.deleteProduct).toHaveBeenCalledWith(productId);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Product deleted successfully',
                data: deletedProduct
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when deleting non-existent product', async () => {
            const productId = '999';
            req.params.id = productId;
            ProductService.deleteProduct.mockResolvedValue(null);

            await ProductController.deleteProduct(req, res);

            expect(ProductService.deleteProduct).toHaveBeenCalledWith(productId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        it('should handle errors when deleting product fails', async () => {
            const productId = '1';
            const errorMessage = 'Database error';
            req.params.id = productId;
            ProductService.deleteProduct.mockRejectedValue(new Error(errorMessage));

            await ProductController.deleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('hardDeleteProduct', () => {
        it('should permanently delete product successfully', async () => {
            const productId = '1';
            const deletedProduct = { id: 1, name: 'Product 1', price: 100 };
            req.params.id = productId;
            ProductService.hardDeleteProduct.mockResolvedValue(deletedProduct);

            await ProductController.hardDeleteProduct(req, res);

            expect(ProductService.hardDeleteProduct).toHaveBeenCalledWith(productId);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Product permanently deleted',
                data: deletedProduct
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when hard deleting non-existent product', async () => {
            const productId = '999';
            req.params.id = productId;
            ProductService.hardDeleteProduct.mockResolvedValue(null);

            await ProductController.hardDeleteProduct(req, res);

            expect(ProductService.hardDeleteProduct).toHaveBeenCalledWith(productId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        it('should handle errors when hard deleting product fails', async () => {
            const productId = '1';
            const errorMessage = 'Database error';
            req.params.id = productId;
            ProductService.hardDeleteProduct.mockRejectedValue(new Error(errorMessage));

            await ProductController.hardDeleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });
});