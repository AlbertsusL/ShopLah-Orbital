import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('shows loading state initially', () => {
    auth.onAuthStateChanged.mockImplementation(() => () => {});
    render(<BrowserRouter><Navbar /></BrowserRouter>);
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  describe('when user is logged in', () => {
    const mockUser = { uid: 'test-uid-123' };
    const mockUserDetails = { user: 'testuser', ID: 'user-db-id-456' };
    const mockCartResponse = { data: { cart: 5 } };

    beforeEach(() => {
      auth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser);
        return () => {}; 
      });

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserDetails,
      });
      axios.get.mockResolvedValue(mockCartResponse);
    });

    test('renders user profile and cart count after loading', async () => {
      render(<BrowserRouter><Navbar /></BrowserRouter>);
      expect(await screen.findByText('testuser')).toBeInTheDocument();
      expect(await screen.findByText('5')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    test('navigates to protected routes when links are clicked', async () => {
      render(<BrowserRouter><Navbar /></BrowserRouter>);
      await screen.findByText('testuser');
      fireEvent.click(screen.getByText('Buy'));
      expect(mockNavigate).toHaveBeenCalledWith('/buy/search');
    });
  });

  describe('when user is logged out', () => {
    beforeEach(() => {
      auth.onAuthStateChanged.mockImplementation((callback) => {
        callback(null);
        return () => {};
      });
    });

    test('renders "Sign In" button', async () => {
      render(<BrowserRouter><Navbar /></BrowserRouter>);
      expect(await screen.findByText('Sign In')).toBeInTheDocument();
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    test('redirects to signin and shows toast for protected links', async () => {
      render(<BrowserRouter><Navbar /></BrowserRouter>);
      await screen.findByText('Sign In');
      fireEvent.click(screen.getByText('Buy'));
      expect(toast.error).toHaveBeenCalledWith('Please sign in to browse products');
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });
});