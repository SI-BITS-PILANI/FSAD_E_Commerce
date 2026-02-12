import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCart, getCartItemQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProductDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productAPI.getProductById(id);
      if (response.data.success && response.data.product) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    const cartQuantity = getCartItemQuantity(parseInt(id));
    const maxAvailable = product ? product.stock - cartQuantity : 10;
    const newQuantity = Math.max(1, Math.min(maxAvailable, value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartQuantity = getCartItemQuantity(product.id);
    const availableToAdd = product.stock - cartQuantity;
    
    if (quantity > availableToAdd) {
      alert(`Only ${availableToAdd} more can be added to cart`);
      return;
    }
    
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    openCart();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">☆</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-loading">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="product-detail-error">
          <h2>Error</h2>
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const images = product.images || [product.image] || ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate('/dashboard')} className="btn-back-link">
        ‹ Back to Products
      </button>

      <div className="product-detail-content">
        <div className="product-gallery">
          <div className="main-image">
            <img src={images[selectedImage]} alt={product.name} />
            {isOutOfStock && (
              <div className="out-of-stock-overlay">Out of Stock</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating-section">
            <div className="rating-stars">
              {renderStars(product.rating || 0)}
            </div>
            <span className="rating-text">
              {Number(product.rating || 0).toFixed(1)} ({product.reviews || 0} reviews)
            </span>
          </div>

          <div className="product-price-section">
            <span className="price">${Number(product.price || 0).toFixed(2)}</span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <>
                <span className="original-price">${Number(product.originalPrice).toFixed(2)}</span>
                <span className="discount">
                  {Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="stock-info">
            {isOutOfStock ? (
              <span className="stock-status out">Out of Stock</span>
            ) : product.stock < 10 ? (
              <span className="stock-status low">Only {product.stock} left in stock</span>
            ) : (
              <span className="stock-status in">In Stock</span>
            )}
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.specifications && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <ul>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.category && (
            <div className="product-category">
              <strong>Category:</strong> {product.category}
            </div>
          )}

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={isOutOfStock || quantity <= 1}
                  className="quantity-btn"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isOutOfStock}
                  className="quantity-input"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isOutOfStock || quantity >= 10}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`btn-add-to-cart ${addedToCart ? 'added' : ''}`}
              >
                {isOutOfStock ? 'Out of Stock' : addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn-buy-now"
              >
                {isOutOfStock ? 'Unavailable' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {product.relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="related-product-card"
                onClick={() => navigate(`/products/${relatedProduct.id}`)}
              >
                <img src={relatedProduct.image} alt={relatedProduct.name} />
                <h4>{relatedProduct.name}</h4>
                <p className="related-price">${Number(relatedProduct.price || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
