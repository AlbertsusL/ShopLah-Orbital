import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ModifyProducts from './ModifyProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'prod-123' }),
}));

const mockProduct = {
  id: 'prod-123',
  name: 'Vintage Lamp',
  description: 'An old lamp.',
  price: 75.50,
  stock: 10,
  low_stock_alert: 5,
  category: 'home',
  images: [{ image_url: 'lamp.jpg' }]
};

describe('ModifyProducts Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockResolvedValue({ data: { success: true, product: mockProduct } });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });


  const renderComponent = () => {
    render(
      <MemoryRouter initialEntries={['/sell/modify/prod-123']}>
        <Routes>
          <Route path="/sell/modify/:id" element={<ModifyProducts />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('fetches and displays product data correctly', async () => {
    renderComponent();
    expect(await screen.findByDisplayValue('An old lamp.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('75.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

  test('allows description, price, and stock to be updated', async () => {
    renderComponent();
    await screen.findByText('Vintage Lamp');

    const descriptionInput = screen.getByDisplayValue('An old lamp.');
    const priceInput = screen.getByDisplayValue('75.5');
    const stockInput = screen.getByDisplayValue('10');

    fireEvent.change(descriptionInput, { target: { value: 'A beautiful old lamp.' } });
    fireEvent.change(priceInput, { target: { value: '80' } });
    fireEvent.change(stockInput, { target: { value: '8' } });

    expect(descriptionInput.value).toBe('A beautiful old lamp.');
    expect(priceInput.value).toBe('80');
    expect(stockInput.value).toBe('8');
  });

  test('submits updated data and navigates on success', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    renderComponent();
    await screen.findByText('Vintage Lamp');

    const descriptionInput = screen.getByDisplayValue('An old lamp.');
    fireEvent.change(descriptionInput, { target: { value: 'A really beautiful old lamp.' } });
    
    const updateButton = screen.getByRole('button', { name: /update vintage lamp/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/modify/prod-123'),
        expect.objectContaining({
          description: 'A really beautiful old lamp.',
          price: 75.5,
          stock: 10,
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Updated successfully');
      expect(mockNavigate).toHaveBeenCalledWith('/sell/manage');
    });
  });

  test('shows an error toast if the update fails', async () => {
    axios.put.mockRejectedValue(new Error('Update failed'));
    renderComponent();
    await screen.findByText('Vintage Lamp');

    const updateButton = screen.getByRole('button', { name: /update vintage lamp/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update product');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('navigates back when "Back to Manage Products" is clicked', async () => {
    renderComponent();
    await screen.findByText('Vintage Lamp');

    const backButton = screen.getByRole('button', { name: /back to manage products/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/sell/manage');
  });
});