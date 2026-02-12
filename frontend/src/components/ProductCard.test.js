import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { CartProvider } from '../context/CartContext';

const mockProduct = {
  id: 1,
  _id: '1',
  name: 'Test Product',
  price: 99.99,
  rating: 4.5,
  stock: 10,
  image: 'https://example.com/image.jpg'
};

const renderWithRouter = (component) => {
  return render(
    <CartProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </CartProvider>
  );
};

describe('ProductCard Component', () => {
  test('renders product information correctly', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/₹99.99/)).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  test('displays out of stock badge when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    renderWithRouter(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  test('displays low stock badge when stock is less than 10', () => {
    const lowStockProduct = { ...mockProduct, stock: 5 };
    renderWithRouter(<ProductCard product={lowStockProduct} />);
    
    expect(screen.getByText('Only 5 left')).toBeInTheDocument();
  });

  test('renders rating stars correctly', () => {
    renderWithRouter(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('(4.5)')).toBeInTheDocument();
  });
});
