import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './Orders.css';

const STATUS_COLORS = {
  Pending: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  Processing: 'linear-gradient(135deg, #7b8ef5 0%, #6366f1 100%)',
  Shipped: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  Delivered: 'linear-gradient(135deg, #8b6fb8 0%, #7c3aed 100%)',
  Cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
};

const TIMELINE_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Ref for dropdown
  const filterDropdownRef = useRef(null);

  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderNumber = (order) => {
    const id = order?.id ?? order?._id ?? '0';
    return `#ORD-${String(id).padStart(6, '0')}`;
  };

  const getStatusColor = (status) => STATUS_COLORS[status] || 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';

  const getTimelineSteps = (status) => {
    if (status === 'Cancelled') {
      return [{ label: 'Cancelled', state: 'present' }];
    }

    const currentIndex = Math.max(0, TIMELINE_STEPS.indexOf(status));
    return TIMELINE_STEPS.map((label, index) => {
      let state = 'future';
      if (index < currentIndex) {
        state = 'past';
      } else if (index === currentIndex) {
        state = 'present';
      }
      return { label, state };
    });
  };

  const fetchOrders = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError('');
      const response = await orderAPI.getAll();
      const data = response.data?.orders || [];
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleFocus = () => fetchOrders(false);
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchOrders(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchOrders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };

    if (filterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterDropdownOpen]);

  const toggleExpanded = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') {
      return orders;
    }
    return orders.filter((order) => order.orderStatus === statusFilter);
  }, [orders, statusFilter]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setFilterDropdownOpen(false);
  };

  const getFilterLabel = () => {
    return statusFilter === 'All' ? 'All Orders' : statusFilter;
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="spinner" role="status" aria-label="Loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1>Order History</h1>
            <p className="orders-subtitle">Track your purchases and delivery status.</p>
          </div>
          <div className="orders-actions">
            <label htmlFor="statusFilter" className="filter-label">Filter by status:</label>
            <div className="custom-filter-dropdown" ref={filterDropdownRef}>
              <button
                className={`filter-select ${filterDropdownOpen ? 'open' : ''}`}
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              >
                <span>{getFilterLabel()}</span>
                <svg viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {filterDropdownOpen && (
                <div className="filter-dropdown-menu">
                  <button
                    className={`filter-option ${statusFilter === 'All' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('All')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                    <span>All Orders</span>
                  </button>
                  <button
                    className={`filter-option ${statusFilter === 'Pending' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('Pending')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Pending</span>
                  </button>
                  <button
                    className={`filter-option ${statusFilter === 'Processing' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('Processing')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Processing</span>
                  </button>
                  <button
                    className={`filter-option ${statusFilter === 'Shipped' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('Shipped')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>Shipped</span>
                  </button>
                  <button
                    className={`filter-option ${statusFilter === 'Delivered' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('Delivered')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <span>Delivered</span>
                  </button>
                  <button
                    className={`filter-option ${statusFilter === 'Cancelled' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('Cancelled')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>Cancelled</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-illustration">{orders.length === 0 ? '🧾' : '🔍'}</div>
            <h2>{orders.length === 0 ? "You haven't placed any orders yet" : `No ${statusFilter} orders found`}</h2>
            <p>{orders.length === 0 ? 'Browse the catalog and add items to your cart to start shopping.' : `You don't have any orders with ${statusFilter} status. Try selecting a different filter.`}</p>
            {orders.length === 0 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Start Shopping
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStatusFilter('All')}
              >
                View All Orders
              </button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const orderId = order.id ?? order._id;
              const isExpanded = expandedOrderId === orderId;
              const status = order.orderStatus || 'Pending';

              return (
                <div key={orderId} className="order-card">
                  <div className="order-summary">
                    <div className="order-meta">
                      <h3>{getOrderNumber(order)}</h3>
                      <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-timeline-summary">
                      <div className="timeline timeline-compact">
                        {getTimelineSteps(status).map((step) => (
                          <div key={step.label} className={`timeline-step timeline-${step.state}`}>
                            <span className="timeline-dot">
                              {step.state === 'past' && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </span>
                            <span>{step.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => toggleExpanded(orderId)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-status-price-card">
                        <div className="status-price-item">
                          <span className="label">Status</span>
                          <span
                            className="status-badge-small"
                            style={{ background: getStatusColor(status) }}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="status-price-item">
                          <span className="label">Total Amount</span>
                          <span className="order-total-large">₹{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                      <div className="details-grid">
                        <div className="detail-block">
                          <h4>Items</h4>
                          <div className="order-items">
                            {(order.items || []).map((item) => {
                              const productId = item.product?.id || item.productId;
                              const content = (
                                <>
                                  <img
                                    src={item.product?.image || '/placeholder.svg'}
                                    alt={item.product?.name || 'Product'}
                                    onError={(event) => {
                                      event.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                  <div>
                                    <p className="item-name">{item.product?.name || 'Product'}</p>
                                    <p className="item-meta">Qty: {item.quantity}</p>
                                    <p className="item-price">₹{formatCurrency(item.price)}</p>
                                  </div>
                                </>
                              );

                              return productId ? (
                                <Link
                                  key={`${orderId}-${item.id || item.productId}`}
                                  to={`/products/${productId}`}
                                  className="order-item order-item-link"
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div
                                  key={`${orderId}-${item.id || item.productId}`}
                                  className="order-item"
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="detail-block">
                          <h4>Shipping Address</h4>
                          <p className="detail-text">
                            {order.shippingAddress?.street}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                            {order.shippingAddress?.country}
                          </p>
                        </div>

                        <div className="detail-block">
                          <h4>Payment</h4>
                          <p className="detail-text">Method: {order.paymentMethod || 'N/A'}</p>
                          <p className="detail-text">
                            Transaction ID: {order.paymentMethod === 'Cash on Delivery' ? 'N/A - Pay on Delivery' : (order.transactionId || 'N/A')}
                          </p>
                          <p className="detail-text">
                            Payment Status: {order.paymentMethod === 'Cash on Delivery' ? 'Pending - Pay on Delivery' : (order.paymentStatus || 'Pending')}
                          </p>
                        </div>
                      </div>

                      <div className="detail-block track-order">
                        <h4>Track Order</h4>
                        <p className="detail-text">Tracking details will appear here once the carrier updates shipment data.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
