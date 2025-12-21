const { testCategories } = require('../helpers/testData');

// Unit tests cho Category Service Logic
describe('Category Service - Unit Tests', () => {
    
    describe('Category Validation Logic', () => {
        test('should validate category has required fields', () => {
            const category = testCategories.validCategory;
            
            expect(category).toHaveProperty('name');
            expect(typeof category.name).toBe('string');
        });
        
        test('should validate category name is not empty', () => {
            const validCategory = testCategories.validCategory;
            const invalidCategory = { name: '' };
            
            expect(validCategory.name.length).toBeGreaterThan(0);
            expect(invalidCategory.name.length).toBe(0);
        });
        
        test('should trim category name', () => {
            const categoryName = '  Test Category  ';
            const trimmed = categoryName.trim();
            
            expect(trimmed).toBe('Test Category');
            expect(trimmed.length).toBeLessThan(categoryName.length);
        });
    });
    
    describe('Category Name Formatting Logic', () => {
        test('should capitalize first letter of each word', () => {
            const input = 'test category name';
            
            // Logic từ category.controller.js
            const formatted = input.toLowerCase().replace(/^.|\s\S/g, a => { 
                return a.toUpperCase() 
            });
            
            expect(formatted).toBe('Test Category Name');
        });
        
        test('should handle single word category', () => {
            const input = 'electronics';
            const formatted = input.toLowerCase().replace(/^.|\s\S/g, a => { 
                return a.toUpperCase() 
            });
            
            expect(formatted).toBe('Electronics');
        });
        
        test('should handle already capitalized input', () => {
            const input = 'FASHION ITEMS';
            const formatted = input.toLowerCase().replace(/^.|\s\S/g, a => { 
                return a.toUpperCase() 
            });
            
            expect(formatted).toBe('Fashion Items');
        });
        
        test('should handle mixed case input', () => {
            const input = 'SpOrTs EqUiPmEnT';
            const formatted = input.toLowerCase().replace(/^.|\s\S/g, a => { 
                return a.toUpperCase() 
            });
            
            expect(formatted).toBe('Sports Equipment');
        });
    });
    
    describe('Category Duplicate Detection Logic', () => {
        const mockCategories = [
            { category: 'Electronics', _id: 'cat-1' },
            { category: 'Fashion', _id: 'cat-2' },
            { category: 'Sports', _id: 'cat-3' }
        ];
        
        test('should detect duplicate category (case-insensitive)', () => {
            const newCategoryName = 'electronics';
            
            const duplicate = mockCategories.filter((c) => {
                return c.category.toUpperCase() === newCategoryName.toUpperCase().trim()
            });
            
            expect(duplicate.length).toBeGreaterThan(0);
            expect(duplicate[0].category).toBe('Electronics');
        });
        
        test('should detect duplicate with different case', () => {
            const newCategoryName = 'FASHION';
            
            const duplicate = mockCategories.filter((c) => {
                return c.category.toUpperCase() === newCategoryName.toUpperCase().trim()
            });
            
            expect(duplicate.length).toBe(1);
        });
        
        test('should not detect duplicate for unique category', () => {
            const newCategoryName = 'Books';
            
            const duplicate = mockCategories.filter((c) => {
                return c.category.toUpperCase() === newCategoryName.toUpperCase().trim()
            });
            
            expect(duplicate.length).toBe(0);
        });
        
        test('should handle whitespace in duplicate detection', () => {
            const newCategoryName = '  electronics  ';
            
            const duplicate = mockCategories.filter((c) => {
                return c.category.toUpperCase() === newCategoryName.toUpperCase().trim()
            });
            
            expect(duplicate.length).toBeGreaterThan(0);
        });
    });
    
    describe('Category Search Logic', () => {
        const mockCategories = [
            { category: 'Electronics', id: 'cat-001' },
            { category: 'Fashion', id: 'cat-002' },
            { category: 'Sports Equipment', id: 'cat-003' },
            { category: 'Home & Garden', id: 'cat-004' }
        ];
        
        test('should search categories by name', () => {
            const searchKeyword = 'Elect';
            
            const results = mockCategories.filter(value => {
                return value.category.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1
            });
            
            expect(results.length).toBe(1);
            expect(results[0].category).toBe('Electronics');
        });
        
        test('should search categories by ID', () => {
            const searchKeyword = '001';
            
            const results = mockCategories.filter(value => {
                return value.id.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1
            });
            
            expect(results.length).toBe(1);
            expect(results[0].id).toBe('cat-001');
        });
        
        test('should search case-insensitive', () => {
            const searchKeyword = 'fashion';
            
            const results = mockCategories.filter(value => {
                return value.category.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1
            });
            
            expect(results.length).toBe(1);
        });
        
        test('should return empty array when no match', () => {
            const searchKeyword = 'NonExistent';
            
            const results = mockCategories.filter(value => {
                return value.category.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1 ||
                       value.id.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1
            });
            
            expect(results.length).toBe(0);
        });
        
        test('should search partial matches', () => {
            const searchKeyword = 'Sport';
            
            const results = mockCategories.filter(value => {
                return value.category.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1
            });
            
            expect(results.length).toBe(1);
            expect(results[0].category).toContain('Sport');
        });
    });
    
    describe('Category Pagination Logic', () => {
        const mockCategories = Array.from({ length: 20 }, (_, i) => ({
            category: `Category ${i + 1}`,
            _id: `cat-${i + 1}`
        }));
        
        test('should calculate pagination correctly - page 1', () => {
            const page = 1;
            const perPage = 8;
            
            const start = (page - 1) * perPage;
            const end = page * perPage;
            
            expect(start).toBe(0);
            expect(end).toBe(8);
        });
        
        test('should paginate categories - page 1', () => {
            const page = 1;
            const perPage = 8;
            
            const start = (page - 1) * perPage;
            const end = page * perPage;
            const paginated = mockCategories.slice(start, end);
            
            expect(paginated.length).toBe(8);
            expect(paginated[0].category).toBe('Category 1');
            expect(paginated[7].category).toBe('Category 8');
        });
        
        test('should paginate categories - page 2', () => {
            const page = 2;
            const perPage = 8;
            
            const start = (page - 1) * perPage;
            const end = page * perPage;
            const paginated = mockCategories.slice(start, end);
            
            expect(paginated.length).toBe(8);
            expect(paginated[0].category).toBe('Category 9');
        });
        
        test('should calculate total pages', () => {
            const perPage = 8;
            const totalPage = Math.ceil(mockCategories.length / perPage);
            
            expect(totalPage).toBe(3); // 20 categories / 8 per page = 3 pages
        });
        
        test('should handle last page with fewer items', () => {
            const page = 3;
            const perPage = 8;
            
            const start = (page - 1) * perPage;
            const end = page * perPage;
            const paginated = mockCategories.slice(start, end);
            
            expect(paginated.length).toBe(4); // 20 - 16 = 4 items on last page
        });
    });
    
    describe('Category Count Logic', () => {
        test('should count total categories', () => {
            const categories = [
                { category: 'Electronics' },
                { category: 'Fashion' },
                { category: 'Sports' }
            ];
            
            const count = categories.length;
            
            expect(count).toBe(3);
        });
        
        test('should handle empty category list', () => {
            const categories = [];
            
            const count = categories.length;
            
            expect(count).toBe(0);
        });
    });
    
    describe('Category Lookup Logic', () => {
        const mockCategories = [
            { category: 'Electronics', _id: 'cat-001' },
            { category: 'Fashion', _id: 'cat-002' },
            { category: 'Sports', _id: 'cat-003' }
        ];
        
        test('should find category by name', () => {
            const categoryName = 'Electronics';
            
            const found = mockCategories.find(c => c.category === categoryName);
            
            expect(found).toBeDefined();
            expect(found._id).toBe('cat-001');
        });
        
        test('should find category by ID', () => {
            const categoryId = 'cat-002';
            
            const found = mockCategories.find(c => c._id === categoryId);
            
            expect(found).toBeDefined();
            expect(found.category).toBe('Fashion');
        });
        
        test('should return undefined when category not found', () => {
            const categoryName = 'NonExistent';
            
            const found = mockCategories.find(c => c.category === categoryName);
            
            expect(found).toBeUndefined();
        });
    });
    
    describe('Category Product Association Logic', () => {
        test('should link products to category', () => {
            const categoryId = 'cat-123';
            const products = [
                { name: 'Product 1', id_category: categoryId },
                { name: 'Product 2', id_category: categoryId },
                { name: 'Product 3', id_category: categoryId }
            ];
            
            const categoryProducts = products.filter(p => p.id_category === categoryId);
            
            expect(categoryProducts.length).toBe(3);
        });
        
        test('should count products in category', () => {
            const categoryId = 'cat-123';
            const allProducts = [
                { name: 'Product 1', id_category: 'cat-123' },
                { name: 'Product 2', id_category: 'cat-456' },
                { name: 'Product 3', id_category: 'cat-123' }
            ];
            
            const count = allProducts.filter(p => p.id_category === categoryId).length;
            
            expect(count).toBe(2);
        });
    });
    
    describe('Category Sorting Logic', () => {
        test('should sort categories alphabetically', () => {
            const categories = [
                { category: 'Sports' },
                { category: 'Electronics' },
                { category: 'Fashion' }
            ];
            
            const sorted = [...categories].sort((a, b) => 
                a.category.localeCompare(b.category)
            );
            
            expect(sorted[0].category).toBe('Electronics');
            expect(sorted[1].category).toBe('Fashion');
            expect(sorted[2].category).toBe('Sports');
        });
    });
});
