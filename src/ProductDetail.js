import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMinus, FaPlus, FaStar, FaRegStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ProductDetail.css';
import './ProductReviews.css';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import API_URL from './api';

// ===== SAFE IMAGE URL EXTRACTOR =====
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/600x800?text=No+Image';
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
  return 'https://placehold.co/600x800?text=Image+Error';
};

// Renders 5 stars. If interactive, clicking a star calls onSelect(n).
const StarRow = ({ rating, interactive = false, onSelect }) => {
  const rounded = Math.round(rating || 0);
  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star-icon ${interactive ? 'interactive' : ''}`}
          onClick={interactive ? () => onSelect(n) : undefined}
        >
          {n <= rounded ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </span>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  // ===== REVIEWS STATE =====
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          if (data.data.sizes && data.data.sizes.length > 0) {
            setSelectedSize(data.data.sizes[0]);
          }
          if (data.data.colors && data.data.colors.length > 0) {
            setSelectedColor(data.data.colors[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ===== FETCH REVIEWS =====
  const fetchReviews = () => {
    setReviewsLoading(true);
    fetch(`${API_URL}/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setReviews(data.data);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Thank you for your review!');
        setNewRating(0);
        setNewComment('');
        fetchReviews();
        // Refresh product so the average rating shown near the price updates too.
        fetch(`${API_URL}/api/products/${id}`)
          .then(res => res.json())
          .then(d => { if (d.success) setProduct(d.data); });
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Server error, please try again');
    } finally {
      setSubmittingReview(false);
    }
  };

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      alert('Please select a size');
      return;
    }
    console.log('🛒 Adding to cart:', { product: product.id, quantity, selectedSize, selectedColor });
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  if (loading) return <div className="loading">⏳ LOADING ...</div>;
  if (!product) return <div className="loading">❌ Product not found</div>;

  return (
    <div className="product-detail-page">
      <Link to="/" className="back-btn">← Back to Home</Link>

      <div className="product-detail-container">
        {/* LEFT: IMAGE */}
        <div className="product-detail-left">
          <img 
            src={getImageUrl(product.images)}
            alt={product.name} 
            className="main-image"
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x800?text=Image+Not+Found';
            }}
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div className="product-detail-right">
          <h1>{product.name}</h1>

          {reviews.length > 0 && (
            <div className="detail-rating-row">
              <StarRow rating={product.rating} />
              <span className="detail-rating-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          
          <div className="detail-price-section">
            {product.discount_price ? (
              <>
                <span className="detail-original">Rs. {product.price}</span>
                <span className="detail-discount-price">Rs. {product.discount_price}</span>
              </>
            ) : (
              <span className="detail-discount-price">Rs. {product.price}</span>
            )}
          </div>

          <p className="stock-status">
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>

          <p className="detail-desc">{product.description}</p>

          {/* SIZES */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="detail-option">
              <h4>Select Size</h4>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLORS */}
          {product.colors && product.colors.length > 0 && (
            <div className="detail-option">
              <h4>Select Color</h4>
              <div className="color-options">
                {product.colors.map(color => (
                  <button 
                    key={color} 
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.toLowerCase() }}
                  >
                    {selectedColor === color && '✓'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="detail-option">
            <h4>Quantity</h4>
            <div className="qty-selector">
              <button onClick={decreaseQty}><FaMinus /></button>
              <span>{quantity}</span>
              <button onClick={increaseQty}><FaPlus /></button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button 
            className="detail-cart-btn" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <div className="product-specs">
            <h4>Product Details</h4>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>SKU:</strong> MB-{product.id?.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* ===== REVIEWS SECTION ===== */}
      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews</h2>

        {reviewsLoading ? (
          <p className="empty-msg">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="empty-msg">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-card-header">
                  <span className="review-author">{review.user_name || 'Anonymous'}</span>
                  <StarRow rating={review.rating} />
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
                <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* WRITE A REVIEW */}
        <div className="write-review-block">
          <h3>Write a Review</h3>
          {user ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="review-form-stars">
                <span>Your Rating:</span>
                <StarRow rating={newRating} interactive onSelect={setNewRating} />
              </div>
              <textarea
                placeholder="Share your experience with this product (optional)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="4"
              />
              <button type="submit" className="review-submit-btn" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="review-login-prompt">
              Please <Link to="/login">log in</Link> to write a review.
            </p>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="related-products">
        <h2 className="section-title">You May Also Like</h2>
        <p className="empty-msg">More products coming soon!</p>
      </div>
    </div>
  );
}

export default ProductDetail;