import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../api';
import './Checkout.css';

// ===== SAFE IMAGE URL EXTRACTOR =====
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/60x60?text=No+Image';
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
  return 'https://placehold.co/60x60?text=Image+Error';
};

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
    paymentMethod: 'cash_on_delivery',
    billingSame: true,
    discount: ''
  });

  // ✅ NEW: Separate billing address fields (only used when billingSame is false)
  const [billingData, setBillingData] = useState({
    address: '',
    city: '',
    country: 'Pakistan'
  });

  const [loading, setLoading] = useState(false);

  // ✅ NEW: Coupon state
  const [couponStatus, setCouponStatus] = useState('idle'); // idle | checking | applied | invalid
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, type, value }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ✅ NEW: Billing field change handler
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ NEW: Apply coupon
  const handleApplyCoupon = async () => {
    const code = formData.discount.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }
    setCouponStatus('checking');
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({ code: code.toUpperCase(), ...data.data });
        setCouponStatus('applied');
        toast.success('Coupon applied!');
      } else {
        setAppliedCoupon(null);
        setCouponStatus('invalid');
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      setAppliedCoupon(null);
      setCouponStatus('invalid');
      toast.error('Could not validate coupon. Please try again.');
    }
  };

  // ✅ NEW: Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus('idle');
    setFormData(prev => ({ ...prev, discount: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Required fields validation (including Last Name)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.phone) {
      toast.error('Please fill in all required fields (including email)');
      return;
    }

    // ✅ Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // ✅ NEW: Billing address validation (only if different from shipping)
    if (!formData.billingSame) {
      if (!billingData.address || !billingData.city) {
        toast.error('Please fill in your billing address');
        return;
      }
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // ✅ Calculate final total including shipping and discount
    const subtotal = getTotalPrice();
    const shipping = subtotal >= 3000 ? 0 : 200;
    const discountAmount = getDiscountAmount();
    const total = Math.max(subtotal - discountAmount, 0) + shipping;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          totalPrice: total, // sent but backend ignores it (recalculates from DB)
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
          // ✅ NEW: billing address (only sent when different from shipping)
          billingAddress: formData.billingSame
            ? null
            : {
                address: billingData.address,
                city: billingData.city,
                country: billingData.country
              },
          paymentMethod: formData.paymentMethod,
          couponCode: appliedCoupon ? appliedCoupon.code : null, // ✅ NEW
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Order placed successfully! Confirmation email sent.');
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

  // ✅ NEW: Compute discount amount from applied coupon
  function getDiscountAmount() {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percent') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    if (appliedCoupon.type === 'flat') {
      return Math.min(appliedCoupon.value, subtotal);
    }
    return 0;
  }

  const discountAmount = getDiscountAmount();
  const total = Math.max(subtotal - discountAmount, 0) + shipping;

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (formData.paymentMethod) {
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
        {/* LEFT: FORM */}
        <div className="checkout-form">
          {!user && (
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Link to="/login" state={{ from: '/checkout' }} style={{ fontSize: '14px', color: '#1a1a1a' }}>
                Already have an account? <strong>Login for faster checkout</strong>
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Shipping Information</h3>
              {!user && (
                <p className="section-note" style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                  🛒 Guest Checkout — No account needed. Enter your details below.
                </p>
              )}

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
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
                <small style={{ color: '#888', fontSize: '12px' }}>
                  We'll send your order confirmation and tracking updates to this email.
                </small>
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

            {/* SHIPPING METHOD */}
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

            {/* PAYMENT */}
            <div className="form-section">
              <h3>Payment</h3>
              <p className="section-note">All transactions are secure and encrypted.</p>
              <div className="payment-gateways">
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

            {/* BILLING */}
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

              {/* ✅ NEW: Billing address fields (shown only when different from shipping) */}
              {!formData.billingSame && (
                <div style={{ marginTop: '12px' }}>
                  <div className="form-group">
                    <label>Billing Address <span className="required">*</span></label>
                    <input
                      type="text"
                      name="address"
                      value={billingData.address}
                      onChange={handleBillingChange}
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
                        value={billingData.city}
                        onChange={handleBillingChange}
                        required
                        placeholder="Lahore"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <select
                        name="country"
                        value={billingData.country}
                        onChange={handleBillingChange}
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
                </div>
              )}
            </div>

            {/* DISCOUNT */}
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
                  disabled={couponStatus === 'applied'}
                />
                {/* ✅ NEW: Apply / Remove coupon logic wired up */}
                {couponStatus === 'applied' ? (
                  <button type="button" className="apply-btn" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === 'checking'}
                  >
                    {couponStatus === 'checking' ? 'Checking...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponStatus === 'applied' && appliedCoupon && (
                <p style={{ color: '#1a7a4c', fontSize: '13px', marginTop: '6px' }}>
                  ✓ "{appliedCoupon.code}" applied
                </p>
              )}
            </div>

            <button type="submit" className="pay-now-btn" disabled={loading}>
              {getButtonText()}
            </button>
          </form>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="checkout-summary">
          <div className="summary-header">
            <h3>Seller Summary</h3>
            <span className="summary-item-count">{cartItems.reduce((t, i) => t + i.quantity, 0)} items</span>
          </div>

          <div className="summary-items">
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="summary-item">
                <div className="summary-item-image">
                  <img
                    src={getImageUrl(item.images)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/60x60?text=Image+Error';
                    }}
                  />
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
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            {/* ✅ NEW: Discount line, only shown when a coupon is applied */}
            {appliedCoupon && (
              <div className="summary-row">
                <span>Discount ({appliedCoupon.code})</span>
                <span>- Rs. {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
            </div>
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