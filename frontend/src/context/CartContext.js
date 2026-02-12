import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'ecommerce_cart';
const TAX_RATE = 0.18; // 18% GST

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.id) {
      console.error('Invalid product');
      return { success: false, message: 'Invalid product' };
    }

    // Check stock availability
    const availableStock = product.stock || 0;
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > availableStock) {
          return prevItems; // Don't update if exceeds stock
        }
        
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Check if quantity exceeds stock for new item
      if (quantity > availableStock) {
        return prevItems;
      }

      // Add new item
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          quantity: quantity,
        },
      ];
    });

    return { success: true, message: 'Added to cart' };
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  // Update quantity of item in cart
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          // Check stock availability
          const maxQuantity = Math.min(quantity, item.stock || quantity);
          return { ...item, quantity: maxQuantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate cart totals
  const getCartTotal = useCallback(() => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    };
  }, [cartItems]);

  // Get total item count
  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Check if product can be added (stock validation)
  const canAddToCart = useCallback((productId, quantity = 1) => {
    const item = cartItems.find((i) => i.id === productId);
    if (item) {
      return (item.quantity + quantity) <= item.stock;
    }
    return true;
  }, [cartItems]);

  // Get quantity of specific product in cart
  const getCartItemQuantity = useCallback((productId) => {
    const item = cartItems.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Toggle cart modal
  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    canAddToCart,
    getCartItemQuantity,
    toggleCart,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
