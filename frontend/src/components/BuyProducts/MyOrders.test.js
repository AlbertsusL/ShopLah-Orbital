import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import MyOrders from './MyOrders';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

const mockNavigate = jest.fn();
const mockOrders = [
  { id: 'order1', product_id: 'p1', product_name: 'Delivered Item', buyer_name: 'Test', buyer_email: 'test@test.com', total: '25.00', status: 'delivered', has_review: false },
  { id: 'order2', product_id: 'p2', product_name: 'Reviewed Item', buyer_name: 'Test', buyer_email: 'test@test.com', total: '30.00', status: 'delivered', has_review: true },
  { id: 'order3', product_id: 'p3', product_name: 'Shipped Item', buyer_name: 'Test', buyer_email: 'test@test.com', total: '40.00', status: 'shipped', has_review: false },
];

describe('MyOrders Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ email: 'buyer@example.com' }) });
  });

  test('displays orders and correct review buttons', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: mockOrders } });
    render(<BrowserRouter><MyOrders /></BrowserRouter>);

    const shippedItemCard = await screen.findByText('Shipped Item');
    const deliveredItemCard = screen.getByText('Delivered Item');
    const reviewedItemCard = screen.getByText('Reviewed Item');

    expect(shippedItemCard).toBeInTheDocument();
    expect(deliveredItemCard).toBeInTheDocument();
    expect(reviewedItemCard).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /write review/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit review/i })).toBeInTheDocument();

    const shippedCardContainer = shippedItemCard.closest('.shadow'); 
    const reviewButtonInShippedCard = within(shippedCardContainer).queryByRole('button', { name: /review/i });
    expect(reviewButtonInShippedCard).toBeNull();
  });
  
  test('navigates to the review page on button click', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: mockOrders } });
    render(<BrowserRouter><MyOrders /></BrowserRouter>);
    
    const writeReviewButton = await screen.findByRole('button', { name: /write review/i });
    fireEvent.click(writeReviewButton);

    expect(mockNavigate).toHaveBeenCalledWith('/buy/review/order1', {
      state: { order: mockOrders[0] },
    });
  });

  test('displays "No orders found" message when order list is empty', async () => {
    axios.get.mockResolvedValue({ data: { success: true, orders: [] } });
    render(<BrowserRouter><MyOrders /></BrowserRouter>);
    expect(await screen.findByText(/no orders found/i)).toBeInTheDocument();
  });
});