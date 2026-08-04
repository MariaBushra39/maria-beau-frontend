import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductDetail from './ProductDetail';
import './App.css';
import { 
  FaSearch, FaRegHeart, FaHeart, FaShoppingCart, FaUser, 
  FaTruck, FaLock, FaUndo, FaGem, 
  FaInstagram, FaFacebook, FaTwitter, FaPinterest,
  FaChevronLeft, FaChevronRight, FaTimes, FaSignOutAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
// ===== API URL =====
import API_URL from './api';

// ===== AUTH CONTEXT =====
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminRoute from './context/AdminRoute';

// ===== CART CONTEXT =====
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';

// ===== AUTH PAGES =====
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ===== OTHER PAGES =====
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import FAQs from './pages/FAQs';
import Returns from './pages/Returns';
import Payments from './pages/Payments';
import Blogs from './pages/Blogs';
import SizeGuide from './pages/SizeGuide';
import TrackOrder from './pages/TrackOrder';
import NewArrivals from './pages/NewArrivals';
import Sale from './pages/Sale';
import CategoryPage from './pages/CategoryPage';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';          // ✅ ADDED
import OrderSuccess from './pages/OrderSuccess';  // ✅ ADDED
import Wishlist from './pages/Wishlist';

// ===== ADMIN PAGES =====
import Admin from './pages/Admin';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';

// ===== MAIN APP CONTENT =====
function AppContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offerIndex, setOfferIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { getTotalItems, addToCart } = useCart();
  const { isInWishlist, toggleWishlist, getTotalWishlistItems } = useWishlist();

  // ===== OFFER BAR MESSAGES =====
  const offers = useMemo(() => [
    'Free Shipping on Orders Above Rs. 3000',
    'New Arrivals Available Now',
    'Summer Sale Up to 40% Off'
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [offers.length]);

  // ===== HERO SLIDES (useMemo for stability) =====
  const slides = useMemo(() => [
    {
      image: 'https://images.pexels.com/photos/20593503/pexels-photo-20593503.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'New Summer Collection 2026',
      subtitle: 'Style That Defines You',
      link: '/women'
    },
    {
      image: 'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: "Men's Luxury Edit",
      subtitle: 'Timeless Elegance',
      link: '/men'
    },
    {
      image: 'https://images.pexels.com/photos/18472915/pexels-photo-18472915.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Kids Festive Collection',
      subtitle: 'Playful & Chic',
      link: '/kids'
    },
    {
      image: 'https://images.pexels.com/photos/36608749/pexels-photo-36608749.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Ready to Wear',
      subtitle: 'Everyday Glamour',
      link: '/women/ready-to-wear'
    },
    {
      image: 'https://images.pexels.com/photos/33365139/pexels-photo-33365139.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Western Collection',
      subtitle: 'Global Trends, Local Love',
      link: '/women/western'
    }
  ], []);

  // ===== CAROUSEL CONTROLS (useCallback for stability) =====
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // ===== PRELOAD NEXT IMAGE =====
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    const img = new Image();
    img.src = slides[nextIndex].image;
  }, [currentSlide, slides]);

  // ===== AUTO SLIDE =====
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // ===== FETCH PRODUCTS (Using API_URL) =====
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // ===== LIVE SEARCH (filters already-loaded products by name/category) =====
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery, products]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery('');
  };

  const handleSearchResultClick = (productId) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    window.location.href = `/product/${productId}`;
  };

  // Wishlist heart toggle on a product card (doesn't navigate to product page)
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    const wasInWishlist = isInWishlist(product.id);
    toggleWishlist(product);
    toast.success(wasInWishlist ? `${product.name} removed from wishlist` : `${product.name} added to wishlist!`);
  };

  const handleProductClick = (productId) => {
    window.location.href = `/product/${productId}`;
  };

  // Quick "Add to Cart" from the product card icon (no size/color picker here,
  // so we default to the first available size/color — user can change it
  // later from the Cart page if needed).
  const handleQuickAdd = (e, product) => {
    e.stopPropagation(); // don't trigger the card click (navigate to product page)
    const defaultSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
    const defaultColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
    addToCart(product, 1, defaultSize, defaultColor);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="home-skeleton">
        <div className="skeleton-hero shimmer"></div>
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton-image shimmer"></div>
              <div className="skeleton-line shimmer" style={{ width: '80%' }}></div>
              <div className="skeleton-line shimmer" style={{ width: '40%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== SORTED PRODUCTS =====
  const sortedProducts = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const newArrivals = sortedProducts.slice(0, 4);
  const bestSellers = sortedProducts.slice(4, 8);

  // A product counts as "NEW" if it was added within the last 14 days.
  // Only shown when the product has no discount (discount badge takes priority).
  const isNewProduct = (createdAt) => {
    if (!createdAt) return false;
    const daysSince = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 14;
  };

  // ===== CIRCLE CATEGORY SHOWCASE (below hero) =====
  // Uses the first matching product's image as the representative photo.
  const circleShowcase = [
    { label: 'Women', sub: 'Unstitched', link: '/women/unstitched', category: 'women', subcategory: 'unstitched' },
    { label: 'Men', sub: 'Formal', link: '/men/formal', category: 'men', subcategory: 'formal' },
    { label: 'Kids', sub: 'Girls & Boys', link: '/kids', category: 'kids', subcategory: null }
  ];

  const getCircleImage = (category, subcategory) => {
    const match = products.find(p => {
      const pCategory = (p.category || '').toLowerCase().trim();
      if (pCategory !== category) return false;
      if (subcategory) {
        const pSub = (p.subcategory || '').toLowerCase().trim();
        return pSub === subcategory;
      }
      return true;
    });
    if (!match || !match.images || !Array.isArray(match.images) || match.images.length === 0) {
      return 'https://placehold.co/300x300?text=No+Image';
    }
    const img = match.images[0];
    if (typeof img === 'string' && img.startsWith('http')) return img;
    if (typeof img === 'string') return `${API_URL}/uploads/${img}`;
    return 'https://placehold.co/300x300?text=No+Image';
  };

  // ===== RENDER PRODUCT CARD — SAFE IMAGE HANDLING =====
  const renderProduct = (product) => {
    // Safe image URL extractor
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

    return (
      <div 
        key={product.id} 
        className="product-card"
        onClick={() => handleProductClick(product.id)}
      >
        <div className="product-image-wrapper">
          <img 
            src={getImageUrl(product.images)}
            alt={product.name} 
            className="product-img" 
            loading="lazy"
            decoding="async"
            style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
            onLoad={(e) => { e.target.style.opacity = 1; }}
            onError={(e) => {
              e.target.src = 'https://placehold.co/300x400?text=Image+Not+Found';
              e.target.style.opacity = 1;
            }}
          />
          {product.discount_price ? (
            <span className="sale-badge">
              {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
            </span>
          ) : isNewProduct(product.created_at) ? (
            <span className="sale-badge new-badge">NEW</span>
          ) : null}
          <button
            className="quick-add-btn"
            onClick={(e) => handleQuickAdd(e, product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <FaShoppingCart />
          </button>
          <button
            className={`wishlist-toggle-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={(e) => handleWishlistToggle(e, product)}
            aria-label={`Toggle ${product.name} in wishlist`}
          >
            {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
          </button>
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
    );
  };

  return (
    <div>
      {/* ===== OFFER BAR ===== */}
      <div className="announcement-bar offer-slider">
        <span key={offerIndex} className="offer-text">
          {offers[offerIndex]}
        </span>
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <div className="navbar-top">
          <div className="hamburger" onClick={toggleMenu}>
            <span></span><span></span><span></span>
          </div>
          <div className="logo">
            <span className="logo-part1">Maria</span><span className="logo-part2">Beau</span>
          </div>
          <div className="nav-icons">
            <span className="icon" onClick={toggleSearch} style={{ cursor: 'pointer' }}><FaSearch /></span>
            <Link to="/wishlist" className="icon cart-icon" style={{ position: 'relative', color: '#fff' }}>
              <FaRegHeart />
              {getTotalWishlistItems() > 0 && (
                <span className="cart-badge">{getTotalWishlistItems()}</span>
              )}
            </Link>
            <Link to="/cart" className="icon cart-icon" style={{ position: 'relative', color: '#fff' }}>
              <FaShoppingCart />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/profile" className="icon login-btn" style={{ color: '#fff', textDecoration: 'none' }}>
                  <FaUser /> <span className="btn-label">Profile</span>
                </Link>
                <span className="icon login-btn" onClick={logout} style={{ cursor: 'pointer' }}>
                  <FaSignOutAlt /> <span className="btn-label">Logout</span>
                </span>
              </div>
            ) : (
              <Link to="/login" className="icon login-btn">
                <FaUser /> <span className="btn-label">Login</span>
              </Link>
            )}
          </div>
        </div>

        <div className="navbar-bottom">
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li className="dropdown">
              <Link to="/women">Women ▾</Link>
              <ul className="dropdown-menu">
                <li><Link to="/women/ready-to-wear">Ready to Wear</Link></li>
                <li><Link to="/women/unstitched">Unstitched</Link></li>
                <li><Link to="/women/western">Western Wear</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/men">Men ▾</Link>
              <ul className="dropdown-menu">
                <li><Link to="/men/casual">Casual</Link></li>
                <li><Link to="/men/formal">Formal</Link></li>
                <li><Link to="/men/ethnic">Ethnic</Link></li>
              </ul>
            </li>
            <li className="dropdown">
              <Link to="/kids">Kids ▾</Link>
              <ul className="dropdown-menu">
                <li><Link to="/kids/girls">Girls</Link></li>
                <li><Link to="/kids/boys">Boys</Link></li>
              </ul>
            </li>
            <li><Link to="/new-arrivals">New Arrivals</Link></li>
            <li><Link to="/sale" className="sale-link">Sale</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </nav>

      {/* ===== SEARCH DROPDOWN ===== */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-panel" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-row">
              <FaSearch className="search-input-icon" />
              <input
                type="text"
                autoFocus
                placeholder="Search for products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-close-btn" onClick={() => setIsSearchOpen(false)}><FaTimes /></span>
            </div>
            {searchQuery.trim() && (
              <div className="search-results">
                {searchResults.length === 0 ? (
                  <p className="search-no-results">No products found for "{searchQuery}"</p>
                ) : (
                  searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(product.id)}
                    >
                      <span className="search-result-name">{product.name}</span>
                      <span className="search-result-category">{product.category}</span>
                      <span className="search-result-price">Rs. {product.discount_price || product.price}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SIDEBAR MENU ===== */}
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
      <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-part1">Maria</span><span className="logo-part2">Beau</span>
          </div>
          <span className="close-btn" onClick={toggleMenu}><FaTimes /></span>
        </div>
        <ul className="sidebar-links">
          <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
          <li className="sidebar-dropdown">
            <span>Women ▾</span>
            <ul>
              <li><Link to="/women/ready-to-wear" onClick={toggleMenu}>Ready to Wear</Link></li>
              <li><Link to="/women/unstitched" onClick={toggleMenu}>Unstitched</Link></li>
              <li><Link to="/women/western" onClick={toggleMenu}>Western Wear</Link></li>
            </ul>
          </li>
          <li className="sidebar-dropdown">
            <span>Men ▾</span>
            <ul>
              <li><Link to="/men/casual" onClick={toggleMenu}>Casual</Link></li>
              <li><Link to="/men/formal" onClick={toggleMenu}>Formal</Link></li>
              <li><Link to="/men/ethnic" onClick={toggleMenu}>Ethnic</Link></li>
            </ul>
          </li>
          <li className="sidebar-dropdown">
            <span>Kids ▾</span>
            <ul>
              <li><Link to="/kids/girls" onClick={toggleMenu}>Girls</Link></li>
              <li><Link to="/kids/boys" onClick={toggleMenu}>Boys</Link></li>
            </ul>
          </li>
          <li><Link to="/new-arrivals" onClick={toggleMenu}>New Arrivals</Link></li>
          <li><Link to="/sale" onClick={toggleMenu} className="sale-link">Sale</Link></li>
          <li><Link to="/wishlist" onClick={toggleMenu}>Wishlist</Link></li>
          <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
          {user ? (
            <>
              <li><Link to="/profile" onClick={toggleMenu}>Profile</Link></li>
              <li><span onClick={() => { logout(); toggleMenu(); }} style={{ cursor: 'pointer' }}>Logout</span></li>
            </>
          ) : (
            <li><Link to="/login" onClick={toggleMenu}>Login</Link></li>
          )}
        </ul>
      </div>

      {/* ===== ROUTES ===== */}
      <Routes>
        <Route path="/" element={
          <>
            <section className="hero-carousel">
              <div className="hero-slide" key={currentSlide}>
                <img 
                  src={slides[currentSlide].image} 
                  alt={slides[currentSlide].title} 
                  className="hero-image" 
                />
                <div className="hero-content">
                  <h1>{slides[currentSlide].title}</h1>
                  <p>{slides[currentSlide].subtitle}</p>
                  <Link to={slides[currentSlide].link} className="hero-btn">Shop Now →</Link>
                </div>
              </div>
              <button className="carousel-btn left" onClick={prevSlide}>
                <FaChevronLeft />
              </button>
              <button className="carousel-btn right" onClick={nextSlide}>
                <FaChevronRight />
              </button>
              <div className="carousel-dots">
                {slides.map((_, index) => (
                  <span 
                    key={index} 
                    className={`dot ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  ></span>
                ))}
              </div>
            </section>

            <section className="circle-showcase-section">
              <div className="circle-showcase-row">
                {circleShowcase.map((item) => (
                  <Link to={item.link} key={item.label + item.sub} className="circle-showcase-item">
                    <div className="circle-showcase-img-wrap">
                      <img
                        src={getCircleImage(item.category, item.subcategory)}
                        alt={`${item.label} ${item.sub}`}
                        loading="lazy"
                      />
                    </div>
                    <span className="circle-showcase-label">{item.label}</span>
                    <span className="circle-showcase-sub">{item.sub}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="category-section">
              <div className="category-header">
                <h2>Women</h2>
                <Link to="/women" className="view-all">View All →</Link>
              </div>
              <div className="product-grid">
                {products.filter(p => p.category === 'Women').slice(0, 4).length === 0 ? (
                  <p className="empty-msg">No women products yet.</p>
                ) : (
                  products.filter(p => p.category === 'Women').slice(0, 4).map(product => renderProduct(product))
                )}
              </div>
            </section>

            <section className="category-section">
              <div className="category-header">
                <h2>Men</h2>
                <Link to="/men" className="view-all">View All →</Link>
              </div>
              <div className="product-grid">
                {products.filter(p => p.category === 'Men').slice(0, 4).length === 0 ? (
                  <p className="empty-msg">No men products yet.</p>
                ) : (
                  products.filter(p => p.category === 'Men').slice(0, 4).map(product => renderProduct(product))
                )}
              </div>
            </section>

            <section className="category-section">
              <div className="category-header">
                <h2>Kids</h2>
                <Link to="/kids" className="view-all">View All →</Link>
              </div>
              <div className="product-grid">
                {products.filter(p => p.category === 'Kids').slice(0, 4).length === 0 ? (
                  <p className="empty-msg">No kids products yet.</p>
                ) : (
                  products.filter(p => p.category === 'Kids').slice(0, 4).map(product => renderProduct(product))
                )}
              </div>
            </section>

            <section className="products-section">
              <h2 className="section-title">New Arrivals</h2>
              <div className="product-grid">
                {newArrivals.length === 0 ? (
                  <p className="empty-msg">No products yet.</p>
                ) : (
                  newArrivals.map(product => renderProduct(product))
                )}
              </div>
            </section>

            <section className="products-section">
              <h2 className="section-title">Best Sellers</h2>
              <div className="product-grid">
                {bestSellers.length === 0 ? (
                  <p className="empty-msg">No products yet.</p>
                ) : (
                  bestSellers.map(product => renderProduct(product))
                )}
              </div>
            </section>

            <section className="why-choose-section">
              <h2 className="section-title">Why Choose Us</h2>
              <p className="section-subtitle">Premium Quality. Trusted Service.</p>
              <div className="features-grid">
                <div className="feature-card">
                  <span className="feature-icon"><FaTruck /></span>
                  <h3>Free Shipping</h3>
                  <p>Free delivery on orders above Rs. 3,000.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon"><FaLock /></span>
                  <h3>Secure Payment</h3>
                  <p>100% safe and encrypted checkout.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon"><FaUndo /></span>
                  <h3>Easy Returns</h3>
                  <p>7-day hassle-free return policy.</p>
                </div>
                <div className="feature-card">
                  <span className="feature-icon"><FaGem /></span>
                  <h3>Premium Quality</h3>
                  <p>Carefully selected fabrics and designs.</p>
                </div>
              </div>
            </section>

            <section className="newsletter-section">
              <div className="newsletter-container">
                <h2>Stay Updated</h2>
                <p>Get the latest fashion trends and exclusive offers.</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Enter your email" />
                  <button>Subscribe →</button>
                </div>
              </div>
            </section>
          </>
        } />

        {/* ===== CATEGORY PAGES ===== */}
        <Route path="/women" element={<CategoryPage />} />
        <Route path="/women/:subcategory" element={<CategoryPage />} />
        <Route path="/men" element={<CategoryPage />} />
        <Route path="/men/:subcategory" element={<CategoryPage />} />
        <Route path="/kids" element={<CategoryPage />} />
        <Route path="/kids/:subcategory" element={<CategoryPage />} />

        {/* ===== AUTH PAGES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ===== USER PAGES ===== */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />                {/* ✅ ADDED */}
        <Route path="/order-success/:orderId" element={<OrderSuccess />} /> {/* ✅ ADDED */}

        {/* ===== ADMIN PAGES (Protected — admin role only) ===== */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
        <Route path="/admin/edit-product/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />

        {/* ===== OTHER PAGES ===== */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Routes>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Contact Us</h4>
            <p><a href="mailto:mariabushra392@gmail.com" style={{ color: '#aaa', textDecoration: 'none' }}>mariabushra392@gmail.com</a></p>
            <p><a href="tel:+923296892140" style={{ color: '#aaa', textDecoration: 'none' }}>+923296892140</a></p>
          </div>
          <div className="footer-col">
            <h4>Customer Care</h4>
            <Link to="/faqs">FAQs</Link>
            <Link to="/returns">Exchange & Return Policy</Link>
            <Link to="/track-order">Track Your Order</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <Link to="/about">About Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/payments">Payments</Link>
            <Link to="/blogs">Blogs</Link>
            <Link to="/size-guide">Size Guide</Link>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/maria_bushra3?igsh=MTM2MjE5YTQ2YnA1dQ==" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://www.facebook.com/share/18hsySAypv/" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://x.com/MariaBushr59127" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://pin.it/7iOo7eeix" target="_blank" rel="noopener noreferrer"><FaPinterest /></a>
            </div>
            <div className="payment-methods">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>JazzCash</span>
              <span>EasyPaisa</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} MariaBeau. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ================================================================
// APP WRAPPER
// ================================================================
function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;