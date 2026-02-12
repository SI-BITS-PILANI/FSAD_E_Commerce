import React, { useState, useEffect, useRef } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ onSubmit, onBack, amount }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    paymentMethod: 'Credit Card'
  });

  const [errors, setErrors] = useState({});
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bankDropdownRef = useRef(null);

  const paymentMethods = [
    { value: 'Credit Card', label: 'Credit Card', icon: '💳' },
    { value: 'Debit Card', label: 'Debit Card', icon: '💳' },
    { value: 'UPI', label: 'UPI', icon: '📱' },
    { value: 'Net Banking', label: 'Net Banking', icon: '🏦' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery', icon: '💵' }
  ];

  const banks = [
    { value: 'State Bank of India', label: 'State Bank of India', icon: '🏦' },
    { value: 'HDFC Bank', label: 'HDFC Bank', icon: '🏦' },
    { value: 'ICICI Bank', label: 'ICICI Bank', icon: '🏦' },
    { value: 'Axis Bank', label: 'Axis Bank', icon: '🏦' },
    { value: 'Punjab National Bank', label: 'Punjab National Bank', icon: '🏦' },
    { value: 'Bank of Baroda', label: 'Bank of Baroda', icon: '🏦' },
    { value: 'Kotak Mahindra Bank', label: 'Kotak Mahindra Bank', icon: '🏦' },
    { value: 'IndusInd Bank', label: 'IndusInd Bank', icon: '🏦' },
    { value: 'Yes Bank', label: 'Yes Bank', icon: '🏦' },
    { value: 'IDFC First Bank', label: 'IDFC First Bank', icon: '🏦' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target)) {
        setIsBankDropdownOpen(false);
      }
    };

    if (isPaymentDropdownOpen || isBankDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPaymentDropdownOpen, isBankDropdownOpen]);

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
    const method = formData.paymentMethod;

    // Card-based validations (Credit Card, Debit Card)
    if (method === 'Credit Card' || method === 'Debit Card') {
      const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
      if (!cleanedCardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cleanedCardNumber.length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      } else if (!/^\d+$/.test(cleanedCardNumber)) {
        newErrors.cardNumber = 'Card number must contain only digits';
      }

      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      } else if (formData.cardholderName.trim().length < 3) {
        newErrors.cardholderName = 'Name must be at least 3 characters';
      }

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

      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    // UPI validation
    if (method === 'UPI') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Invalid UPI ID format (e.g., username@bank)';
      }
    }

    // Net Banking validation
    if (method === 'Net Banking') {
      if (!formData.bankName) {
        newErrors.bankName = 'Please select a bank';
      }
    }

    // Cash on Delivery - no validation needed

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
      const submissionData = {
        paymentMethod: formData.paymentMethod
      };

      // Add method-specific data
      if (formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') {
        submissionData.cardNumber = formData.cardNumber.replace(/\s/g, '');
        submissionData.cardholderName = formData.cardholderName;
        submissionData.expiryDate = formData.expiryDate;
        submissionData.cvv = formData.cvv;
      } else if (formData.paymentMethod === 'UPI') {
        submissionData.upiId = formData.upiId;
      } else if (formData.paymentMethod === 'Net Banking') {
        submissionData.bankName = formData.bankName;
      }

      onSubmit(submissionData);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2 className="payment-form-title">Payment Details</h2>

      <div className="form-group">
        <label htmlFor="paymentMethod">
          Payment Method <span className="required">*</span>
        </label>
        <div className="payment-select-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="payment-select-button"
            onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
          >
            <span className="payment-method-icon">
              {paymentMethods.find(m => m.value === formData.paymentMethod)?.icon}
            </span>
            <span className="payment-method-label">{formData.paymentMethod}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ transform: isPaymentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {isPaymentDropdownOpen && (
            <div className="payment-dropdown-menu">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className={`payment-dropdown-item ${formData.paymentMethod === method.value ? 'active' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, paymentMethod: method.value }));
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  <span className="payment-method-icon">{method.icon}</span>
                  <span className="payment-method-label">{method.label}</span>
                  {formData.paymentMethod === method.value && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="check-icon">
                      <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credit Card / Debit Card Fields */}
      {(formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') && (
        <>
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
        </>
      )}

      {/* UPI Fields */}
      {formData.paymentMethod === 'UPI' && (
        <div className="form-group">
          <label htmlFor="upiId">
            UPI ID <span className="required">*</span>
          </label>
          <input
            type="text"
            id="upiId"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            className={errors.upiId ? 'error' : ''}
            placeholder="username@bank"
          />
          {errors.upiId && <span className="error-message">{errors.upiId}</span>}
          <small className="helper-text">Enter your UPI ID (e.g., yourname@paytm, yourname@gpay)</small>
        </div>
      )}

      {/* Net Banking Fields */}
      {formData.paymentMethod === 'Net Banking' && (
        <div className="form-group">
          <label htmlFor="bankName">
            Select Bank <span className="required">*</span>
          </label>
          <div className="bank-select-wrapper" ref={bankDropdownRef}>
            <button
              type="button"
              className={`bank-select-button ${errors.bankName ? 'error' : ''}`}
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
            >
              <span className="bank-icon">🏦</span>
              <span className="bank-label">
                {formData.bankName || '-- Select Your Bank --'}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ transform: isBankDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isBankDropdownOpen && (
              <div className="bank-dropdown-menu">
                {banks.map((bank) => (
                  <div
                    key={bank.value}
                    className={`bank-dropdown-item ${formData.bankName === bank.value ? 'active' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, bankName: bank.value }));
                      setIsBankDropdownOpen(false);
                      if (errors.bankName) {
                        setErrors(prev => ({ ...prev, bankName: '' }));
                      }
                    }}
                  >
                    <span className="bank-icon">{bank.icon}</span>
                    <span className="bank-label">{bank.label}</span>
                    {formData.bankName === bank.value && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="check-icon">
                        <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.bankName && <span className="error-message">{errors.bankName}</span>}
        </div>
      )}

      {/* Cash on Delivery Message */}
      {formData.paymentMethod === 'Cash on Delivery' && (
        <div className="cod-info">
          <div className="cod-icon">💵</div>
          <div className="cod-content">
            <h4>Cash on Delivery</h4>
            <p>Pay with cash when your order is delivered to your doorstep.</p>
            <ul>
              <li>Keep exact change ready for a smooth delivery</li>
              <li>Payment can be made to the delivery executive</li>
              <li>You can inspect the package before payment</li>
            </ul>
          </div>
        </div>
      )}

      <div className="payment-amount">
        <span>Amount to pay:</span>
        <strong>₹{amount.toFixed(2)}</strong>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-place-order">
          Place Order
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
