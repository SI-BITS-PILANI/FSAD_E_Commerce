import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AppHeader.css';

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems, toggleCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const shouldRender = isAuthenticated && !isAuthPage;
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (!shouldRender) {
      return undefined;
    }

    return () => {
      // Cleanup if needed
    };
  }, [shouldRender]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!shouldRender) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shouldRender]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  if (!shouldRender) {
    return null;
  }

  const handleLogout = () => {
    logout(false);
    navigate('/login');
  };

  return (
    <header className="dashboard-header" role="banner">
      <div className="header-content">
        <Link to="/dashboard" className="header-home" aria-label="Go to home">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h1 className="dashboard-title">Linux MarketPlace</h1>
        </Link>

        <div className="user-section">
          <button
            type="button"
            className="cart-button"
            onClick={toggleCart}
            aria-label={`Shopping cart with ${cartItemCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </button>

          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className="user-menu-trigger"
              onClick={toggleMenu}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <div className="user-avatar">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{user?.name || 'User'}</span>
              <span className="user-menu-caret" aria-hidden="true">▾</span>
            </button>

            {isMenuOpen && (
              <div className="user-menu-dropdown" role="menu" aria-label="User menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="dropdown-user-info">
                    <div className="dropdown-user-name">{user?.name || 'User'}</div>
                    <div className="dropdown-user-email">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link
                  to="/dashboard"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Browse Products
                </Link>
                <Link
                  to="/orders"
                  className="user-menu-item"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                  My Orders
                </Link>
                <div className="dropdown-divider"></div>
                <button
                  type="button"
                  className="user-menu-item user-menu-item-danger"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  role="menuitem"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
