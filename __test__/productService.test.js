const ProductService = require('../services/productService');
const ProductModel = require('../models/productModel');


jest.mock('../models/productModel');

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return a list of products', async () => {
            const mockProducts = [{ id: 1, name: 'Album A' }, { id: 2, name: 'Album B' }];
            ProductModel.findAll.mockResolvedValue(mockProducts);

            const result = await ProductService.getProducts();
            expect(result).toEqual(mockProducts);
            expect(ProductModel.findAll).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the query fails', async () => {
            ProductModel.findAll.mockRejectedValue(new Error('DB error'));

            await expect(ProductService.getProducts()).rejects.toThrow('Error fetching products: DB error');
        });
    });

    describe('getProductById', () => {
        it('should return a product by id', async () => {
            const mockProduct = { id: 1, name: 'Album X' };
            ProductModel.findById.mockResolvedValue(mockProduct);

            const result = await ProductService.getProductById(1);
            expect(result).toEqual(mockProduct);
            expect(ProductModel.findById).toHaveBeenCalledWith(1);
        });

        it('should return null if the product does not exist', async () => {
            ProductModel.findById.mockResolvedValue(null);

            const result = await ProductService.getProductById(99);
            expect(result).toBeNull();
        });

        it('should throw error if there is no id', async () => {
            await expect(ProductService.getProductById()).rejects.toThrow('Product ID is required');
        });
    });

    describe('createProduct', () => {
        it('should create a valid product', async () => {
            const newProduct = { name: 'Album Y', artist: 'Artist Y', genre_id: 1, price: 10 };
            ProductModel.findByName.mockResolvedValue(null); // No existe previamente
            ProductModel.create.mockResolvedValue({ id: 1, ...newProduct });

            const result = await ProductService.createProduct(newProduct);

            expect(result).toEqual({ id: 1, ...newProduct });
            expect(ProductModel.findByName).toHaveBeenCalledWith('Album Y');
            expect(ProductModel.create).toHaveBeenCalled();
        });

        it('should fail if the name already exists', async () => {
            ProductModel.findByName.mockResolvedValue({ id: 2, name: 'Album Y' });

            await expect(
                ProductService.createProduct({ name: 'Album Y', artist: 'Artist', genre_id: 1, price: 20 })
            ).rejects.toThrow('Product name already exists');
        });

        it('should fail if a required field is missing', async () => {
            await expect(
                ProductService.createProduct({ name: '', artist: 'Artist', genre_id: 1, price: 20 })
            ).rejects.toThrow('Name, artist, genre_id, and price are required fields');
        });

        it('should fail if price is <= 0', async () => {
            await expect(
                ProductService.createProduct({ name: 'Album Z', artist: 'Artist', genre_id: 1, price: 0 })
            ).rejects.toThrow('Price must be greater than 0');
        });
    });

    describe('updateProduct', () => {
        it('should update an existing product', async () => {
            const mockProduct = { id: 1, name: 'Old Name' };
            ProductModel.findById.mockResolvedValue(mockProduct);
            ProductModel.findByName.mockResolvedValue(null);
            ProductModel.update.mockResolvedValue(true);

            const result = await ProductService.updateProduct(1, { name: 'New Name' });

            expect(ProductModel.findById).toHaveBeenCalledWith(1);
            expect(ProductModel.update).toHaveBeenCalledWith(1, { name: 'New Name' });
            expect(result).toEqual(mockProduct);
        });

        it('should return null if the product does not exist', async () => {
            ProductModel.findById.mockResolvedValue(null);

            const result = await ProductService.updateProduct(99, { name: 'New' });
            expect(result).toBeNull();
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product (soft delete)', async () => {
            const mockProduct = { id: 1, name: 'Album Deleted' };
            ProductModel.findById.mockResolvedValue(mockProduct);
            ProductModel.softDelete.mockResolvedValue(true);

            const result = await ProductService.deleteProduct(1);

            expect(result).toEqual(mockProduct);
            expect(ProductModel.softDelete).toHaveBeenCalledWith(1);
        });

        it('should return null if the product does not exist', async () => {
            ProductModel.findById.mockResolvedValue(null);

            const result = await ProductService.deleteProduct(99);
            expect(result).toBeNull();
        });
    });

    describe('hardDeleteProduct', () => {
        it('should permanently delete a product (hard delete)', async () => {
            const mockProduct = { id: 1, name: 'Album Permanent Delete' };
            ProductModel.findById.mockResolvedValue(mockProduct);
            ProductModel.hardDelete.mockResolvedValue(true);

            const result = await ProductService.hardDeleteProduct(1);

            expect(result).toEqual(mockProduct);
            expect(ProductModel.findById).toHaveBeenCalledWith(1);
            expect(ProductModel.hardDelete).toHaveBeenCalledWith(1);
        });

        it('should return null if the product does not exist', async () => {
            ProductModel.findById.mockResolvedValue(null);

            const result = await ProductService.hardDeleteProduct(99);
            expect(result).toBeNull();
            expect(ProductModel.findById).toHaveBeenCalledWith(99);
            expect(ProductModel.hardDelete).not.toHaveBeenCalled();
        });

        it('should throw an error if an id is not passed', async () => {
            await expect(ProductService.hardDeleteProduct()).rejects.toThrow(
                'Product ID is required for hard delete'
            );
        });

        it('should throw an error if the deletion fails in the database', async () => {
            const mockProduct = { id: 2, name: 'Album Fail Delete' };
            ProductModel.findById.mockResolvedValue(mockProduct);
            ProductModel.hardDelete.mockResolvedValue(false);

            await expect(ProductService.hardDeleteProduct(2)).rejects.toThrow(
                'Failed to permanently delete product'
                );
            });
    });
    
    describe('getProductsByGenre', () => {
        it('should return products by gender', async () => {
            ProductModel.findByGenre.mockResolvedValue([{ id: 1, genre_id: 2 }]);
            const result = await ProductService.getProductsByGenre(2);
            expect(result).toEqual([{ id: 1, genre_id: 2 }]);
        });

        it('should throw error if genreId is not passed', async () => {
            await expect(ProductService.getProductsByGenre()).rejects.toThrow('Genre ID is required');
        });
    });

    describe('updateProduct validations', () => {
        it('should throw error if id is not passed', async () => {
            await expect(ProductService.updateProduct(null, {}))
                .rejects.toThrow('Product ID is required for update');
        });

        it('should throw error if price <= 0', async () => {
            ProductModel.findById.mockResolvedValue({ id: 1 });
            await expect(ProductService.updateProduct(1, { price: 0 }))
                .rejects.toThrow('Price must be greater than 0');
        });

        it('should throw error if genre_id is not number', async () => {
            ProductModel.findById.mockResolvedValue({ id: 1 });
            await expect(ProductService.updateProduct(1, { genre_id: "abc" }))
                .rejects.toThrow('Genre ID must be a valid number');
        });

        it('should throw an error if the name already exists', async () => {
            const existingProduct = { id: 1, name: 'Old' };
            ProductModel.findById.mockResolvedValue(existingProduct);
            ProductModel.findByName.mockResolvedValue({ id: 2, name: 'New' });

            await expect(ProductService.updateProduct(1, { name: 'New' }))
                .rejects.toThrow('Product name already exists');
        });

        it('should throw an error if update fails', async () => {
            const existingProduct = { id: 1, name: 'Old' };
            ProductModel.findById.mockResolvedValue(existingProduct);
            ProductModel.findByName.mockResolvedValue(null);
            ProductModel.update.mockResolvedValue(false);

            await expect(ProductService.updateProduct(1, { name: 'Updated' }))
                .rejects.toThrow('Failed to update product');
            });
    });

    describe('deleteProduct validations', () => {
        it('should throw error if id is not passed', async () => {
            await expect(ProductService.deleteProduct())
                .rejects.toThrow('Product ID is required for delete');
        });

        it('should throw error if softDelete fails', async () => {
            const mockProduct = { id: 1, name: 'Album Fail Delete' };
            ProductModel.findById.mockResolvedValue(mockProduct);
            ProductModel.softDelete.mockResolvedValue(false);

            await expect(ProductService.deleteProduct(1))
                .rejects.toThrow('Failed to delete product');
        });
    });


});
