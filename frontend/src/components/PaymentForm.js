import React, { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit, onBack, amount }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'Credit Card'
  });

  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};

    // Card number validation
    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanedCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    } else if (!/^\d+$/.test(cleanedCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (formData.cardholderName.trim().length < 3) {
      newErrors.cardholderName = 'Name must be at least 3 characters';
    }

    // Expiry date validation
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      } else {
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (monthNum < 1 || monthNum > 12) {
          newErrors.expiryDate = 'Invalid month';
        } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          newErrors.expiryDate = 'Card has expired';
        }
      }
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value.replace(/\s/g, '').slice(0, 16));
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'cardholderName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, '')
      });
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2 className="payment-form-title">Payment Details</h2>

      <div className="form-group">
        <label htmlFor="paymentMethod">
          Payment Method <span className="required">*</span>
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="UPI">UPI</option>
          <option value="Net Banking">Net Banking</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="cardNumber">
          Card Number <span className="required">*</span>
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          className={errors.cardNumber ? 'error' : ''}
          placeholder="#### #### #### ####"
          maxLength="19"
        />
        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="cardholderName">
          Cardholder Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="cardholderName"
          name="cardholderName"
          value={formData.cardholderName}
          onChange={handleChange}
          className={errors.cardholderName ? 'error' : ''}
          placeholder="Name on card"
        />
        {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">
            Expiry Date <span className="required">*</span>
          </label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className={errors.expiryDate ? 'error' : ''}
            placeholder="MM/YY"
            maxLength="5"
          />
          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cvv">
            CVV <span className="required">*</span>
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            className={errors.cvv ? 'error' : ''}
            placeholder="123"
            maxLength="4"
          />
          {errors.cvv && <span className="error-message">{errors.cvv}</span>}
        </div>
      </div>

      <div className="payment-amount">
        <span>Amount to pay:</span>
        <strong>${amount.toFixed(2)}</strong>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-back" onClick={onBack}>
          Back to Shipping
        </button>
        <button type="submit" className="btn-place-order">
          Place Order
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
