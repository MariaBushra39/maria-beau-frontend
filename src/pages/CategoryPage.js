import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Page from './Page';
import { FaImage } from 'react-icons/fa';
import API_URL from '../api'; // ✅ Added

function CategoryPage() {
  // 🟢 DIRECT: useParams() se category aur subcategory lo
  const params = useParams();
  console.log('📌 Raw Params:', params);

  // ✅ Agar category undefined hai toh URL se guess karo
  let { category, subcategory } = params;
  
  // Agar category nahi mili toh URL path se nikaalo
  if (!category) {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 0) {
      // Pehla part category ho sakta hai (women, men, kids)
      const possibleCategory = parts[0];
      if (['women', 'men', 'kids'].includes(possibleCategory.toLowerCase())) {
        category = possibleCategory;
      }
      // Agar doosra part hai toh woh subcategory hai
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
        const res = await fetch(`${API_URL}/api/products`); // ✅ Using API_URL
        const data = await res.json();
        
        if (data.success) {
          const categoryLower = category?.toLowerCase().trim() || '';
          const subcategoryLower = subcategory?.toLowerCase().replace(/-/g, ' ').trim() || '';

          console.log('🔍 Searching Category:', categoryLower);
          console.log('🔍 Searching Subcategory:', subcategoryLower);

          const filtered = data.data.filter(p => {
            const pCategory = (p.category || '').toLowerCase().trim();
            
            // Pehle category match karo
            if (pCategory !== categoryLower) return false;

            // Agar subcategory di hai toh match karo
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
                {product.images && product.images[0] && product.images[0] !== 'dummy.jpg' ? (
                  <img 
                    src={`${API_URL}/uploads/${product.images[0]}`} // ✅ Using API_URL
                    alt={product.name} 
                    className="product-img" 
                  />
                ) : (
                  <div className="product-img-placeholder"><FaImage size={32} color="#ccc" /></div>
                )}
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