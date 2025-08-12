import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import { getDoc, doc } from 'firebase/firestore';
import { auth } from '../../firebase/firebase';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockProduct = {
  id: 'prod-1', name: 'Super Gadget', description: 'The best gadget ever.', category: 'electronics', price: '199.99', stock: 15, userid: 'seller-uid-xyz', images: [{ image_url: 'gadget.jpg', is_primary: true }],
};
const mockSeller = { user: 'GadgetStore', ID: 'seller-db-id-abc' };
const mockReviews = [
  { id: 1, buyer_name: 'John Doe', rating: 5, comment: 'Amazing product!', created_at: new Date().toISOString() }
];

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
}));

describe('ProductDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.onAuthStateChanged.mockImplementation(callback => (callback({ uid: 'buyer-uid-123' }), () => {}));

    doc.mockImplementation((db, collection, id) => ({
      id: id,
      path: `${collection}/${id}` // a fake path
    }));
    
    getDoc.mockImplementation(docRef => {
      if (docRef.id === 'seller-uid-xyz') {
        return Promise.resolve({ exists: () => true, data: () => mockSeller });
      }
      return Promise.resolve({ exists: () => true, data: () => ({ ID: 'buyer-id-123' }) });
    });

    axios.get.mockImplementation(url => {
      if (url.includes('/api/products/prod-1')) return Promise.resolve({ data: { product: mockProduct } });
      if (url.includes('/api/orders/reviews/product/prod-1')) return Promise.resolve({ data: { success: true, reviews: mockReviews, avgRating: 5, totalReviews: 1 } });
      return Promise.reject(new Error(`not mocked: ${url}`));
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter initialEntries={['/product/prod-1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state, then fetches and displays all product, seller, and review data', async () => {
    renderComponent();
    expect(screen.getByText(/loading product.../i)).toBeInTheDocument();
    
    expect(await screen.findByText('Super Gadget')).toBeInTheDocument();
    expect(screen.getByText(/sold by: gadgetstore/i)).toBeInTheDocument();
    expect(screen.getByText('Amazing product!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buy now - \$199.99/i })).toBeInTheDocument();
  });

  test('updates total price when quantity is changed', async () => {
    renderComponent();
    await screen.findByText('Super Gadget');
    const quantitySelect = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantitySelect, { target: { value: '3' } });
    expect(screen.getByRole('button', { name: /buy now - \$599.97/i })).toBeInTheDocument();
    expect(screen.getByText(/total: \$599.97/i)).toBeInTheDocument();
  });

  test('handles "Add to Cart" action correctly', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    renderComponent();
    await screen.findByText('Super Gadget');
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/cart'),
        expect.objectContaining({
          userId: mockSeller.ID,
          product: 'prod-1',
          quantity: 1,
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Added 1 Super Gadget(s) to cart!');
      expect(mockNavigate).toHaveBeenCalledWith('/buy/cart');
    });
  });
});