// In src/components/BuyProducts/WriteReview.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import WriteReview from './WriteReview';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock the router hooks
const mockNavigate = jest.fn();
const mockOrder = {
  id: 'order123',
  product_id: 'prod456',
  buyer_name: 'Test Buyer',
  buyer_email: 'buyer@test.com',
  product_name: 'A Great Product',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      order: mockOrder,
    },
  }),
  useParams: () => ({ orderId: 'order123' }),
}));

describe('WriteReview Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { success: true, review: null } });
  });

  test('renders the component with order details', async () => {
    render(<BrowserRouter><WriteReview /></BrowserRouter>);

    expect(screen.getByText('A Great Product')).toBeInTheDocument();
    expect(screen.getByText(/order #order123/i)).toBeInTheDocument();
    
    expect(screen.getByLabelText(/your review/i)).toBeInTheDocument();
  });

  test('allows the user to change the star rating', () => {
    render(<BrowserRouter><WriteReview /></BrowserRouter>);

    const starButtons = screen.getAllByRole('button', { name: '' }); 
    
    fireEvent.click(starButtons[2]);

    expect(starButtons[0].querySelector('svg')).toHaveClass('text-yellow-400');
    expect(starButtons[1].querySelector('svg')).toHaveClass('text-yellow-400');
    expect(starButtons[2].querySelector('svg')).toHaveClass('text-yellow-400');
    expect(starButtons[3].querySelector('svg')).toHaveClass('text-gray-300');
    expect(starButtons[4].querySelector('svg')).toHaveClass('text-gray-300');
  });

  test('submits the review and navigates on success', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    render(<BrowserRouter><WriteReview /></BrowserRouter>);

    const commentInput = screen.getByLabelText(/your review/i);
    fireEvent.change(commentInput, { target: { value: 'This was a fantastic product!' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/reviews'),
        expect.objectContaining({
          orderId: 'order123',
          productId: 'prod456',
          rating: 5,
          comment: 'This was a fantastic product!',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Review submitted!');
      expect(mockNavigate).toHaveBeenCalledWith('/buy/myorders');
    });
  });

  test('shows an error toast if the review comment is empty', async () => {
    render(<BrowserRouter><WriteReview /></BrowserRouter>);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Please write a review');
    expect(axios.post).not.toHaveBeenCalled();
  });
  
  test('fetches and populates an existing review', async () => {
    const existingReview = { rating: 4, comment: 'It was pretty good.' };
    axios.get.mockResolvedValue({ data: { success: true, review: existingReview } });
    
    render(<BrowserRouter><WriteReview /></BrowserRouter>);
    
    expect(await screen.findByDisplayValue('It was pretty good.')).toBeInTheDocument();
    
    const starButtons = screen.getAllByRole('button', { name: '' });
    expect(starButtons[3].querySelector('svg')).toHaveClass('text-yellow-400');
    expect(starButtons[4].querySelector('svg')).toHaveClass('text-gray-300');
  });
});