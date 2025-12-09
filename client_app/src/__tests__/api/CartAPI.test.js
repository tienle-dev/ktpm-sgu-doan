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
            const mockCart = {
                id_user: 'user123',
                items: [
                    { _id: '1', id_product: 'prod1', count: 2 },
                    { _id: '2', id_product: 'prod2', count: 1 }
                ]
            };
            axiosClient.get.mockResolvedValue(mockCart);

            const result = await CartAPI.Get_Cart('user123');

            expect(axiosClient.get).toHaveBeenCalledWith('/api/Cart/user123');
            expect(result).toEqual(mockCart);
        });

        test('trả về giỏ hàng rỗng khi không có sản phẩm', async () => {
            const emptyCart = { id_user: 'user123', items: [] };
            axiosClient.get.mockResolvedValue(emptyCart);

            const result = await CartAPI.Get_Cart('user123');

            expect(result.items).toEqual([]);
        });
    });

    describe('Add_To_Cart', () => {
        test('thêm sản phẩm mới vào giỏ hàng', async () => {
            const newCartItem = {
                id_user: 'user123',
                id_product: 'prod1',
                name_product: 'Test Product',
                price_product: 100000,
                count: 1,
                size: 'M'
            };
            const mockResponse = { msg: 'Thêm vào giỏ hàng thành công', cart: { items: [newCartItem] } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await CartAPI.Add_To_Cart(newCartItem);

            expect(axiosClient.post).toHaveBeenCalledWith('/api/Cart', newCartItem);
            expect(result.msg).toBe('Thêm vào giỏ hàng thành công');
        });
    });

    describe('Sync_Cart', () => {
        test('đồng bộ giỏ hàng từ localStorage', async () => {
            const syncData = {
                id_user: 'user123',
                items: [
                    { id_product: 'prod1', count: 2 }
                ]
            };
            const mockResponse = { msg: 'Đồng bộ giỏ hàng thành công', cart: { items: syncData.items } };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await CartAPI.Sync_Cart(syncData);

            expect(axiosClient.post).toHaveBeenCalledWith('/api/Cart/sync', syncData);
            expect(result.msg).toBe('Đồng bộ giỏ hàng thành công');
        });
    });

    describe('Update_Cart_Item', () => {
        test('cập nhật số lượng sản phẩm', async () => {
            const updateData = {
                id_user: 'user123',
                item_id: 'cart1',
                count: 5
            };
            const mockResponse = { msg: 'Cập nhật giỏ hàng thành công', cart: { items: [] } };
            axiosClient.put.mockResolvedValue(mockResponse);

            const result = await CartAPI.Update_Cart_Item(updateData);

            expect(axiosClient.put).toHaveBeenCalledWith('/api/Cart', updateData);
            expect(result.msg).toBe('Cập nhật giỏ hàng thành công');
        });
    });

    describe('Remove_From_Cart', () => {
        test('xóa sản phẩm khỏi giỏ hàng', async () => {
            axiosClient.delete.mockResolvedValue({ msg: 'Xóa sản phẩm thành công' });

            const result = await CartAPI.Remove_From_Cart('user123', 'item1');

            expect(axiosClient.delete).toHaveBeenCalledWith('/api/Cart/user123/item1');
            expect(result.msg).toBe('Xóa sản phẩm thành công');
        });
    });

    describe('Clear_Cart', () => {
        test('xóa toàn bộ giỏ hàng', async () => {
            axiosClient.delete.mockResolvedValue({ msg: 'Đã xóa toàn bộ giỏ hàng' });

            const result = await CartAPI.Clear_Cart('user123');

            expect(axiosClient.delete).toHaveBeenCalledWith('/api/Cart/clear/user123');
            expect(result.msg).toBe('Đã xóa toàn bộ giỏ hàng');
        });
    });

    describe('Get_Cart_Count', () => {
        test('lấy số lượng sản phẩm trong giỏ', async () => {
            axiosClient.get.mockResolvedValue({ count: 5 });

            const result = await CartAPI.Get_Cart_Count('user123');

            expect(axiosClient.get).toHaveBeenCalledWith('/api/Cart/count/user123');
            expect(result.count).toBe(5);
        });
    });
});
