import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../api';
import {
  FaBoxOpen, FaClipboardList, FaPlus, FaSearch,
  FaEdit, FaTrash, FaImage, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import './Admin.css';

// If the image is already a full URL (e.g. Cloudinary), use it as-is.
// Otherwise, treat it as a filename served from our own backend.
const getImageSrc = (filename) => {
  if (!filename || typeof filename !== 'string') return null;
  if (filename.startsWith('http')) return filename;
  return `${API_URL}/uploads/${filename}`;
};

function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null); // ✅ NEW

  // ===== FETCH PRODUCTS =====
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // ===== FETCH ORDERS =====
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchOrders();
      setLoading(false);
    };
    loadData();
  }, []);

  // ===== DELETE PRODUCT =====
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Product deleted!');
        fetchProducts();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  // ===== UPDATE ORDER STATUS =====
  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Order status updated!');
        fetchOrders();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  // ✅ NEW: expand/collapse an order row to show its products
  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) return <div className="loading">⏳ LOADING ...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name || 'Admin'} — here's what's happening with MariaBeau today.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-icon products-icon"><FaBoxOpen /></span>
          <div>
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon orders-icon"><FaClipboardList /></span>
          <div>
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon pending-icon"><FaClipboardList /></span>
          <div>
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          <FaBoxOpen /> Products
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          <FaClipboardList /> Orders
        </button>
      </div>

      {/* ===== PRODUCTS TAB ===== */}
      {activeTab === 'products' && (
        <div className="admin-products">
          <div className="admin-toolbar">
            <div className="admin-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/admin/add-product" className="add-product-btn">
              <FaPlus /> Add New Product
            </Link>
          </div>

          <div className="product-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <FaBoxOpen size={28} />
                        <p>{searchTerm ? 'No products match your search.' : 'No products yet. Add your first one!'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const thumbSrc = product.images && product.images[0] && product.images[0] !== 'dummy.jpg'
                      ? getImageSrc(product.images[0])
                      : null;
                    return (
                      <tr key={product.id}>
                        <td>
                          {thumbSrc ? (
                            <img src={thumbSrc} alt={product.name} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb-placeholder"><FaImage /></div>
                          )}
                        </td>
                        <td className="product-name-cell">{product.name}</td>
                        <td className="price-cell">Rs. {product.price}</td>
                        <td><span className="category-pill">{product.category}</span></td>
                        <td>
                          <span className={`stock-badge ${product.stock <= 5 ? 'low' : ''}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <Link to={`/admin/edit-product/${product.id}`} className="edit-btn"><FaEdit /> Edit</Link>
                          <button className="delete-btn" onClick={() => deleteProduct(product.id)}><FaTrash /> Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ORDERS TAB ===== */}
      {activeTab === 'orders' && (
        <div className="admin-orders">
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <FaClipboardList size={28} />
                        <p>No orders yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => {
                    const isExpanded = expandedOrderId === order.id;
                    const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          onClick={() => toggleOrderExpand(order.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ color: '#B5762E', textAlign: 'center' }}>
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </td>
                          <td className="order-id-cell">#{order.id?.slice(0, 8)}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{order.user_name || 'Guest'}</div>
                            {/* ✅ NEW: customer email shown under their name */}
                            {order.user_email && (
                              <div style={{ fontSize: '12px', color: '#888' }}>{order.user_email}</div>
                            )}
                          </td>
                          <td className="price-cell">Rs. {order.total_price}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="status-select"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                        {/* ✅ NEW: expanded row — list of products ordered */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" style={{ background: '#faf7f2', padding: '16px 20px' }}>
                              {itemCount === 0 ? (
                                <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>No product details available.</p>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ textAlign: 'left', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Product</th>
                                      <th style={{ textAlign: 'center', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Qty</th>
                                      <th style={{ textAlign: 'right', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Price</th>
                                      <th style={{ textAlign: 'right', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={idx} style={{ borderTop: '1px solid #e8dcc4' }}>
                                        <td style={{ padding: '8px 0', fontSize: '14px' }}>{item.name}</td>
                                        <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'right' }}>Rs. {item.price}</td>
                                        <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>
                                          Rs. {(item.price * item.quantity).toFixed(2)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;