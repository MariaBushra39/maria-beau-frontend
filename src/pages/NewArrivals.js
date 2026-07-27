import React, { useEffect, useState } from 'react';
import Page from './Page';
import API_URL from '../api'; // ✅ Added

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`) // ✅ Using API_URL
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sorted = data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setProducts(sorted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">LOADING ...</div>;

  return (
    <Page title="New Arrivals" wide>
      <p>Discover the latest additions to our collection.</p>
      <div className="product-grid" style={{ marginTop: '20px' }}>
        {products.length === 0 ? (
          <p className="empty-msg">No new arrivals yet.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img 
                  src={`${API_URL}/uploads/${product.images?.[0] || 'dummy.jpg'}`} // ✅ Using API_URL
                  alt={product.name} 
                  className="product-img" 
                />
              </div>
              <h3 className="product-name">{product.name}</h3>
              <div className="price-wrapper">
                <span className="discount-price">Rs. {product.price}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  );
}

export default NewArrivals;