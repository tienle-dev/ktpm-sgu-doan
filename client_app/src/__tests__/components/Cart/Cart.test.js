import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import Cart from '../../../Cart/Cart';

// Mock localStorage
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Mock CouponAPI
jest.mock('../../../API/CouponAPI', () => ({
    Get_Coupon_By_Code: jest.fn()
}));

describe('Cart Component', () => {
    const mockCartItems = [
        {
            id_cart: '1',
            id_product: 'prod1',
            name_product: 'Sản phẩm 1',
            price_product: 100000,
            count: 2,
            image: 'image1.jpg'
        },
        {
            id_cart: '2',
            id_product: 'prod2',
            name_product: 'Sản phẩm 2',
            price_product: 200000,
            count: 1,
            image: 'image2.jpg'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.clear();
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockCartItems));
    });

    describe('Rendering', () => {
        test('renders giỏ hàng với các sản phẩm', () => {
            renderWithProviders(<Cart />);
            
            expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
        });

        test('hiển thị danh sách sản phẩm trong giỏ', async () => {
            renderWithProviders(<Cart />);
            
            await waitFor(() => {
                expect(screen.getByText('Sản phẩm 1')).toBeInTheDocument();
                expect(screen.getByText('Sản phẩm 2')).toBeInTheDocument();
            });
        });

        test('hiển thị tổng tiền đúng', async () => {
            renderWithProviders(<Cart />);
            
            // Tổng = (100000 * 2) + (200000 * 1) = 400000
            await waitFor(() => {
                expect(screen.getByText(/400,000/)).toBeInTheDocument();
            });
        });
    });

    describe('Cart Operations', () => {
        test('tăng số lượng sản phẩm', async () => {
            renderWithProviders(<Cart />);
            
            const increaseButtons = screen.getAllByText('+');
            fireEvent.click(increaseButtons[0]);
            
            // Kiểm tra localStorage được update
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });

        test('giảm số lượng sản phẩm', async () => {
            renderWithProviders(<Cart />);
            
            const decreaseButtons = screen.getAllByText('-');
            fireEvent.click(decreaseButtons[0]);
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });

        test('không giảm số lượng khi đã là 1', async () => {
            const singleItemCart = [{
                id_cart: '1',
                id_product: 'prod1',
                name_product: 'Sản phẩm 1',
                price_product: 100000,
                count: 1,
                image: 'image1.jpg'
            }];
            
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(singleItemCart));
            
            renderWithProviders(<Cart />);
            
            const decreaseButton = screen.getByText('-');
            fireEvent.click(decreaseButton);
            
            // Số lượng vẫn là 1
            expect(screen.getByDisplayValue('1')).toBeInTheDocument();
        });

        test('xóa sản phẩm khỏi giỏ hàng', async () => {
            renderWithProviders(<Cart />);
            
            const deleteButtons = screen.getAllByTitle('Remove');
            fireEvent.click(deleteButtons[0]);
            
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('Empty Cart', () => {
        test('hiển thị thông báo khi giỏ hàng trống', () => {
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
            
            renderWithProviders(<Cart />);
            
            expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
        });
    });

    describe('Coupon', () => {
        test('cho phép nhập mã giảm giá', () => {
            renderWithProviders(<Cart />);
            
            const couponInput = screen.getByPlaceholderText(/coupon/i);
            fireEvent.change(couponInput, { target: { value: 'SALE10' } });
            
            expect(couponInput.value).toBe('SALE10');
        });
    });

    describe('Navigation', () => {
        test('có link tiếp tục mua sắm', () => {
            renderWithProviders(<Cart />);
            
            expect(screen.getByText(/Continue Shopping/i)).toBeInTheDocument();
        });

        test('có button checkout', () => {
            renderWithProviders(<Cart />);
            
            expect(screen.getByText(/Checkout/i)).toBeInTheDocument();
        });
    });
});
