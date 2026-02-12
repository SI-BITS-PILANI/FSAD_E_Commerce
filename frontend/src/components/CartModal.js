import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartModal.css';

const CartModal = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCart();

  const { subtotal, tax, total } = getCartTotal();

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else if (newQuantity <= maxStock) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleBrowseProducts = () => {
    closeCart();
    navigate('/dashboard');
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('cart-modal-overlay')) {
      closeCart();
    }
  };

  if (!isCartOpen) {
    return null;
  }

  return (
    <div className="cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="cart-modal">
        <div className="cart-modal-header">
          <h2>Shopping Cart</h2>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
            ×
          </button>
        </div>

        <div className="cart-modal-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some products to get started!</p>
              <button className="btn-browse-products" onClick={handleBrowseProducts}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">${Number(item.price).toFixed(2)}</p>
                      {item.quantity >= item.stock && (
                        <span className="cart-item-stock-warning">Max stock reached</span>
                      )}
                    </div>
                    <div className="cart-item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-actions">
                <button className="btn-clear-cart" onClick={clearCart}>
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-modal-footer">
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-total-row">
                <span>Tax (18% GST):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-total-row cart-grand-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="btn-checkout" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
