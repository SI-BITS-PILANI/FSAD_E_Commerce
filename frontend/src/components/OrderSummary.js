import React from 'react';
import './OrderSummary.css';

const OrderSummary = ({ cartItems, totals, isProcessing = false }) => {
  const { subtotal, tax, total, itemCount } = totals;

  return (
    <div className="order-summary">
      <h3 className="order-summary-title">Order Summary</h3>
      
      <div className="order-summary-items">
        {cartItems.map((item) => (
          <div key={item.id} className="order-summary-item">
            <img 
              src={item.image || 'https://via.placeholder.com/60x60'} 
              alt={item.name}
              className="order-summary-item-image"
            />
            <div className="order-summary-item-details">
              <h4 className="order-summary-item-name">{item.name}</h4>
              <p className="order-summary-item-qty">Qty: {item.quantity}</p>
            </div>
            <div className="order-summary-item-price">
              ₹{(Number(item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="order-summary-divider"></div>

      <div className="order-summary-totals">
        <div className="order-summary-row">
          <span>Subtotal ({itemCount} items)</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="order-summary-row">
          <span>Tax (18%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="order-summary-divider"></div>
        <div className="order-summary-row order-summary-total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {isProcessing && (
        <div className="order-summary-processing">
          <div className="processing-spinner"></div>
          <p>Processing your order...</p>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
