import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../api'; // ✅ Added
import './Profile.css';

// Orders in these statuses can still be cancelled by the customer themselves.
const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [cancellingId, setCancellingId] = useState(null); // ✅ NEW

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders`, { // ✅ Using API_URL
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ NEW: cancel an order from the customer's side
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return;
    setCancellingId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order cancelled.');
        fetchOrders();
      } else {
        toast.error(data.message || 'Could not cancel this order.');
      }
    } catch (error) {
      toast.error('Server error. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <div className="loading">⏳ LOADING ...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>
      </div>

      <div className="profile-tabs">
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          🛍️ My Orders
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          👤 Profile
        </button>
      </div>

      {/* ================================================================ */}
      {/* ORDERS TAB */}
      {/* ================================================================ */}
      {activeTab === 'orders' && (
        <div className="profile-orders">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>You haven't placed any orders yet.</p>
              <Link to="/" className="continue-shopping">Start Shopping →</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => {
                const canCancel = CANCELLABLE_STATUSES.includes(order.status);
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-id">Order #{order.id?.slice(0, 8)}</span>
                        <span className={`order-status ${order.status}`}>{order.status}</span>
                      </div>
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="order-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span className="order-item-name">{item.product_name || 'Product'}</span>
                          <span className="order-item-qty">x{item.quantity}</span>
                          <span className="order-item-price">Rs. {item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span className="order-total">Total: Rs. {order.total_price}</span>
                      <span className="order-payment">{order.payment_method?.replace(/_/g, ' ')}</span>
                    </div>
                    {/* ✅ NEW: cancel button — only shown while the order is still cancellable */}
                    {canCancel && (
                      <div style={{ marginTop: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          style={{
                            background: 'transparent',
                            border: '1px solid #c0392b',
                            color: '#c0392b',
                            padding: '8px 18px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: cancellingId === order.id ? 'not-allowed' : 'pointer',
                            opacity: cancellingId === order.id ? 0.6 : 1
                          }}
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* PROFILE TAB */}
      {/* ================================================================ */}
      {activeTab === 'profile' && (
        <div className="profile-info">
          <div className="profile-card">
            <div className="profile-avatar">👤</div>
            <div className="profile-details">
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'user'}</p>
              <p><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString() || 'N/A'}</p>
            </div>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;