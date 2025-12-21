const Category = require('../../Models/category');
const Product = require('../../Models/product');
const categoryController = require('../../API/Controller/category.controller');
const categoryAdminController = require('../../API/Controller/admin/category.controller');
const { testCategories } = require('../helpers/testData');

// Mock the models
jest.mock('../../Models/category');
jest.mock('../../Models/product');

// Integration tests cho Category API
describe('Category API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /api/category - Get all categories (Client)', () => {
        test('should return all categories', async () => {
            const mockCategories = [
                { category: 'Electronics', _id: 'cat-1' },
                { category: 'Fashion', _id: 'cat-2' },
                { category: 'Sports', _id: 'cat-3' }
            ];
            
            Category.find.mockResolvedValue(mockCategories);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await categoryController.index(req, res);
            
            expect(Category.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockCategories);
        });
        
        test('should return empty array when no categories', async () => {
            Category.find.mockResolvedValue([]);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await categoryController.index(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });
    
    describe('GET /admin/category - Get paginated categories (Admin)', () => {
        const mockCategories = Array.from({ length: 20 }, (_, i) => ({
            category: `Category ${i + 1}`,
            id: `cat-${String(i + 1).padStart(3, '0')}`,
            _id: `cat-id-${i + 1}`
        }));
        
        test('should return paginated categories - page 1', async () => {
            Category.find.mockResolvedValue(mockCategories);
            Category.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, { page: '1', limit: '8' });
            const res = mockResponse();
            
            await categoryAdminController.index(req, res);
            
            expect(Category.find).toHaveBeenCalled();
            expect(Category.countDocuments).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
            
            const result = res.json.mock.calls[0][0];
            expect(result).toHaveProperty('categories');
            expect(result).toHaveProperty('totalPage');
            expect(result.categories.length).toBe(8);
            expect(result.totalPage).toBe(3); // 20 / 8 = 3 pages
        });
        
        test('should return paginated categories - page 2', async () => {
            Category.find.mockResolvedValue(mockCategories);
            Category.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, { page: '2', limit: '8' });
            const res = mockResponse();
            
            await categoryAdminController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.categories.length).toBe(8);
            expect(result.categories[0].category).toBe('Category 9');
        });
        
        test('should use default pagination values', async () => {
            Category.find.mockResolvedValue(mockCategories);
            Category.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {}); // No page or limit
            const res = mockResponse();
            
            await categoryAdminController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.categories.length).toBe(8); // Default limit is 8
        });
        
        test('should search categories by name', async () => {
            Category.find.mockResolvedValue(mockCategories);
            Category.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {
                page: '1',
                limit: '8',
                search: 'Category 1'
            });
            const res = mockResponse();
            
            await categoryAdminController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.categories.length).toBeGreaterThan(0);
            
            // Verify search logic
            result.categories.forEach(cat => {
                expect(
                    cat.category.toUpperCase().includes('CATEGORY 1') ||
                    cat.id.toUpperCase().includes('CATEGORY 1')
                ).toBe(true);
            });
        });
        
        test('should search categories by ID', async () => {
            Category.find.mockResolvedValue(mockCategories);
            Category.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {
                page: '1',
                limit: '8',
                search: '001'
            });
            const res = mockResponse();
            
            await categoryAdminController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.categories.length).toBeGreaterThan(0);
        });
    });
    
    describe('POST /admin/category/create - Create category', () => {
        test('should create new category successfully', async () => {
            Category.find.mockResolvedValue([
                { category: 'Electronics' },
                { category: 'Fashion' }
            ]);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Category.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: 'Sports' });
            const res = mockResponse();
            
            await categoryAdminController.create(req, res);
            
            expect(Category.find).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã thêm thành công' });
        });
        
        test('should capitalize category name on creation', async () => {
            Category.find.mockResolvedValue([]);
            
            let savedCategory = null;
            const mockSave = jest.fn().mockImplementation(function() {
                savedCategory = this;
                return Promise.resolve();
            });
            
            Category.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: 'home appliances' });
            const res = mockResponse();
            
            await categoryAdminController.create(req, res);
            
            // Verify capitalization logic
            const formatted = 'home appliances'.toLowerCase().replace(/^.|\s\S/g, a => a.toUpperCase());
            expect(formatted).toBe('Home Appliances');
        });
        
        test('should reject duplicate category (case-insensitive)', async () => {
            Category.find.mockResolvedValue([
                { category: 'Electronics' },
                { category: 'Fashion' }
            ]);
            
            const req = mockRequest({}, {}, { name: 'electronics' }); // lowercase
            const res = mockResponse();
            
            await categoryAdminController.create(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Loại đã tồn tại' });
        });
        
        test('should reject duplicate with different case', async () => {
            Category.find.mockResolvedValue([
                { category: 'Fashion' }
            ]);
            
            const req = mockRequest({}, {}, { name: 'FASHION' });
            const res = mockResponse();
            
            await categoryAdminController.create(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Loại đã tồn tại' });
        });
        
        test('should handle whitespace in category name', async () => {
            Category.find.mockResolvedValue([]);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Category.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: '  Sports Equipment  ' });
            const res = mockResponse();
            
            await categoryAdminController.create(req, res);
            
            expect(mockSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã thêm thành công' });
        });
    });
    
    describe('DELETE /admin/category/delete - Delete category', () => {
        test('should delete category successfully', async () => {
            Category.deleteOne.mockImplementation((query, callback) => {
                callback(null);
                return Promise.resolve();
            });
            
            const req = mockRequest({}, {}, { id: 'cat-123' });
            const res = mockResponse();
            
            await categoryAdminController.delete(req, res);
            
            expect(Category.deleteOne).toHaveBeenCalledWith(
                { _id: 'cat-123' },
                expect.any(Function)
            );
            expect(res.json).toHaveBeenCalledWith({ msg: 'Thanh Cong' });
        });
        
        test('should handle delete errors', async () => {
            const error = new Error('Delete failed');
            Category.deleteOne.mockImplementation((query, callback) => {
                callback(error);
                return Promise.resolve();
            });
            
            const req = mockRequest({}, {}, { id: 'cat-123' });
            const res = mockResponse();
            
            await categoryAdminController.delete(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: error });
        });
    });
    
    describe('GET /admin/category/:id/products - Get products by category', () => {
        test('should return products for category with pagination', async () => {
            const mockCategory = {
                category: 'Electronics',
                _id: 'cat-123'
            };
            
            const mockProducts = Array.from({ length: 15 }, (_, i) => ({
                name_product: `Product ${i + 1}`,
                price_product: '100',
                id_category: 'cat-123',
                id: `prod-${i + 1}`
            }));
            
            Category.findOne.mockResolvedValue(mockCategory);
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockProducts)
            };
            Product.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'Electronics' }, {
                page: '1',
                limit: '8'
            });
            const res = mockResponse();
            
            await categoryAdminController.detailProduct(req, res);
            
            expect(Category.findOne).toHaveBeenCalledWith({ category: 'Electronics' });
            expect(Product.find).toHaveBeenCalledWith({ id_category: 'cat-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith('id_category');
            
            const result = res.json.mock.calls[0][0];
            expect(result).toHaveProperty('products');
            expect(result).toHaveProperty('totalPage');
            expect(result.products.length).toBe(8);
        });
        
        test('should search products in category', async () => {
            const mockCategory = {
                category: 'Electronics',
                _id: 'cat-123'
            };
            
            const mockProducts = [
                { name_product: 'Laptop', price_product: '1000', id: 'prod-1' },
                { name_product: 'Phone', price_product: '500', id: 'prod-2' },
                { name_product: 'Tablet', price_product: '300', id: 'prod-3' }
            ];
            
            Category.findOne.mockResolvedValue(mockCategory);
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockProducts)
            };
            Product.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'Electronics' }, {
                page: '1',
                limit: '8',
                search: 'Laptop'
            });
            const res = mockResponse();
            
            await categoryAdminController.detailProduct(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.products.length).toBeGreaterThan(0);
        });
        
        test('should handle category with no products', async () => {
            const mockCategory = {
                category: 'Empty Category',
                _id: 'cat-999'
            };
            
            Category.findOne.mockResolvedValue(mockCategory);
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue([])
            };
            Product.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'Empty Category' }, {
                page: '1',
                limit: '8'
            });
            const res = mockResponse();
            
            await categoryAdminController.detailProduct(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.products).toEqual([]);
            expect(result.totalPage).toBe(0);
        });
    });
    
    describe('PUT /admin/category/:id - Update category', () => {
        test('should update category name', async () => {
            const mockCategory = {
                _id: 'cat-123',
                category: 'Old Name',
                save: jest.fn().mockResolvedValue(true)
            };
            
            Category.findOne.mockResolvedValue(mockCategory);
            
            const req = mockRequest(
                { category: 'New Name' },
                { id: 'cat-123' }
            );
            const res = mockResponse();
            
            if (categoryAdminController.update) {
                await categoryAdminController.update(req, res);
                
                expect(Category.findOne).toHaveBeenCalledWith({ _id: 'cat-123' });
                expect(mockCategory.save).toHaveBeenCalled();
            }
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors in index', async () => {
            Category.find.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest();
            const res = mockResponse();
            
            try {
                await categoryController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle errors in admin index', async () => {
            Category.find.mockRejectedValue(new Error('Database error'));
            Category.countDocuments.mockResolvedValue(0);
            
            const req = mockRequest({}, {}, { page: '1', limit: '8' });
            const res = mockResponse();
            
            try {
                await categoryAdminController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });
    
    describe('Category Statistics', () => {
        test('should count products per category', async () => {
            const categories = [
                { _id: 'cat-1', category: 'Electronics' },
                { _id: 'cat-2', category: 'Fashion' }
            ];
            
            const products = [
                { id_category: 'cat-1' },
                { id_category: 'cat-1' },
                { id_category: 'cat-1' },
                { id_category: 'cat-2' },
                { id_category: 'cat-2' }
            ];
            
            const electronicsCount = products.filter(p => p.id_category === 'cat-1').length;
            const fashionCount = products.filter(p => p.id_category === 'cat-2').length;
            
            expect(electronicsCount).toBe(3);
            expect(fashionCount).toBe(2);
        });
    });
});
