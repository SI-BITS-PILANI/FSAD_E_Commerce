import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AppHeader.css';

const AppHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenuTimeoutRef = useRef(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isActive = (path) => location.pathname === path;
  const shouldRender = isAuthenticated && !isAuthPage;

  useEffect(() => {
    if (!shouldRender) {
      return undefined;
    }

    return () => {
      if (closeMenuTimeoutRef.current) {
        clearTimeout(closeMenuTimeoutRef.current);
      }
    };
  }, [shouldRender]);

  const openMenu = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
    setIsMenuOpen(true);
  };

  const closeMenuWithDelay = (delayMs = 150) => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
    }
    closeMenuTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, delayMs);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    openMenu();
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
          <h1 className="dashboard-title">Linux FSAD ecommerce</h1>
        </Link>

        <div className="user-section">
          <nav className="header-nav" aria-label="Primary">
            <Link
              to="/orders"
              className={`header-link ${isActive('/orders') ? 'active' : ''}`}
            >
              Orders
            </Link>
          </nav>

          <div
            className="user-menu"
            ref={menuRef}
            onMouseEnter={openMenu}
            onMouseLeave={() => closeMenuWithDelay(150)}
          >
            <button
              type="button"
              className="user-menu-trigger"
              onClick={toggleMenu}
              onFocus={openMenu}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              Welcome, {user?.name || 'User'}
              <span className="user-menu-caret" aria-hidden="true">▾</span>
            </button>

            {isMenuOpen && (
              <div className="user-menu-dropdown" role="menu" aria-label="User menu">
                <Link
                  to="/orders"
                  className="user-menu-item"
                  role="menuitem"
                >
                  My Orders
                </Link>
              </div>
            )}
          </div>
          <button type="button" onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
