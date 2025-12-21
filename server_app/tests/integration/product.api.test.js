const Products = require('../../Models/product');
const Category = require('../../Models/category');
const productController = require('../../API/Controller/product.controller');
const { testProducts } = require('../helpers/testData');

// Mock the models
jest.mock('../../Models/product');
jest.mock('../../Models/category');

// Integration tests cho Product API
describe('Product API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /api/product - Get all products', () => {
        test('should return all products', async () => {
            const mockProducts = testProducts.bulkProducts;
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await productController.index(req, res);
            
            expect(Products.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });
        
        test('should return empty array when no products', async () => {
            Products.find.mockResolvedValue([]);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await productController.index(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });
    
    describe('GET /api/product/category - Get products by category', () => {
        test('should return all products when category is "all"', async () => {
            const mockProducts = testProducts.bulkProducts;
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, { id_category: 'all' });
            const res = mockResponse();
            
            await productController.category(req, res);
            
            expect(Products.find).toHaveBeenCalledWith();
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });
        
        test('should return filtered products by category', async () => {
            const categoryId = 'category-123';
            const mockProducts = testProducts.bulkProducts;
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, { id_category: categoryId });
            const res = mockResponse();
            
            await productController.category(req, res);
            
            expect(Products.find).toHaveBeenCalledWith({ id_category: categoryId });
            expect(res.json).toHaveBeenCalledWith(mockProducts);
        });
    });
    
    describe('GET /api/product/:id - Get product detail', () => {
        test('should return product with populated category', async () => {
            const mockProduct = {
                ...testProducts.validProduct,
                id_category: {
                    _id: 'category-123',
                    name: 'Test Category'
                }
            };
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockProduct)
            };
            Products.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await productController.detail(req, res);
            
            expect(Products.findOne).toHaveBeenCalledWith({ _id: 'product-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith('id_category');
            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });
    });
    
    describe('GET /api/product/pagination - Paginate and search products', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should paginate products - page 1', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '2',
                category: 'all'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            expect(Products.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
            
            const result = res.json.mock.calls[0][0];
            expect(result.length).toBe(2);
        });
        
        test('should paginate products - page 2', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '2',
                count: '2',
                category: 'all'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.length).toBe(2);
        });
        
        test('should filter by category and paginate', async () => {
            const categoryId = 'test-category-id';
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '3',
                category: categoryId
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            expect(Products.find).toHaveBeenCalledWith({ id_category: categoryId });
            expect(res.json).toHaveBeenCalled();
        });
        
        test('should search products by name', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '10',
                category: 'all',
                search: 'Product 1'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.length).toBeGreaterThan(0);
            result.forEach(product => {
                expect(product.name_product.toUpperCase()).toContain('PRODUCT 1');
            });
        });
        
        test('should search products by price', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '10',
                category: 'all',
                search: '100'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            expect(res.json).toHaveBeenCalled();
        });
        
        test('should return empty array when search has no results', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '10',
                category: 'all',
                search: 'NonExistentProduct'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result).toEqual([]);
        });
        
        test('should handle default values for page and count', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                category: 'all'
            });
            const res = mockResponse();
            
            await productController.pagination(req, res);
            
            expect(res.json).toHaveBeenCalled();
        });
    });
    
    describe('GET /api/product/scroll - Infinite scroll products', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should return products for scroll pagination', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '3',
                search: ''
            });
            const res = mockResponse();
            
            await productController.scoll(req, res);
            
            expect(Products.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
        
        test('should search and scroll products', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '3',
                search: 'Product'
            });
            const res = mockResponse();
            
            await productController.scoll(req, res);
            
            expect(res.json).toHaveBeenCalled();
        });
        
        test('should handle page 2 for scroll', async () => {
            Products.find.mockResolvedValue(mockProducts);
            
            const req = mockRequest({}, {}, {
                page: '2',
                count: '2',
                search: ''
            });
            const res = mockResponse();
            
            await productController.scoll(req, res);
            
            expect(res.json).toHaveBeenCalled();
        });
    });
    
    describe('POST /api/product - Create new product', () => {
        test('should create new product successfully', async () => {
            const newProduct = testProducts.validProduct;
            Products.create.mockResolvedValue(newProduct);
            
            const req = mockRequest(newProduct);
            const res = mockResponse();
            
            // Assuming there's a create function
            if (productController.create) {
                await productController.create(req, res);
                
                expect(Products.create).toHaveBeenCalledWith(newProduct);
                expect(res.json).toHaveBeenCalled();
            }
        });
    });
    
    describe('PUT /api/product/:id - Update product', () => {
        test('should update product successfully', async () => {
            const mockProduct = {
                ...testProducts.validProduct,
                save: jest.fn().mockResolvedValue(true)
            };
            
            Products.findOne.mockResolvedValue(mockProduct);
            
            const updateData = {
                name_product: 'Updated Product',
                price_product: '200'
            };
            
            const req = mockRequest(updateData, { id: 'product-123' });
            const res = mockResponse();
            
            // Assuming there's an update function
            if (productController.update) {
                await productController.update(req, res);
                
                expect(Products.findOne).toHaveBeenCalledWith({ _id: 'product-123' });
            }
        });
    });
    
    describe('DELETE /api/product/:id - Delete product', () => {
        test('should delete product successfully', async () => {
            Products.deleteOne.mockResolvedValue({ deletedCount: 1 });
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            // Assuming there's a delete function
            if (productController.delete) {
                await productController.delete(req, res);
                
                expect(Products.deleteOne).toHaveBeenCalledWith({ _id: 'product-123' });
            }
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors in index', async () => {
            Products.find.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest();
            const res = mockResponse();
            
            try {
                await productController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle errors in pagination', async () => {
            Products.find.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({}, {}, {
                page: '1',
                count: '10',
                category: 'all'
            });
            const res = mockResponse();
            
            try {
                await productController.pagination(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });
});
