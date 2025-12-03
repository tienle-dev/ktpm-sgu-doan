import CartAPI from '../../API/CartAPI';
import axiosClient from '../../API/axiosClient';

// Mock axiosClient
jest.mock('../../API/axiosClient', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
}));

describe('CartAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Get_Cart', () => {
        test('gọi đúng endpoint với user id', async () => {
            const mockCart = [
                { _id: '1', id_product: 'prod1', count: 2 },
                { _id: '2', id_product: 'prod2', count: 1 }
            ];
            axiosClient.get.mockResolvedValue(mockCart);

            const result = await CartAPI.Get_Cart('user123');

            expect(axiosClient.get).toHaveBeenCalledWith('/api/Cart/user123');
            expect(result).toEqual(mockCart);
        });

        test('trả về mảng rỗng khi không có sản phẩm', async () => {
            axiosClient.get.mockResolvedValue([]);

            const result = await CartAPI.Get_Cart('user123');

            expect(result).toEqual([]);
        });
    });

    describe('Post_Cart', () => {
        test('thêm sản phẩm mới vào giỏ hàng', async () => {
            const newCartItem = {
                id_user: 'user123',
                id_product: 'prod1',
                count: 1
            };
            const mockResponse = { _id: 'cart1', ...newCartItem };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await CartAPI.Post_Cart(newCartItem);

            expect(axiosClient.post).toHaveBeenCalledWith('/api/Cart', newCartItem);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Put_Cart', () => {
        test('cập nhật số lượng sản phẩm', async () => {
            const updateData = {
                _id: 'cart1',
                count: 5
            };
            const mockResponse = { ...updateData, updated: true };
            axiosClient.put.mockResolvedValue(mockResponse);

            const result = await CartAPI.Put_Cart(updateData);

            expect(axiosClient.put).toHaveBeenCalledWith('/api/Cart', updateData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Delete_Cart', () => {
        test('xóa sản phẩm khỏi giỏ hàng', async () => {
            axiosClient.delete.mockResolvedValue({ deleted: true });

            const result = await CartAPI.Delete_Cart('cart1');

            expect(axiosClient.delete).toHaveBeenCalledWith('/api/Cart/cart1');
            expect(result).toEqual({ deleted: true });
        });
    });
});
