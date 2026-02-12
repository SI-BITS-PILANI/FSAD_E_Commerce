import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12;

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Ref for dropdown
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getCategories();
        if (response.data.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };

    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortDropdownOpen]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        category: category,
        sort: sortBy
      };

      const response = await productAPI.getProducts(params);
      
      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalProducts(response.data.pagination?.total || 0);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, category, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleCustomSortChange = (value) => {
    setSortBy(value);
    setSortDropdownOpen(false);
    setCurrentPage(1);
  };

  const getSortLabel = () => {
    const sortOptions = {
      '': 'Sort By',
      'price_asc': 'Price: Low to High',
      'price_desc': 'Price: High to Low',
      'name': 'Name: A to Z',
      'rating': 'Rating: High to Low'
    };
    return sortOptions[sortBy] || 'Sort By';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key="first" onClick={() => handlePageChange(1)} className="pagination-btn">
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" className="pagination-dots">...</span>);
      }
      pages.push(
        <button key="last" onClick={() => handlePageChange(totalPages)} className="pagination-btn">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="dashboard-container">
      <div className="categories-bar">
        <div className="categories-container">
          <div className="categories-list">
            <button
              className={`category-item ${category === '' ? 'active' : ''}`}
              onClick={() => handleCategoryChange({ target: { value: '' } })}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-item ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange({ target: { value: cat } })}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="search-wrapper-compact">
            <svg className="search-icon-compact" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input-compact"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProducts} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      <div className="products-section">
        {loading ? (
          <div className="product-grid">
            <ProductSkeleton count={12} />
          </div>
        ) : products.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="products-info">
              <p>Showing {products.length} of {totalProducts} products</p>
              <div className="custom-sort-dropdown" ref={sortDropdownRef}>
                <button
                  className="sort-select-button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <span>{getSortLabel()}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {sortDropdownOpen && (
                  <div className="sort-dropdown-menu">
                    <button
                      className={`sort-option ${sortBy === '' ? 'active' : ''}`}
                      onClick={() => handleCustomSortChange('')}
                    >
                      <span>Sort By</span>
                    </button>
                    <button
                      className={`sort-option ${sortBy === 'price_asc' ? 'active' : ''}`}
                      onClick={() => handleCustomSortChange('price_asc')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                      <span>Price: Low to High</span>
                    </button>
                    <button
                      className={`sort-option ${sortBy === 'price_desc' ? 'active' : ''}`}
                      onClick={() => handleCustomSortChange('price_desc')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                      </svg>
                      <span>Price: High to Low</span>
                    </button>
                    <button
                      className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
                      onClick={() => handleCustomSortChange('name')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                      </svg>
                      <span>Name: A to Z</span>
                    </button>
                    <button
                      className={`sort-option ${sortBy === 'rating' ? 'active' : ''}`}
                      onClick={() => handleCustomSortChange('rating')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span>Rating: High to Low</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ‹ Previous
          </button>
          {renderPagination()}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
