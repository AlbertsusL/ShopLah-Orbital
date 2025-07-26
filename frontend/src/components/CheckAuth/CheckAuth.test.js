import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import CheckAuth from './CheckAuth';
import { auth } from '../../firebase/firebase';
import { toast } from 'react-toastify';

const MockProtectedPage = () => <div>This is a protected page.</div>;

const mockNavigate = jest.fn();
const mockUseLocation = {
  pathname: '/protected-route'
};

describe('CheckAuth Higher-Order Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockUseLocation);
    Storage.prototype.setItem = jest.fn();
  });

  test('renders loading state initially', () => {
    auth.onAuthStateChanged.mockImplementation(() => () => {});

    render(
      <BrowserRouter>
        <CheckAuth page={<MockProtectedPage />} />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  describe('when user is authenticated', () => {
    test('renders the protected page component', async () => {
      auth.onAuthStateChanged.mockImplementation(callback => {
        callback({ uid: 'user-123', email: 'test@test.com' }); 
        return () => {};
      });

      render(
        <BrowserRouter>
          <CheckAuth page={<MockProtectedPage />} />
        </BrowserRouter>
      );

      expect(await screen.findByText('This is a protected page.')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    test('does not render the page, redirects to /signin, and shows a toast', async () => {
      auth.onAuthStateChanged.mockImplementation(callback => {
        callback(null);
        return () => {};
      });
      
      render(
        <BrowserRouter>
          <CheckAuth page={<MockProtectedPage />} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('This is a protected page.')).not.toBeInTheDocument();
        expect(screen.getByText('Please Sign In')).toBeInTheDocument();
        expect(toast.error).toHaveBeenCalledWith('Please sign in to access this page');
        expect(localStorage.setItem).toHaveBeenCalledWith('redirectAfterLogin', '/protected-route');
        expect(mockNavigate).toHaveBeenCalledWith('/signin');
      });
    });
  });
});