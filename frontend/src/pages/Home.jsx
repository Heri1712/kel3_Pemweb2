import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories } from '../api/admin';
import {
  getCart,
  addToCart,
  deleteCartItem,
  checkoutCart,
  getTransactions
} from '../api/user';
import styles from './Home.module.css';

export default function HomePage() {
  const { user, isAuth, logout } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // UI Interactive States
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [authWarningOpen, setAuthWarningOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  // Form States
  const [address, setAddress] = useState('');
  const [likedProducts, setLikedProducts] = useState({}); // Local state for wishlist heart toggling

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  // Load all products and categories
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat katalog produk');
    } finally {
      setLoading(false);
    }
  };

  // Load cart data if logged in
  const loadCartData = async () => {
    if (!isAuth) {
      setCart([]);
      setCartTotal(0);
      return;
    }
    try {
      const cartRes = await getCart();
      setCart(cartRes.data || []);
      setCartTotal(cartRes.total_harga || 0);
    } catch (err) {
      console.error('Gagal mengambil keranjang:', err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCartData();
  }, [isAuth]);

  // Handle adding to cart
  const handleAddToCart = async (product) => {
    if (!isAuth) {
      setAuthWarningOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      await addToCart(product.id, 1);
      
      // Update local cart state and show the drawer for a smooth premium feedback
      await loadCartData();
      setSuccessMsg(`"${product.nama_produk}" berhasil dimasukkan ke keranjang`);
      setCartOpen(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting from cart
  const handleDeleteItem = async (cartId) => {
    try {
      await deleteCartItem(cartId);
      await loadCartData();
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Handle opening checkout modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // Handle checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    try {
      setSubmitting(true);
      await checkoutCart(address);
      
      // Success feedback
      setAddress('');
      setCheckoutOpen(false);
      setSuccessMsg('Pemesanan berhasil diproses! Terima kasih telah berbelanja.');
      
      // Reload cart (now empty) and products (with updated stock)
      await Promise.all([loadCartData(), loadData()]);
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening transaction history
  const handleOpenHistory = async () => {
    if (!isAuth) {
      setAuthWarningOpen(true);
      return;
    }
    
    try {
      setAccountDropdownOpen(false);
      setLoading(true);
      const trxRes = await getTransactions();
      setTransactions(trxRes.data || []);
      setHistoryOpen(true);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle local liked/wishlist state
  const toggleLike = (productId) => {
    setLikedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    setCart([]);
    setCartTotal(0);
    navigate('/');
  };

  // Helper to get full image URL
  const getImageUrl = (foto) => {
    if (!foto || foto === 'default.png') return '';
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }
    const backendUrl = BASE_URL.replace('/api', '');
    return `${backendUrl}/uploads/produk/${foto}`;
  };

  const formatRupiah = (val) => {
    if (!val) return 'Rp. 0';
    return `Rp. ${Number(val).toLocaleString('id-ID')}`;
  };

  // Filtered Products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.deskripsi && prod.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || Number(prod.id_kategori) === Number(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span>Mini</span>
          <span className={styles.brandHighlight}>Retail</span>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className={styles.navActions}>
          {/* Cart Icon */}
          <button 
            className={styles.cartButton} 
            onClick={() => isAuth ? setCartOpen(true) : setAuthWarningOpen(true)}
            aria-label="Keranjang Belanja"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {isAuth && cart.length > 0 && (
              <span className={styles.cartBadge}>{cart.reduce((sum, item) => sum + Number(item.jumlah), 0)}</span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className={styles.accountSection}>
            <button 
              className={styles.accountButton}
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
            >
              <div className={styles.avatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span>{isAuth ? (user?.nama || 'Akun Saya') : 'Akun Saya'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {accountDropdownOpen && (
              <div className={styles.dropdownMenu} onMouseLeave={() => setAccountDropdownOpen(false)}>
                {isAuth ? (
                  <>
                    <div className={styles.dropdownUserDetail}>
                      <strong>{user?.nama}</strong>
                      <p>{user?.email}</p>
                    </div>
                    {user?.role === 'admin' ? (
                      <button 
                        className={styles.dropdownItem}
                        onClick={() => navigate('/admin/dashboard')}
                      >
                        ⚡ Dashboard Admin
                      </button>
                    ) : (
                      <button 
                        className={styles.dropdownItem}
                        onClick={handleOpenHistory}
                      >
                        📦 Riwayat Transaksi
                      </button>
                    )}
                    <button 
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => navigate('/login')}
                    >
                      🔑 Login
                    </button>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => navigate('/register')}
                    >
                      📝 Daftar Akun
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Alerts & Toasts ── */}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '40px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          zIndex: 999,
          fontWeight: 600,
          animation: 'slideDown 0.3s ease'
        }}>
          ✅ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '40px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          zIndex: 999,
          fontWeight: 600,
          animation: 'slideDown 0.3s ease'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className={styles.mainLayout}>
        {/* Sidebar Kategori */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Kategori</h2>
          <p className={styles.sidebarSubtitle}>Semua Kategori</p>
          <ul className={styles.categoryList}>
            <li 
              className={`${styles.categoryItem} ${selectedCategory === 'all' ? styles.categoryItemActive : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Semua Kategori
            </li>
            {categories.map((cat) => (
              <li 
                key={cat.id}
                className={`${styles.categoryItem} ${Number(selectedCategory) === Number(cat.id) ? styles.categoryItemActive : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.nama_kategori}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content Panel */}
        <main className={styles.contentPanel}>
          {/* Hero Banner */}
          <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Promo Spesial Hari Ini!</h1>
              <p className={styles.heroSubtitle}>Dapatkan diskon hingga 30%</p>
              <button className={styles.heroBtn} onClick={() => {
                const target = document.getElementById('produk-terbaru');
                target?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Belanja Sekarang
              </button>
            </div>
            
            {/* SVG Illustration similar to the cartoon mockup image */}
            <div className={styles.heroIllustration}>
              <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Cart shape */}
                <path d="M70 80 H280 L250 180 H100 L70 80 Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.3"/>
                {/* Wheels */}
                <circle cx="120" cy="205" r="15" stroke="white" strokeWidth="5" fill="none" opacity="0.3"/>
                <circle cx="230" cy="205" r="15" stroke="white" strokeWidth="5" fill="none" opacity="0.3"/>
                {/* Bag 1 */}
                <rect x="110" y="90" width="50" height="70" rx="8" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="4"/>
                <path d="M125 90 C125 75 145 75 145 90" stroke="white" strokeWidth="4"/>
                {/* Bag 2 */}
                <rect x="170" y="70" width="60" height="90" rx="8" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="4"/>
                <path d="M185 70 C185 50 215 50 215 70" stroke="white" strokeWidth="4"/>
                {/* Shirt hanger outline */}
                <path d="M280 90 L300 70 L320 90 Z" stroke="white" strokeWidth="4" fill="none"/>
                <path d="M300 70 V60" stroke="white" strokeWidth="4"/>
                {/* Hanging Clothes */}
                <path d="M260 95 H340 V180 H260 Z" stroke="white" strokeWidth="4" fill="white" fillOpacity="0.1"/>
                <path d="M290 180 V150 H310 V180" stroke="white" strokeWidth="4" fill="none"/>
                {/* Cute Shopping Bag Character on right */}
                <rect x="300" y="110" width="70" height="70" rx="10" fill="#3b82f6" stroke="white" strokeWidth="4"/>
                <path d="M320 110 C320 90 350 90 350 110" stroke="white" strokeWidth="4"/>
                {/* Smiling eyes & mouth */}
                <circle cx="323" cy="140" r="3" fill="white"/>
                <circle cx="347" cy="140" r="3" fill="white"/>
                <path d="M330 152 Q335 158 340 152" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            
            <div className={styles.bannerDots}>
              <span className={styles.bannerDot}></span>
              <span className={styles.bannerDot}></span>
              <span className={`${styles.bannerDot} ${styles.bannerDotActive}`}></span>
            </div>
          </div>

          {/* Section Title */}
          <div className={styles.sectionHeader} id="produk-terbaru">
            <h2 className={styles.sectionTitle}>Produk Terbaru</h2>
            <a href="#view-all" className={styles.viewAllLink} onClick={(e) => { e.preventDefault(); setSearchQuery(''); setSelectedCategory('all'); }}>
              <span>Lihat Semua</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>

          {/* Loading state */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', width: '100%' }}>
              <span className={styles.spinner} style={{ borderTopColor: '#3b82f6', width: '40px', height: '40px', borderWidth: '4px' }} />
            </div>
          ) : (
            <div className={styles.productGrid}>
              {filteredProducts.length === 0 ? (
                <div className={styles.noProducts}>
                  <div className={styles.noProductsIcon}>🔍</div>
                  <h3>Tidak ada produk ditemukan</h3>
                  <p>Coba gunakan kata kunci pencarian lain atau pilih kategori yang berbeda.</p>
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div key={prod.id} className={styles.productCard}>
                    {/* Stock indicator if low or empty */}
                    {Number(prod.stok) === 0 ? (
                      <span className={styles.stockAlert}>Stok Habis</span>
                    ) : Number(prod.stok) <= 3 ? (
                      <span className={styles.stockAlert} style={{ backgroundColor: '#f97316' }}>Sisa {prod.stok}</span>
                    ) : null}

                    <div className={styles.imageWrapper}>
                      {prod.foto ? (
                        <img 
                          src={getImageUrl(prod.foto)} 
                          alt={prod.nama_produk} 
                          className={styles.productImage}
                        />
                      ) : (
                        <div style={{ fontSize: '48px', color: '#cbd5e1' }}>👕</div>
                      )}
                    </div>

                    <div className={styles.productCardBottom}>
                      <h3 className={styles.productTitle} title={prod.nama_produk}>{prod.nama_produk}</h3>
                      <p className={styles.productDesc}>{prod.deskripsi || 'Tidak ada deskripsi untuk produk ini.'}</p>
                      
                      <div className={styles.productPrice}>{formatRupiah(prod.harga)}</div>
                      
                      <div className={styles.cardActions}>
                        {/* Wishlist Heart Button */}
                        <button 
                          className={`${styles.actionBtn} ${likedProducts[prod.id] ? styles.wishlistActive : ''}`}
                          onClick={() => toggleLike(prod.id)}
                          aria-label="Tambah ke Favorit"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={likedProducts[prod.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>

                        {/* Add to Cart Button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.cartActive}`}
                          onClick={() => handleAddToCart(prod)}
                          disabled={Number(prod.stok) === 0 || submitting}
                          aria-label="Tambah ke Keranjang"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── CART DRAWER ── */}
      <div 
        className={`${styles.drawerOverlay} ${cartOpen ? styles.drawerOverlayOpen : ''}`} 
        onClick={() => setCartOpen(false)}
      />
      <div className={`${styles.drawer} ${cartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <h2>Keranjang Belanja</h2>
          <button className={styles.closeDrawerBtn} onClick={() => setCartOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.drawerContent}>
          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <div className={styles.cartEmptyIcon}>🛒</div>
              <p>Keranjang belanja Anda kosong</p>
              <button 
                onClick={() => setCartOpen(false)}
                style={{
                  marginTop: '16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className={styles.cartList}>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.cartItemImageWrapper}>
                    {item.foto ? (
                      <img src={getImageUrl(item.foto)} alt={item.nama_produk} className={styles.cartItemImage} />
                    ) : (
                      <span style={{ fontSize: '24px' }}>👕</span>
                    )}
                  </div>
                  <div className={styles.cartItemDetails}>
                    <h4 className={styles.cartItemTitle}>{item.nama_produk}</h4>
                    <div className={styles.cartItemPrice}>{formatRupiah(item.harga)}</div>
                    <div className={styles.cartItemQty}>Jumlah: {item.jumlah}</div>
                  </div>
                  <button 
                    className={styles.deleteCartItemBtn} 
                    onClick={() => handleDeleteItem(item.id)}
                    title="Hapus barang"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Belanja</span>
              <span className={styles.totalVal}>{formatRupiah(cartTotal)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleOpenCheckout}>
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>

      {/* ── CHECKOUT MODAL ── */}
      {checkoutOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Alamat Pengiriman</h3>
              <button className={styles.closeDrawerBtn} onClick={() => setCheckoutOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="address-input" className={styles.formLabel}>Alamat Lengkap</label>
                  <textarea
                    id="address-input"
                    className={styles.textareaInput}
                    placeholder="Masukkan alamat pengiriman lengkap (Minimal 10 karakter)..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    minLength={10}
                  />
                  <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Pastikan menulis jalan, nomor rumah, RT/RW, kecamatan, kota, dan kode pos.
                  </small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCheckoutOpen(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting || address.trim().length < 10}>
                  {submitting ? <span className={styles.spinner} /> : 'Konfirmasi Pemesanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── AUTH WARNING MODAL (GUEST TRYING TO BUY) ── */}
      {authWarningOpen && (
        <div className={styles.modalOverlay} onClick={() => setAuthWarningOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalContent}>
              <div className={styles.authWarningContent}>
                <div className={styles.authWarningIcon}>🔒</div>
                <h3 className={styles.authWarningTitle}>Perlu Login Terlebih Dahulu</h3>
                <p className={styles.authWarningDesc}>
                  Anda harus masuk ke akun MiniRetail Anda untuk menambahkan produk ke keranjang belanja dan melakukan checkout.
                </p>
                <div className={styles.authWarningActions}>
                  <button className={styles.cancelBtn} onClick={() => setAuthWarningOpen(false)}>
                    Nanti Saja
                  </button>
                  <button 
                    className={styles.loginBtn}
                    onClick={() => {
                      setAuthWarningOpen(false);
                      navigate('/login');
                    }}
                  >
                    Login Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION HISTORY MODAL ── */}
      {historyOpen && (
        <div className={styles.modalOverlay} onClick={() => setHistoryOpen(false)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Riwayat Transaksi</h3>
              <button className={styles.closeDrawerBtn} onClick={() => setHistoryOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className={styles.modalContent}>
              {transactions.length === 0 ? (
                <div className={styles.noTrx}>
                  <p>Anda belum memiliki riwayat transaksi berbelanja.</p>
                </div>
              ) : (
                <div className={styles.trxList}>
                  {transactions.map((trx) => (
                    <div key={trx.id} className={styles.trxCard}>
                      <div className={styles.trxCardHeader}>
                        <div>
                          <span className={styles.trxId}>Nota #{trx.id}</span>
                          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                          <span className={styles.trxDate}>{new Date(trx.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <span className={styles.trxStatus}>{trx.status}</span>
                      </div>
                      <div className={styles.trxCardBody}>
                        {trx.detail && trx.detail.map((item, idx) => (
                          <div key={idx} className={styles.trxDetailItem}>
                            <div className={styles.trxProductImageWrapper}>
                              {item.foto ? (
                                <img src={getImageUrl(item.foto)} alt={item.nama_produk} className={styles.trxProductImage} />
                              ) : (
                                <span style={{ fontSize: '18px' }}>👕</span>
                              )}
                            </div>
                            <span className={styles.trxProductName}>{item.nama_produk}</span>
                            <span className={styles.trxProductQtyPrice}>
                              {item.jumlah} x {formatRupiah(item.harga_satuan)}
                            </span>
                          </div>
                        ))}
                        <div className={styles.trxAddress}>
                          <strong>Alamat Pengiriman:</strong> {trx.alamat}
                        </div>
                        <div className={styles.trxTotal}>
                          <span className={styles.trxTotalLabel}>Total Pembayaran</span>
                          <span className={styles.trxTotalVal}>{formatRupiah(trx.total_harga)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setHistoryOpen(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
