import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../api/admin';
import {
  getCart,
  addToCart,
  deleteCartItem,
  checkoutCart,
  getTransactions
} from '../api/user';
import styles from './ProductDetail.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user, isAuth, logout } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // UI & Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // UI Interactive States
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [authWarningOpen, setAuthWarningOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  // Form & Quantity States
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  // Load single product details
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/produk/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat detail produk');
      }
      setProduct(data.data || null);
      // Reset quantity to 1 when product changes
      setQuantity(1);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat detail produk');
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
    loadProduct();
  }, [id]);

  useEffect(() => {
    loadCartData();
  }, [isAuth]);

  // Handle quantity modification
  const handleQuantityChange = (val) => {
    if (!product) return;
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= Number(product.stok)) {
      setQuantity(newQty);
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!isAuth) {
      setAuthWarningOpen(true);
      return;
    }
    if (!product || Number(product.stok) === 0) return;

    try {
      setSubmitting(true);
      await addToCart(product.id, quantity);
      
      // Update local cart state
      await loadCartData();
      setSuccessMsg(`"${product.nama_produk}" (${quantity} pcs) berhasil dimasukkan ke keranjang`);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle "Beli Sekarang"
  const handleBuyNow = async () => {
    if (!isAuth) {
      setAuthWarningOpen(true);
      return;
    }
    if (!product || Number(product.stok) === 0) return;

    try {
      setSubmitting(true);
      // Add to cart with current quantity
      await addToCart(product.id, quantity);
      await loadCartData();
      
      // Open checkout modal directly
      setCheckoutOpen(true);
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

  // Handle open checkout
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
      
      // Reload cart (now empty) and product (with updated stock)
      await Promise.all([loadCartData(), loadProduct()]);
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle search redirection
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/', { state: { search: searchQuery } });
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

  return (
    <div className={styles.container}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.brand} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>Mini</span>
          <span className={styles.brandHighlight}>Retail</span>
        </div>

        <form onSubmit={handleSearchSubmit} className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchSubmitBtn}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className={styles.navActions}>
          {/* Cart Icon */}
          <button 
            className={styles.cartButton} 
            onClick={() => isAuth ? navigate('/keranjang') : setAuthWarningOpen(true)}
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

      {/* ── Toast Messages ── */}
      {successMsg && (
        <div className={styles.successToast}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className={styles.errorToast}>
          {errorMsg}
        </div>
      )}

      {/* ── DETAIL PRODUCT CONTENT ── */}
      <main className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <span className={styles.spinner} />
            <p>Memuat detail produk...</p>
          </div>
        ) : !product ? (
          <div className={styles.notFoundContainer}>
            <div className={styles.notFoundIcon}>⚠️</div>
            <h2>Produk Tidak Ditemukan</h2>
            <p>Produk yang Anda cari tidak ada atau telah dihapus.</p>
            <button className={styles.backHomeBtn} onClick={() => navigate('/')}>
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <div className={styles.productDetailsWrapper}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <span className={styles.breadcrumbLink} onClick={() => navigate('/')}>Beranda</span>
              <span className={styles.breadcrumbSeparator}>&gt;</span>
              <span className={styles.breadcrumbActive}>{product.nama_kategori || 'Fashion'}</span>
            </div>

            {/* Product Sheet Grid */}
            <div className={styles.productSheet}>
              {/* Left Column: Image wrapper */}
              <div className={styles.imageColumn}>
                <div className={styles.productImageWrapper}>
                  {product.foto ? (
                    <img 
                      src={getImageUrl(product.foto)} 
                      alt={product.nama_produk} 
                      className={styles.productImage}
                    />
                  ) : (
                    <span className={styles.noImagePlaceholder}>👕</span>
                  )}
                </div>
              </div>

              {/* Right Column: Information Sheet */}
              <div className={styles.infoColumn}>
                <h1 className={styles.productTitle}>{product.nama_produk}</h1>
                <div className={styles.productPrice}>{formatRupiah(product.harga)}</div>
                
                <div className={styles.stockInfo}>
                  Stok : {product.stok}
                </div>

                {/* Star Ratings */}
                <div className={styles.ratingsContainer}>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                  <span className={styles.star}>★</span>
                </div>

                {/* Description */}
                <p className={styles.productDescription}>
                  {product.deskripsi || 'Tidak ada deskripsi untuk produk ini.'}
                </p>

                {/* Quantity selection */}
                <div className={styles.quantitySection}>
                  <span className={styles.quantityLabel}>Jumlah</span>
                  <div className={styles.quantityRow}>
                    <div className={styles.counterBox}>
                      <button 
                        className={styles.counterBtn} 
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        —
                      </button>
                      <span className={styles.counterVal}>{quantity}</span>
                      <button 
                        className={styles.counterBtn} 
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= Number(product.stok)}
                      >
                        +
                      </button>
                    </div>
                    
                    <span className={Number(product.stok) > 0 ? styles.inStockText : styles.outOfStockText}>
                      {Number(product.stok) > 0 ? 'Tersedia' : 'Stok Habis'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.addToCartBtn} 
                    onClick={handleAddToCart}
                    disabled={Number(product.stok) === 0 || submitting}
                  >
                    Tambahkan ke Keranjang
                  </button>
                  
                  <button 
                    className={styles.buyNowBtn} 
                    onClick={handleBuyNow}
                    disabled={Number(product.stok) === 0 || submitting}
                  >
                    Beli Sekarang
                  </button>
                </div>

                {/* Details list table */}
                <table className={styles.specTable}>
                  <tbody>
                    <tr>
                      <td className={styles.specLabel}>Kategori</td>
                      <td className={styles.specValue}>{product.nama_kategori || 'Umum'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>



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

      {/* ── AUTH WARNING MODAL ── */}
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
