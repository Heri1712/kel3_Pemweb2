import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/admin';
import styles from './AdminKategori.module.css';

export default function AdminKategoriPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [namaKategori, setNamaKategori] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs
  const formRef = useRef(null);

  // Load all categories
  const loadCategoriesData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat kategori dari REST API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setNamaKategori('');
  };

  const handleAddClick = () => {
    resetForm();
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditClick = (category) => {
    setEditMode(true);
    setEditId(category.id);
    setNamaKategori(category.nama_kategori || '');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = async (category) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"?`)) {
      try {
        setErrorMsg('');
        setSuccessMsg('');
        const res = await deleteCategory(category.id);
        setSuccessMsg(res.message || 'Kategori berhasil dihapus');
        // Reload data
        const catRes = await getCategories();
        setCategories(catRes.data || []);
        // Reset form if deleted category was being edited
        if (editId === category.id) {
          resetForm();
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        setErrorMsg(err.message || 'Gagal menghapus kategori. Kategori ini mungkin sedang digunakan oleh produk.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!namaKategori.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editMode) {
        res = await updateCategory(editId, { nama_kategori: namaKategori.trim() });
        setSuccessMsg(res.message || 'Kategori berhasil diperbarui');
      } else {
        res = await createCategory({ nama_kategori: namaKategori.trim() });
        setSuccessMsg(res.message || 'Kategori berhasil ditambahkan');
      }

      // Reload categories list
      const catRes = await getCategories();
      setCategories(catRes.data || []);

      // Reset form
      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat Halaman Kelola Kategori...</p>
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
          <button className={styles.menuItem} onClick={() => navigate('/admin/dashboard')}>
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

          <button className={`${styles.menuItem} ${styles.menuItemActive}`} onClick={() => navigate('/admin/kategori')}>
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
          <h1 className={styles.headerTitle}>Kelola Kategori</h1>

          <div className={styles.headerRight}>
            <button className={styles.addButton} onClick={handleAddClick}>
              <span>+ Tambah Kategori</span>
            </button>

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
          </div>
        </header>

        {/* Alerts */}
        {successMsg && <div className={`${styles.alert} ${styles.alertSuccess}`}>{successMsg}</div>}
        {errorMsg && <div className={`${styles.alert} ${styles.alertError}`}>{errorMsg}</div>}

        {/* Registered Categories Card */}
        <section className={styles.tableSection}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.noCell}>No</th>
                  <th>Nama Kategori</th>
                  <th className={styles.actionCell}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((item, index) => (
                    <tr key={item.id} className={styles.tableRow}>
                      <td className={styles.noCell}>{index + 1}</td>
                      <td>{item.nama_kategori}</td>
                      <td className={styles.actionCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.iconBtn} ${styles.editIcon}`}
                            onClick={() => handleEditClick(item)}
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.deleteIcon}`}
                            onClick={() => handleDeleteClick(item)}
                            title="Hapus"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.tableRow}>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      Belum ada kategori terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add/Edit Category Form Card */}
        <section className={styles.formSection} ref={formRef}>
          <h2 className={styles.formTitle}>Form Tambah / Edit Kategori</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Kategori</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Masukkan nama kategori"
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                required
              />
            </div>

            {/* Form Buttons */}
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={resetForm}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
