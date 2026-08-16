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

// ✅ NEW: safely extract a thumbnail URL from an order item's images array
const getItemThumb = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) return null;
  const img = images[0];
  if (typeof img === 'string') return getImageSrc(img);
  return null;
};

// ✅ NEW: simple Previous/Next pagination control, reused for Products and Orders
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
          background: currentPage === 1 ? '#f5f5f5' : '#fff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px'
        }}
      >
        ← Previous
      </button>
      <span style={{ fontSize: '13px', color: '#555' }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '6px 14px', borderRadius: '4px', border: '1px solid #ddd',
          background: currentPage === totalPages ? '#f5f5f5' : '#fff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px'
        }}
      >
        Next →
      </button>
    </div>
  );
}

function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]); // ✅ NEW
  const [coupons, setCoupons] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState(''); // ✅ NEW
  const [orderStatusFilter, setOrderStatusFilter] = useState('all'); // ✅ NEW
  const [expandedOrderId, setExpandedOrderId] = useState(null); // ✅ NEW
  const [productPage, setProductPage] = useState(1); // ✅ NEW
  const [orderPage, setOrderPage] = useState(1);     // ✅ NEW
  const ITEMS_PER_PAGE = 10;                          // ✅ NEW

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

  // ✅ NEW: FETCH REVIEWS (admin moderation queue)
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  // ✅ NEW: FETCH COUPONS
  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/coupons/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCoupons(data.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  // ✅ NEW: new coupon form state
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent', value: '', expires_at: '' });
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchOrders();
      await fetchReviews(); // ✅ NEW
      await fetchCoupons(); // ✅ NEW
      setLoading(false);
    };
    loadData();
  }, []);

  // ✅ NEW: reset to page 1 whenever the search/filter changes, so the user
  // never lands on a page that's now empty
  useEffect(() => {
    setProductPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearchTerm, orderStatusFilter]);

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

  // ✅ NEW: create a coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.value) {
      toast.error('Please fill in the coupon code and value');
      return;
    }
    setCreatingCoupon(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          code: newCoupon.code,
          type: newCoupon.type,
          value: newCoupon.value,
          expires_at: newCoupon.expires_at || null
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon created!');
        setNewCoupon({ code: '', type: 'percent', value: '', expires_at: '' });
        fetchCoupons();
      } else {
        toast.error(data.message || 'Could not create coupon');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setCreatingCoupon(false);
    }
  };

  // ✅ NEW: toggle a coupon active/inactive
  const toggleCoupon = async (couponId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/coupons/${couponId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCoupons();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  // ✅ NEW: delete a coupon
  const deleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Coupon deleted');
        fetchCoupons();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  // ✅ NEW: approve/reject a review
  const approveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Review approved!');
        fetchReviews();
      } else {
        toast.error(data.message || 'Approve failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const rejectReview = async (reviewId) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Review removed');
        fetchReviews();
      } else {
        toast.error(data.message || 'Delete failed');
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

  // ✅ NEW: paginate products (10 per page)
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * ITEMS_PER_PAGE,
    productPage * ITEMS_PER_PAGE
  );

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // ✅ NEW: total revenue — cancelled orders excluded since they never completed
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  // ✅ NEW: pending reviews count for the tab badge
  const pendingReviews = reviews.filter(r => !r.approved).length;

  // ✅ NEW: filter orders by search term (order ID / customer name / email) and status
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const term = orderSearchTerm.trim().toLowerCase();
    const matchesSearch = !term ||
      order.id?.toLowerCase().includes(term) ||
      order.user_name?.toLowerCase().includes(term) ||
      order.user_email?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // ✅ NEW: paginate orders (10 per page)
  const orderTotalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ITEMS_PER_PAGE,
    orderPage * ITEMS_PER_PAGE
  );

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
        {/* ✅ NEW: total revenue card (cancelled orders excluded) */}
        <div className="stat-card">
          <span className="stat-icon orders-icon">Rs.</span>
          <div>
            <h3>Rs. {totalRevenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
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
        {/* ✅ NEW: Reviews tab, with a badge showing how many are awaiting approval */}
        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
          <FaClipboardList /> Reviews{pendingReviews > 0 ? ` (${pendingReviews})` : ''}
        </button>
        {/* ✅ NEW: Coupons tab */}
        <button className={activeTab === 'coupons' ? 'active' : ''} onClick={() => setActiveTab('coupons')}>
          <FaClipboardList /> Coupons
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
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <FaBoxOpen size={28} />
                        <p>{searchTerm ? 'No products match your search.' : 'No products yet. Add your first one!'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(product => {
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
          {/* ✅ NEW: pagination controls */}
          <Pagination currentPage={productPage} totalPages={productTotalPages} onPageChange={setProductPage} />
        </div>
      )}

      {/* ===== ORDERS TAB ===== */}
      {activeTab === 'orders' && (
        <div className="admin-orders">
          {/* ✅ NEW: order search + status filter toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, customer name, or email..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="status-select"
              style={{ minWidth: '160px' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

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
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">
                        <FaClipboardList size={28} />
                        <p>{orders.length === 0 ? 'No orders yet.' : 'No orders match your search/filter.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(order => {
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
                          <td>
                            {new Date(order.created_at).toLocaleDateString()}
                            <div style={{ fontSize: '12px', color: '#888' }}>
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
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
                                      <th style={{ textAlign: 'center', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Qty / Category</th>
                                      <th style={{ textAlign: 'right', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Price</th>
                                      <th style={{ textAlign: 'right', fontSize: '12px', color: '#888', paddingBottom: '8px' }}>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => {
                                      const thumb = getItemThumb(item.images);
                                      return (
                                        <tr key={idx} style={{ borderTop: '1px solid #e8dcc4' }}>
                                          <td style={{ padding: '8px 0', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                              {thumb ? (
                                                <img
                                                  src={thumb}
                                                  alt={item.name}
                                                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e8dcc4' }}
                                                />
                                              ) : (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                  <FaImage size={14} />
                                                </div>
                                              )}
                                              <span>{item.name}</span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'center' }}>
                                            <div>{item.quantity}</div>
                                            {(item.category || item.subcategory) && (
                                              <div style={{ fontSize: '11px', color: '#B5762E', marginTop: '2px' }}>
                                                {[item.category, item.subcategory].filter(Boolean).join(' • ')}
                                              </div>
                                            )}
                                          </td>
                                          <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'right' }}>Rs. {item.price}</td>
                                          <td style={{ padding: '8px 0', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>
                                            Rs. {(item.price * item.quantity).toFixed(2)}
                                          </td>
                                        </tr>
                                      );
                                    })}
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
          {/* ✅ NEW: pagination controls */}
          <Pagination currentPage={orderPage} totalPages={orderTotalPages} onPageChange={setOrderPage} />
        </div>
      )}

      {/* ===== REVIEWS TAB (✅ NEW) ===== */}
      {activeTab === 'reviews' && (
        <div className="admin-orders">
          {reviews.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList size={28} />
              <p>No reviews yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map(review => (
                <div
                  key={review.id}
                  style={{
                    background: review.approved ? '#fff' : '#faf7f2',
                    border: review.approved ? '1px solid #eee' : '1px solid #e8dcc4',
                    borderRadius: '6px',
                    padding: '16px 20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{review.product_name || 'Unknown Product'}</div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        {review.user_name} • {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} • {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {!review.approved && (
                      <span style={{
                        fontSize: '11px', fontWeight: 'bold', color: '#B5762E',
                        background: '#B5762E1A', padding: '4px 10px', borderRadius: '12px'
                      }}>
                        PENDING
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p style={{ fontSize: '14px', color: '#444', margin: '8px 0' }}>{review.comment}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {!review.approved && (
                      <button className="edit-btn" onClick={() => approveReview(review.id)}>
                        Approve
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => rejectReview(review.id)}>
                      <FaTrash /> {review.approved ? 'Delete' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== COUPONS TAB (✅ NEW) ===== */}
      {activeTab === 'coupons' && (
        <div className="admin-orders">
          {/* Create new coupon form */}
          <form
            onSubmit={handleCreateCoupon}
            style={{
              display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end',
              background: '#faf7f2', border: '1px solid #e8dcc4', borderRadius: '6px',
              padding: '16px 20px', marginBottom: '20px'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Code</label>
              <input
                type="text"
                placeholder="e.g. EID20"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '140px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Type</label>
              <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, type: e.target.value }))}
                className="status-select"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (Rs.)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                Value {newCoupon.type === 'percent' ? '(%)' : '(Rs.)'}
              </label>
              <input
                type="number"
                min="1"
                placeholder={newCoupon.type === 'percent' ? '10' : '200'}
                value={newCoupon.value}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, value: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '90px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Expiry (optional)</label>
              <input
                type="date"
                value={newCoupon.expires_at}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, expires_at: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>
            <button type="submit" className="add-product-btn" disabled={creatingCoupon} style={{ height: '38px' }}>
              <FaPlus /> {creatingCoupon ? 'Creating...' : 'Add Coupon'}
            </button>
          </form>

          {/* Coupons list */}
          {coupons.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList size={28} />
              <p>No coupons yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="order-table">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <tr key={coupon.id}>
                      <td style={{ fontWeight: 700 }}>{coupon.code}</td>
                      <td>
                        {coupon.type === 'percent' ? `${coupon.value}% off` : `Rs. ${coupon.value} off`}
                      </td>
                      <td>
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'No expiry'}
                      </td>
                      <td>
                        <span className={`status-badge ${coupon.active ? 'delivered' : 'cancelled'}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="edit-btn" onClick={() => toggleCoupon(coupon.id)}>
                          {coupon.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="delete-btn" onClick={() => deleteCoupon(coupon.id)}>
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;