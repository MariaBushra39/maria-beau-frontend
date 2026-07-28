import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Page from './Page';
import { FaImage } from 'react-icons/fa';
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

function CategoryPage() {
  const params = useParams();
  console.log('📌 Raw Params:', params);

  let { category, subcategory } = params;
  
  if (!category) {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      const possibleCategory = parts[0];
      if (['women', 'men', 'kids'].includes(possibleCategory.toLowerCase())) {
        category = possibleCategory;
      }
      if (parts.length > 1) {
        subcategory = parts[1];
      }
    }
  }

  console.log('🔍 Final Category:', category);
  console.log('🔍 Final Subcategory:', subcategory);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDisplay = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayCategory = subcategory 
    ? `${category?.charAt(0).toUpperCase() + category?.slice(1)} - ${formatDisplay(subcategory)}` 
    : (category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        
        if (data.success) {
          const categoryLower = category?.toLowerCase().trim() || '';
          const subcategoryLower = subcategory?.toLowerCase().replace(/-/g, ' ').trim() || '';

          console.log('🔍 Searching Category:', categoryLower);
          console.log('🔍 Searching Subcategory:', subcategoryLower);

          const filtered = data.data.filter(p => {
            const pCategory = (p.category || '').toLowerCase().trim();
            
            if (pCategory !== categoryLower) return false;

            if (subcategoryLower) {
              const pSubcategory = (p.subcategory || '').toLowerCase().trim();
              return pSubcategory === subcategoryLower;
            }

            return true;
          });

          console.log('✅ Filtered Products:', filtered.length);
          setProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  if (loading) {
    return <div className="loading">⏳ LOADING ...</div>;
  }

  return (
    <Page title={displayCategory} wide>
      <p>Explore our premium collection of {displayCategory.toLowerCase()} fashion.</p>
      {products.length === 0 ? (
        <p className="empty-msg">No products found in this category.</p>
      ) : (
        <div className="product-grid" style={{ marginTop: '20px' }}>
          {products.map(product => (
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
          ))}
        </div>
      )}
    </Page>
  );
}

export default CategoryPage;