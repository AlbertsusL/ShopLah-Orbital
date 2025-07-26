import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

const mockApiProducts = [
  { id: 1, name: 'Smart Watch', description: 'Its a watch', category: 'electronics', images: [], price: '150' },
  { id: 2, name: 'Denim Jacket', description: 'Made of denim', category: 'clothing', images: [], price: '80' },
  { id: 3, name: 'Smart Lightbulb', description: 'It shines', category: 'electronics', images: [], price: '25' },
];

describe('SearchPage - Component Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: '123' }), () => {}));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ID: 'user-db-id' }) });
    axios.get.mockImplementation(url => {
      if (url.includes('/api/products/favourites')) {
        return Promise.resolve({ data: { success: true, favourites: [] } });
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({ data: { success: true, products: mockApiProducts } });
      }
      if (url.includes('/api/orders/reviews/product/')) {
        return Promise.resolve({ data: { success: true, avgRating: 0, totalReviews: 0 } });
      }
      return Promise.reject(new Error(`AXIOS GET call to ${url} was not mocked.`));
    });
  });

  test('fetches and displays initial products', async () => {
    render(<BrowserRouter><SearchPage /></BrowserRouter>);
    expect(await screen.findByText('Smart Watch')).toBeInTheDocument();
    expect(screen.getByText('Denim Jacket')).toBeInTheDocument();
    expect(screen.getByText(/showing 3 of 3 products/i)).toBeInTheDocument();
  });

  test('filters products based on debounced search term', async () => {
    render(<BrowserRouter><SearchPage /></BrowserRouter>);
    await screen.findByText('Smart Watch');

    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: 'smart' } });

    await waitFor(() => {
      expect(screen.getByText(/showing 2 of 3 products/i)).toBeInTheDocument();
    });
    
    const searchResultsContainer = screen.getByTestId('search-results');
    const similarItemsContainer = screen.getByTestId('similar-items');

    expect(within(searchResultsContainer).getByText('Smart Watch')).toBeInTheDocument();
    expect(within(searchResultsContainer).getByText('Smart Lightbulb')).toBeInTheDocument();
    
    expect(within(searchResultsContainer).queryByText('Denim Jacket')).not.toBeInTheDocument();

    expect(within(similarItemsContainer).getByText('Smart Watch')).toBeInTheDocument();
    expect(within(similarItemsContainer).getByText('Smart Lightbulb')).toBeInTheDocument();
  });
});