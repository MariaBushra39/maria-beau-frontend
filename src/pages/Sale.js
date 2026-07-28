import React, { useEffect, useState } from 'react';
import Page from './Page';
import API_URL from '../api';

// ===== SAFE IMAGE URL EXTRACTOR =====
const getImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return 'https://placehold.co/300x400?text=No+Image';
  }
  const img = images[0];
  if (typeof img === 'string' && img.startsWith('http')) {
    return img;
  }
  if (typeof img === 'string') {
    return `${API_URL}/uploads/${img}`;
  }
  if (Array.isArray(img) && img.length > 0) {
    const first = img[0];
    if (typeof first === 'string' && first.startsWith('http')) {
      return first;
    }
    if (typeof first === 'string') {
      return `${API_URL}/uploads/${first}`;
    }
  }
  return 'https://placehold.co/300x400?text=Image+Error';
};

function Sale() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sirf woh products jin par discount hai
          const saleProducts = data.data.filter(p => p.discount_price && p.discount_price < p.price);
          setProducts(saleProducts);
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
          <p className="empty-msg">No sale products available right now.</p>
        ) : (
          products.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => window.location.href = `/product/${product.id}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image-wrapper">
                <img 
                  src={getImageUrl(product.images)}
                  alt={product.name} 
                  className="product-img" 
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x400?text=Image+Not+Found';
                  }}
                />
                {product.discount_price && (
                  <span className="sale-badge">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                )}
              </div>
              <h3 className="product-name">{product.name}</h3>
              <div className="price-wrapper">
                {product.discount_price ? (
                  <>
                    <span className="original-price">Rs. {product.price}</span>
                    <span className="discount-price">Rs. {product.discount_price}</span>
                  </>
                ) : (
                  <span className="discount-price">Rs. {product.price}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  );
}

export default Sale;