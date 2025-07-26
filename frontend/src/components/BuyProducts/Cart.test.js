import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Cart from './Cart';
import { auth, db } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

const mockCartItems = [
  { id: 1, cart_id: 101, name: 'Gaming Mouse', description: 'A fast mouse', price: '49.99', cart_quantity: 1, images: [] },
  { id: 2, cart_id: 102, name: 'Mechanical Keyboard', description: 'A loud keyboard', price: '120.00', cart_quantity: 2, images: [] },
];

describe('Cart Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'buyer-uid-123' });
      return () => {};
    });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ID: 'buyer-id-456' }),
    });
    window.confirm = jest.fn(() => true);
    window.dispatchEvent = jest.fn();
  });

  test('displays message when cart is empty', async () => {
    axios.get.mockResolvedValue({ data: { success: true, cart: [] } });
    render(<BrowserRouter><Cart /></BrowserRouter>);
    expect(await screen.findByText('No products in Cart')).toBeInTheDocument();
  });

  test('displays cart items and correct total price', async () => {
    axios.get.mockResolvedValue({ data: { success: true, cart: mockCartItems } });
    render(<BrowserRouter><Cart /></BrowserRouter>);
    expect(await screen.findByText('Gaming Mouse')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText(/Total: \$289.99/i)).toBeInTheDocument();
  });

  test('handles item deletion successfully', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, cart: mockCartItems } })
      .mockResolvedValueOnce({ data: { success: true, cart: [mockCartItems[1]] } }); 
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(<BrowserRouter><Cart /></BrowserRouter>);
    await screen.findByText('Gaming Mouse');

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product from cart?');
    
    await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
          expect.stringContaining('/api/products/cart/101'),
          expect.any(Object)
        );

        expect(toast.success).toHaveBeenCalledWith('Product successfully deleted!');
        expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
        expect(screen.queryByText('Gaming Mouse')).not.toBeInTheDocument();
    });
  });

  test('navigates to checkout with correct state on "Proceed to Checkout" click', async () => {
    axios.get.mockResolvedValue({ data: { success: true, cart: mockCartItems } });
    render(<BrowserRouter><Cart /></BrowserRouter>);
    await screen.findByText('Gaming Mouse');

    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/checkout', {
      state: {
        buyerid: 'buyer-id-456',
        orderData: [
          { product: mockCartItems[0], quantity: 1 },
          { product: mockCartItems[1], quantity: 2 },
        ],
      },
    });
  });
});