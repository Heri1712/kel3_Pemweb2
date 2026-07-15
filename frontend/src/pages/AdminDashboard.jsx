import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard } from '../api/admin';
import styles from './AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatRupiah = (val) => {
    return 'Rp. ' + Number(val).toLocaleString('id-ID');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'selesai') return styles.statusSelesai;
    if (s === 'dibatalkan') return styles.statusDibatalkan;
    return styles.statusPending;
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat Dashboard Admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h3>Terjadi Kesalahan</h3>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.userProfile} style={{ border: '1px solid #d1d5db', marginTop: 12 }}>
          Coba Lagi
        </button>
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
          <button className={`${styles.menuItem} ${styles.menuItemActive}`}>
            <span className={styles.menuIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7" />
                <path d="M9 22V12h6v10" />
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

      {/* ── Main Content Area ── */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Dashboard</h1>

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

        {/* Metrics Grid */}
        <section className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h4 className={styles.metricTitle}>Total Produk</h4>
            <span className={styles.metricValue}>{data?.total_produk ?? 0}</span>
          </div>
          <div className={styles.metricCard}>
            <h4 className={styles.metricTitle}>Total Kategori</h4>
            <span className={styles.metricValue}>{data?.total_kategori ?? 0}</span>
          </div>
          <div className={styles.metricCard}>
            <h4 className={styles.metricTitle}>Total Stok</h4>
            <span className={styles.metricValue}>{data?.total_stok ?? 0}</span>
          </div>
          <div className={styles.metricCard}>
            <h4 className={styles.metricTitle}>Total Transaksi</h4>
            <span className={styles.metricValue}>{data?.total_transaksi ?? 0}</span>
          </div>
        </section>

        {/* Chart Section */}
        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            Penjualan (7 Hari Terakhir)
          </div>
          <div className={styles.chartBody}>
            <div className={styles.chartWrapper}>
              <svg width="100%" height="100%" viewBox="0 0 800 220" preserveAspectRatio="none">
                <defs>
                  {/* Purple Area Gradient */}
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Coral Area Gradient */}
                  <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f87171" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="60" y1="30" x2="760" y2="30" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="60" y1="80" x2="760" y2="80" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="60" y1="130" x2="760" y2="130" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="60" y1="180" x2="760" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="50" y="34" fill="#94a3b8" fontSize="11" textAnchor="end">3,000</text>
                <text x="50" y="84" fill="#94a3b8" fontSize="11" textAnchor="end">2,000</text>
                <text x="50" y="134" fill="#94a3b8" fontSize="11" textAnchor="end">1,000</text>
                <text x="50" y="184" fill="#94a3b8" fontSize="11" textAnchor="end">0</text>

                {/* Area under purple line */}
                <path d="M 80,180 L 80,143 L 170,116 L 260,110 L 350,134 L 440,134 L 530,98 L 620,74 L 710,62 L 710,180 Z" fill="url(#purpleGrad)" />

                {/* Area under coral line */}
                <path d="M 80,180 L 80,170 L 170,152 L 260,164 L 350,140 L 440,146 L 530,122 L 620,110 L 710,98 L 710,180 Z" fill="url(#coralGrad)" />

                {/* Purple Line */}
                <path d="M 80,143 L 170,116 L 260,110 L 350,134 L 440,134 L 530,98 L 620,74 L 710,62" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Coral Line */}
                <path d="M 80,170 L 170,152 L 260,164 L 350,140 L 440,146 L 530,122 L 620,110 L 710,98" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Interactive circles/nodes for Purple Line */}
                <circle cx="80" cy="143" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="170" cy="116" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="260" cy="110" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="350" cy="134" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="440" cy="134" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="530" cy="98" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="620" cy="74" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="710" cy="62" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />

                {/* Interactive circles/nodes for Coral Line */}
                <circle cx="80" cy="170" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="170" cy="152" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="260" cy="164" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="350" cy="140" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="440" cy="146" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="530" cy="122" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="620" cy="110" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="710" cy="98" r="4" fill="#f87171" stroke="#ffffff" strokeWidth="1.5" />

                {/* X-Axis Labels */}
                <text x="80" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Jan</text>
                <text x="170" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Feb</text>
                <text x="260" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Mar</text>
                <text x="350" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Apr</text>
                <text x="440" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">May</text>
                <text x="530" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Jun</text>
                <text x="620" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Jul</text>
                <text x="710" y="210" fill="#94a3b8" fontSize="11" textAnchor="middle">Aug</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Transactions Table Section */}
        <section className={styles.tableSection}>
          <h2 className={styles.tableTitle}>Transaksi Terbaru</h2>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Invoice</th>
                  <th>User</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.transaksi_terbaru && data.transaksi_terbaru.length > 0 ? (
                  data.transaksi_terbaru.map((item) => (
                    <tr key={item.id} className={styles.tableRow}>
                      <td>INV-2026-{String(item.id).padStart(3, '0')}</td>
                      <td>{item.nama_pelanggan || 'User'}</td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>{formatRupiah(item.total_harga)}</td>
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {capitalize(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.tableRow}>
                    <td colSpan="5" style={{ textAlignment: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      Belum ada transaksi terbaru.
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