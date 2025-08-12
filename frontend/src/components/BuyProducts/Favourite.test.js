import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Favourite from './Favourite';
import { auth } from '../../firebase/firebase';
import { getDoc } from 'firebase/firestore';
import axios from 'axios';

const mockNavigate = jest.fn();
const mockFavourites = [
  { id: 'fav1', name: 'Favorite Book', category: 'books', price: '19.99', images: [] },
  { id: 'fav2', name: 'Favorite Lamp', category: 'home', price: '45.00', images: [] },
];

describe('Favourite Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    auth.onAuthStateChanged.mockImplementation(cb => (cb({ uid: 'test-uid' }), () => {}));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ID: 'user-db-id' }) });
    axios.get.mockImplementation(url => {
      if(url.includes('/api/products/favourites/')) {
        return Promise.resolve({ data: { favourites: mockFavourites } });
      }
      if(url.includes('/api/orders/reviews/product/')) {
        return Promise.resolve({ data: { success: true, avgRating: 0, totalReviews: 0 } });
      }
      return Promise.reject(new Error(`AXIOS GET not mocked for ${url}`));
    });
  });

  test('fetches and displays favorite products', async () => {
    render(<BrowserRouter><Favourite /></BrowserRouter>);
    expect(await screen.findByText('Favorite Book')).toBeInTheDocument();
    expect(screen.getByText('Favorite Lamp')).toBeInTheDocument();
  });

  test('filters favourites by search term', async () => {
    render(<BrowserRouter><Favourite /></BrowserRouter>);
    await screen.findByText('Favorite Book');

    const searchInput = screen.getByPlaceholderText(/search products/i);
    fireEvent.change(searchInput, { target: { value: 'lamp' } });
    
    expect(screen.queryByText('Favorite Book')).not.toBeInTheDocument();
    expect(screen.getByText('Favorite Lamp')).toBeInTheDocument();
  });

  test('navigates to product detail page on click', async () => {
    render(<BrowserRouter><Favourite /></BrowserRouter>);
    const product = await screen.findByText('Favorite Book');
    fireEvent.click(product);
    expect(mockNavigate).toHaveBeenCalledWith('/buy/product/fav1');
  });
});