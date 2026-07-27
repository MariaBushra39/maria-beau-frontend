import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Checkout.css';

function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    country: 'Pakistan',
    address: '',
    city: '',
    phone: '',
    shippingMethod: 'home_delivery',
    paymentMethod: 'cash_on_delivery', // ✅ FIXED: Default value matches ENUM
    billingSame: true,
    discount: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.address || !formData.city || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalPrice: getTotalPrice(),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            shippingMethod: formData.shippingMethod
          },
          paymentMethod: formData.paymentMethod, // ✅ Sends correct ENUM value
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-success/${data.data.orderId}`);
      } else {
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

  // ✅ DYNAMIC BUTTON TEXT (Matching ENUM values)
  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch(formData.paymentMethod) {
      case 'cash_on_delivery':
        return 'Place Order • COD';
      case 'bank_transfer':
        return 'Pay Now • JazzCash/EasyPaisa';
      case 'card':
        return 'Pay Now • Card';
      default:
        return 'Place Order';
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your Cart is Empty</h2>
        <p>Add some items before checking out.</p>
        <Link to="/" className="continue-shopping">Continue Shopping →</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* ================================================================ */}
        {/* LEFT: FORM */}
        {/* ================================================================ */}
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            {/* ===== SHIPPING INFORMATION ===== */}
            <div className="form-section">
              <h3>Shipping Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Country/Region <span className="required">*</span></label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="India">India</option>
                    <option value="UAE">UAE</option>
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address <span className="required">*</span></label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="House #123, Street 5, Lahore"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Lahore"
                  />
                </div>
                <div className="form-group">
                  <label>Phone <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+923001234567"
                  />
                </div>
              </div>
            </div>

            {/* ===== SHIPPING METHOD ===== */}
            <div className="form-section">
              <h3>Shipping Method</h3>
              <div className="shipping-options">
                <label className={`shipping-option ${formData.shippingMethod === 'home_delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="home_delivery"
                    checked={formData.shippingMethod === 'home_delivery'}
                    onChange={handleChange}
                  />
                  <div className="shipping-info">
                    <span className="shipping-name">Home Delivery</span>
                    <span className="shipping-price">{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ===== PAYMENT (UPDATED WITH CORRECT ENUM VALUES) ===== */}
            <div className="form-section">
              <h3>Payment</h3>
              <p className="section-note">All transactions are secure and encrypted.</p>

              <div className="payment-gateways">
                {/* ✅ Cash on Delivery */}
                <label className={`payment-gateway ${formData.paymentMethod === 'cash_on_delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={formData.paymentMethod === 'cash_on_delivery'}
                    onChange={handleChange}
                  />
                  <div className="gateway-content">
                    <span className="gateway-name">Cash on Delivery</span>
                    <span className="gateway-desc">Pay when you receive your order</span>
                  </div>
                </label>

                {/* ✅ Bank Transfer (JazzCash/EasyPaisa) */}
                <label className={`payment-gateway ${formData.paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                  />
                  <div className="gateway-content">
                    <span className="gateway-name">JazzCash / EasyPaisa</span>
                    <span className="gateway-desc">Pay via mobile wallet</span>
                  </div>
                </label>

                {/* ✅ Card */}
                <label className={`payment-gateway ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <div className="gateway-content">
                    <span className="gateway-name">Credit / Debit Card</span>
                    <span className="gateway-desc">Visa, Mastercard</span>
                    <div className="gateway-icons">
                      <span className="card-icon visa">VISA</span>
                      <span className="card-icon unionpay">UnionPay</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* ===== BILLING ADDRESS ===== */}
            <div className="form-section">
              <h3>Billing address</h3>
              <label className="billing-toggle">
                <input
                  type="checkbox"
                  name="billingSame"
                  checked={formData.billingSame}
                  onChange={handleChange}
                />
                <span>Same as shipping address</span>
              </label>
            </div>

            {/* ===== DISCOUNT ===== */}
            <div className="form-section discount-section">
              <div className="discount-toggle">
                <span>Add discount</span>
                <span className="discount-arrow">▼</span>
              </div>
              <div className="discount-input">
                <input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="Enter coupon code"
                />
                <button type="button" className="apply-btn">Apply</button>
              </div>
            </div>

            <button type="submit" className="pay-now-btn" disabled={loading}>
              {getButtonText()}
            </button>
          </form>
        </div>

        {/* ================================================================ */}
        {/* RIGHT: ORDER SUMMARY (WITH IMAGES) */}
        {/* ================================================================ */}
        <div className="checkout-summary">
          <div className="summary-header">
            <h3>Seller Summary</h3>
            <span className="summary-item-count">{cartItems.reduce((t, i) => t + i.quantity, 0)} items</span>
          </div>

          <div className="summary-items">
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="summary-item">
                <div className="summary-item-image">
                  {item.images && item.images[0] && item.images[0] !== 'dummy.jpg' ? (
                    <img 
                      src={`http://127.0.0.1:5000/uploads/${item.images[0]}`} 
                      alt={item.name} 
                    />
                  ) : (
                    <span>👗</span>
                  )}
                </div>
                <div className="summary-item-info">
                  <p className="summary-item-name">{item.name}</p>
                  <p className="summary-item-qty">Qty: {item.quantity}</p>
                </div>
                <div className="summary-item-total">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Total</span>
              <span className="summary-total-price">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="policy-links">
            <Link to="/refund">Refund policy</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;