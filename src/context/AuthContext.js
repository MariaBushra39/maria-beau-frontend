import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../api'; // ✅ Added
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, getTotalItems, getTotalPrice, createOrder } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to checkout');
      return;
    }
    const orderData = {
      userId: user.id,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.discount_price || item.price
      })),
      total: getTotalPrice()
    };
    const result = await createOrder(orderData);
    if (result?.success) {
      alert('Order placed successfully!');
    } else {
      alert('Failed to place order');
    }
  };

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
              src={item.images?.[0] ? `${API_URL}/uploads/${item.images[0]}` : 'https://via.placeholder.com/80'} 
              alt={item.name} 
            />
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p>Size: {item.size} | Color: {item.color}</p>
              <p>Qty: {item.quantity}</p>
              <p>Price: Rs. {(item.discount_price || item.price) * item.quantity}</p>
            </div>
            <button onClick={() => removeFromCart(item.id, item.size, item.color)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: Rs. {getTotalPrice()}</h3>
        <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>
    </div>
  );
}

export default Cart;