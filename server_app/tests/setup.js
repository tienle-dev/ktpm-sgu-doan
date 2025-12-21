const mongoose = require('mongoose');

// Mock environment variables nếu chưa có
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/test-db';

// Tăng timeout cho tất cả tests
jest.setTimeout(10000);

// Mock console để giảm noise trong test output
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Setup trước khi chạy tất cả tests
beforeAll(async () => {
    // Đóng tất cả connections cũ nếu có
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
});

// Cleanup sau mỗi test
afterEach(async () => {
    // Clear tất cả mocks
    jest.clearAllMocks();
});

// Cleanup sau khi chạy xong tất cả tests
afterAll(async () => {
    // Đóng kết nối database
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Đợi một chút để đảm bảo tất cả connections đã đóng
    await new Promise(resolve => setTimeout(resolve, 500));
});

// Helper để mock response object
global.mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

// Helper để mock request object
global.mockRequest = (body = {}, params = {}, query = {}) => {
    return {
        body,
        params,
        query,
        headers: {},
        user: null
    };
};
