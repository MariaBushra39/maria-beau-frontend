import React from 'react';
import { Link } from 'react-router-dom';
import './OrderSuccess.css';

function OrderSuccess() {
  return (
    <div className="order-success">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
        <Link to="/">
          <button className="continue-btn">Continue Shopping</button>
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;