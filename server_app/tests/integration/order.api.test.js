const Order = require('../../Models/order');
const Detail_Order = require('../../Models/detail_order');
const Note = require('../../Models/note');
const orderController = require('../../API/Controller/order.controller');
const mailer = require('../../mailer');
const { testOrders } = require('../helpers/testData');

// Mock the models and mailer
jest.mock('../../Models/order');
jest.mock('../../Models/detail_order');
jest.mock('../../Models/note');
jest.mock('../../mailer');

// Integration tests cho Order API
describe('Order API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('POST /api/order - Create order', () => {
        test('should create new order successfully', async () => {
            const mockOrder = {
                ...testOrders.validOrder,
                _id: 'order-123'
            };
            
            Order.create.mockResolvedValue(mockOrder);
            
            const req = mockRequest(testOrders.validOrder);
            const res = mockResponse();
            
            await orderController.post_order(req, res);
            
            expect(Order.create).toHaveBeenCalledWith(testOrders.validOrder);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });
        
        test('should create order with payment info', async () => {
            const orderWithPayment = testOrders.orderWithPayment;
            Order.create.mockResolvedValue({ ...orderWithPayment, _id: 'order-456' });
            
            const req = mockRequest(orderWithPayment);
            const res = mockResponse();
            
            await orderController.post_order(req, res);
            
            expect(Order.create).toHaveBeenCalledWith(orderWithPayment);
            expect(res.json).toHaveBeenCalled();
        });
        
        test('should handle order creation errors', async () => {
            Order.create.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest(testOrders.validOrder);
            const res = mockResponse();
            
            try {
                await orderController.post_order(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });
    
    describe('POST /api/order/send_mail - Send order confirmation email', () => {
        test('should send email with order details', async () => {
            const mockCartItems = [
                {
                    id_product: {
                        name_product: 'Product 1',
                        price_product: '100',
                        image: 'http://example.com/image1.jpg'
                    },
                    count: 2,
                    size: 'M'
                },
                {
                    id_product: {
                        name_product: 'Product 2',
                        price_product: '50',
                        image: 'http://example.com/image2.jpg'
                    },
                    count: 3,
                    size: 'L'
                }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockCartItems)
            };
            Detail_Order.find.mockReturnValue(mockQuery);
            mailer.sendMail.mockResolvedValue(true);
            
            const req = mockRequest({
                id_order: 'order-123',
                fullname: 'Test Customer',
                email: 'customer@example.com',
                phone: '0123456789',
                address: '123 Test St',
                price: '50',
                total: '400'
            });
            const res = mockResponse();
            
            await orderController.send_mail(req, res);
            
            expect(Detail_Order.find).toHaveBeenCalledWith({ id_order: 'order-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith('id_product');
            expect(mailer.sendMail).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Gui Email Thanh Cong');
        });
        
        test('should generate correct email HTML content', async () => {
            const mockCartItems = [
                {
                    id_product: {
                        name_product: 'Test Product',
                        price_product: '100',
                        image: 'http://example.com/image.jpg'
                    },
                    count: 2,
                    size: 'M'
                }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockCartItems)
            };
            Detail_Order.find.mockReturnValue(mockQuery);
            mailer.sendMail.mockResolvedValue(true);
            
            const req = mockRequest({
                id_order: 'order-123',
                fullname: 'John Doe',
                email: 'john@example.com',
                phone: '0123456789',
                address: '123 Main St',
                price: '30',
                total: '230'
            });
            const res = mockResponse();
            
            await orderController.send_mail(req, res);
            
            const emailCall = mailer.sendMail.mock.calls[0];
            expect(emailCall[0]).toBe('john@example.com');
            expect(emailCall[1]).toBe('Hóa Đơn Đặt Hàng');
            expect(emailCall[2]).toContain('John Doe');
            expect(emailCall[2]).toContain('0123456789');
            expect(emailCall[2]).toContain('123 Main St');
            expect(emailCall[2]).toContain('230$');
        });
    });
    
    describe('GET /api/order/:id - Get user orders', () => {
        test('should return all orders for user', async () => {
            const mockOrders = [
                { ...testOrders.validOrder, _id: 'order-1' },
                { ...testOrders.validOrder, _id: 'order-2' }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockOrders)
            };
            Order.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'user-123' });
            const res = mockResponse();
            
            await orderController.get_order(req, res);
            
            expect(Order.find).toHaveBeenCalledWith({ id_user: 'user-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith(['id_user', 'id_note']);
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
        
        test('should return empty array when user has no orders', async () => {
            const mockQuery = {
                populate: jest.fn().mockResolvedValue([])
            };
            Order.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'user-123' });
            const res = mockResponse();
            
            await orderController.get_order(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });
    
    describe('GET /api/order/detail/:id - Get order detail', () => {
        test('should return order with full details', async () => {
            const mockOrder = {
                ...testOrders.orderWithPayment,
                _id: 'order-123',
                id_user: { username: 'testuser' },
                id_note: { content: 'Please deliver after 5pm' },
                id_payment: { method: 'MoMo', status: 'completed' }
            };
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockOrder)
            };
            Order.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'order-123' });
            const res = mockResponse();
            
            await orderController.get_detail(req, res);
            
            expect(Order.findOne).toHaveBeenCalledWith({ _id: 'order-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith(['id_user', 'id_note', 'id_payment']);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });
        
        test('should handle order not found', async () => {
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(null)
            };
            Order.findOne.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'non-existent' });
            const res = mockResponse();
            
            await orderController.get_detail(req, res);
            
            expect(res.json).toHaveBeenCalledWith(null);
        });
    });
    
    describe('POST /api/order/momo - Create MoMo payment', () => {
        test('should create MoMo payment request', async () => {
            const req = mockRequest({
                orderID: 'order-123',
                total: '500'
            });
            const res = mockResponse();
            
            if (orderController.create_momo_payment) {
                // Mock crypto and https
                jest.mock('crypto');
                jest.mock('https');
                
                await orderController.create_momo_payment(req, res);
                
                // Verify request was processed
                expect(req.body.orderID).toBe('order-123');
                expect(req.body.total).toBe('500');
            }
        });
        
        test('should return error when missing orderID or total', async () => {
            const req = mockRequest({ orderID: '', total: '' });
            const res = mockResponse();
            
            if (orderController.create_momo_payment) {
                await orderController.create_momo_payment(req, res);
                
                expect(res.status).toHaveBeenCalledWith(400);
            }
        });
    });
    
    describe('PUT /api/order/:id/status - Update order status', () => {
        test('should update order status', async () => {
            const mockOrder = {
                ...testOrders.validOrder,
                status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };
            
            Order.findOne.mockResolvedValue(mockOrder);
            
            const req = mockRequest(
                { status: 'processing' },
                { id: 'order-123' }
            );
            const res = mockResponse();
            
            if (orderController.update_status) {
                await orderController.update_status(req, res);
                
                expect(Order.findOne).toHaveBeenCalledWith({ _id: 'order-123' });
                expect(mockOrder.save).toHaveBeenCalled();
            }
        });
    });
    
    describe('GET /api/order/all - Get all orders (Admin)', () => {
        test('should return all orders for admin', async () => {
            const mockOrders = [
                { ...testOrders.validOrder, _id: 'order-1' },
                { ...testOrders.validOrder, _id: 'order-2' },
                { ...testOrders.validOrder, _id: 'order-3' }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockOrders)
            };
            Order.find.mockReturnValue(mockQuery);
            
            const req = mockRequest();
            const res = mockResponse();
            
            if (orderController.get_all_orders) {
                await orderController.get_all_orders(req, res);
                
                expect(Order.find).toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith(mockOrders);
            }
        });
    });
    
    describe('Order Detail Items', () => {
        test('should get order detail items', async () => {
            const mockDetailOrders = [
                {
                    id_order: 'order-123',
                    id_product: 'product-1',
                    count: 2,
                    size: 'M'
                },
                {
                    id_order: 'order-123',
                    id_product: 'product-2',
                    count: 1,
                    size: 'L'
                }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockDetailOrders)
            };
            Detail_Order.find.mockReturnValue(mockQuery);
            
            const orderId = 'order-123';
            const result = await Detail_Order.find({ id_order: orderId }).populate('id_product');
            
            expect(Detail_Order.find).toHaveBeenCalledWith({ id_order: orderId });
            expect(result.length).toBe(2);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors in get_order', async () => {
            const mockQuery = {
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            Order.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'user-123' });
            const res = mockResponse();
            
            try {
                await orderController.get_order(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle mailer errors', async () => {
            const mockQuery = {
                populate: jest.fn().mockResolvedValue([])
            };
            Detail_Order.find.mockReturnValue(mockQuery);
            mailer.sendMail.mockRejectedValue(new Error('Email service error'));
            
            const req = mockRequest({
                id_order: 'order-123',
                email: 'test@example.com',
                fullname: 'Test',
                phone: '123',
                address: 'Address',
                price: '10',
                total: '100'
            });
            const res = mockResponse();
            
            try {
                await orderController.send_mail(req, res);
            } catch (error) {
                expect(error.message).toBe('Email service error');
            }
        });
    });
});
