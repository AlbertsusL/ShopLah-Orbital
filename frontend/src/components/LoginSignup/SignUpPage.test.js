import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import SignUpPage from './SignUpPage';
import { auth } from '../../firebase/firebase';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

const mockNavigate = jest.fn();

describe('SignUpPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
  });

  test('allows user to fill out the sign-up form', () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText('Username').value).toBe('newuser');
    expect(screen.getByPlaceholderText('Enter your email').value).toBe('new@example.com');
  });

  test('shows an error toast if passwords do not match', async () => {
    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Passwords don't match!", expect.any(Object));
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  test('creates a user, saves to firestore, and redirects on successful sign-up', async () => {
    const mockUser = { uid: 'user-uid-123', email: 'new@example.com' };
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    auth.currentUser = mockUser;
    
    const mockDocRef = { id: 'mock-doc-ref' };
    doc.mockReturnValue(mockDocRef);

    render(<BrowserRouter><SignUpPage /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'new@example.com', 'password123');
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        email: 'new@example.com',
        user: 'newuser',
        ID: 'user-uid-123',
      });
      expect(toast.success).toHaveBeenCalledWith('Account created successfully!', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('shows an error toast if firebase registration fails', async () => {
    const errorMessage = 'Email already in use';
    createUserWithEmailAndPassword.mockRejectedValue({ message: errorMessage });

    render(<BrowserRouter><SignUpPage /></BrowserRouter>);
    
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });
  });
});