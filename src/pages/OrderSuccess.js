import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderSuccess.css';

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="order-success">
      <div className="success-container">
        <div className="success-tick-wrap">
          <svg className="success-tick-svg" viewBox="0 0 100 100">
            <circle className="success-tick-circle" cx="50" cy="50" r="45" />
            <path className="success-tick-check" d="M27 50 L43 66 L73 34" />
          </svg>
        </div>

        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for shopping with MariaBeau. Your order has been received successfully
          and is now being processed. We will contact you soon with further updates.
        </p>

        {orderId && (
          <div className="success-order-id">
            Order ID: <span>#{orderId.slice(0, 8)}</span>
          </div>
        )}

        <div className="success-actions">
          <Link to="/">
            <button className="continue-btn">Continue Shopping</button>
          </Link>
          <Link to="/track-order">
            <button className="track-btn">Track Order</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;