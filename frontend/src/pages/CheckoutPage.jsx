import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCart,
  checkoutCart,
  getTransactions
} from '../api/user';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { user, isAuth, logout } = useAuth();
  const navigate = useNavigate();

  // Data States
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  // Form States
  const [fullName, setFullName] = useState(user?.nama || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS'); // QRIS preselected in mockup

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  // Load cart data
  const loadCartData = async () => {
    try {
      setLoading(true);
      const cartRes = await getCart();
      const items = cartRes.data || [];
      
      setCart(items);
      setCartTotal(cartRes.total_harga || 0);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengambil data keranjang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      loadCartData();
    } else {
      navigate('/login');
    }
  }, [isAuth]);

  // Handle order submission
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap harus diisi');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (streetAddress.trim().length < 10) {
      setErrorMsg('Alamat lengkap harus minimal 10 karakter');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Keranjang belanja Anda kosong');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    try {
      setSubmitting(true);
      
      // Combine recipient name, address and payment method to store in the address field
      const combinedAddress = `${fullName.trim()} - ${streetAddress.trim()} (Metode: ${paymentMethod})`;
      
      await checkoutCart(combinedAddress);
      
      // Success feedback
      setFullName('');
      setStreetAddress('');
      setSuccessMsg('Pemesanan berhasil diproses! Terima kasih telah berbelanja.');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/');
      }, 3000);
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

  const ONGKIR = cart.length > 0 ? 10000 : 0;
  const TOTAL_ALL = cartTotal + ONGKIR;

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
          <button 
            className={styles.cartButton} 
            onClick={() => navigate('/keranjang')}
            aria-label="Keranjang Belanja"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.length > 0 && (
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
              <span>{user?.nama || 'Akun Saya'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {accountDropdownOpen && (
              <div className={styles.dropdownMenu} onMouseLeave={() => setAccountDropdownOpen(false)}>
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
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Toast Messages ── */}
      {successMsg && <div className={styles.successToast}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorToast}>{errorMsg}</div>}

      {/* ── MAIN CONTENT ── */}
      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Checkout</h1>

        {loading && cart.length === 0 ? (
          <div className={styles.loadingContainer}>
            <span className={styles.spinner} />
            <p>Memuat ringkasan checkout...</p>
          </div>
        ) : cart.length === 0 && !successMsg ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h2>Tidak ada barang untuk di-checkout</h2>
            <p>Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
            <button className={styles.startShoppingBtn} onClick={() => navigate('/')}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className={styles.checkoutLayout}>
            
            {/* Left Column: Delivery details form */}
            <div className={styles.formColumn}>
              <h2 className={styles.sectionTitle}>Detail Pengiriman</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nama Lengkap</label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Masukkan nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Alamat</label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="Masukkan alamat lengkap"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  required
                  minLength={10}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Metode Pembayaran</label>
                <input
                  type="text"
                  className={`${styles.textInput} ${styles.readOnlyInput}`}
                  placeholder="Pilih metode pembayaran"
                  value={paymentMethod}
                  readOnly
                />
              </div>

              <div className={styles.backShoppingRow}>
                <Link to="/keranjang" className={styles.backShoppingLink}>
                  &lt; Lanjut Belanja
                </Link>
              </div>
            </div>

            {/* Right Column: Checkout summary & Payment Selector */}
            <div className={styles.summaryColumn}>
              
              {/* Shopping Summary */}
              <div className={styles.summaryCard}>
                <h2 className={styles.cardTitle}>Ringkasan Belanja</h2>
                <div className={styles.cartItemsList}>
                  {cart.map((item) => (
                    <div key={item.id} className={styles.cartSummaryItem}>
                      <div className={styles.summaryItemInfo}>
                        <span className={styles.itemName}>{item.nama_produk} {item.jumlah}x</span>
                        <span className={styles.itemPrice}>{formatRupiah(item.harga * item.jumlah)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className={styles.ongkirRow}>
                  <span>Ongkir</span>
                  <span>{formatRupiah(ONGKIR)}</span>
                </div>
              </div>

              {/* Payment Methods selector */}
              <div className={styles.paymentMethodCard}>
                <h2 className={styles.cardTitle}>Metode Pembayaran</h2>
                
                <div className={styles.paymentOptionsList}>
                  <label className={styles.paymentOptionLabel}>
                    <span>COD</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className={styles.paymentRadio}
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    <span className={styles.customRadio} />
                  </label>

                  <label className={styles.paymentOptionLabel}>
                    <span>Transfer Bank</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className={styles.paymentRadio}
                      checked={paymentMethod === 'Transfer Bank'}
                      onChange={() => setPaymentMethod('Transfer Bank')}
                    />
                    <span className={styles.customRadio} />
                  </label>

                  <label className={styles.paymentOptionLabel}>
                    <span>QRIS</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      className={styles.paymentRadio}
                      checked={paymentMethod === 'QRIS'}
                      onChange={() => setPaymentMethod('QRIS')}
                    />
                    <span className={styles.customRadio} />
                  </label>
                </div>

                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span className={styles.totalVal}>{formatRupiah(TOTAL_ALL)}</span>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitOrderBtn}
                  disabled={submitting}
                >
                  {submitting ? <span className={styles.spinner} /> : 'Buat Pesanan'}
                </button>
              </div>

            </div>
          </form>
        )}
      </main>

      {/* ── TRANSACTION HISTORY MODAL ── */}
      {historyOpen && (
        <div className={styles.modalOverlay} onClick={() => setHistoryOpen(false)}>
          <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Riwayat Transaksi</h3>
              <button className={styles.closeModalBtn} onClick={() => setHistoryOpen(false)}>
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
