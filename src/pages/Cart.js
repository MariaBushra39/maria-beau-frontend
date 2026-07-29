import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_URL from '../api';
import './Cart.css';

const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/100x100?text=No+Image';
  }
  const img = images[0];
  if (typeof img === 'string' && img.startsWith('http')) return img;
  if (typeof img === 'string') return `${API_URL}/uploads/${img}`;
  if (Array.isArray(img) && img.length > 0) {
    const first = img[0];
    if (typeof first === 'string' && first.startsWith('http')) return first;
    if (typeof first === 'string') return `${API_URL}/uploads/${first}`;
  }
  return 'https://placehold.co/100x100?text=Image+Error';
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
      <h2>Shopping Cart ({getTotalItems()} items)</h2>
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id + item.size + item.color} className="cart-item">
            <img 
              src={getImageUrl(item.images)} 
              alt={item.name} 
              className="cart-item-img"
              onError={(e) => {
                e.target.src = 'https://placehold.co/100x100?text=Image+Not+Found';
              }}
            />
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p>Size: {item.size} | Color: {item.color}</p>
              <div className="cart-qty">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}>+</button>
              </div>
              <p>Price: Rs. {item.discount_price || item.price}</p>
            </div>
            <button className="remove-btn" onClick={() => removeFromCart(item.id, item.size, item.color)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: Rs. {getTotalPrice()}</h3>
        <Link to="/checkout">
          <button className="checkout-btn">Proceed to Checkout</button>
        </Link>
      </div>
    </div>
  );
}

export default Cart;