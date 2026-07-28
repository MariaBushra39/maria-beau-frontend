import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMinus, FaPlus } from 'react-icons/fa';
import './ProductDetail.css';
import { useCart } from './context/CartContext';

// ===== API URL =====
import API_URL from './api';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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
        {/* LEFT: IMAGE - Smart URL handling */}
        <div className="product-detail-left">
          <img 
            src={product.images && product.images[0] && product.images[0] !== 'dummy.jpg'
              ? (product.images[0].startsWith('http') 
                  ? product.images[0] 
                  : `${API_URL}/uploads/${product.images[0]}`)
              : 'https://via.placeholder.com/600x800?text=No+Image'} 
            alt={product.name} 
            className="main-image"
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div className="product-detail-right">
          <h1>{product.name}</h1>
          
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
            {product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
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

      {/* RELATED PRODUCTS */}
      <div className="related-products">
        <h2 className="section-title">You May Also Like</h2>
        <p className="empty-msg">More products coming soon!</p>
      </div>
    </div>
  );
}

export default ProductDetail;