import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ManageAccount from './ManageAccount';
import { auth, db } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

const mockAccountData = {
  success: true,
  order: [
    { date: '2023-10-27T10:00:00Z', name: 'Product A', total: '100.00', status: 'delivered' },
    { date: '2023-10-26T12:30:00Z', name: 'Product B', total: '50.50', status: 'processing' },
  ],
  totalSum: 50.50, 
  revenueSum: 100.00,
};

describe('ManageAccount Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'seller-uid-123' });
      return () => {};
    });

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ ID: 'seller-db-id-456' }),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('fetches and displays account summary and transactions', async () => {
    axios.get.mockResolvedValue({ data: mockAccountData });
    render(<BrowserRouter><ManageAccount /></BrowserRouter>);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    expect(await screen.findByText('$100')).toBeInTheDocument(); 
    expect(screen.getByText('$50.5')).toBeInTheDocument();

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('$50.50')).toBeInTheDocument();
    expect(screen.getByText('delivered')).toBeInTheDocument();
  });

  test('displays a message when there are no transactions', async () => {
    const noTransactionsData = { ...mockAccountData, order: [], totalSum: 0 };
    axios.get.mockResolvedValue({ data: noTransactionsData });
    render(<BrowserRouter><ManageAccount /></BrowserRouter>);

    expect(await screen.findByText('No transactions found.')).toBeInTheDocument();
  });

  test('displays an error message if fetching data fails', async () => {
    axios.get.mockRejectedValue({ response: { data: { message: 'API Error' } } });
    render(<BrowserRouter><ManageAccount /></BrowserRouter>);

    expect(await screen.findByText(/failed to fetch orders/i)).toBeInTheDocument();
  });
});