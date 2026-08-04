import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import API_URL from '../api';

// Same safe image URL extractor used on the homepage, kept local to this
// page so it doesn't depend on App.js internals.
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/300x400?text=No+Image';
  }
  const img = images[0];
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${API_URL}/uploads/${img}`;
  return 'https://placehold.co/300x400?text=Image+Error';
};

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
    addToCart(product, 1, defaultSize, defaultColor);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.info(`${product.name} removed from wishlist`);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1><FaHeart /> My Wishlist</h1>
        <Link to="/" className="back-link"><FaArrowLeft /> Continue Shopping</Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <FaHeart size={40} />
          <p>Your wishlist is empty.</p>
          <Link to="/" className="hero-btn" style={{ display: 'inline-block', marginTop: '16px', color: '#1a1a1a' }}>
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="product-grid wishlist-grid">
          {wishlistItems.map((product) => (
            <div key={product.id} className="product-card wishlist-card">
              <Link to={`/product/${product.id}`} className="wishlist-image-link">
                <div className="product-image-wrapper">
                  <img
                    src={getImageUrl(product.images)}
                    alt={product.name}
                    className="product-img"
                    loading="lazy"
                  />
                </div>
              </Link>
              <h3 className="product-name">{product.name}</h3>
              <div className="price-wrapper">
                {product.discount_price ? (
                  <>
                    <span className="original-price">Rs. {product.price}</span>
                    <span className="discount-price">Rs. {product.discount_price}</span>
                  </>
                ) : (
                  <span className="discount-price">Rs. {product.price}</span>
                )}
              </div>
              <div className="wishlist-actions">
                <button className="wishlist-add-cart-btn" onClick={() => handleMoveToCart(product)}>
                  <FaShoppingCart /> Add to Cart
                </button>
                <button className="wishlist-remove-btn" onClick={() => handleRemove(product)} aria-label="Remove from wishlist">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;