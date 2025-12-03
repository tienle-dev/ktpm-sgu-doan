import User from '../../API/User';
import axiosClient from '../../API/axiosClient';

// Mock axiosClient
jest.mock('../../API/axiosClient', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
}));

describe('User API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Get_All_User', () => {
        test('gọi đúng endpoint', async () => {
            const mockUsers = [
                { _id: '1', username: 'user1' },
                { _id: '2', username: 'user2' }
            ];
            axiosClient.get.mockResolvedValue(mockUsers);

            const result = await User.Get_All_User();

            expect(axiosClient.get).toHaveBeenCalledWith('/api/User');
            expect(result).toEqual(mockUsers);
        });

        test('xử lý lỗi khi API fail', async () => {
            axiosClient.get.mockRejectedValue(new Error('Network Error'));

            await expect(User.Get_All_User()).rejects.toThrow('Network Error');
        });
    });

    describe('Get_User', () => {
        test('gọi đúng endpoint với id', async () => {
            const mockUser = { _id: 'user123', username: 'testuser' };
            axiosClient.get.mockResolvedValue(mockUser);

            const result = await User.Get_User('user123');

            expect(axiosClient.get).toHaveBeenCalledWith('/api/User/user123');
            expect(result).toEqual(mockUser);
        });
    });

    describe('Get_Detail_User', () => {
        test('gọi đúng endpoint với query string', async () => {
            const mockUser = { _id: 'user123', username: 'testuser' };
            axiosClient.get.mockResolvedValue(mockUser);

            const query = '?username=testuser&password=pass123';
            const result = await User.Get_Detail_User(query);

            expect(axiosClient.get).toHaveBeenCalledWith('/api/User/detail/login?username=testuser&password=pass123');
            expect(result).toEqual(mockUser);
        });

        test('trả về thông báo lỗi khi user không tồn tại', async () => {
            axiosClient.get.mockResolvedValue('Khong Tìm Thấy User');

            const query = '?username=wronguser&password=pass123';
            const result = await User.Get_Detail_User(query);

            expect(result).toBe('Khong Tìm Thấy User');
        });

        test('trả về thông báo lỗi khi sai mật khẩu', async () => {
            axiosClient.get.mockResolvedValue('Sai Mat Khau');

            const query = '?username=testuser&password=wrongpass';
            const result = await User.Get_Detail_User(query);

            expect(result).toBe('Sai Mat Khau');
        });
    });

    describe('Post_User', () => {
        test('gọi đúng endpoint với data đăng ký', async () => {
            const newUser = {
                email: 'test@test.com',
                username: 'newuser',
                password: 'password123',
                fullname: 'New User',
                id_permission: '68ed1321ea0818176077f743'
            };
            const mockResponse = { _id: 'newuser123', ...newUser };
            axiosClient.post.mockResolvedValue(mockResponse);

            const result = await User.Post_User(newUser);

            expect(axiosClient.post).toHaveBeenCalledWith('/api/User', newUser);
            expect(result).toEqual(mockResponse);
        });

        test('trả về thông báo khi username đã tồn tại', async () => {
            const newUser = {
                email: 'test@test.com',
                username: 'existinguser',
                password: 'password123',
                fullname: 'Test User',
                id_permission: '68ed1321ea0818176077f743'
            };
            axiosClient.post.mockResolvedValue('User Da Ton Tai');

            const result = await User.Post_User(newUser);

            expect(result).toBe('User Da Ton Tai');
        });
    });

    describe('Put_User', () => {
        test('gọi đúng endpoint để cập nhật user', async () => {
            const updateData = {
                _id: 'user123',
                fullname: 'Updated Name',
                email: 'updated@test.com'
            };
            const mockResponse = { ...updateData, updated: true };
            axiosClient.put.mockResolvedValue(mockResponse);

            const result = await User.Put_User(updateData);

            expect(axiosClient.put).toHaveBeenCalledWith('/api/User', updateData);
            expect(result).toEqual(mockResponse);
        });
    });
});
