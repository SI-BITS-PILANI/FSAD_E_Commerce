import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ShippingForm.css';

const ShippingForm = ({ onSubmit, onBack, initialData = {} }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    addressLine1: initialData.addressLine1 || '',
    addressLine2: initialData.addressLine2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zipCode: initialData.zipCode || '',
    country: initialData.country || 'India',
    phone: initialData.phone || ''
  });

  const [errors, setErrors] = useState({});
  const [useProfileAddress, setUseProfileAddress] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 6 digits';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUseProfileAddress = (e) => {
    const checked = e.target.checked;
    setUseProfileAddress(checked);
    
    if (checked && user?.address) {
      setFormData({
        addressLine1: user.address.addressLine1 || '',
        addressLine2: user.address.addressLine2 || '',
        city: user.address.city || '',
        state: user.address.state || '',
        zipCode: user.address.zipCode || '',
        country: user.address.country || 'India',
        phone: user.phone || ''
      });
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form className="shipping-form" onSubmit={handleSubmit}>
      <h2 className="shipping-form-title">Shipping Address</h2>

      {user?.address && (
        <div className="form-checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useProfileAddress}
              onChange={handleUseProfileAddress}
            />
            <span>Use address from profile</span>
          </label>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="addressLine1">
          Address Line 1 <span className="required">*</span>
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className={errors.addressLine1 ? 'error' : ''}
          placeholder="Street address, P.O. box"
        />
        {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="addressLine2">Address Line 2</label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">
            City <span className="required">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'error' : ''}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="state">
            State <span className="required">*</span>
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? 'error' : ''}
          />
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="zipCode">
            ZIP Code <span className="required">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={errors.zipCode ? 'error' : ''}
            placeholder="6 digits"
            maxLength="6"
          />
          {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            placeholder="10 digits"
            maxLength="10"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="country">
          Country <span className="required">*</span>
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={errors.country ? 'error' : ''}
        />
        {errors.country && <span className="error-message">{errors.country}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-continue">
          Continue to Payment
        </button>
      </div>
    </form>
  );
};

export default ShippingForm;
