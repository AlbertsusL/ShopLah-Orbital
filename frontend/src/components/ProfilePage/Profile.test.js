import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Profile from './Profile';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    window.dispatchEvent = jest.fn();
  });

  test('displays loading state then user information', async () => {
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ user: 'TestUser', email: 'test@example.com' }),
    });

    render(<BrowserRouter><Profile /></BrowserRouter>);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    expect(await screen.findByText('Welcome, TestUser!')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('handles logout correctly', async () => {
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    auth.signOut = jest.fn();
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ user: 'TestUser', email: 'test@example.com' }),
    });

    render(<BrowserRouter><Profile /></BrowserRouter>);
    
    const logoutButton = await screen.findByRole('button', { name: /sign out/i });
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    });
  });
});