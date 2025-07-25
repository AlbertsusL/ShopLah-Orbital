import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import SignInPage from './SignInPage';

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const mockNavigate = jest.fn();

describe('SignInPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  test('allows user to type in email and password fields', () => {
    render(<BrowserRouter><SignInPage /></BrowserRouter>);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('logs in successfully and redirects to profile page', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });

    render(<BrowserRouter><SignInPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', '123');
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('User logged in successfully'), expect.any(Object));
    });
  });

  test('redirects to a specific page after successful login if one is stored', async () => {
    localStorage.getItem.mockReturnValue('/buy/cart');
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });

    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('redirectAfterLogin');
      expect(mockNavigate).toHaveBeenCalledWith('/buy/cart');
      expect(toast.success).toHaveBeenCalledWith('Welcome back!', expect.any(Object));
    });
  });

  test('shows an error toast message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    signInWithEmailAndPassword.mockRejectedValue({ message: errorMessage });

    render(<BrowserRouter><SignInPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'som.tingwong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });
  });

  test('handles forgot password successfully', async () => {
    sendPasswordResetEmail.mockResolvedValue();
    render(<BrowserRouter><SignInPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'forgot@example.com' } });
    fireEvent.click(screen.getByText(/forgot password\?/i));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'forgot@example.com');
      expect(toast.success).toHaveBeenCalledWith('Password reset email sent! Check your inbox.');
    });
  });
});