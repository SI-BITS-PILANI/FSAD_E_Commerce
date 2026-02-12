import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { paymentAPI, orderAPI } from '../services/api';
import OrderSummary from '../components/OrderSummary';
import ShippingForm from '../components/ShippingForm';
import PaymentForm from '../components/PaymentForm';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const totals = getCartTotal();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/dashboard');
    }
  }, [cartItems, navigate]);

  const handleQuantityChange = (productId, newQuantity, maxStock) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else if (newQuantity <= maxStock) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setCurrentStep(3);
    setError(null);
    window.scrollTo(0, 0); // Scroll to top when moving to payment step
  };

  const handleBackToCart = () => {
    setCurrentStep(1);
    setError(null);
    window.scrollTo(0, 0);
  };

  const handleBackToShipping = () => {
    setCurrentStep(2);
    setError(null);
  };

  const handlePaymentSubmit = async (paymentData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Process payment
      const paymentResponse = await paymentAPI.processPayment({
        amount: totals.total,
        paymentMethod: paymentData.paymentMethod,
        cardDetails: {
          cardNumber: paymentData.cardNumber,
          cardholderName: paymentData.cardholderName,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv
        }
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Payment failed');
      }

      const { transactionId } = paymentResponse.data;

      // Step 2: Create order
      // Transform shipping data to match backend expectations
      const backendShippingAddress = {
        street: shippingData.addressLine1 + (shippingData.addressLine2 ? ', ' + shippingData.addressLine2 : ''),
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
        country: shippingData.country,
        phone: shippingData.phone
      };

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: backendShippingAddress,
        paymentMethod: paymentData.paymentMethod,
        transactionId
      };

      const orderResponse = await orderAPI.createOrder(orderData);

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Order creation failed');
      }

      // Success: Clear cart and redirect to confirmation
      clearCart();
      navigate('/order-confirmation', {
        state: {
          order: orderResponse.data.order,
          transactionId
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to process your order. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Cart Review' },
      { number: 2, label: 'Shipping' },
      { number: 3, label: 'Payment' }
    ];

    return (
      <div className="checkout-steps">
        {steps.map((step) => (
          <div 
            key={step.number}
            className={`checkout-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="checkout-step-inner">
              <div className="checkout-step-number">
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="checkout-step-label">{step.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back-to-shop">
          ← Back to Shopping
        </button>
        <h1 className="checkout-title">Checkout</h1>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="checkout-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-dismiss-error">
            Dismiss
          </button>
        </div>
      )}

      <div className="checkout-content">
        <div className="checkout-main">
          {currentStep === 1 && (
            <div className="cart-review">
              <h2 className="cart-review-title">Review Your Cart</h2>
              <div className="cart-review-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-review-item">
                    <img 
                      src={item.image || 'https://via.placeholder.com/100x100'} 
                      alt={item.name}
                      className="cart-review-item-image"
                    />
                    <div className="cart-review-item-details">
                      <h3>{item.name}</h3>
                      <p className="item-price">${Number(item.price).toFixed(2)} each</p>
                      {item.quantity >= item.stock && (
                        <span className="stock-warning">Max stock reached</span>
                      )}
                    </div>
                    <div className="cart-review-item-quantity">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-review-item-total">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCurrentStep(2)} className="btn-continue">
                Continue to Shipping
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <ShippingForm 
              onSubmit={handleShippingSubmit}
              onBack={handleBackToCart}
              initialData={shippingData || {}}
            />
          )}

          {currentStep === 3 && (
            <PaymentForm 
              onSubmit={handlePaymentSubmit}
              onBack={handleBackToShipping}
              amount={totals.total}
            />
          )}
        </div>

        <div className="checkout-sidebar">
          <OrderSummary 
            cartItems={cartItems} 
            totals={totals}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <div className="processing-spinner-large"></div>
            <h3>Processing Your Order</h3>
            <p>Please do not close this window...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
