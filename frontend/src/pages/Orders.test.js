import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Orders from './Orders';
import { orderAPI } from '../services/api';

jest.mock('../services/api', () => ({
  orderAPI: {
    getAll: jest.fn(),
    getById: jest.fn()
  }
}));

const renderWithRouter = (ui, { initialEntries = ['/orders'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/orders" element={ui} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/products/:id" element={<div>Product Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

const makeOrder = (overrides = {}) => ({
  id: 1,
  createdAt: '2026-02-10T10:00:00.000Z',
  totalAmount: '99.99',
  orderStatus: 'Processing',
  paymentStatus: 'Completed',
  paymentMethod: 'UPI',
  transactionId: 'TXN_TEST',
  shippingAddress: {
    street: '100 Test Street',
    city: 'Bengaluru',
    state: 'KA',
    zipCode: '560100',
    country: 'India'
  },
  items: [
    {
      id: 10,
      productId: 101,
      quantity: 1,
      price: '49.99',
      product: {
        id: 101,
        name: 'Wireless Bluetooth Headphones',
        image: 'https://example.com/img.jpg'
      }
    }
  ],
  ...overrides
});

describe('Orders page', () => {
  test('shows empty state and navigates to dashboard', async () => {
    orderAPI.getAll.mockResolvedValue({ data: { orders: [] } });

    renderWithRouter(<Orders />);

    expect(await screen.findByText(/you haven't placed any orders yet/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /start shopping/i }));
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  test('lists orders newest first and shows status badge', async () => {
    const older = makeOrder({ id: 1, createdAt: '2026-02-10T10:00:00.000Z', orderStatus: 'Processing' });
    const newer = makeOrder({ id: 2, createdAt: '2026-02-12T10:00:00.000Z', orderStatus: 'Delivered' });

    orderAPI.getAll.mockResolvedValue({ data: { orders: [older, newer] } });

    renderWithRouter(<Orders />);

    expect(await screen.findByRole('heading', { name: /order history/i })).toBeInTheDocument();

    const orderHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(orderHeadings[0]).toHaveTextContent('#ORD-000002');
    expect(orderHeadings[1]).toHaveTextContent('#ORD-000001');

    const newerCard = orderHeadings[0].closest('.order-card');
    expect(newerCard).toBeTruthy();

    // Status badge should be in the expanded details section
    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    await userEvent.click(viewDetailsButtons[0]);
    
    // Use getAllByText and verify the badge exists (there are 2: one in timeline, one in status card)
    const deliveredBadges = within(newerCard).getAllByText('Delivered');
    expect(deliveredBadges.length).toBeGreaterThan(0);
    expect(deliveredBadges[0]).toBeInTheDocument();
  });

  test('expands order details and shows key sections', async () => {
    const order = makeOrder({ id: 7, orderStatus: 'Shipped' });
    orderAPI.getAll.mockResolvedValue({ data: { orders: [order] } });

    renderWithRouter(<Orders />);

    expect(await screen.findByText('#ORD-000007')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /view details/i }));

    expect(screen.getByRole('heading', { level: 4, name: /shipping address/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: /^payment$/i })).toBeInTheDocument();
    // Timeline is now in the order summary section, not a separate heading in details

    expect(screen.getByText('Wireless Bluetooth Headphones')).toBeInTheDocument();
    expect(screen.getByText(/transaction id/i)).toBeInTheDocument();
  });

  test('ordered item links navigate to product detail page', async () => {
    const order = makeOrder({
      id: 3,
      items: [
        {
          id: 11,
          productId: 555,
          quantity: 1,
          price: '10.00',
          product: { id: 555, name: 'Mechanical Gaming Keyboard', image: 'https://example.com/kb.jpg' }
        }
      ]
    });

    orderAPI.getAll.mockResolvedValue({ data: { orders: [order] } });

    renderWithRouter(<Orders />);

    await userEvent.click(await screen.findByRole('button', { name: /view details/i }));

    await userEvent.click(screen.getByText('Mechanical Gaming Keyboard'));
    expect(screen.getByText('Product Page')).toBeInTheDocument();
  });

  test('filters orders by status', async () => {
    const delivered = makeOrder({ id: 4, orderStatus: 'Delivered' });
    const processing = makeOrder({ id: 5, orderStatus: 'Processing' });

    orderAPI.getAll.mockResolvedValue({ data: { orders: [processing, delivered] } });

    renderWithRouter(<Orders />);

    await screen.findByText('#ORD-000005');

    // Click the filter button to open dropdown
    const filterButton = screen.getByRole('button', { name: /all orders/i });
    await userEvent.click(filterButton);
    
    // Click the Delivered option
    const deliveredOption = screen.getByRole('button', { name: /^delivered$/i });
    await userEvent.click(deliveredOption);

    expect(screen.getByText('#ORD-000004')).toBeInTheDocument();
    expect(screen.queryByText('#ORD-000005')).not.toBeInTheDocument();
  });

  test('refreshes orders on window focus', async () => {
    const order = makeOrder({ id: 9 });
    orderAPI.getAll.mockResolvedValue({ data: { orders: [order] } });

    renderWithRouter(<Orders />);

    await screen.findByText('#ORD-000009');
    expect(orderAPI.getAll).toHaveBeenCalledTimes(1);

    fireEvent.focus(window);

    // Wait for the refresh call to happen
    await screen.findByText('#ORD-000009');
    expect(orderAPI.getAll).toHaveBeenCalledTimes(2);
  });
});
