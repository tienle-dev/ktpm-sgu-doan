import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../testUtils';
import SignUp from '../../../Auth/SignUp';
import User from '../../../API/User';

// Mock API
jest.mock('../../../API/User', () => ({
    Post_User: jest.fn()
}));

describe('SignUp Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        test('renders form đăng ký với tất cả fields', () => {
            renderWithProviders(<SignUp />);
            
            expect(screen.getByText('Register')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
        });

        test('renders link đến trang đăng nhập', () => {
            renderWithProviders(<SignUp />);
            
            const loginLink = screen.getByText('Already have an account?');
            expect(loginLink).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        test('hiển thị lỗi khi email trống', async () => {
            renderWithProviders(<SignUp />);
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('* Please Check Your Email!')).toBeInTheDocument();
            });
        });

        test('hiển thị lỗi khi fullname trống', async () => {
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('* Please Check Your Full Name!')).toBeInTheDocument();
            });
        });

        test('hiển thị lỗi khi username trống', async () => {
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const fullnameInput = screen.getByPlaceholderText('Full Name');
            
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('* Please Check Your Username!')).toBeInTheDocument();
            });
        });

        test('hiển thị lỗi khi password không khớp', async () => {
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const fullnameInput = screen.getByPlaceholderText('Full Name');
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm Password');
            
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'differentpassword' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('* Please Check Your Confirm Password!')).toBeInTheDocument();
            });
        });
    });

    describe('API Integration', () => {
        test('gọi API đăng ký với đúng data', async () => {
            User.Post_User.mockResolvedValue({ _id: 'newuser123' });
            
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const fullnameInput = screen.getByPlaceholderText('Full Name');
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm Password');
            
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
            fireEvent.change(usernameInput, { target: { value: 'testuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'password123' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(User.Post_User).toHaveBeenCalledWith({
                    email: 'test@test.com',
                    username: 'testuser',
                    password: 'password123',
                    fullname: 'Test User',
                    id_permission: '68ed1321ea0818176077f743'
                });
            });
        });

        test('hiển thị lỗi khi username đã tồn tại', async () => {
            User.Post_User.mockResolvedValue('User Da Ton Tai');
            
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const fullnameInput = screen.getByPlaceholderText('Full Name');
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm Password');
            
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
            fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'password123' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('* Username Is Exist. Please Enter Againt!')).toBeInTheDocument();
            });
        });

        test('hiển thị thông báo thành công khi đăng ký thành công', async () => {
            User.Post_User.mockResolvedValue({ _id: 'newuser123' });
            
            renderWithProviders(<SignUp />);
            
            const emailInput = screen.getByPlaceholderText('Email');
            const fullnameInput = screen.getByPlaceholderText('Full Name');
            const usernameInput = screen.getByPlaceholderText('Username');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm Password');
            
            fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
            fireEvent.change(fullnameInput, { target: { value: 'Test User' } });
            fireEvent.change(usernameInput, { target: { value: 'newuser' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(confirmInput, { target: { value: 'password123' } });
            
            const submitButton = screen.getByRole('button', { name: /register/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('You Signup Successfull!')).toBeInTheDocument();
            });
        });
    });
});
