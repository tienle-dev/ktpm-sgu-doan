const Users = require('../../Models/user');
const userController = require('../../API/Controller/user.controller');
const { testUsers } = require('../helpers/testData');

// Mock the Users model
jest.mock('../../Models/user');

// Integration tests cho User API
describe('User API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /api/user - Get all users', () => {
        test('should return all users', async () => {
            const mockUsers = [testUsers.validUser, testUsers.adminUser];
            Users.find.mockResolvedValue(mockUsers);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await userController.index(req, res);
            
            expect(Users.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockUsers);
        });
        
        test('should return empty array when no users', async () => {
            Users.find.mockResolvedValue([]);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await userController.index(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });
    
    describe('GET /api/user/:id - Get user by ID', () => {
        test('should return user by id', async () => {
            const mockUser = testUsers.validUser;
            Users.findOne.mockResolvedValue(mockUser);
            
            const req = mockRequest({}, { id: 'user-123' });
            const res = mockResponse();
            
            await userController.user(req, res);
            
            expect(Users.findOne).toHaveBeenCalledWith({ _id: 'user-123' });
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });
        
        test('should return null when user not found', async () => {
            Users.findOne.mockResolvedValue(null);
            
            const req = mockRequest({}, { id: 'non-existent' });
            const res = mockResponse();
            
            await userController.user(req, res);
            
            expect(res.json).toHaveBeenCalledWith(null);
        });
    });
    
    describe('POST /api/user/login - User login', () => {
        test('should login with username successfully', async () => {
            const mockUser = {
                ...testUsers.validUser,
                password: '$2b$10$mock.hashed.password'
            };
            
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            
            Users.findOne.mockResolvedValue(mockUser);
            
            const req = mockRequest({}, {}, {
                username: 'testuser',
                password: 'Test123!@#'
            });
            const res = mockResponse();
            
            await userController.detail(req, res);
            
            expect(Users.findOne).toHaveBeenCalledWith({
                $or: [
                    { username: 'testuser' },
                    { email: 'testuser' }
                ]
            });
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });
        
        test('should login with email successfully', async () => {
            const mockUser = {
                ...testUsers.validUser,
                password: '$2b$10$mock.hashed.password'
            };
            
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            
            Users.findOne.mockResolvedValue(mockUser);
            
            const req = mockRequest({}, {}, {
                username: 'testuser@example.com',
                password: 'Test123!@#'
            });
            const res = mockResponse();
            
            await userController.detail(req, res);
            
            expect(Users.findOne).toHaveBeenCalledWith({
                $or: [
                    { username: 'testuser@example.com' },
                    { email: 'testuser@example.com' }
                ]
            });
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });
        
        test('should reject login with wrong password', async () => {
            const mockUser = {
                ...testUsers.validUser,
                password: '$2b$10$mock.hashed.password'
            };
            
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValue(false);
            
            Users.findOne.mockResolvedValue(mockUser);
            
            const req = mockRequest({}, {}, {
                username: 'testuser',
                password: 'WrongPassword'
            });
            const res = mockResponse();
            
            await userController.detail(req, res);
            
            expect(res.send).toHaveBeenCalledWith('Sai Mat Khau');
        });
        
        test('should reject login when user not found', async () => {
            Users.findOne.mockResolvedValue(null);
            
            const req = mockRequest({}, {}, {
                username: 'nonexistent',
                password: 'Test123!@#'
            });
            const res = mockResponse();
            
            await userController.detail(req, res);
            
            expect(res.send).toHaveBeenCalledWith('Khong Tìm Thấy User');
        });
    });
    
    describe('POST /api/user/register - User registration', () => {
        test('should register new user successfully', async () => {
            Users.findOne.mockResolvedValue(null);
            Users.create.mockResolvedValue(testUsers.validUser);
            
            const bcrypt = require('bcrypt');
            bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$mock.hashed.password');
            
            const req = mockRequest(testUsers.validUser);
            const res = mockResponse();
            
            await userController.post_user(req, res);
            
            expect(Users.findOne).toHaveBeenCalledWith({ username: testUsers.validUser.username });
            expect(bcrypt.hash).toHaveBeenCalledWith(testUsers.validUser.password, 10);
            expect(Users.create).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('Thanh Cong');
        });
        
        test('should reject registration with existing username', async () => {
            Users.findOne.mockResolvedValue(testUsers.validUser);
            
            const req = mockRequest(testUsers.validUser);
            const res = mockResponse();
            
            await userController.post_user(req, res);
            
            expect(Users.create).not.toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('User Da Ton Tai');
        });
        
        test('should hash password during registration', async () => {
            Users.findOne.mockResolvedValue(null);
            Users.create.mockResolvedValue({});
            
            const bcrypt = require('bcrypt');
            const hashSpy = jest.fn().mockResolvedValue('$2b$10$mock.hashed.password');
            bcrypt.hash = hashSpy;
            
            const req = mockRequest(testUsers.validUser);
            const res = mockResponse();
            
            await userController.post_user(req, res);
            
            expect(hashSpy).toHaveBeenCalledWith(testUsers.validUser.password, 10);
            expect(Users.create).toHaveBeenCalledWith({
                ...testUsers.validUser,
                password: '$2b$10$mock.hashed.password'
            });
        });
    });
    
    describe('PUT /api/user/update - Update user', () => {
        test('should update user successfully', async () => {
            const mockUser = {
                ...testUsers.validUser,
                save: jest.fn().mockResolvedValue(true)
            };
            
            Users.findOne.mockResolvedValue(mockUser);
            
            const bcrypt = require('bcrypt');
            bcrypt.hash = jest.fn().mockResolvedValue('$2b$10$new.hashed.password');
            
            const updateData = {
                _id: 'user-123',
                fullname: 'Updated Name',
                username: 'updateduser',
                password: 'NewPassword123'
            };
            
            const req = mockRequest(updateData);
            const res = mockResponse();
            
            await userController.update_user(req, res);
            
            expect(Users.findOne).toHaveBeenCalledWith({ _id: updateData._id });
            expect(mockUser.fullname).toBe(updateData.fullname);
            expect(mockUser.username).toBe(updateData.username);
            expect(bcrypt.hash).toHaveBeenCalledWith(updateData.password, 10);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith('Thanh Cong');
        });
        
        test('should update user without changing password', async () => {
            const mockUser = {
                ...testUsers.validUser,
                password: '$2b$10$old.hashed.password',
                save: jest.fn().mockResolvedValue(true)
            };
            
            Users.findOne.mockResolvedValue(mockUser);
            
            const bcrypt = require('bcrypt');
            const hashSpy = jest.fn();
            bcrypt.hash = hashSpy;
            
            const updateData = {
                _id: 'user-123',
                fullname: 'Updated Name',
                username: 'updateduser',
                password: '' // Empty password
            };
            
            const req = mockRequest(updateData);
            const res = mockResponse();
            
            await userController.update_user(req, res);
            
            expect(hashSpy).not.toHaveBeenCalled();
            expect(mockUser.password).toBe('$2b$10$old.hashed.password');
            expect(mockUser.save).toHaveBeenCalled();
        });
        
        test('should return error when user not found', async () => {
            Users.findOne.mockResolvedValue(null);
            
            const req = mockRequest({ _id: 'non-existent' });
            const res = mockResponse();
            
            await userController.update_user(req, res);
            
            expect(res.send).toHaveBeenCalledWith('Không tìm thấy user để cập nhật');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors gracefully', async () => {
            Users.find.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest();
            const res = mockResponse();
            
            try {
                await userController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });
});
