import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SellProducts from './SellProducts';
import { auth, db } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

describe('SellProducts (AddProductPage) Component', () => {

  beforeAll(() => {
    window.URL.createObjectURL = jest.fn().mockReturnValue("fake-image-url");
  });

  beforeEach(() => {
    jest.clearAllMocks();

    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'seller-uid-123' });
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ID: 'seller-db-id-456' }),
    });
  });

  test('renders the form with all fields', () => {
    render(<BrowserRouter><SellProducts /></BrowserRouter>);

    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/upload images/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  test('allows user to fill out the form', () => {
    render(<BrowserRouter><SellProducts /></BrowserRouter>);
    
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'New Gadget' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A shiny new gadget.' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/stock quantity/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'electronics' } });

    expect(screen.getByLabelText(/product name/i).value).toBe('New Gadget');
    expect(screen.getByLabelText(/description/i).value).toBe('A shiny new gadget.');
    expect(screen.getByLabelText(/price/i).value).toBe('99.99');
    expect(screen.getByLabelText(/stock quantity/i).value).toBe('100');
    expect(screen.getByLabelText(/category/i).value).toBe('electronics');
  });

  test('submits the form and shows a success message', async () => {
    axios.post.mockImplementation(url => {
        if (url.includes('/api/upload')) {
            return Promise.resolve({ data: { imageUrls: ['http://example.com/image.jpg'] } });
        }
        if (url.includes('/api/products')) {
            return Promise.resolve({ data: { success: true } });
        }
        return Promise.reject(new Error('Not mocked'));
    });

    render(<BrowserRouter><SellProducts /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'New Gadget' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A shiny new gadget.' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/stock quantity/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'electronics' } });
    
    const file = new File(['(⌐□_□)'], 'gadget.png', { type: 'image/png' });
    const imageInput = screen.getByLabelText(/upload images/i);
    fireEvent.change(imageInput, { target: { files: [file] } });
    
    expect(await screen.findByAltText(/preview 0/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add product/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/upload'), expect.any(FormData), expect.any(Object));
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/products'), expect.objectContaining({
        name: 'New Gadget',
        price: 99.99,
        stock: 100,
        images: ['http://example.com/image.jpg'],
      }));
      expect(screen.getByText('Product added successfully!')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/product name/i).value).toBe('');
  });

  test('shows an error message if submission fails', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Failed to create product' } } });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BrowserRouter><SellProducts /></BrowserRouter>);
    
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/stock quantity/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'books' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A book.' } });

    const file = new File(['(⌐□_□)'], 'gadget.png', { type: 'image/png' });
    const imageInput = screen.getByLabelText(/upload images/i);
    fireEvent.change(imageInput, { target: { files: [file] } });

    await screen.findByAltText(/preview 0/i);
    fireEvent.click(screen.getByRole('button', { name: /add product/i }));
    
    expect(await screen.findByText('Failed to create product')).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });
});