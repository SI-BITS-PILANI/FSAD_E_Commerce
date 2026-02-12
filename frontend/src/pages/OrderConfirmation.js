import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, transactionId } = location.state || {};

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Redirect if no order data
    if (!order) {
      navigate('/dashboard');
    }
  }, [order, navigate]);

  if (!order) {
    return null; // Will redirect in useEffect
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className="success-icon">
            <svg viewBox="0 0 52 52" className="checkmark">
              <circle cx="26" cy="26" r="25" fill="none" />
              <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <div className="header-content">
            <h1 className="confirmation-title">Order Placed Successfully!</h1>
            <p className="confirmation-message">
              Order #{order.id} • {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="order-content-grid">
          <div className="order-details-card">
            <h3>Order Summary</h3>
            <div className="order-detail-row">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">
                {order.paymentMethod === 'Cash on Delivery' ? 'N/A - Pay on Delivery' : transactionId}
              </span>
            </div>

            <div className="order-detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{order.paymentMethod || 'Card'}</span>
            </div>

            <div className="order-detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-badge ${order.paymentMethod === 'Cash on Delivery' ? 'pending' : 'success'}`}>
                {order.paymentMethod === 'Cash on Delivery' ? 'Pending - Pay on Delivery' : (order.paymentStatus || 'Completed')}
              </span>
            </div>

            <div className="order-detail-divider"></div>

            <div className="order-detail-row total-row">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value total-amount">
                ₹{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
            
            {order.shippingAddress && (
              <div className="shipping-compact">
                <h4>Shipping To:</h4>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </div>
            )}
          </div>

          {order.items && order.items.length > 0 && (
            <div className="order-items-section">
              <h3>Items ({order.items.length})</h3>
              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.product?.image && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="order-item-image"
                      />
                    )}
                    <div className="order-item-details">
                      <h4>{item.product?.name || 'Product'}</h4>
                      <p>Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="order-item-total">
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="confirmation-actions">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-continue-shopping"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => window.print()} 
            className="btn-print-receipt"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
