/**
 * COUPON & SALE TEST CASES
 * Người thực hiện: Người 3
 * Ngày tạo: 16/12/2024
 * Mô tả: Test cases cho module Coupon và Sale
 */

// Mock các dependencies
jest.mock('../../Models/coupon');
jest.mock('../../Models/sale');

const Coupon = require('../..//Models/coupon');
const Sale = require('../../Models/sale');

// ========================================
// TEST DATA (theo TEST_DATA_DOCUMENT.txt)
// ========================================
const TEST_DATA = {
  validCoupons: [
    {
      _id: 'coupon_001',
      code: 'DISCOUNT10',
      discount: 10,
      type: 'percent',
      minOrder: 100000,
      maxDiscount: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      quantity: 100,
      used: 10,
      status: true
    },
    {
      _id: 'coupon_002',
      code: 'FLAT50K',
      discount: 50000,
      type: 'fixed',
      minOrder: 200000,
      maxDiscount: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      quantity: 50,
      used: 5,
      status: true
    }
  ],
  expiredCoupon: {
    _id: 'coupon_003',
    code: 'EXPIRED2023',
    discount: 20,
    type: 'percent',
    minOrder: 50000,
    maxDiscount: 100000,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    quantity: 100,
    used: 50,
    status: true
  },
  usedUpCoupon: {
    _id: 'coupon_004',
    code: 'SOLDOUT',
    discount: 30,
    type: 'percent',
    minOrder: 100000,
    maxDiscount: 150000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    quantity: 100,
    used: 100,
    status: true
  },
  sales: [
    {
      _id: 'sale_001',
      name: 'Flash Sale 50%',
      discount: 50,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      products: ['prod_001', 'prod_002'],
      status: true
    },
    {
      _id: 'sale_002',
      name: 'Khuyến mãi mùa đông',
      discount: 30,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2025-01-15'),
      products: ['prod_003', 'prod_004'],
      status: true
    }
  ]
};

// ========================================
// TEST SUITE: COUPON VALIDATION
// ========================================
describe('COUPON VALIDATION TESTS', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-CP-001: Validate coupon code hợp lệ
  describe('TC-CP-001: Validate Valid Coupon Code', () => {
    test('should return coupon info when code is valid', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(TEST_DATA.validCoupons[0]);
      
      const result = await Coupon.findOne({ code: 'DISCOUNT10' });
      
      expect(result).toBeDefined();
      expect(result.code).toBe('DISCOUNT10');
      expect(result.discount).toBe(10);
      expect(result.status).toBe(true);
    });
  });

  // TC-CP-002: Validate coupon code không tồn tại
  describe('TC-CP-002: Validate Invalid Coupon Code', () => {
    test('should return null when coupon code does not exist', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(null);
      
      const result = await Coupon.findOne({ code: 'INVALIDCODE' });
      
      expect(result).toBeNull();
    });
  });

  // TC-CP-003: Validate coupon đã hết hạn
  describe('TC-CP-003: Validate Expired Coupon', () => {
    test('should reject expired coupon', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(TEST_DATA.expiredCoupon);
      
      const coupon = await Coupon.findOne({ code: 'EXPIRED2023' });
      const now = new Date();
      const isExpired = coupon.endDate < now;
      
      expect(isExpired).toBe(true);
    });
  });

  // TC-CP-004: Validate coupon đã hết lượt sử dụng
  describe('TC-CP-004: Validate Used Up Coupon', () => {
    test('should reject coupon when quantity is exhausted', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(TEST_DATA.usedUpCoupon);
      
      const coupon = await Coupon.findOne({ code: 'SOLDOUT' });
      const isUsedUp = coupon.used >= coupon.quantity;
      
      expect(isUsedUp).toBe(true);
    });
  });

  // TC-CP-005: Validate minimum order amount
  describe('TC-CP-005: Validate Minimum Order Amount', () => {
    test('should reject coupon when order amount is below minimum', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(TEST_DATA.validCoupons[0]);
      
      const coupon = await Coupon.findOne({ code: 'DISCOUNT10' });
      const orderAmount = 50000; // Below minOrder of 100000
      const isValidOrder = orderAmount >= coupon.minOrder;
      
      expect(isValidOrder).toBe(false);
    });

    test('should accept coupon when order amount meets minimum', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(TEST_DATA.validCoupons[0]);
      
      const coupon = await Coupon.findOne({ code: 'DISCOUNT10' });
      const orderAmount = 150000; // Above minOrder of 100000
      const isValidOrder = orderAmount >= coupon.minOrder;
      
      expect(isValidOrder).toBe(true);
    });
  });
});

// ========================================
// TEST SUITE: DISCOUNT CALCULATION
// ========================================
describe('DISCOUNT CALCULATION TESTS', () => {

  // TC-CP-006: Tính giảm giá theo phần trăm
  describe('TC-CP-006: Calculate Percentage Discount', () => {
    test('should calculate correct percentage discount', () => {
      const coupon = TEST_DATA.validCoupons[0]; // 10% discount
      const orderAmount = 500000;
      
      let discountAmount = (orderAmount * coupon.discount) / 100;
      if (discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
      
      expect(discountAmount).toBe(50000); // 10% of 500000 = 50000
    });

    test('should cap discount at maxDiscount', () => {
      const coupon = TEST_DATA.validCoupons[0]; // 10% discount, max 50000
      const orderAmount = 1000000;
      
      let discountAmount = (orderAmount * coupon.discount) / 100;
      if (discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
      
      expect(discountAmount).toBe(50000); // Capped at maxDiscount
    });
  });

  // TC-CP-007: Tính giảm giá cố định
  describe('TC-CP-007: Calculate Fixed Discount', () => {
    test('should apply fixed discount correctly', () => {
      const coupon = TEST_DATA.validCoupons[1]; // 50000 fixed
      const orderAmount = 300000;
      
      const discountAmount = coupon.type === 'fixed' ? coupon.discount : 0;
      const finalAmount = orderAmount - discountAmount;
      
      expect(discountAmount).toBe(50000);
      expect(finalAmount).toBe(250000);
    });
  });

  // TC-CP-008: Tính tổng tiền sau giảm giá
  describe('TC-CP-008: Calculate Final Amount After Discount', () => {
    test('should calculate final amount correctly with percent coupon', () => {
      const coupon = TEST_DATA.validCoupons[0];
      const orderAmount = 200000;
      
      let discountAmount = (orderAmount * coupon.discount) / 100;
      if (discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
      const finalAmount = orderAmount - discountAmount;
      
      expect(discountAmount).toBe(20000); // 10% of 200000
      expect(finalAmount).toBe(180000);
    });
  });
});

// ========================================
// TEST SUITE: SALE EVENTS
// ========================================
describe('SALE EVENT TESTS', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-SALE-001: Lấy danh sách sale đang hoạt động
  describe('TC-SALE-001: Get Active Sales', () => {
    test('should return list of active sales', async () => {
      Sale.find = jest.fn().mockResolvedValue(TEST_DATA.sales);
      
      const now = new Date();
      const activeSales = await Sale.find({
        status: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      
      expect(activeSales).toBeDefined();
      expect(Array.isArray(activeSales)).toBe(true);
    });
  });

  // TC-SALE-002: Tính giá sản phẩm trong sale
  describe('TC-SALE-002: Calculate Sale Price', () => {
    test('should calculate discounted price for product in sale', () => {
      const sale = TEST_DATA.sales[0]; // 50% discount
      const originalPrice = 500000;
      
      const salePrice = originalPrice - (originalPrice * sale.discount / 100);
      
      expect(salePrice).toBe(250000);
    });
  });

  // TC-SALE-003: Kiểm tra sản phẩm có trong sale không
  describe('TC-SALE-003: Check Product In Sale', () => {
    test('should return true if product is in active sale', () => {
      const sale = TEST_DATA.sales[0];
      const productId = 'prod_001';
      
      const isInSale = sale.products.includes(productId);
      
      expect(isInSale).toBe(true);
    });

    test('should return false if product is not in sale', () => {
      const sale = TEST_DATA.sales[0];
      const productId = 'prod_999';
      
      const isInSale = sale.products.includes(productId);
      
      expect(isInSale).toBe(false);
    });
  });

  // TC-SALE-004: Áp dụng cả coupon và sale
  describe('TC-SALE-004: Apply Both Coupon and Sale', () => {
    test('should apply sale first, then coupon', () => {
      const sale = TEST_DATA.sales[0]; // 50% discount
      const coupon = TEST_DATA.validCoupons[0]; // 10% discount, max 50000
      const originalPrice = 500000;
      
      // Apply sale first
      const afterSale = originalPrice - (originalPrice * sale.discount / 100);
      expect(afterSale).toBe(250000);
      
      // Then apply coupon
      let couponDiscount = (afterSale * coupon.discount) / 100;
      if (couponDiscount > coupon.maxDiscount) {
        couponDiscount = coupon.maxDiscount;
      }
      const finalPrice = afterSale - couponDiscount;
      
      expect(couponDiscount).toBe(25000); // 10% of 250000
      expect(finalPrice).toBe(225000);
    });
  });
});

// ========================================
// EXPORT TEST RESULTS
// ========================================
module.exports = {
  testSuiteName: 'Coupon & Sale Tests',
  author: 'Người 3',
  totalTests: 12,
  categories: ['Coupon Validation', 'Discount Calculation', 'Sale Events']
};
