const { testProducts } = require('../helpers/testData');

// Unit tests cho Product Service Logic
describe('Product Service - Unit Tests', () => {
    
    describe('Product Filtering Logic', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should filter products by category', () => {
            const categoryId = 'test-category-id';
            
            // Giả lập logic filter
            const filteredProducts = mockProducts.filter(
                product => product.id_category === categoryId
            );
            
            expect(filteredProducts.length).toBe(mockProducts.length);
            filteredProducts.forEach(product => {
                expect(product.id_category).toBe(categoryId);
            });
        });
        
        test('should return all products when category is "all"', () => {
            const categoryId = 'all';
            
            // Logic từ product.controller.js
            let products;
            if (categoryId === 'all') {
                products = mockProducts;
            } else {
                products = mockProducts.filter(p => p.id_category === categoryId);
            }
            
            expect(products.length).toBe(mockProducts.length);
        });
        
        test('should filter products by search keyword (name)', () => {
            const searchKeyword = 'Product 1';
            
            // Logic search từ controller
            const filtered = mockProducts.filter(product => {
                return product.name_product.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1;
            });
            
            expect(filtered.length).toBeGreaterThan(0);
            filtered.forEach(product => {
                expect(product.name_product.toUpperCase()).toContain(searchKeyword.toUpperCase());
            });
        });
        
        test('should filter products by search keyword (price)', () => {
            const searchKeyword = '100';
            
            const filtered = mockProducts.filter(product => {
                return product.price_product.indexOf(searchKeyword) !== -1;
            });
            
            expect(filtered.length).toBeGreaterThan(0);
            filtered.forEach(product => {
                expect(product.price_product).toContain(searchKeyword);
            });
        });
        
        test('should handle case-insensitive search', () => {
            const searchKeyword = 'pRoDuCt';
            
            const filtered = mockProducts.filter(product => {
                return product.name_product.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1;
            });
            
            expect(filtered.length).toBe(mockProducts.length);
        });
    });
    
    describe('Product Pagination Logic', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should calculate correct pagination slice', () => {
            const page = 1;
            const numberProduct = 2;
            
            const start = (page - 1) * numberProduct;
            const end = page * numberProduct;
            
            expect(start).toBe(0);
            expect(end).toBe(2);
        });
        
        test('should paginate products correctly - page 1', () => {
            const page = 1;
            const count = 2;
            
            const start = (page - 1) * count;
            const end = page * count;
            const paginatedProducts = mockProducts.slice(start, end);
            
            expect(paginatedProducts.length).toBe(2);
            expect(paginatedProducts[0].name_product).toBe('Product 1');
            expect(paginatedProducts[1].name_product).toBe('Product 2');
        });
        
        test('should paginate products correctly - page 2', () => {
            const page = 2;
            const count = 2;
            
            const start = (page - 1) * count;
            const end = page * count;
            const paginatedProducts = mockProducts.slice(start, end);
            
            expect(paginatedProducts.length).toBe(2);
            expect(paginatedProducts[0].name_product).toBe('Product 3');
            expect(paginatedProducts[1].name_product).toBe('Product 4');
        });
        
        test('should handle last page with fewer items', () => {
            const page = 3;
            const count = 2;
            
            const start = (page - 1) * count;
            const end = page * count;
            const paginatedProducts = mockProducts.slice(start, end);
            
            expect(paginatedProducts.length).toBe(1);
            expect(paginatedProducts[0].name_product).toBe('Product 5');
        });
        
        test('should combine category filter and pagination', () => {
            const categoryId = 'test-category-id';
            const page = 1;
            const count = 3;
            
            // Step 1: Filter by category
            let products = mockProducts.filter(p => p.id_category === categoryId);
            
            // Step 2: Paginate
            const start = (page - 1) * count;
            const end = page * count;
            const result = products.slice(start, end);
            
            expect(result.length).toBe(3);
        });
    });
    
    describe('Product Search with Pagination', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should search and paginate together', () => {
            const page = 1;
            const count = 2;
            const searchKeyword = 'Product';
            
            // Pagination first
            const start = (page - 1) * count;
            const end = page * count;
            const paginatedProducts = mockProducts.slice(start, end);
            
            // Then search
            const searchResults = paginatedProducts.filter(product => {
                return product.name_product.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1;
            });
            
            expect(searchResults.length).toBeGreaterThan(0);
        });
        
        test('should return empty array when no match found', () => {
            const page = 1;
            const count = 2;
            const searchKeyword = 'NonExistent';
            
            const start = (page - 1) * count;
            const end = page * count;
            const paginatedProducts = mockProducts.slice(start, end);
            
            const searchResults = paginatedProducts.filter(product => {
                return product.name_product.toUpperCase().indexOf(searchKeyword.toUpperCase()) !== -1;
            });
            
            expect(searchResults).toEqual([]);
        });
    });
    
    describe('Product Validation Logic', () => {
        test('should validate product has required fields', () => {
            const product = testProducts.validProduct;
            
            expect(product).toHaveProperty('name_product');
            expect(product).toHaveProperty('price_product');
            expect(product).toHaveProperty('image');
            expect(product).toHaveProperty('id_category');
        });
        
        test('should validate price is numeric string', () => {
            const product = testProducts.validProduct;
            
            const price = parseInt(product.price_product);
            expect(price).toBeGreaterThan(0);
            expect(isNaN(price)).toBe(false);
        });
        
        test('should validate promotion is numeric', () => {
            const product = testProducts.validProduct;
            
            const promotion = parseInt(product.promotion);
            expect(promotion).toBeGreaterThanOrEqual(0);
            expect(promotion).toBeLessThanOrEqual(100);
        });
        
        test('should calculate discounted price', () => {
            const product = testProducts.validProduct;
            const price = parseInt(product.price_product);
            const promotion = parseInt(product.promotion);
            
            const discountedPrice = price - (price * promotion / 100);
            
            expect(discountedPrice).toBe(90); // 100 - 10% = 90
        });
    });
    
    describe('Product Scroll Logic', () => {
        const mockProducts = testProducts.bulkProducts;
        
        test('should load products for infinite scroll', () => {
            const page = 1;
            const count = 3;
            
            const start = (page - 1) * count;
            const end = page * count;
            const scrollProducts = mockProducts.slice(start, end);
            
            expect(scrollProducts.length).toBe(3);
        });
        
        test('should combine search with scroll pagination', () => {
            const page = 1;
            const count = 3;
            const search = 'Product';
            
            const start = (page - 1) * count;
            const end = page * count;
            const scrollProducts = mockProducts.slice(start, end);
            
            const filtered = scrollProducts.filter(product => {
                return product.name_product.toUpperCase().indexOf(search.toUpperCase()) !== -1;
            });
            
            expect(filtered.length).toBe(3);
        });
    });
});
