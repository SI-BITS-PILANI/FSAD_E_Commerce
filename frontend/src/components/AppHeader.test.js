import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const LocationDisplay = () => {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
};

const renderHeader = (initialEntries = ['/dashboard']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <CartProvider>
        <AppHeader />
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/orders" element={<div>Orders Page</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
        <LocationDisplay />
      </CartProvider>
    </MemoryRouter>
  );
};

describe('AppHeader', () => {
  test('does not render on auth pages', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout: jest.fn()
    });

    renderHeader(['/login']);

    expect(screen.queryByText(/linux fsad ecommerce/i)).not.toBeInTheDocument();
  });

  test('renders title and Orders link when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout: jest.fn()
    });

    renderHeader(['/dashboard']);

    expect(screen.getByText(/linux marketplace/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home/i })).toBeInTheDocument();
  });

  test('opens user dropdown on click and closes on outside click', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout: jest.fn()
    });

    renderHeader(['/dashboard']);

    const trigger = screen.getByRole('button', { name: /admin user/i });
    
    // Menu should not be visible initially
    expect(screen.queryByRole('menuitem', { name: /my orders/i })).not.toBeInTheDocument();

    // Click to open menu
    await userEvent.click(trigger);
    expect(await screen.findByRole('menuitem', { name: /my orders/i })).toBeInTheDocument();

    // Click outside to close
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menuitem', { name: /my orders/i })).not.toBeInTheDocument();
  });

  test('navigates to orders from dropdown', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout: jest.fn()
    });

    renderHeader(['/dashboard']);

    const trigger = screen.getByRole('button', { name: /admin user/i });
    
    // Click to open menu
    await userEvent.click(trigger);

    // Click orders link
    await userEvent.click(await screen.findByRole('menuitem', { name: /my orders/i }));

    expect(screen.getByText('Orders Page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/orders');
  });

  test('logout navigates to login and calls logout(false)', async () => {
    const logout = jest.fn();
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout
    });

    renderHeader(['/dashboard']);

    // Click to open the user menu
    const trigger = screen.getByRole('button', { name: /admin user/i });
    await userEvent.click(trigger);

    // Click logout
    await userEvent.click(await screen.findByRole('menuitem', { name: /logout/i }));

    expect(logout).toHaveBeenCalledWith(false);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
