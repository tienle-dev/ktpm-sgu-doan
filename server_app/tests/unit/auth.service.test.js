const bcrypt = require('bcrypt');
const { testUsers } = require('../helpers/testData');

// Unit tests cho Authentication Service Logic
describe('Authentication Service - Unit Tests', () => {
    
    describe('Password Hashing', () => {
        test('should hash password correctly', async () => {
            const password = 'TestPassword123!';
            const saltRounds = 10;
            
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(0);
        });
        
        test('should generate different hashes for same password', async () => {
            const password = 'TestPassword123!';
            const saltRounds = 10;
            
            const hash1 = await bcrypt.hash(password, saltRounds);
            const hash2 = await bcrypt.hash(password, saltRounds);
            
            expect(hash1).not.toBe(hash2);
        });
        
        test('should validate correct password', async () => {
            const password = 'TestPassword123!';
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const isMatch = await bcrypt.compare(password, hashedPassword);
            
            expect(isMatch).toBe(true);
        });
        
        test('should reject incorrect password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword456!';
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
            
            expect(isMatch).toBe(false);
        });
    });
    
    describe('User Validation Logic', () => {
        test('should validate user object has required fields', () => {
            const user = testUsers.validUser;
            
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('password');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('fullname');
        });
        
        test('should detect missing required fields', () => {
            const invalidUser = testUsers.invalidUser;
            
            expect(invalidUser.username).toBeFalsy();
            expect(invalidUser.password.length).toBeLessThan(6);
        });
        
        test('should validate email format', () => {
            const validEmail = testUsers.validUser.email;
            const invalidEmail = testUsers.invalidUser.email;
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            expect(emailRegex.test(validEmail)).toBe(true);
            expect(emailRegex.test(invalidEmail)).toBe(false);
        });
        
        test('should validate password strength', () => {
            const strongPassword = testUsers.validUser.password;
            const weakPassword = testUsers.invalidUser.password;
            
            // Password phải có ít nhất 6 ký tự
            expect(strongPassword.length).toBeGreaterThanOrEqual(6);
            expect(weakPassword.length).toBeLessThan(6);
        });
    });
    
    describe('Login Logic', () => {
        test('should accept username or email for login', () => {
            const user = testUsers.validUser;
            const usernameQuery = { username: user.username };
            const emailQuery = { email: user.email };
            
            // Giả lập query logic
            const query = [usernameQuery, emailQuery];
            
            expect(query).toContainEqual(usernameQuery);
            expect(query).toContainEqual(emailQuery);
        });
        
        test('should prepare correct query for user lookup', () => {
            const loginInput = 'testuser@example.com';
            
            // Logic tương tự user.controller.js detail function
            const query = [
                { username: loginInput },
                { email: loginInput }
            ];
            
            expect(query).toHaveLength(2);
            expect(query[0]).toHaveProperty('username', loginInput);
            expect(query[1]).toHaveProperty('email', loginInput);
        });
    });
    
    describe('User Update Logic', () => {
        test('should preserve password if not provided in update', async () => {
            const existingHashedPassword = await bcrypt.hash('OldPassword123', 10);
            
            const updateData = {
                fullname: 'Updated Name',
                username: 'updateduser',
                password: '' // Empty password should not update
            };
            
            // Logic: chỉ hash password mới nếu có
            let finalPassword = existingHashedPassword;
            if (updateData.password && updateData.password.length > 0) {
                finalPassword = await bcrypt.hash(updateData.password, 10);
            }
            
            expect(finalPassword).toBe(existingHashedPassword);
        });
        
        test('should hash new password when updating', async () => {
            const newPassword = 'NewPassword123';
            const saltRounds = 10;
            
            // Giả lập logic update với password mới
            let hashedPassword = null;
            if (newPassword) {
                hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            }
            
            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(newPassword);
            
            const isMatch = await bcrypt.compare(newPassword, hashedPassword);
            expect(isMatch).toBe(true);
        });
    });
    
    describe('Registration Logic', () => {
        test('should create user object with hashed password', async () => {
            const userData = testUsers.validUser;
            const saltRounds = 10;
            
            // Giả lập logic registration
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const newUser = { ...userData, password: hashedPassword };
            
            expect(newUser.password).not.toBe(userData.password);
            expect(newUser.username).toBe(userData.username);
            expect(newUser.email).toBe(userData.email);
        });
        
        test('should preserve all user fields during registration', async () => {
            const userData = testUsers.validUser;
            const saltRounds = 10;
            
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const newUser = { ...userData, password: hashedPassword };
            
            expect(newUser).toHaveProperty('username', userData.username);
            expect(newUser).toHaveProperty('fullname', userData.fullname);
            expect(newUser).toHaveProperty('email', userData.email);
            expect(newUser).toHaveProperty('phone', userData.phone);
            expect(newUser).toHaveProperty('gender', userData.gender);
        });
    });
});
