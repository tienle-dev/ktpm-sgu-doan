// Test data helpers cho các bài test

// User test data
const testUsers = {
    validUser: {
        username: 'testuser',
        password: 'Test123!@#',
        fullname: 'Test User',
        email: 'testuser@example.com',
        phone: '0123456789',
        gender: 'male',
        id_permission: '1'
    },
    
    adminUser: {
        username: 'admin',
        password: 'Admin123!@#',
        fullname: 'Admin User',
        email: 'admin@example.com',
        phone: '0987654321',
        gender: 'male',
        id_permission: '0'
    },
    
    invalidUser: {
        username: '',
        password: '123',
        email: 'invalid-email',
    }
};

// Product test data
const testProducts = {
    validProduct: {
        name_product: 'Test Product',
        price_product: '100',
        image: 'http://example.com/image.jpg',
        describe: 'Test product description',
        id_category: 'test-category-id',
        promotion: '10',
        status: 'active'
    },
    
    bulkProducts: Array.from({ length: 5 }, (_, i) => ({
        name_product: `Product ${i + 1}`,
        price_product: `${(i + 1) * 100}`,
        image: `http://example.com/image${i + 1}.jpg`,
        describe: `Description for product ${i + 1}`,
        id_category: 'test-category-id',
        promotion: `${i * 5}`,
        status: 'active'
    }))
};

// Cart test data
const testCart = {
    validCartItem: {
        id_user: 'test-user-id',
        id_product: 'test-product-id',
        name_product: 'Test Product',
        price_product: '100',
        count: 2,
        image: 'http://example.com/image.jpg',
        size: 'M'
    },
    
    cartWithMultipleItems: {
        id_user: 'test-user-id',
        items: [
            {
                id_product: 'product-1',
                name_product: 'Product 1',
                price_product: '100',
                count: 1,
                size: 'S'
            },
            {
                id_product: 'product-2',
                name_product: 'Product 2',
                price_product: '200',
                count: 2,
                size: 'M'
            }
        ]
    }
};

// Order test data
const testOrders = {
    validOrder: {
        fullname: 'Test Customer',
        email: 'customer@example.com',
        phone: '0123456789',
        address: '123 Test Street',
        total: '300',
        id_user: 'test-user-id',
        status: 'pending'
    },
    
    orderWithPayment: {
        fullname: 'Test Customer',
        email: 'customer@example.com',
        phone: '0123456789',
        address: '123 Test Street',
        total: '500',
        price: '50', // shipping fee
        id_user: 'test-user-id',
        id_payment: 'test-payment-id',
        status: 'pending'
    }
};

// Coupon test data
const testCoupons = {
    validCoupon: {
        code: 'TEST10',
        discount: 10,
        type: 'percentage',
        minOrder: 100,
        maxDiscount: 50,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
    },
    
    expiredCoupon: {
        code: 'EXPIRED',
        discount: 20,
        type: 'percentage',
        expiryDate: new Date(Date.now() - 1000), // expired
        isActive: true
    },
    
    inactiveCoupon: {
        code: 'INACTIVE',
        discount: 15,
        type: 'percentage',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: false
    }
};

// Comment test data
const testComments = {
    validComment: {
        id_product: 'test-product-id',
        id_user: 'test-user-id',
        content: 'Great product!',
        rating: 5
    },
    
    invalidComment: {
        id_product: '',
        content: '',
        rating: 0
    }
};

// Category test data
const testCategories = {
    validCategory: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description'
    }
};

// Helper function để generate random IDs
const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
};

// Helper function để tạo JWT token giả
const generateMockToken = (userId = 'test-user-id') => {
    return `mock-jwt-token-${userId}`;
};

// Helper function để tạo hashed password giả
const generateMockHashedPassword = (password) => {
    return `$2b$10$mock.hashed.${password}`;
};

module.exports = {
    testUsers,
    testProducts,
    testCart,
    testOrders,
    testCoupons,
    testComments,
    testCategories,
    generateId,
    generateMockToken,
    generateMockHashedPassword
};
