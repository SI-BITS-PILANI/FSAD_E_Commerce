import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAuth } from '../context/AuthContext';

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
      <AppHeader />
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/orders" element={<div>Orders Page</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
      <LocationDisplay />
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

    expect(screen.getByText(/linux fsad ecommerce/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
  });

  test('opens user dropdown on hover and closes on outside click', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Admin User' },
      logout: jest.fn()
    });

    renderHeader(['/dashboard']);

    const trigger = screen.getByRole('button', { name: /welcome, admin user/i });
    const menuRoot = trigger.closest('.user-menu');
    expect(menuRoot).toBeTruthy();

    fireEvent.mouseEnter(menuRoot);
    expect(await screen.findByRole('menuitem', { name: /my orders/i })).toBeInTheDocument();

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

    const trigger = screen.getByRole('button', { name: /welcome, admin user/i });
    const menuRoot = trigger.closest('.user-menu');
    expect(menuRoot).toBeTruthy();

    fireEvent.mouseEnter(menuRoot);

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

    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(logout).toHaveBeenCalledWith(false);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
