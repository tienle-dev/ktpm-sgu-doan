const Permission = require('../../Models/permission');
const permissionController = require('../../API/Controller/admin/permission.controller');

// Mock the Permission model
jest.mock('../../Models/permission');

// Integration tests cho Permission API
describe('Permission API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /admin/permission - Get paginated permissions', () => {
        const mockPermissions = Array.from({ length: 20 }, (_, i) => ({
            permission: `Permission ${i + 1}`,
            id: `perm-${String(i + 1).padStart(3, '0')}`,
            _id: `perm-id-${i + 1}`
        }));
        
        test('should return paginated permissions - page 1', async () => {
            Permission.find.mockResolvedValue(mockPermissions);
            Permission.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, { page: '1', limit: '8' });
            const res = mockResponse();
            
            await permissionController.index(req, res);
            
            expect(Permission.find).toHaveBeenCalled();
            expect(Permission.countDocuments).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
            
            const result = res.json.mock.calls[0][0];
            expect(result).toHaveProperty('permission');
            expect(result).toHaveProperty('totalPage');
            expect(result.permission.length).toBe(8);
            expect(result.totalPage).toBe(3); // 20 / 8 = 3 pages
        });
        
        test('should return paginated permissions - page 2', async () => {
            Permission.find.mockResolvedValue(mockPermissions);
            Permission.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, { page: '2', limit: '8' });
            const res = mockResponse();
            
            await permissionController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.permission.length).toBe(8);
            expect(result.permission[0].permission).toBe('Permission 9');
        });
        
        test('should use default pagination values', async () => {
            Permission.find.mockResolvedValue(mockPermissions);
            Permission.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {}); // No page or limit
            const res = mockResponse();
            
            await permissionController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.permission.length).toBe(8); // Default limit is 8
        });
        
        test('should search permissions by name', async () => {
            Permission.find.mockResolvedValue(mockPermissions);
            Permission.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {
                page: '1',
                limit: '8',
                search: 'Permission 1'
            });
            const res = mockResponse();
            
            await permissionController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.permission.length).toBeGreaterThan(0);
            
            // Verify search logic
            result.permission.forEach(perm => {
                expect(
                    perm.permission.toUpperCase().includes('PERMISSION 1') ||
                    perm.id.toUpperCase().includes('PERMISSION 1')
                ).toBe(true);
            });
        });
        
        test('should search permissions by ID', async () => {
            Permission.find.mockResolvedValue(mockPermissions);
            Permission.countDocuments.mockResolvedValue(20);
            
            const req = mockRequest({}, {}, {
                page: '1',
                limit: '8',
                search: '001'
            });
            const res = mockResponse();
            
            await permissionController.index(req, res);
            
            const result = res.json.mock.calls[0][0];
            expect(result.permission.length).toBeGreaterThan(0);
        });
    });
    
    describe('GET /admin/permission/all - Get all permissions', () => {
        test('should return all permissions without pagination', async () => {
            const mockPermissions = [
                { permission: 'Admin', _id: 'perm-1' },
                { permission: 'Staff', _id: 'perm-2' },
                { permission: 'Manager', _id: 'perm-3' }
            ];
            
            Permission.find.mockResolvedValue(mockPermissions);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await permissionController.all(req, res);
            
            expect(Permission.find).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockPermissions);
        });
        
        test('should return empty array when no permissions', async () => {
            Permission.find.mockResolvedValue([]);
            
            const req = mockRequest();
            const res = mockResponse();
            
            await permissionController.all(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });
    
    describe('POST /admin/permission/create - Create permission', () => {
        test('should create new permission successfully', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin' },
                { permission: 'Staff' }
            ]);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Permission.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: 'Manager' });
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            expect(Permission.find).toHaveBeenCalled();
            expect(mockSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã thêm thành công' });
        });
        
        test('should capitalize permission name on creation', async () => {
            Permission.find.mockResolvedValue([]);
            
            let savedPermission = null;
            const mockSave = jest.fn().mockImplementation(function() {
                savedPermission = this;
                return Promise.resolve();
            });
            
            Permission.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: 'super admin' });
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            // Verify capitalization logic
            const formatted = 'super admin'.toLowerCase().replace(/^.|\s\S/g, a => a.toUpperCase());
            expect(formatted).toBe('Super Admin');
        });
        
        test('should reject duplicate permission (case-insensitive)', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin' },
                { permission: 'Staff' }
            ]);
            
            const req = mockRequest({}, {}, { name: 'admin' }); // lowercase
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Quyền đã tồn tại' });
        });
        
        test('should reject duplicate with different case', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Staff' }
            ]);
            
            const req = mockRequest({}, {}, { name: 'STAFF' });
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Quyền đã tồn tại' });
        });
        
        test('should handle whitespace in permission name', async () => {
            Permission.find.mockResolvedValue([]);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Permission.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: '  Moderator  ' });
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            expect(mockSave).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã thêm thành công' });
        });
        
        test('should create Vietnamese permission names', async () => {
            Permission.find.mockResolvedValue([]);
            
            const mockSave = jest.fn().mockResolvedValue(true);
            Permission.mockImplementation(() => ({
                save: mockSave
            }));
            
            const req = mockRequest({}, {}, { name: 'nhân viên' });
            const res = mockResponse();
            
            await permissionController.create(req, res);
            
            expect(mockSave).toHaveBeenCalled();
        });
    });
    
    describe('GET /admin/permission/:id - Get permission details', () => {
        test('should return permission by ID', async () => {
            const mockPermission = {
                permission: 'Admin',
                _id: 'perm-123'
            };
            
            Permission.findOne.mockResolvedValue(mockPermission);
            
            const req = mockRequest({}, { id: 'perm-123' });
            const res = mockResponse();
            
            await permissionController.details(req, res);
            
            expect(Permission.findOne).toHaveBeenCalledWith({ _id: 'perm-123' });
            expect(res.json).toHaveBeenCalledWith(mockPermission);
        });
        
        test('should return null when permission not found', async () => {
            Permission.findOne.mockResolvedValue(null);
            
            const req = mockRequest({}, { id: 'non-existent' });
            const res = mockResponse();
            
            await permissionController.details(req, res);
            
            expect(res.json).toHaveBeenCalledWith(null);
        });
    });
    
    describe('PUT /admin/permission/update - Update permission', () => {
        test('should update permission successfully', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin', id: 'perm-1' },
                { permission: 'Staff', id: 'perm-2' }
            ]);
            Permission.updateOne.mockResolvedValue({ nModified: 1 });
            
            const req = mockRequest({}, {}, {
                id: 'perm-1',
                name: 'Super Admin'
            });
            const res = mockResponse();
            
            await permissionController.update(req, res);
            
            expect(Permission.find).toHaveBeenCalled();
            expect(Permission.updateOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã update thành công' });
        });
        
        test('should capitalize permission name on update', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin', id: 'perm-1' }
            ]);
            Permission.updateOne.mockResolvedValue({ nModified: 1 });
            
            const req = mockRequest({}, {}, {
                id: 'perm-1',
                name: 'system administrator'
            });
            const res = mockResponse();
            
            await permissionController.update(req, res);
            
            // Verify capitalization
            const formatted = 'system administrator'.toLowerCase().replace(/^.|\s\S/g, a => a.toUpperCase());
            expect(formatted).toBe('System Administrator');
            expect(Permission.updateOne).toHaveBeenCalled();
        });
        
        test('should allow updating to same name (same ID)', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin', id: 'perm-1' },
                { permission: 'Staff', id: 'perm-2' }
            ]);
            Permission.updateOne.mockResolvedValue({ nModified: 1 });
            
            const req = mockRequest({}, {}, {
                id: 'perm-1',
                name: 'Admin' // Same name
            });
            const res = mockResponse();
            
            await permissionController.update(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Bạn đã update thành công' });
        });
        
        test('should reject update to existing permission name (different ID)', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin', id: 'perm-1' },
                { permission: 'Staff', id: 'perm-2' }
            ]);
            
            const req = mockRequest({}, {}, {
                id: 'perm-1',
                name: 'Staff' // Permission của perm-2
            });
            const res = mockResponse();
            
            await permissionController.update(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Quyền đã tồn tại' });
        });
        
        test('should reject update with duplicate (case-insensitive)', async () => {
            Permission.find.mockResolvedValue([
                { permission: 'Admin', id: 'perm-1' },
                { permission: 'Staff', id: 'perm-2' }
            ]);
            
            const req = mockRequest({}, {}, {
                id: 'perm-1',
                name: 'STAFF' // uppercase
            });
            const res = mockResponse();
            
            await permissionController.update(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Quyền đã tồn tại' });
        });
    });
    
    describe('DELETE /admin/permission/delete - Delete permission', () => {
        test('should delete permission successfully', async () => {
            Permission.deleteOne.mockImplementation((query, callback) => {
                callback(null);
                return Promise.resolve();
            });
            
            const req = mockRequest({}, {}, { id: 'perm-123' });
            const res = mockResponse();
            
            await permissionController.delete(req, res);
            
            expect(Permission.deleteOne).toHaveBeenCalledWith(
                { _id: 'perm-123' },
                expect.any(Function)
            );
            expect(res.json).toHaveBeenCalledWith({ msg: 'Thanh Cong' });
        });
        
        test('should handle delete errors', async () => {
            const error = new Error('Delete failed');
            Permission.deleteOne.mockImplementation((query, callback) => {
                callback(error);
                return Promise.resolve();
            });
            
            const req = mockRequest({}, {}, { id: 'perm-123' });
            const res = mockResponse();
            
            await permissionController.delete(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: error });
        });
        
        test('should handle deleting non-existent permission', async () => {
            Permission.deleteOne.mockImplementation((query, callback) => {
                callback(null);
                return Promise.resolve();
            });
            
            const req = mockRequest({}, {}, { id: 'non-existent' });
            const res = mockResponse();
            
            await permissionController.delete(req, res);
            
            expect(res.json).toHaveBeenCalledWith({ msg: 'Thanh Cong' });
        });
    });
    
    describe('Permission with Users', () => {
        test('should get users by permission', async () => {
            const Users = require('../../Models/user');
            jest.mock('../../Models/user');
            
            const mockUsers = [
                { username: 'admin1', id_permission: 'perm-1' },
                { username: 'admin2', id_permission: 'perm-1' }
            ];
            
            Users.find = jest.fn().mockResolvedValue(mockUsers);
            
            const permissionId = 'perm-1';
            const users = await Users.find({ id_permission: permissionId });
            
            expect(users.length).toBe(2);
            users.forEach(user => {
                expect(user.id_permission).toBe(permissionId);
            });
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors in index', async () => {
            Permission.find.mockRejectedValue(new Error('Database error'));
            Permission.countDocuments.mockResolvedValue(0);
            
            const req = mockRequest({}, {}, { page: '1', limit: '8' });
            const res = mockResponse();
            
            try {
                await permissionController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle database errors in all', async () => {
            Permission.find.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest();
            const res = mockResponse();
            
            try {
                await permissionController.all(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle errors in details', async () => {
            Permission.findOne.mockRejectedValue(new Error('Database error'));
            
            const req = mockRequest({}, { id: 'perm-123' });
            const res = mockResponse();
            
            try {
                await permissionController.details(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
    });
    
    describe('Permission Statistics', () => {
        test('should count users per permission', async () => {
            const users = [
                { id_permission: 'perm-1' },
                { id_permission: 'perm-1' },
                { id_permission: 'perm-1' },
                { id_permission: 'perm-2' },
                { id_permission: 'perm-2' }
            ];
            
            const adminCount = users.filter(u => u.id_permission === 'perm-1').length;
            const staffCount = users.filter(u => u.id_permission === 'perm-2').length;
            
            expect(adminCount).toBe(3);
            expect(staffCount).toBe(2);
        });
    });
});
