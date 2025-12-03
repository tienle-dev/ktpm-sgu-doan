import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import SignIn from '../../../Auth/SignIn';
import User from '../../../API/User';

// Mock API
jest.mock('../../../API/User', () => ({
    Get_Detail_User: jest.fn()
}));

describe('SignIn Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    describe('Rendering', () => {
        test('renders login form với tất cả elements', () => {
            renderWithProviders(<SignIn />);
            
            expect(screen.getByText('Login')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        test('renders breadcrumb navigation', () => {
            renderWithProviders(<SignIn />);
            
            expect(screen.getByText('Home')).toBeInTheDocument();
        });

        test('renders link đến trang đăng ký', () => {
            renderWithProviders(<SignIn />);
            
            const signupLink = screen.getByText('Do You Have Account?');
            expect(signupLink).toBeInTheDocument();
            expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
        });
    });

    describe('User Interactions', () => {
        test('cho phép nhập username', () => {
            renderWithProviders(<SignIn />);
            
            const usernameInput = screen.getByPlaceholderText('Username');
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            
            expect(usernameInput.value).toBe('testuser');
        });

        test('cho phép nhập password', () => {
            renderWithProviders(<SignIn />);
            
            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.change(passwordInput, { target: { value: 'testpass123' } });
            
            expect(passwordInput.value).toBe('testpass123');
        });
    });

    describe('Form Validation', () => {
        test('hiển thị lỗi khi username không tồn tại', async () => {
            User.Get_Detail_User.mockResolvedValue('Khong Tìm Thấy User');
            
            renderWithProviders(<SignIn />);
            
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: /login/i });

            fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('* Wrong Username!')).toBeInTheDocument();
            });
        });

        test('hiển thị lỗi khi password sai', async () => {
            User.Get_Detail_User.mockResolvedValue('Sai Mat Khau');
            
            renderWithProviders(<SignIn />);
            
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: /login/i });

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(screen.getByText('* Wrong Password!')).toBeInTheDocument();
            });
        });
    });

    describe('API Integration', () => {
        test('gọi API với đúng parameters', async () => {
            User.Get_Detail_User.mockResolvedValue({ _id: 'user123' });
            
            renderWithProviders(<SignIn />);
            
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: /login/i });

            fireEvent.change(usernameInput, { target: { value: 'myuser' } });
            fireEvent.change(passwordInput, { target: { value: 'mypass' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(User.Get_Detail_User).toHaveBeenCalledWith('?username=myuser&password=mypass');
            });
        });

        test('đăng nhập thành công lưu user id vào session', async () => {
            const mockUser = { _id: 'user123', username: 'testuser' };
            User.Get_Detail_User.mockResolvedValue(mockUser);
            
            renderWithProviders(<SignIn />);
            
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const loginButton = screen.getByRole('button', { name: /login/i });

            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(sessionStorage.getItem('id_user')).toBe('user123');
            });
        });
    });

    describe('Edge Cases', () => {
        test('xử lý khi submit form trống', async () => {
            renderWithProviders(<SignIn />);
            
            const loginButton = screen.getByRole('button', { name: /login/i });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(User.Get_Detail_User).toHaveBeenCalledWith('?username=&password=');
            });
        });
    });
});
