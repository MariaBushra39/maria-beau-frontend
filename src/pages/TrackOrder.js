import React, { useState } from 'react';
import Page from './Page';
import API_URL from '../api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './TrackOrder.css';

// The customer-facing status steps, in order. "cancelled" is handled
// separately below since it's not part of the normal forward flow.
const STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
];

function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both your Order ID and email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim().replace(/^#/, ''), email: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || 'Order not found. Please check your order number.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? STEPS.findIndex(s => s.key === order.status) : -1;

  return (
    <Page title="Track Your Order" wide>
      <p className="track-intro">
        Enter your Order ID and the email you used at checkout to see the latest status of your order.
      </p>

      <form className="track-form" onSubmit={handleSubmit}>
        <div className="track-form-row">
          <input
            type="text"
            placeholder="Order ID (e.g. a1b2c3d4)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email used at checkout"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Track Order'}
          </button>
        </div>
      </form>

      {error && <p className="track-error">{error}</p>}

      {order && (
        <div className="track-result">
          <h3>Order #{order.id.slice(0, 8)}</h3>
          <p className="track-meta">
            Placed on {new Date(order.created_at).toLocaleDateString()} · Rs. {order.total_price}
          </p>

          {order.status === 'cancelled' ? (
            <div className="track-cancelled">
              <FaTimesCircle />
              <span>This order has been cancelled.</span>
            </div>
          ) : (
            <div className="track-timeline">
              {STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div
                    key={step.key}
                    className={`track-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="track-step-dot">
                      {isDone ? <FaCheckCircle /> : <span className="track-step-empty-dot"></span>}
                    </div>
                    <span className="track-step-label">{step.label}</span>
                    {index < STEPS.length - 1 && <div className={`track-step-line ${isDone ? 'done' : ''}`}></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="track-help">
        <strong>Need Help?</strong> If you haven't received your tracking details or have any
        questions about your order, please contact our customer support team. We'll be happy to assist you.
      </div>
    </Page>
  );
}

export default TrackOrder;