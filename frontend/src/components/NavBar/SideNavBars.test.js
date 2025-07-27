import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SideNavbar from './SideNavbar';
import BuySideNavbar from './BuySideNavBar';

describe('SideNavbars', () => {
  describe('Sell SideNavbar', () => {
    test('renders all sell links', () => {
      render(
        <MemoryRouter>
          <SideNavbar />
        </MemoryRouter>
      );
      expect(screen.getByText(/list items/i)).toBeInTheDocument();
      expect(screen.getByText(/manage products/i)).toBeInTheDocument();
      expect(screen.getByText(/manage orders/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/my account/i)).toBeInTheDocument();
    });

    test('highlights the active link based on URL', () => {
      render(
        <MemoryRouter initialEntries={['/sell/manage']}>
          <SideNavbar />
        </MemoryRouter>
      );
      const activeLink = screen.getByText(/manage products/i);
      expect(activeLink.closest('a')).toHaveClass('bg-amber-200');
    });
  });

  describe('Buy SideNavbar', () => {
    test('renders all buy links', () => {
      render(
        <MemoryRouter>
          <BuySideNavbar />
        </MemoryRouter>
      );
      expect(screen.getByText(/browse products/i)).toBeInTheDocument();
      expect(screen.getByText(/my orders/i)).toBeInTheDocument();
      expect(screen.getByText(/favourites/i)).toBeInTheDocument();
    });

    test('highlights the active link based on URL', () => {
      render(
        <MemoryRouter initialEntries={['/buy/search']}>
          <BuySideNavbar />
        </MemoryRouter>
      );
      const activeLink = screen.getByText(/browse products/i);
      expect(activeLink.closest('a')).toHaveClass('bg-amber-200');
    });
  });
});