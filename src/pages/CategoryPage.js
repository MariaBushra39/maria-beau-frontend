import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

// A product counts as "NEW" if it was added within the last 14 days.
// Only shown when the product has no discount (discount badge takes priority).
// Same rule used on the homepage, kept consistent across the site.
const isNewProduct = (createdAt) => {
  if (!createdAt) return false;
  const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 14;
};

function CategoryPage() {
  const params = useParams();
  console.log('📌 Raw Params:', params);

  let { category, subcategory } = params;
  
  if (!category) {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const possibleCategory = parts[0];
      if (['women', 'men', 'kids'].includes(possibleCategory.toLowerCase())) {
        category = possibleCategory;
      }
      if (parts.length > 1) {
        subcategory = parts[1];
      }
    }
  }

  console.log('🔍 Final Category:', category);
  console.log('🔍 Final Subcategory:', subcategory);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const formatDisplay = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayCategory = subcategory 
    ? `${category?.charAt(0).toUpperCase() + category?.slice(1)} - ${formatDisplay(subcategory)}` 
    : (category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        
        if (data.success) {
          const categoryLower = category?.toLowerCase().trim() || '';
          const subcategoryLower = subcategory?.toLowerCase().replace(/-/g, ' ').trim() || '';

          console.log('🔍 Searching Category:', categoryLower);
          console.log('🔍 Searching Subcategory:', subcategoryLower);

          const filtered = data.data.filter(p => {
            const pCategory = (p.category || '').toLowerCase().trim();
            
            if (pCategory !== categoryLower) return false;

            if (subcategoryLower) {
              const pSubcategory = (p.subcategory || '').toLowerCase().trim();
              return pSubcategory === subcategoryLower;
            }

            return true;
          });

          console.log('✅ Filtered Products:', filtered.length);
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  // Quick "Add to Cart" from the product card icon (no size/color picker here,
  // so we default to the first available size/color — same as homepage).
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

  if (loading) {
    return <div className="loading">⏳ LOADING ...</div>;
  }

  return (
    <Page title={displayCategory} wide>
      <p>Explore our premium collection of {displayCategory.toLowerCase()} fashion.</p>
      {products.length === 0 ? (
        <p className="empty-msg">No products found in this category.</p>
      ) : (
        <div className="product-grid" style={{ marginTop: '20px' }}>
          {products.map(product => (
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
                ) : product.discount_price ? (
                  <span className="sale-badge">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                ) : isNewProduct(product.created_at) ? (
                  <span className="sale-badge new-badge">NEW</span>
                ) : null}
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
          ))}
        </div>
      )}
    </Page>
  );
}

export default CategoryPage;