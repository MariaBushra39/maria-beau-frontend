import React, { useEffect, useState } from 'react';
import Page from './Page';
import API_URL from '../api'; // ✅ Added

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`) // ✅ Using API_URL
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const onSale = data.data.filter(p => p.discount_price);
          setProducts(onSale);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">LOADING ...</div>;

  return (
    <Page title="Sale" wide>
      <p>Grab the best deals on our premium collection.</p>
      <div className="product-grid" style={{ marginTop: '20px' }}>
        {products.length === 0 ? (
          <p className="empty-msg">No products on sale right now.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img 
                  src={`${API_URL}/uploads/${product.images?.[0] || 'dummy.jpg'}`} // ✅ Using API_URL
                  alt={product.name} 
                  className="product-img" 
                />
                <span className="sale-badge">
                  {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                </span>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <div className="price-wrapper">
                <span className="original-price">Rs. {product.price}</span>
                <span className="discount-price">Rs. {product.discount_price}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  );
}

export default Sale;