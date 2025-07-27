import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import ManageProducts from './ManageProducts';
import { auth, db } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

const mockProducts = [
  { id: 'p1', name: 'Laptop Pro', description: 'A powerful laptop.', category: 'electronics', stock: 15, price: '1200.00', images: [{ image_url: 'laptop.jpg' }] },
  { id: 'p2', name: 'Cool T-Shirt', description: 'A cool shirt.', category: 'clothing', stock: 50, price: '25.50', images: [{ image_url: 'shirt.jpg' }] },
];

describe('ManageProducts Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'seller-uid-123' });
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ID: 'seller-db-id-456' }),
    });

    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });


  test('shows loading state, then fetches and displays products', async () => {
    axios.get.mockResolvedValue({ data: { success: true, products: mockProducts } });

    render(<BrowserRouter><ManageProducts /></BrowserRouter>);

    expect(screen.getByText(/loading products.../i)).toBeInTheDocument();

    expect(await screen.findByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Cool T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('$1200.00')).toBeInTheDocument();
  });

  test('displays an error message if fetching products fails', async () => {
    axios.get.mockRejectedValue({ response: { data: { message: 'Network Error' } } });
    
    render(<BrowserRouter><ManageProducts /></BrowserRouter>);

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  test('filters products by search term', async () => {
    axios.get.mockResolvedValue({ data: { success: true, products: mockProducts } });
    
    render(<BrowserRouter><ManageProducts /></BrowserRouter>);
    
    await screen.findByText('Laptop Pro');

    const searchInput = screen.getByPlaceholderText(/search products.../i);
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.queryByText('Cool T-Shirt')).not.toBeInTheDocument();
  });

  test('navigates to the modify page when modify button is clicked', async () => {
    axios.get.mockResolvedValue({ data: { success: true, products: mockProducts } });

    render(<BrowserRouter><ManageProducts /></BrowserRouter>);

    const modifyButtons = await screen.findAllByRole('button', { name: /modify/i });
    fireEvent.click(modifyButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/sell/modify/p1');
  });

  test('deletes a product when delete button is clicked and confirmed', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
    axios.get.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[1]] } });
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(<BrowserRouter><ManageProducts /></BrowserRouter>);

    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');

    await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/products/delete/p1'), expect.any(Object));
        expect(toast.success).toHaveBeenCalledWith('Product successfully deleted!');
        expect(screen.queryByText('Laptop Pro')).not.toBeInTheDocument();
        expect(screen.getByText('Cool T-Shirt')).toBeInTheDocument();
    });
  });
});