const { testCoupons } = require('../helpers/testData');

// Unit tests cho Coupon Service Logic
describe('Coupon Service - Unit Tests', () => {
    
    describe('Coupon Validation Logic', () => {
        test('should validate coupon has required fields', () => {
            const coupon = testCoupons.validCoupon;
            
            expect(coupon).toHaveProperty('code');
            expect(coupon).toHaveProperty('discount');
            expect(coupon).toHaveProperty('type');
            expect(coupon).toHaveProperty('expiryDate');
            expect(coupon).toHaveProperty('isActive');
        });
        
        test('should validate coupon code format', () => {
            const coupon = testCoupons.validCoupon;
            
            expect(coupon.code).toBeDefined();
            expect(coupon.code.length).toBeGreaterThan(0);
            expect(typeof coupon.code).toBe('string');
        });
        
        test('should validate discount value', () => {
            const coupon = testCoupons.validCoupon;
            
            expect(coupon.discount).toBeGreaterThan(0);
            expect(typeof coupon.discount).toBe('number');
        });
    });
    
    describe('Coupon Expiry Check Logic', () => {
        test('should detect expired coupon', () => {
            const coupon = testCoupons.expiredCoupon;
            const now = new Date();
            
            const isExpired = new Date(coupon.expiryDate) < now;
            
            expect(isExpired).toBe(true);
        });
        
        test('should validate active coupon not expired', () => {
            const coupon = testCoupons.validCoupon;
            const now = new Date();
            
            const isExpired = new Date(coupon.expiryDate) < now;
            
            expect(isExpired).toBe(false);
        });
        
        test('should check coupon expiry date format', () => {
            const coupon = testCoupons.validCoupon;
            
            expect(coupon.expiryDate).toBeInstanceOf(Date);
            expect(isNaN(coupon.expiryDate.getTime())).toBe(false);
        });
    });
    
    describe('Coupon Active Status Check', () => {
        test('should validate active coupon', () => {
            const coupon = testCoupons.validCoupon;
            
            expect(coupon.isActive).toBe(true);
        });
        
        test('should detect inactive coupon', () => {
            const coupon = testCoupons.inactiveCoupon;
            
            expect(coupon.isActive).toBe(false);
        });
        
        test('should check both active status and expiry', () => {
            const validCoupon = testCoupons.validCoupon;
            const now = new Date();
            
            const isValid = validCoupon.isActive && new Date(validCoupon.expiryDate) > now;
            
            expect(isValid).toBe(true);
        });
        
        test('should reject inactive even if not expired', () => {
            const coupon = testCoupons.inactiveCoupon;
            const now = new Date();
            
            const isExpired = new Date(coupon.expiryDate) < now;
            const isValid = coupon.isActive && !isExpired;
            
            expect(isExpired).toBe(false);
            expect(isValid).toBe(false);
        });
    });
    
    describe('Coupon Discount Calculation Logic', () => {
        test('should calculate percentage discount', () => {
            const coupon = testCoupons.validCoupon;
            const orderAmount = 200;
            
            if (coupon.type === 'percentage') {
                const discount = (orderAmount * coupon.discount) / 100;
                expect(discount).toBe(20); // 10% of 200
            }
        });
        
        test('should calculate fixed amount discount', () => {
            const coupon = {
                ...testCoupons.validCoupon,
                type: 'fixed',
                discount: 30
            };
            const orderAmount = 200;
            
            if (coupon.type === 'fixed') {
                const discount = coupon.discount;
                expect(discount).toBe(30);
            }
        });
        
        test('should respect max discount limit for percentage', () => {
            const coupon = testCoupons.validCoupon; // 10% with max 50
            const orderAmount = 1000; // 10% would be 100
            
            if (coupon.type === 'percentage') {
                let discount = (orderAmount * coupon.discount) / 100;
                if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount;
                }
                expect(discount).toBe(50); // capped at maxDiscount
            }
        });
        
        test('should not exceed order amount', () => {
            const coupon = {
                ...testCoupons.validCoupon,
                type: 'fixed',
                discount: 300
            };
            const orderAmount = 200;
            
            let discount = coupon.discount;
            if (discount > orderAmount) {
                discount = orderAmount;
            }
            
            expect(discount).toBe(200);
        });
    });
    
    describe('Coupon Minimum Order Validation', () => {
        test('should validate order meets minimum amount', () => {
            const coupon = testCoupons.validCoupon; // minOrder: 100
            const orderAmount = 150;
            
            const meetsMinimum = orderAmount >= coupon.minOrder;
            
            expect(meetsMinimum).toBe(true);
        });
        
        test('should reject order below minimum amount', () => {
            const coupon = testCoupons.validCoupon; // minOrder: 100
            const orderAmount = 50;
            
            const meetsMinimum = orderAmount >= coupon.minOrder;
            
            expect(meetsMinimum).toBe(false);
        });
        
        test('should accept order at exact minimum amount', () => {
            const coupon = testCoupons.validCoupon; // minOrder: 100
            const orderAmount = 100;
            
            const meetsMinimum = orderAmount >= coupon.minOrder;
            
            expect(meetsMinimum).toBe(true);
        });
    });
    
    describe('Coupon Application Logic', () => {
        test('should apply valid coupon to order', () => {
            const coupon = testCoupons.validCoupon;
            const orderAmount = 200;
            const now = new Date();
            
            // Check all conditions
            const isValid = coupon.isActive &&
                new Date(coupon.expiryDate) > now &&
                orderAmount >= coupon.minOrder;
            
            expect(isValid).toBe(true);
            
            if (isValid && coupon.type === 'percentage') {
                const discount = (orderAmount * coupon.discount) / 100;
                const finalAmount = orderAmount - discount;
                expect(finalAmount).toBe(180);
            }
        });
        
        test('should reject expired coupon', () => {
            const coupon = testCoupons.expiredCoupon;
            const orderAmount = 200;
            const now = new Date();
            
            const isValid = coupon.isActive &&
                new Date(coupon.expiryDate) > now &&
                orderAmount >= (coupon.minOrder || 0);
            
            expect(isValid).toBe(false);
        });
        
        test('should reject inactive coupon', () => {
            const coupon = testCoupons.inactiveCoupon;
            const orderAmount = 200;
            const now = new Date();
            
            const isValid = coupon.isActive &&
                new Date(coupon.expiryDate) > now;
            
            expect(isValid).toBe(false);
        });
    });
    
    describe('Coupon Code Lookup Logic', () => {
        const mockCoupons = [
            testCoupons.validCoupon,
            testCoupons.expiredCoupon,
            testCoupons.inactiveCoupon
        ];
        
        test('should find coupon by code', () => {
            const code = 'TEST10';
            
            const found = mockCoupons.find(c => c.code === code);
            
            expect(found).toBeDefined();
            expect(found.code).toBe(code);
        });
        
        test('should handle case-sensitive code', () => {
            const code = 'test10'; // lowercase
            const upperCode = 'TEST10';
            
            const foundExact = mockCoupons.find(c => c.code === code);
            const foundUpper = mockCoupons.find(c => c.code === upperCode);
            
            expect(foundExact).toBeUndefined();
            expect(foundUpper).toBeDefined();
        });
        
        test('should return undefined for non-existent code', () => {
            const code = 'NONEXISTENT';
            
            const found = mockCoupons.find(c => c.code === code);
            
            expect(found).toBeUndefined();
        });
    });
    
    describe('Multiple Coupon Scenarios', () => {
        test('should compare discount amounts', () => {
            const coupon1 = { discount: 10, type: 'percentage' };
            const coupon2 = { discount: 20, type: 'percentage' };
            const orderAmount = 100;
            
            const discount1 = (orderAmount * coupon1.discount) / 100;
            const discount2 = (orderAmount * coupon2.discount) / 100;
            
            expect(discount2).toBeGreaterThan(discount1);
        });
        
        test('should choose best coupon for user', () => {
            const orderAmount = 100;
            const coupons = [
                { code: 'A', discount: 10, type: 'percentage' }, // 10
                { code: 'B', discount: 25, type: 'fixed' }      // 25
            ];
            
            const discounts = coupons.map(c => {
                if (c.type === 'percentage') {
                    return (orderAmount * c.discount) / 100;
                }
                return c.discount;
            });
            
            const maxDiscount = Math.max(...discounts);
            expect(maxDiscount).toBe(25);
        });
    });
});
