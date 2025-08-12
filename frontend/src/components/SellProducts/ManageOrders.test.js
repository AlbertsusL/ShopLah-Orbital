import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ManageOrders from './ManageOrders';
import { auth, db } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockOrders = [
  { id: 1, product_name: 'Blue Pen', buyer_name: 'Alice', buyer_email: 'alice@example.com', total: '10.00', quantity: 2, status: 'pending', created_at: new Date().toISOString() },
  { id: 2, product_name: 'Red Stapler', buyer_name: 'Bob', buyer_email: 'bob@example.com', total: '15.50', quantity: 1, status: 'processing', created_at: new Date().toISOString() },
  { id: 3, product_name: 'Blue Pen', buyer_name: 'Charlie', buyer_email: 'charlie@example.com', total: '5.00', quantity: 1, status: 'shipped', created_at: new Date().toISOString() },
];

describe('ManageOrders Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'seller-uid-123' }), () => {}));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ID: 'seller-db-id-456' }) });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });


  test('fetches and displays a list of orders', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: mockOrders } });
    render(<BrowserRouter><ManageOrders /></BrowserRouter>);
    expect(await screen.findByText('Order ID #1')).toBeInTheDocument();
    expect(screen.getByText('Order ID #2')).toBeInTheDocument();
    expect(screen.getByText('Order ID #3')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('filters orders by search term (buyer name)', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: mockOrders } });
    render(<BrowserRouter><ManageOrders /></BrowserRouter>);
    await screen.findByText('Order ID #1');

    const searchInput = screen.getByPlaceholderText(/search by buyer name/i);
    fireEvent.change(searchInput, { target: { value: 'bob' } });

    expect(screen.queryByText('Order ID #1')).not.toBeInTheDocument();
    expect(screen.getByText('Order ID #2')).toBeInTheDocument();
  });

  test('filters orders by status', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: mockOrders } });
    render(<BrowserRouter><ManageOrders /></BrowserRouter>);
    await screen.findByText('Order ID #1');

    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: 'shipped' } });

    expect(screen.queryByText('Order ID #1')).not.toBeInTheDocument();
    expect(screen.queryByText('Order ID #2')).not.toBeInTheDocument();
    expect(screen.getByText('Order ID #3')).toBeInTheDocument();
  });

    test('allows updating order status from pending to processing', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, orders: mockOrders } });
        axios.put.mockResolvedValue({ data: { success: true } });
        const updatedOrders = mockOrders.map(o => o.id === 1 ? { ...o, status: 'processing' } : o);
        axios.get.mockResolvedValueOnce({ data: { success: true, orders: updatedOrders } });
    
        render(<BrowserRouter><ManageOrders /></BrowserRouter>);
        
        const order1Card = await screen.findByText(/order id #1/i, { selector: 'h3' });
        const markProcessingButton = within(order1Card.closest('.p-6')).getByRole('button', { name: /mark as processing/i });
        
        fireEvent.click(markProcessingButton);
        
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/api/orders/1/status'),
                { status: 'processing' }
            );
            expect(toast.success).toHaveBeenCalledWith('Order status updated to processing!');
        });
        

        const updatedOrder1Card = await screen.findByText(/order id #1/i, { selector: 'h3' });
        expect(within(updatedOrder1Card.closest('.p-6')).getByText(/processing/i)).toBeInTheDocument();
    });
});