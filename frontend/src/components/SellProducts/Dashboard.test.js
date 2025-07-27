import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

// Mock recharts library
jest.mock('recharts', () => {
  const OriginalRecharts = jest.requireActual('recharts');
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const mockDashboardData = {
  success: true,
  orderStatus: [{ status: 'delivered', status_count: '10' }],
  uniqueUsers: 5,
  itemsListed: 20,
  revenue: 1500,
  completedOrders: 10,
  review: [{ review_score: 5, review_score_count: '8' }],
  category: [{ category: 'electronics', count: '12' }],
  revenueMonth: [{ month: 'Oct', monthly_revenue: '500' }],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ID: 'test-id' }) });
    axios.get.mockResolvedValue({ data: mockDashboardData });
  });

  test('renders metric cards with correct data after fetching', async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    
    expect(await screen.findByText('$ 1500')).toBeInTheDocument();
    expect(await screen.findByText('20')).toBeInTheDocument();
    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(await screen.findByText('5')).toBeInTheDocument();

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Total Items Listed')).toBeInTheDocument();
    expect(screen.getByText('Completed Orders')).toBeInTheDocument();
    expect(screen.getByText('Unique Users')).toBeInTheDocument();
  });

  test('renders chart titles', async () => {
    render(<BrowserRouter><Dashboard /></BrowserRouter>);

    await screen.findByText('Total Revenue');
    
    expect(screen.getByText('Order Status')).toBeInTheDocument();
    expect(screen.getByText('Reviews Summary')).toBeInTheDocument();
    expect(screen.getByText('Revenue by Month')).toBeInTheDocument();
    expect(screen.getByText('Order Categories')).toBeInTheDocument();
  });
});