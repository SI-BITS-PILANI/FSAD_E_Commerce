import React, { useState, useEffect, useCallback } from 'react';
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 12;

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState('');

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

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
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
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input-compact"
            />
            <span className="search-icon-compact">🔍</span>
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
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="">Sort By</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Rating: High to Low</option>
              </select>
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
