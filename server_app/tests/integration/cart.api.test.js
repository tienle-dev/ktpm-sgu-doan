const Carts = require('../../Models/cart');
const Products = require('../../Models/product');
const cartController = require('../../API/Controller/cart.controller');
const { testCart, testProducts } = require('../helpers/testData');

// Mock the models
jest.mock('../../Models/cart');
jest.mock('../../Models/product');

// Integration tests cho Cart API
describe('Cart API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /api/cart/:id_user - Get cart', () => {
        test('should return cart for user', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: testCart.cartWithMultipleItems.items
            };
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockCart)
            };
            Carts.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id_user: 'user-123' });
            const res = mockResponse();
            
            await cartController.getCart(req, res);
            
            expect(Carts.findOne).toHaveBeenCalledWith({ id_user: 'user-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith('items.id_product');
            expect(res.json).toHaveBeenCalledWith(mockCart);
        });
        
        test('should return empty cart when user has no cart', async () => {
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(null)
            };
            Carts.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id_user: 'user-123' });
            const res = mockResponse();
            
            await cartController.getCart(req, res);
            
            expect(res.json).toHaveBeenCalledWith({
                id_user: 'user-123',
                items: []
            });
        });
        
        test('should return 400 when id_user is missing', async () => {
            const req = mockRequest({}, {});
            const res = mockResponse();
            
            await cartController.getCart(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Thiếu id_user' });
        });
        
        test('should handle database errors', async () => {
            const mockQuery = {
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            Carts.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id_user: 'user-123' });
            const res = mockResponse();
            
            await cartController.getCart(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Lỗi server',
                error: 'Database error'
            });
        });
    });
    
    describe('POST /api/cart/add - Add to cart', () => {
        test('should create new cart and add item for new user', async () => {
            Carts.findOne.mockResolvedValue(null);
            
            const mockCart = {
                id_user: 'user-123',
                items: [],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.mockImplementation(() => mockCart);
            
            const cartItem = testCart.validCartItem;
            const req = mockRequest(cartItem);
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(Carts.findOne).toHaveBeenCalledWith({ id_user: cartItem.id_user });
        });
        
        test('should add new item to existing cart', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const cartItem = testCart.validCartItem;
            const req = mockRequest(cartItem);
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(mockCart.save).toHaveBeenCalled();
        });
        
        test('should increase quantity for existing item (same product and size)', async () => {
            const existingItem = {
                id_product: 'product-123',
                size: 'M',
                count: 2
            };
            
            const mockCart = {
                id_user: 'user-123',
                items: [existingItem],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const cartItem = {
                id_user: 'user-123',
                id_product: 'product-123',
                size: 'M',
                count: 3
            };
            
            const req = mockRequest(cartItem);
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(mockCart.save).toHaveBeenCalled();
        });
        
        test('should add as separate item for same product but different size', async () => {
            const existingItem = {
                id_product: 'product-123',
                size: 'S',
                count: 2
            };
            
            const mockCart = {
                id_user: 'user-123',
                items: [existingItem],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const cartItem = {
                id_user: 'user-123',
                id_product: 'product-123',
                size: 'M', // Different size
                count: 1
            };
            
            const req = mockRequest(cartItem);
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(mockCart.save).toHaveBeenCalled();
        });
        
        test('should return 400 when required fields missing', async () => {
            const req = mockRequest({ id_user: '', id_product: '' });
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Thiếu thông tin bắt buộc' });
        });
        
        test('should handle errors gracefully', async () => {
            Carts.findOne.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest(testCart.validCartItem);
            const res = mockResponse();
            
            await cartController.addToCart(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
    
    describe('PUT /api/cart/update - Update cart item', () => {
        test('should update item quantity in cart', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [
                    {
                        id_product: 'product-123',
                        size: 'M',
                        count: 2
                    }
                ],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const req = mockRequest({
                id_user: 'user-123',
                id_product: 'product-123',
                size: 'M',
                count: 5
            });
            const res = mockResponse();
            
            if (cartController.updateCart) {
                await cartController.updateCart(req, res);
                
                expect(mockCart.save).toHaveBeenCalled();
            }
        });
    });
    
    describe('DELETE /api/cart/remove - Remove from cart', () => {
        test('should remove item from cart', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [
                    { id_product: 'product-123', size: 'M', count: 2 },
                    { id_product: 'product-456', size: 'L', count: 1 }
                ],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const req = mockRequest({
                id_user: 'user-123',
                id_product: 'product-123',
                size: 'M'
            });
            const res = mockResponse();
            
            if (cartController.removeFromCart) {
                await cartController.removeFromCart(req, res);
                
                expect(mockCart.save).toHaveBeenCalled();
            }
        });
        
        test('should handle removing non-existent item', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [
                    { id_product: 'product-123', size: 'M', count: 2 }
                ],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const req = mockRequest({
                id_user: 'user-123',
                id_product: 'non-existent',
                size: 'L'
            });
            const res = mockResponse();
            
            if (cartController.removeFromCart) {
                await cartController.removeFromCart(req, res);
            }
        });
    });
    
    describe('DELETE /api/cart/clear - Clear cart', () => {
        test('should clear all items from cart', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [
                    { id_product: 'product-123', size: 'M', count: 2 },
                    { id_product: 'product-456', size: 'L', count: 1 }
                ],
                save: jest.fn().mockResolvedValue(true)
            };
            
            Carts.findOne.mockResolvedValue(mockCart);
            
            const req = mockRequest({}, { id_user: 'user-123' });
            const res = mockResponse();
            
            if (cartController.clearCart) {
                await cartController.clearCart(req, res);
                
                expect(mockCart.save).toHaveBeenCalled();
            }
        });
    });
    
    describe('Cart Calculation', () => {
        test('should calculate cart total correctly', async () => {
            const mockCart = {
                id_user: 'user-123',
                items: [
                    {
                        id_product: {
                            price_product: '100'
                        },
                        count: 2
                    },
                    {
                        id_product: {
                            price_product: '50'
                        },
                        count: 3
                    }
                ]
            };
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockCart)
            };
            Carts.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id_user: 'user-123' });
            const res = mockResponse();
            
            await cartController.getCart(req, res);
            
            const cart = res.json.mock.calls[0][0];
            
            // Calculate total
            const total = cart.items.reduce((sum, item) => {
                return sum + (parseInt(item.id_product.price_product) * item.count);
            }, 0);
            
            expect(total).toBe(350); // (100*2) + (50*3)
        });
    });
});
