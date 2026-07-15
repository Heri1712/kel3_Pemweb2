import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminTransaksi, getAdminTransaksiDetail } from '../api/admin';
import styles from './AdminTransaksi.module.css';

export default function AdminTransaksiPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [transaksi, setTransaksi] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(today.toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal detail
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      const res = await getAdminTransaksi();
      const data = res.data || [];
      setTransaksi(data);
      applyFilter(data, dateFrom, dateTo, statusFilter);
    } catch (err) {
      setError(err.message || 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransaksi();
  }, []);

  const applyFilter = (data, from, to, status) => {
    let result = [...data];

    if (from) {
      result = result.filter(t => {
        const trxDate = new Date(t.created_at);
        return trxDate >= new Date(from);
      });
    }
    if (to) {
      result = result.filter(t => {
        const trxDate = new Date(t.created_at);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59);
        return trxDate <= toDate;
      });
    }
    if (status) {
      result = result.filter(t =>
        String(t.status).toLowerCase() === String(status).toLowerCase()
      );
    }
    setFiltered(result);
  };

  const handleFilter = () => {
    applyFilter(transaksi, dateFrom, dateTo, statusFilter);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatRupiah = (val) =>
    'Rp. ' + Number(val).toLocaleString('id-ID');

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatDateInput = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  const getStatusClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'selesai') return styles.statusSelesai;
    if (s === 'dibatalkan') return styles.statusDibatalkan;
    if (s === 'pending') return styles.statusPending;
    return styles.statusLainnya;
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleRowClick = async (trx) => {
    setSelectedTrx(trx);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const res = await getAdminTransaksiDetail(trx.id);
      setDetailData(res.data);
    } catch {
      setDetailData({ ...trx, detail: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTrx(null);
    setDetailData(null);
  };

  // Unique statuses for dropdown
  const uniqueStatuses = [...new Set(transaksi.map(t => t.status).filter(Boolean))];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat Data Transaksi...</p>
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
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
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
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span>Kategori</span>
          </button>

          <button className={styles.menuItem} onClick={() => navigate('/admin/stok')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                <polyline points="2.32 6.16 12 11 21.68 6.16" />
                <line x1="12" y1="22.76" x2="12" y2="11" />
              </svg>
            </span>
            <span>Stok</span>
          </button>

          <button className={`${styles.menuItem} ${styles.menuItemActive}`} onClick={() => navigate('/admin/transaksi')}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
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
          <h1 className={styles.headerTitle}>Data Transaksi</h1>
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

        {/* Error */}
        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        {/* ── Filter Bar ── */}
        <div className={styles.filterBar}>
          {/* Date From */}
          <div className={styles.dateRangeWrapper}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
            <span>–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
            <span className={styles.calendarIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>

          {/* Status Dropdown */}
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>

          {/* Filter Button */}
          <button className={styles.filterBtn} onClick={handleFilter}>
            Filter
          </button>
        </div>

        {/* ── Transaksi Table ── */}
        <section className={styles.tableSection}>
          {filtered.length > 0 && (
            <p className={styles.resultInfo}>Menampilkan {filtered.length} transaksi</p>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Invoice</th>
                  <th>User</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Alamat</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <tr
                      key={item.id}
                      className={styles.tableRow}
                      onClick={() => handleRowClick(item)}
                      title="Klik untuk lihat detail"
                    >
                      <td className={styles.invoiceCell}>
                        INV-{String(index + 1).padStart(3, '0')}
                      </td>
                      <td>{item.nama_pelanggan || 'User'}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{formatRupiah(item.total_harga)}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.alamat || '-'}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                          {capitalize(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.tableRow}>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                      Tidak ada transaksi yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Modal Detail Transaksi ── */}
      {selectedTrx && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detail Transaksi</h2>
              <button className={styles.modalCloseBtn} onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {detailLoading ? (
              <div className={styles.modalSpinner}></div>
            ) : detailData ? (
              <>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Invoice</span>
                    <span className={styles.modalValue} style={{ color: '#2563eb' }}>
                      INV-{String(detailData.id).padStart(3, '0')}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Status</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(detailData.status)}`}>
                      {capitalize(detailData.status)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>User</span>
                    <span className={styles.modalValue}>{detailData.nama_pelanggan || '-'}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Email</span>
                    <span className={styles.modalValue}>{detailData.email || '-'}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Tanggal</span>
                    <span className={styles.modalValue}>{formatDate(detailData.created_at)}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Total</span>
                    <span className={styles.modalValue} style={{ color: '#059669' }}>
                      {formatRupiah(detailData.total_harga)}
                    </span>
                  </div>
                  <div className={styles.modalFieldFull}>
                    <span className={styles.modalLabel}>Alamat Pengiriman</span>
                    <span className={styles.modalValue}>{detailData.alamat || '-'}</span>
                  </div>
                </div>

                {/* Detail Items */}
                {detailData.detail && detailData.detail.length > 0 && (
                  <>
                    <p className={styles.detailTitle}>Item yang Dibeli</p>
                    <table className={styles.detailTable}>
                      <thead>
                        <tr>
                          <th>Nama Produk</th>
                          <th style={{ textAlign: 'right' }}>Jumlah</th>
                          <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                          <th style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.detail.map((d, idx) => (
                          <tr key={idx}>
                            <td>{d.nama_produk || '-'}</td>
                            <td style={{ textAlign: 'right' }}>{d.jumlah}</td>
                            <td style={{ textAlign: 'right' }}>{formatRupiah(d.harga_satuan)}</td>
                            <td style={{ textAlign: 'right' }}>{formatRupiah(Number(d.harga_satuan) * Number(d.jumlah))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
