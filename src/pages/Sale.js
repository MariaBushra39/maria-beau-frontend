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

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const saleProducts = data.data.filter(p => p.discount_price && p.discount_price < p.price);
          setProducts(saleProducts);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Quick "Add to Cart" from the product card icon (defaults to first
  // available size/color, same behavior as homepage/category pages).
  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('This product is sold out.');
      return;
    }
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
    <Page title="Sale" wide>
      <p>Grab the best deals on our premium collection.</p>
      <div className="product-grid" style={{ marginTop: '20px' }}>
        {products.length === 0 ? (
          <p className="empty-msg">No sale products available right now.</p>
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
                {product.stock === 0 ? (
                  <span className="sale-badge sold-out-badge">SOLD OUT</span>
                ) : product.discount_price && (
                  <span className="sale-badge">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                )}
                <button
                  className={`quick-add-btn ${product.stock === 0 ? 'disabled' : ''}`}
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

export default Sale;