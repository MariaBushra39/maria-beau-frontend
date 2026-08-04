import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import Page from './Page';
import API_URL from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// ===== SAFE IMAGE URL EXTRACTOR =====
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/300x400?text=No+Image';
  }
  const img = images[0];
  if (typeof img === 'string' && img.startsWith('http')) {
    return img;
  }
  if (typeof img === 'string') {
    return `${API_URL}/uploads/${img}`;
  }
  if (Array.isArray(img) && img.length > 0) {
    const first = img[0];
    if (typeof first === 'string' && first.startsWith('http')) {
      return first;
    }
    if (typeof first === 'string') {
      return `${API_URL}/uploads/${first}`;
    }
  }
  return 'https://placehold.co/300x400?text=Image+Error';
};

// Same "NEW" rule used on the homepage and category pages, kept consistent.
const isNewProduct = (createdAt) => {
  if (!createdAt) return false;
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 14;
};

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sorted = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setProducts(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
    addToCart(product, 1, defaultSize, defaultColor);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    const wasInWishlist = isInWishlist(product.id);
    toggleWishlist(product);
    toast.success(wasInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);
  };

  if (loading) return <div className="loading">LOADING ...</div>;

  return (
    <Page title="New Arrivals" wide>
      <p>Discover the latest additions to our collection.</p>
      <div className="product-grid" style={{ marginTop: '20px' }}>
        {products.length === 0 ? (
          <p className="empty-msg">No new arrivals yet.</p>
        ) : (
          products.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image-wrapper">
                <img 
                  src={getImageUrl(product.images)}
                  alt={product.name} 
                  className="product-img" 
                  loading="lazy"
                  decoding="async"
                  style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
                  onLoad={(e) => { e.target.style.opacity = 1; }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x400?text=Image+Not+Found';
                    e.target.style.opacity = 1;
                  }}
                />
                {product.discount_price ? (
                  <span className="sale-badge">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                ) : isNewProduct(product.created_at) ? (
                  <span className="sale-badge new-badge">NEW</span>
                ) : null}
                <button
                  className="quick-add-btn"
                  onClick={(e) => handleQuickAdd(e, product)}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <FaShoppingCart />
                </button>
                <button
                  className={`wishlist-toggle-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                  onClick={(e) => handleWishlistToggle(e, product)}
                  aria-label={`Toggle ${product.name} in wishlist`}
                >
                  {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
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
            </div>
          ))
        )}
      </div>
    </Page>
  );
}

export default NewArrivals;