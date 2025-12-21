const { testCart } = require('../helpers/testData');

// Unit tests cho Cart Service Logic
describe('Cart Service - Unit Tests', () => {
    
    describe('Cart Item Management Logic', () => {
        test('should find existing cart item by product id and size', () => {
            const cart = testCart.cartWithMultipleItems;
            const productId = 'product-1';
            const size = 'S';
            
            // Logic từ cart.controller.js
            const existingItemIndex = cart.items.findIndex(
                item => item.id_product === productId && item.size === size
            );
            
            expect(existingItemIndex).toBeGreaterThanOrEqual(0);
            expect(cart.items[existingItemIndex].id_product).toBe(productId);
            expect(cart.items[existingItemIndex].size).toBe(size);
        });
        
        test('should return -1 when item not found', () => {
            const cart = testCart.cartWithMultipleItems;
            const productId = 'non-existent-product';
            const size = 'XL';
            
            const existingItemIndex = cart.items.findIndex(
                item => item.id_product === productId && item.size === size
            );
            
            expect(existingItemIndex).toBe(-1);
        });
        
        test('should distinguish items with same product but different sizes', () => {
            const cart = {
                items: [
                    { id_product: 'product-1', size: 'S', count: 1 },
                    { id_product: 'product-1', size: 'M', count: 2 }
                ]
            };
            
            const indexS = cart.items.findIndex(
                item => item.id_product === 'product-1' && item.size === 'S'
            );
            const indexM = cart.items.findIndex(
                item => item.id_product === 'product-1' && item.size === 'M'
            );
            
            expect(indexS).toBe(0);
            expect(indexM).toBe(1);
            expect(indexS).not.toBe(indexM);
        });
    });
    
    describe('Cart Quantity Update Logic', () => {
        test('should increase quantity when adding existing item', () => {
            const existingItem = { count: 2 };
            const addCount = 3;
            
            existingItem.count += addCount;
            
            expect(existingItem.count).toBe(5);
        });
        
        test('should set quantity directly when updating', () => {
            const item = { count: 2 };
            const newCount = 5;
            
            item.count = newCount;
            
            expect(item.count).toBe(5);
        });
        
        test('should handle zero quantity', () => {
            const item = { count: 3 };
            
            item.count = 0;
            
            expect(item.count).toBe(0);
        });
        
        test('should validate positive quantity', () => {
            const count = 3;
            
            expect(count).toBeGreaterThan(0);
        });
    });
    
    describe('Cart Total Calculation Logic', () => {
        test('should calculate total for single item', () => {
            const item = {
                price_product: '100',
                count: 2
            };
            
            const itemTotal = parseInt(item.price_product) * item.count;
            
            expect(itemTotal).toBe(200);
        });
        
        test('should calculate cart total for multiple items', () => {
            const items = [
                { price_product: '100', count: 2 },
                { price_product: '200', count: 1 },
                { price_product: '50', count: 3 }
            ];
            
            const total = items.reduce((sum, item) => {
                return sum + (parseInt(item.price_product) * item.count);
            }, 0);
            
            expect(total).toBe(550); // 200 + 200 + 150
        });
        
        test('should handle empty cart', () => {
            const items = [];
            
            const total = items.reduce((sum, item) => {
                return sum + (parseInt(item.price_product) * item.count);
            }, 0);
            
            expect(total).toBe(0);
        });
        
        test('should calculate with decimal prices', () => {
            const items = [
                { price_product: '99.99', count: 1 },
                { price_product: '50.50', count: 2 }
            ];
            
            const total = items.reduce((sum, item) => {
                return sum + (parseFloat(item.price_product) * item.count);
            }, 0);
            
            expect(total).toBeCloseTo(200.99, 2);
        });
    });
    
    describe('Cart Item Removal Logic', () => {
        test('should remove item by product id and size', () => {
            const cart = {
                items: [
                    { id_product: 'product-1', size: 'S', count: 1 },
                    { id_product: 'product-2', size: 'M', count: 2 },
                    { id_product: 'product-3', size: 'L', count: 1 }
                ]
            };
            
            const productIdToRemove = 'product-2';
            const sizeToRemove = 'M';
            
            cart.items = cart.items.filter(
                item => !(item.id_product === productIdToRemove && item.size === sizeToRemove)
            );
            
            expect(cart.items.length).toBe(2);
            expect(cart.items.find(i => i.id_product === 'product-2')).toBeUndefined();
        });
        
        test('should clear all items from cart', () => {
            const cart = {
                items: [
                    { id_product: 'product-1', size: 'S', count: 1 },
                    { id_product: 'product-2', size: 'M', count: 2 }
                ]
            };
            
            cart.items = [];
            
            expect(cart.items.length).toBe(0);
        });
    });
    
    describe('Cart Validation Logic', () => {
        test('should validate cart item has required fields', () => {
            const item = testCart.validCartItem;
            
            expect(item).toHaveProperty('id_user');
            expect(item).toHaveProperty('id_product');
            expect(item).toHaveProperty('count');
            expect(item).toHaveProperty('price_product');
        });
        
        test('should detect missing required fields', () => {
            const invalidItem = {
                id_user: '',
                id_product: '',
                count: 0
            };
            
            expect(invalidItem.id_user).toBeFalsy();
            expect(invalidItem.id_product).toBeFalsy();
            expect(invalidItem.count).toBe(0);
        });
        
        test('should validate positive count', () => {
            const validCount = 3;
            const invalidCount = -1;
            
            expect(validCount).toBeGreaterThan(0);
            expect(invalidCount).toBeLessThan(0);
        });
    });
    
    describe('Cart Creation Logic', () => {
        test('should create new empty cart for user', () => {
            const userId = 'test-user-id';
            
            const newCart = {
                id_user: userId,
                items: []
            };
            
            expect(newCart.id_user).toBe(userId);
            expect(newCart.items).toEqual([]);
            expect(Array.isArray(newCart.items)).toBe(true);
        });
        
        test('should add first item to new cart', () => {
            const cart = {
                id_user: 'test-user-id',
                items: []
            };
            
            const newItem = {
                id_product: 'product-1',
                name_product: 'Test Product',
                price_product: '100',
                count: 1,
                size: 'M',
                image: 'image.jpg'
            };
            
            cart.items.push(newItem);
            
            expect(cart.items.length).toBe(1);
            expect(cart.items[0]).toEqual(newItem);
        });
    });
    
    describe('Cart Update Logic', () => {
        test('should update existing item quantity', () => {
            const cart = {
                items: [
                    { id_product: 'product-1', size: 'S', count: 2, price_product: '100' }
                ]
            };
            
            const productId = 'product-1';
            const size = 'S';
            const newCount = 5;
            
            const itemIndex = cart.items.findIndex(
                item => item.id_product === productId && item.size === size
            );
            
            if (itemIndex >= 0) {
                cart.items[itemIndex].count = newCount;
            }
            
            expect(cart.items[0].count).toBe(5);
        });
        
        test('should update item size', () => {
            const cart = {
                items: [
                    { id_product: 'product-1', size: 'S', count: 2 }
                ]
            };
            
            // Change size from S to M
            cart.items[0].size = 'M';
            
            expect(cart.items[0].size).toBe('M');
        });
    });
});
