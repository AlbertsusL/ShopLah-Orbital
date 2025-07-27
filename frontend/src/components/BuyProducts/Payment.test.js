import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import PaymentPage from './Payment'; 
import axios from 'axios';
import { toast } from 'react-toastify';

const mockStripe = {
  confirmPayment: jest.fn(),
};

const mockElements = {
  getElement: jest.fn(),
};

jest.mock('@stripe/react-stripe-js', () => ({
  ...jest.requireActual('@stripe/react-stripe-js'),
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  PaymentElement: () => <div data-testid="payment-element" />,
}));

const mockNavigate = jest.fn();
const mockLocationState = {
  state: {
    buyerName: 'TestBuyer',
    buyerEmail: 'buyer@test.com',
    buyerAddress: '123 Test St',
    buyerPhone: '12345678',
    grandTotal: 50,
    orderData: [
        { product: { id: 'p1', userid: 'seller1' }, quantity: 1, total: 50 }
    ],
    buyerid: 'cart-buyer-id',
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocationState,
}));

describe('PaymentPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.post.mockResolvedValue({ data: { clientSecret: 'test_client_secret' } });
  });

  test('handles successful payment', async () => {
    mockStripe.confirmPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded', id: 'pi_123' },
    });
    axios.post.mockResolvedValueOnce({ data: { clientSecret: 'test_client_secret' } }) 
      .mockResolvedValueOnce({ data: { success: true } }); 
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(<MemoryRouter><PaymentPage /></MemoryRouter>);

    const payButton = await screen.findByRole('button', { name: /pay \$50.00/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockStripe.confirmPayment).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/orders'), expect.any(Object));
      expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/api/orders/cart-buyer-id'));
      expect(toast.success).toHaveBeenCalledWith('Payment successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('handles failed payment', async () => {
    const errorMessage = 'Your card was declined.';
    mockStripe.confirmPayment.mockResolvedValue({
      error: { message: errorMessage }
    });
    
    render(<MemoryRouter><PaymentPage /></MemoryRouter>);
    const payButton = await screen.findByRole('button', { name: /pay \$50.00/i });
    fireEvent.click(payButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(1); 
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});