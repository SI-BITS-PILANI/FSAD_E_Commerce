import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, getCartItemQuantity } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleViewDetails = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cartQuantity = getCartItemQuantity(product.id);
    if (cartQuantity >= product.stock) {
      return; // Can't add more than available stock
    }
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;

    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }
    
    // Render partial star if there's a decimal
    if (decimal > 0) {
      const percentage = Math.round(decimal * 100);
      stars.push(
        <span key="partial" className="star partial" style={{ '--fill-percentage': `${percentage}%` }}>
          ★
        </span>
      );
    }
    
    // Render empty stars
    const remainingStars = 5 - fullStars - (decimal > 0 ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">☆</span>);
    }
    
    return stars;
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-wrapper">
        <img 
          src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} 
          alt={product.name}
          className="product-image"
        />
        {isOutOfStock && (
          <div className="stock-badge out-of-stock-badge">Out of Stock</div>
        )}
        {!isOutOfStock && product.stock < 10 && (
          <div className="stock-badge low-stock-badge">Only {product.stock} left</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {renderStars(product.rating || 0)}
          <span className="rating-value">({Number(product.rating || 0).toFixed(1)})</span>
        </div>
        <div className="product-price">₹{Number(product.price || 0).toFixed(2)}</div>
        <div className="product-card-actions">
          <button 
            className="btn-view-details"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          <button 
            className={`btn-add-to-cart-small ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {addedToCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
