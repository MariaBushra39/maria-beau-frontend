import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './OrderSuccess.css';

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="order-success">
      <div className="success-card">
        <div className="success-icon"></div>
        <h1>Order Placed Successfully! </h1>
        <p>Thank you for shopping with <strong>MariaBeau</strong></p>
        <p className="order-id">Order ID: <span>{orderId}</span></p>
        <p className="order-message">
          We'll send you a confirmation email with your order details.
        </p>
        <div className="success-actions">
          <Link to="/" className="continue-btn">Continue Shopping</Link>
          <Link to="/profile/orders" className="orders-btn">View Orders</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;