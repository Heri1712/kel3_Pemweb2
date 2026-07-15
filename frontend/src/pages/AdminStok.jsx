import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts, updateProduct } from '../api/admin';
import styles from './AdminStok.module.css';

export default function AdminStokPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Per-row adjust amount state: { [productId]: adjustValue }
  const [adjustValues, setAdjustValues] = useState({});
  // Per-row loading state: { [productId]: true|false }
  const [updatingIds, setUpdatingIds] = useState({});

  // Global messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      const data = res.data || [];
      setProducts(data);
      // Initialize adjust values to 0 for all products
      const initAdjust = {};
      data.forEach(p => { initAdjust[p.id] = 0; });
      setAdjustValues(initAdjust);
    } catch (err) {
      setError(err.message || 'Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getImageUrl = (foto) => {
    if (!foto || foto === 'default.png') return '';
    if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
    const backendUrl = BASE_URL.replace('/api', '');
    return `${backendUrl}/uploads/produk/${foto}`;
  };

  // Handle input change for a row's adjust amount
  const handleAdjustChange = (productId, value) => {
    const parsed = parseInt(value, 10);
    setAdjustValues(prev => ({
      ...prev,
      [productId]: isNaN(parsed) ? 0 : parsed
    }));
  };

  // Quickly add predefined amount
  const handleQuickAdd = (productId, amount) => {
    setAdjustValues(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + amount
    }));
  };

  // Update stok for a product: currentStok + adjustValue
  const handleUpdate = async (product) => {
    const adjustAmount = adjustValues[product.id] || 0;
    const newStok = parseInt(product.stok, 10) + adjustAmount;

    if (newStok < 0) {
      setErrorMsg(`Stok "${product.nama_produk}" tidak boleh negatif (hasil: ${newStok}).`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    try {
      setUpdatingIds(prev => ({ ...prev, [product.id]: true }));
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('stok', newStok);

      await updateProduct(product.id, formData);

      setSuccessMsg(`Stok "${product.nama_produk}" berhasil diperbarui menjadi ${newStok}.`);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reload products to get fresh data
      const res = await getProducts();
      const data = res.data || [];
      setProducts(data);
      // Reset adjust value for this product
      setAdjustValues(prev => ({ ...prev, [product.id]: 0 }));
    } catch (err) {
      setErrorMsg(err.message || `Gagal memperbarui stok "${product.nama_produk}"`);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setUpdatingIds(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat Halaman Kelola Stok...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h3>Terjadi Kesalahan</h3>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button onClick={() => window.location.reload()}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>MiniRetail</span>
            <span className={styles.brandSubtitle}>Admin</span>
          </div>
        </div>

        <nav className={styles.menu}>
          <button className={styles.menuItem} onClick={() => navigate('/admin/dashboard')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7" /><path d="M9 22V12h6v10" />
              </svg>
            </span>
            <span>Dashboard</span>
          </button>

          <button className={styles.menuItem} onClick={() => navigate('/admin/produk')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <span>Produk</span>
          </button>

          <button className={styles.menuItem} onClick={() => navigate('/admin/kategori')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span>Kategori</span>
          </button>

          <button className={`${styles.menuItem} ${styles.menuItemActive}`} onClick={() => navigate('/admin/stok')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                <polyline points="2.32 6.16 12 11 21.68 6.16" />
                <line x1="12" y1="22.76" x2="12" y2="11" />
              </svg>
            </span>
            <span>Stok</span>
          </button>

          <button className={styles.menuItem} onClick={() => navigate('/admin/transaksi')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
            <span>Transaksi</span>
          </button>

          <button className={styles.menuItem} onClick={() => alert('Fitur Kelola User akan datang!')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>User</span>
          </button>

          <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Kelola Stok</h1>
          <div className={styles.userProfile}>
            <span className={styles.userIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
              </svg>
            </span>
            <span>{user?.nama || 'Admin'}</span>
            <span className={styles.chevronIcon}>▾</span>
          </div>
        </header>

        {/* Alerts */}
        {successMsg && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMsg}</div>}
        {errorMsg && <div className={`${styles.alert} ${styles.alertError}`}>{errorMsg}</div>}

        {/* Stok Produk Table */}
        <section className={styles.tableSection}>
          <h2 className={styles.tableTitle}>Stok Produk</h2>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.imageCell}>Foto</th>
                  <th>Nama Produk</th>
                  <th>Stok Saat Ini</th>
                  <th className={styles.adjustCell}>Tambah / Kurangi</th>
                  <th className={styles.updateCell}>Update</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id} className={styles.tableRow}>
                      {/* Foto */}
                      <td className={styles.imageCell}>
                        {getImageUrl(item.foto) ? (
                          <img
                            src={getImageUrl(item.foto)}
                            alt={item.nama_produk}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </td>

                      {/* Nama Produk */}
                      <td style={{ fontWeight: 700 }}>{item.nama_produk}</td>

                      {/* Stok Saat Ini */}
                      <td>
                        <span className={styles.stokValue}>{item.stok}</span>
                      </td>

                      {/* Tambah / Kurangi Controls */}
                      <td className={styles.adjustCell}>
                        <div className={styles.adjustControls}>
                          <button
                            className={`${styles.adjustBtn} ${styles.subtractBtn}`}
                            onClick={() => handleQuickAdd(item.id, -1)}
                            title="Kurangi 1"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className={styles.adjustInput}
                            value={adjustValues[item.id] ?? 0}
                            onChange={(e) => handleAdjustChange(item.id, e.target.value)}
                          />
                          <button
                            className={`${styles.adjustBtn} ${styles.addBtn}`}
                            onClick={() => handleQuickAdd(item.id, 1)}
                            title="Tambah 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Update Button */}
                      <td className={styles.updateCell}>
                        <button
                          className={styles.updateBtn}
                          onClick={() => handleUpdate(item)}
                          disabled={updatingIds[item.id] || adjustValues[item.id] === 0}
                          title={`Stok baru: ${parseInt(item.stok, 10) + (adjustValues[item.id] || 0)}`}
                        >
                          {updatingIds[item.id] ? 'Saving...' : 'Update'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.tableRow}>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      Belum ada produk terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
