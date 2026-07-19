import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCart,
  deleteCartItem,
  updateCartItem,
  checkoutCart,
  getTransactions
} from '../api/user';
import styles from './CartPage.module.css';

export default function CartPage() {
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  // Form States
  const [address, setAddress] = useState('');

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  // Load cart data
  const loadCartData = async () => {
    try {
      setLoading(true);
      const cartRes = await getCart();
      setCart(cartRes.data || []);
      setCartTotal(cartRes.total_harga || 0);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengambil keranjang belanja');
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

  // Handle updating quantity
  const handleUpdateQuantity = async (cartId, currentQty, delta) => {
    const newQty = Number(currentQty) + delta;
    if (newQty < 1) return;

    // Find product stock in local cart items
    const item = cart.find(c => c.id === cartId);
    if (item && newQty > Number(item.stok)) {
      setErrorMsg(`Stok tidak mencukupi. Maksimum pembelian: ${item.stok}`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    try {
      setSubmitting(true);
      await updateCartItem(cartId, newQty);
      await loadCartData();
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
      setSuccessMsg('Produk berhasil dihapus dari keranjang');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(''), 3000);
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

  // Fixed Ongkir matching screenshot
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
          {/* Cart Icon (active link to current page) */}
          <button 
            className={`${styles.cartButton} ${styles.cartButtonActive}`} 
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
        <h1 className={styles.pageTitle}>Keranjang Belanja</h1>

        {loading && cart.length === 0 ? (
          <div className={styles.loadingContainer}>
            <span className={styles.spinner} />
            <p>Memuat keranjang belanja...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Keranjang belanja Anda kosong</h2>
            <p>Anda belum menambahkan produk ke keranjang belanja.</p>
            <button className={styles.startShoppingBtn} onClick={() => navigate('/')}>
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Table Area */}
            <div className={styles.tableCard}>
              <table className={styles.cartTable}>
                <thead>
                  <tr>
                    <th className={styles.colProduk}>Produk</th>
                    <th className={styles.colHarga}>Harga</th>
                    <th className={styles.colJumlah}>Jumlah</th>
                    <th className={styles.colSubtotal}>Subtotal</th>
                    <th className={styles.colAksi}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.cellProduk}>
                        <div className={styles.productCellInfo}>
                          <div className={styles.productImageWrapper}>
                            {item.foto ? (
                              <img 
                                src={getImageUrl(item.foto)} 
                                alt={item.nama_produk} 
                                className={styles.productImage} 
                              />
                            ) : (
                              <span style={{ fontSize: '24px' }}>👕</span>
                            )}
                          </div>
                          <span className={styles.productName}>{item.nama_produk}</span>
                        </div>
                      </td>
                      <td className={styles.cellHarga}>
                        {formatRupiah(item.harga)}
                      </td>
                      <td className={styles.cellJumlah}>
                        <div className={styles.counterBox}>
                          <button 
                            className={styles.counterBtn} 
                            onClick={() => handleUpdateQuantity(item.id, item.jumlah, -1)}
                            disabled={Number(item.jumlah) <= 1 || submitting}
                          >
                            —
                          </button>
                          <span className={styles.counterVal}>{item.jumlah}</span>
                          <button 
                            className={styles.counterBtn} 
                            onClick={() => handleUpdateQuantity(item.id, item.jumlah, 1)}
                            disabled={Number(item.jumlah) >= Number(item.stok) || submitting}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={styles.cellSubtotal}>
                        {formatRupiah(item.harga * item.jumlah)}
                      </td>
                      <td className={styles.cellAksi}>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteItem(item.id)}
                          title="Hapus produk"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Back to Shopping & Summary Section */}
            <div className={styles.bottomSection}>
              <Link to="/" className={styles.backShoppingLink}>
                &lt; Lanjut Belanja
              </Link>

              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Ringkasan Belanja</h2>
                
                <div className={styles.summaryRow}>
                  <span>Subtotal ({cart.reduce((sum, item) => sum + Number(item.jumlah), 0)} Produk)</span>
                  <strong>{formatRupiah(cartTotal)}</strong>
                </div>

                <div className={styles.summaryRow}>
                  <span>Ongkir</span>
                  <strong>{formatRupiah(ONGKIR)}</strong>
                </div>

                <hr className={styles.separator} />

                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span className={styles.totalVal}>{formatRupiah(TOTAL_ALL)}</span>
                </div>

                <button 
                  className={styles.checkoutSubmitBtn}
                  onClick={() => navigate('/checkout')}
                  disabled={submitting}
                >
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
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
