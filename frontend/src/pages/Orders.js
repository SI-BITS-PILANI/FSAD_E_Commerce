import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './Orders.css';

const STATUS_COLORS = {
  Pending: '#f5b50a',
  Processing: '#3b82f6',
  Shipped: '#7c3aed',
  Delivered: '#16a34a',
  Cancelled: '#dc2626'
};

const TIMELINE_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState(() => new Set());
  const [statusFilter, setStatusFilter] = useState('All');

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

  const getStatusColor = (status) => STATUS_COLORS[status] || '#94a3b8';

  const getTimelineSteps = (status) => {
    if (status === 'Cancelled') {
      return [{ label: 'Cancelled', active: true }];
    }

    const currentIndex = Math.max(0, TIMELINE_STEPS.indexOf(status));
    return TIMELINE_STEPS.map((label, index) => ({
      label,
      active: index <= currentIndex
    }));
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

  const toggleExpanded = (orderId) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') {
      return orders;
    }
    return orders.filter((order) => order.orderStatus === statusFilter);
  }, [orders, statusFilter]);

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
            <label htmlFor="statusFilter" className="filter-label">Filter by status</label>
            <select
              id="statusFilter"
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-illustration">🧾</div>
            <h2>You haven't placed any orders yet</h2>
            <p>Browse the catalog and add items to your cart to start shopping.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const orderId = order.id ?? order._id;
              const isExpanded = expandedOrderIds.has(orderId);
              const status = order.orderStatus || 'Pending';

              return (
                <div key={orderId} className="order-card">
                  <div className="order-summary">
                    <div className="order-meta">
                      <h3>{getOrderNumber(order)}</h3>
                      <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {status}
                      </span>
                      <span className="order-total">${formatCurrency(order.totalAmount)}</span>
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
                                    <p className="item-price">${formatCurrency(item.price)}</p>
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
                          <p className="detail-text">Transaction ID: {order.transactionId || 'N/A'}</p>
                          <p className="detail-text">Payment Status: {order.paymentStatus || 'Pending'}</p>
                        </div>
                      </div>

                      <div className="detail-block">
                        <h4>Order Timeline</h4>
                        <div className="timeline">
                          {getTimelineSteps(status).map((step) => (
                            <div key={step.label} className={`timeline-step ${step.active ? 'active' : ''}`}>
                              <span className="timeline-dot"></span>
                              <span>{step.label}</span>
                            </div>
                          ))}
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
