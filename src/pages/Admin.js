import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import API_URL from '../api';
import {
  FaBoxOpen, FaClipboardList, FaPlus, FaSearch,
  FaEdit, FaTrash, FaImage
} from 'react-icons/fa';
import './Admin.css';

function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');

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
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        {product.images && product.images[0] && product.images[0] !== 'dummy.jpg' ? (
                          <img src={`${API_URL}/uploads/${product.images[0]}`} alt={product.name} className="admin-thumb" />
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
                  ))
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
                    <td colSpan="6">
                      <div className="empty-state">
                        <FaClipboardList size={28} />
                        <p>No orders yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id-cell">#{order.id?.slice(0, 8)}</td>
                      <td>{order.user_name || 'Guest'}</td>
                      <td className="price-cell">Rs. {order.total_price}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
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