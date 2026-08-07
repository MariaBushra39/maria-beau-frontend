import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import API_URL from '../api';
import './Cart.css';

// ===== SAFE IMAGE URL EXTRACTOR =====
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://via.placeholder.com/90x108?text=No+Image';
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
  return 'https://via.placeholder.com/90x108?text=Image+Error';
};

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>🛒 Your Cart is Empty</h2>
        <Link to="/">Continue Shopping →</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart ({getTotalItems()} items)</h1>
        <Link to="/" className="continue-link">← Continue Shopping</Link>
      </div>

      <div className="cart-container">
        {/* ===== CART ITEMS ===== */}
        <div className="cart-items">
          <div className="cart-items-count">{getTotalItems()} items</div>
          {cartItems.map((item) => (
            <div key={item.id + item.size + item.color} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={getImageUrl(item.images)}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/90x108?text=Image+Error';
                  }}
                />
              </div>
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <div className="item-attrs">
                  <span className="item-attr">Size: {item.size}</span>
                  <span className="item-attr">Color: {item.color}</span>
                </div>
                <div className="item-price">Rs. {item.discount_price || item.price}</div>
              </div>
              <div className="cart-item-actions">
                <div className="qty-selector">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}>+</button>
                </div>
                <span className="cart-item-total">Rs. {(item.discount_price || item.price) * item.quantity}</span>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id, item.size, item.color)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ===== ORDER SUMMARY ===== */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="shipping-progress">
            <p>Free shipping on orders above Rs. 3,000</p>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((getTotalPrice() / 3000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {getTotalPrice()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{getTotalPrice() >= 3000 ? 'FREE' : 'Rs. 200'}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>Rs. {getTotalPrice() + (getTotalPrice() >= 3000 ? 0 : 200)}</span>
          </div>
          <Link to="/checkout" className="checkout-btn">Proceed to Checkout →</Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;