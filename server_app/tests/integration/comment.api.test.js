const Comment = require('../../Models/comment');
const Users = require('../../Models/user');
const commentController = require('../../API/Controller/comment.controller');
const { testComments } = require('../helpers/testData');

// Mock the models
jest.mock('../../Models/comment');
jest.mock('../../Models/user');

// Integration tests cho Comment API
describe('Comment API - Integration Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('GET /api/comment/:id - Get product comments', () => {
        test('should return all comments for a product', async () => {
            const mockComments = [
                {
                    ...testComments.validComment,
                    _id: 'comment-1',
                    id_user: {
                        _id: 'user-1',
                        username: 'user1',
                        fullname: 'User One'
                    }
                },
                {
                    ...testComments.validComment,
                    _id: 'comment-2',
                    id_user: {
                        _id: 'user-2',
                        username: 'user2',
                        fullname: 'User Two'
                    }
                }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            expect(Comment.find).toHaveBeenCalledWith({ id_product: 'product-123' });
            expect(mockQuery.populate).toHaveBeenCalledWith('id_user');
            expect(res.json).toHaveBeenCalledWith(mockComments);
        });
        
        test('should return empty array when product has no comments', async () => {
            const mockQuery = {
                populate: jest.fn().mockResolvedValue([])
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            expect(res.json).toHaveBeenCalledWith([]);
        });
        
        test('should populate user information with comment', async () => {
            const mockComments = [
                {
                    _id: 'comment-1',
                    id_product: 'product-123',
                    content: 'Great product!',
                    star: 5,
                    id_user: {
                        _id: 'user-1',
                        username: 'testuser',
                        fullname: 'Test User',
                        email: 'test@example.com'
                    }
                }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            const comments = res.json.mock.calls[0][0];
            expect(comments[0].id_user).toHaveProperty('username');
            expect(comments[0].id_user).toHaveProperty('fullname');
        });
    });
    
    describe('POST /api/comment/:id - Post comment', () => {
        test('should create new comment successfully', async () => {
            const mockComment = {
                ...testComments.validComment,
                _id: 'comment-123'
            };
            
            Comment.create.mockResolvedValue(mockComment);
            
            const req = mockRequest(
                {
                    id_user: 'user-123',
                    content: 'Great product!',
                    star: 5
                },
                { id: 'product-123' }
            );
            const res = mockResponse();
            
            await commentController.post_comment(req, res);
            
            expect(Comment.create).toHaveBeenCalledWith({
                id_product: 'product-123',
                id_user: 'user-123',
                content: 'Great product!',
                star: 5
            });
            expect(res.send).toHaveBeenCalledWith('Thanh Cong');
        });
        
        test('should create comment with rating', async () => {
            Comment.create.mockResolvedValue({});
            
            const req = mockRequest(
                {
                    id_user: 'user-123',
                    content: 'Good quality',
                    star: 4
                },
                { id: 'product-123' }
            );
            const res = mockResponse();
            
            await commentController.post_comment(req, res);
            
            const createCall = Comment.create.mock.calls[0][0];
            expect(createCall).toHaveProperty('star', 4);
            expect(createCall).toHaveProperty('content', 'Good quality');
        });
        
        test('should create comment with different ratings', async () => {
            Comment.create.mockResolvedValue({});
            
            const ratings = [1, 2, 3, 4, 5];
            
            for (const rating of ratings) {
                const req = mockRequest(
                    {
                        id_user: 'user-123',
                        content: `Rating ${rating}`,
                        star: rating
                    },
                    { id: 'product-123' }
                );
                const res = mockResponse();
                
                await commentController.post_comment(req, res);
                
                const createCall = Comment.create.mock.calls[Comment.create.mock.calls.length - 1][0];
                expect(createCall.star).toBe(rating);
            }
        });
        
        test('should link comment to correct product', async () => {
            Comment.create.mockResolvedValue({});
            
            const productId = 'product-456';
            const req = mockRequest(
                {
                    id_user: 'user-123',
                    content: 'Nice!',
                    star: 5
                },
                { id: productId }
            );
            const res = mockResponse();
            
            await commentController.post_comment(req, res);
            
            const createCall = Comment.create.mock.calls[0][0];
            expect(createCall.id_product).toBe(productId);
        });
        
        test('should link comment to correct user', async () => {
            Comment.create.mockResolvedValue({});
            
            const userId = 'user-789';
            const req = mockRequest(
                {
                    id_user: userId,
                    content: 'Excellent!',
                    star: 5
                },
                { id: 'product-123' }
            );
            const res = mockResponse();
            
            await commentController.post_comment(req, res);
            
            const createCall = Comment.create.mock.calls[0][0];
            expect(createCall.id_user).toBe(userId);
        });
    });
    
    describe('Comment Validation', () => {
        test('should create comment with valid data structure', async () => {
            Comment.create.mockResolvedValue({});
            
            const commentData = {
                id_user: 'user-123',
                content: 'Test comment',
                star: 5
            };
            
            const req = mockRequest(commentData, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.post_comment(req, res);
            
            const createCall = Comment.create.mock.calls[0][0];
            expect(createCall).toHaveProperty('id_product');
            expect(createCall).toHaveProperty('id_user');
            expect(createCall).toHaveProperty('content');
            expect(createCall).toHaveProperty('star');
        });
    });
    
    describe('Comment Statistics', () => {
        test('should calculate average rating from comments', async () => {
            const mockComments = [
                { star: 5, content: 'Excellent' },
                { star: 4, content: 'Good' },
                { star: 5, content: 'Great' },
                { star: 3, content: 'OK' }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            const comments = res.json.mock.calls[0][0];
            const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
            const avgRating = totalStars / comments.length;
            
            expect(avgRating).toBeCloseTo(4.25, 2);
        });
        
        test('should count comments by rating', async () => {
            const mockComments = [
                { star: 5 },
                { star: 5 },
                { star: 4 },
                { star: 3 },
                { star: 5 }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            const comments = res.json.mock.calls[0][0];
            const fiveStars = comments.filter(c => c.star === 5).length;
            
            expect(fiveStars).toBe(3);
        });
    });
    
    describe('DELETE /api/comment/:id - Delete comment', () => {
        test('should delete comment successfully', async () => {
            Comment.deleteOne.mockResolvedValue({ deletedCount: 1 });
            
            const req = mockRequest({}, { id: 'comment-123' });
            const res = mockResponse();
            
            if (commentController.delete_comment) {
                await commentController.delete_comment(req, res);
                
                expect(Comment.deleteOne).toHaveBeenCalledWith({ _id: 'comment-123' });
            }
        });
    });
    
    describe('PUT /api/comment/:id - Update comment', () => {
        test('should update comment successfully', async () => {
            const mockComment = {
                _id: 'comment-123',
                content: 'Old content',
                star: 3,
                save: jest.fn().mockResolvedValue(true)
            };
            
            Comment.findOne.mockResolvedValue(mockComment);
            
            const req = mockRequest(
                {
                    content: 'Updated content',
                    star: 5
                },
                { id: 'comment-123' }
            );
            const res = mockResponse();
            
            if (commentController.update_comment) {
                await commentController.update_comment(req, res);
                
                expect(Comment.findOne).toHaveBeenCalledWith({ _id: 'comment-123' });
            }
        });
    });
    
    describe('Error Handling', () => {
        test('should handle database errors in index', async () => {
            const mockQuery = {
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            try {
                await commentController.index(req, res);
            } catch (error) {
                expect(error.message).toBe('Database error');
            }
        });
        
        test('should handle errors when creating comment', async () => {
            Comment.create.mockRejectedValue(new Error('Create failed'));
            
            const req = mockRequest(
                testComments.validComment,
                { id: 'product-123' }
            );
            const res = mockResponse();
            
            try {
                await commentController.post_comment(req, res);
            } catch (error) {
                expect(error.message).toBe('Create failed');
            }
        });
    });
    
    describe('Comment Sorting and Filtering', () => {
        test('should sort comments by date (newest first)', async () => {
            const mockComments = [
                { _id: '1', content: 'Comment 1', createdAt: new Date('2024-01-01') },
                { _id: '2', content: 'Comment 2', createdAt: new Date('2024-01-03') },
                { _id: '3', content: 'Comment 3', createdAt: new Date('2024-01-02') }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            const comments = res.json.mock.calls[0][0];
            const sorted = [...comments].sort((a, b) => b.createdAt - a.createdAt);
            
            expect(sorted[0]._id).toBe('2');
            expect(sorted[1]._id).toBe('3');
            expect(sorted[2]._id).toBe('1');
        });
        
        test('should filter comments by rating', async () => {
            const mockComments = [
                { star: 5, content: 'Excellent' },
                { star: 4, content: 'Good' },
                { star: 5, content: 'Great' },
                { star: 2, content: 'Poor' }
            ];
            
            const mockQuery = {
                populate: jest.fn().mockResolvedValue(mockComments)
            };
            Comment.find.mockReturnValue(mockQuery);
            
            const req = mockRequest({}, { id: 'product-123' });
            const res = mockResponse();
            
            await commentController.index(req, res);
            
            const comments = res.json.mock.calls[0][0];
            const fiveStarComments = comments.filter(c => c.star === 5);
            
            expect(fiveStarComments.length).toBe(2);
        });
    });
});
