import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Checkout from './Checkout';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();
const mockLocationState = {
  state: {
    buyerid: 'buyer123',
    orderData: [
      { product: { name: 'Test Product', price: '10.00', images: [] }, quantity: 2 },
    ],
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocationState,
}));

describe('Checkout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ user: 'TestBuyer', email: 'buyer@test.com' }),
    });
  });

  test('renders order summary and total correctly', async () => {
    render(<MemoryRouter><Checkout /></MemoryRouter>);
    expect(await screen.findByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /buy now - \$20.00/i})).toBeInTheDocument();
  });

  test('allows filling the form and navigates to payment on submit', async () => {
    render(<MemoryRouter><Checkout /></MemoryRouter>);
    
    await screen.findByText('Test Product');

    fireEvent.change(screen.getByPlaceholderText(/phone number/i), {target: {value: '12345678'}});
    fireEvent.change(screen.getByPlaceholderText(/your address/i), {target: {value: '123 Test St'}});
    
    fireEvent.click(screen.getByRole('button', {name: /buy now/i}));

    expect(mockNavigate).toHaveBeenCalledWith('/payment', {
        state: expect.objectContaining({
            buyerName: 'TestBuyer',
            buyerAddress: '123 Test St',
            buyerPhone: '12345678',
            grandTotal: 20,
        })
    });
  });

  test('shows an error toast if form is incomplete', async () => {
    render(<MemoryRouter><Checkout /></MemoryRouter>);
    await screen.findByText('Test Product');
    
    fireEvent.click(screen.getByRole('button', {name: /buy now/i}));
    
    expect(toast.error).toHaveBeenCalledWith('Please fill in all information');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});