import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from '../api/admin';
import styles from './AdminProduk.module.css';

export default function AdminProdukPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [namaProduk, setNamaProduk] = useState('');
  const [idKategori, setIdKategori] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

  // Load all products and categories
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data dari REST API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getImageUrl = (foto) => {
    if (!foto || foto === 'default.png') return '';
    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto;
    }
    const backendUrl = BASE_URL.replace('/api', '');
    return `${backendUrl}/uploads/produk/${foto}`;
  };

  const formatRupiah = (val) => {
    if (!val) return '0';
    return Number(val).toLocaleString('id-ID');
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setNamaProduk('');
    setIdKategori('');
    setHarga('');
    setStok('');
    setDeskripsi('');
    setFotoFile(null);
    setFotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddClick = () => {
    resetForm();
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditClick = (product) => {
    setEditMode(true);
    setEditId(product.id);
    setNamaProduk(product.nama_produk || '');
    setIdKategori(product.id_kategori || '');
    setHarga(product.harga || '');
    setStok(product.stok || '');
    setDeskripsi(product.deskripsi || '');
    setFotoFile(null);
    setFotoPreview(getImageUrl(product.foto));
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = async (product) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${product.nama_produk}"?`)) {
      try {
        setErrorMsg('');
        setSuccessMsg('');
        const res = await deleteProduct(product.id);
        setSuccessMsg(res.message || 'Produk berhasil dihapus');
        // Reload data
        const prodRes = await getProducts();
        setProducts(prodRes.data || []);
        // Reset form if deleted product was being edited
        if (editId === product.id) {
          resetForm();
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        setErrorMsg(err.message || 'Gagal menghapus produk');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!namaProduk || !idKategori || !harga || !stok || !deskripsi) {
      setErrorMsg('Semua field wajib diisi kecuali Gambar.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('nama_produk', namaProduk);
      formData.append('id_kategori', idKategori);
      formData.append('harga', harga);
      formData.append('stok', stok);
      formData.append('deskripsi', deskripsi);
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      let res;
      if (editMode) {
        res = await updateProduct(editId, formData);
        setSuccessMsg(res.message || 'Produk berhasil diperbarui');
      } else {
        res = await createProduct(formData);
        setSuccessMsg(res.message || 'Produk berhasil ditambahkan');
      }

      // Reload products list
      const prodRes = await getProducts();
      setProducts(prodRes.data || []);

      // Reset form
      resetForm();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan produk');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat Halaman Kelola Produk...</p>
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

          <button className={`${styles.menuItem} ${styles.menuItemActive}`} onClick={() => navigate('/admin/produk')}>
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
          <h1 className={styles.headerTitle}>Kelola Produk</h1>

          <div className={styles.headerRight}>
            <button className={styles.addButton} onClick={handleAddClick}>
              <span>+ Tambah Produk</span>
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

        {/* Registered Products Card */}
        <section className={styles.tableSection}>
          <h2 className={styles.tableTitle}>Produk Terdaftar</h2>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.imageCell}>Foto</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Harga</th>
                  <th>Stock</th>
                  <th className={styles.actionCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id} className={styles.tableRow}>
                      <td className={styles.imageCell}>
                        {getImageUrl(item.foto) ? (
                          <img
                            src={getImageUrl(item.foto)}
                            alt={item.nama_produk}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.productImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td>{item.nama_produk}</td>
                      <td>{item.nama_kategori || 'Tanpa Kategori'}</td>
                      <td>{formatRupiah(item.harga)}</td>
                      <td>{item.stok}</td>
                      <td className={styles.actionCell}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteClick(item)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className={styles.tableRow}>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      Belum ada produk terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add/Edit Product Form Card */}
        <section className={styles.formSection} ref={formRef}>
          <h2 className={styles.formTitle}>
            {editMode ? 'Form Edit Produk' : 'Form Tambah/Edit Produk'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              {/* Left Column: Nama Produk & Harga & Deskripsi */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nama Produk</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Masukkan nama produk"
                    value={namaProduk}
                    onChange={(e) => setNamaProduk(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Masukkan harga produk"
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Deskripsi</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Masukkan deskripsi produk"
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Right Column: Kategori & Stok & Gambar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kategori</label>
                  <select
                    className={styles.select}
                    value={idKategori}
                    onChange={(e) => setIdKategori(e.target.value)}
                    required
                  >
                    <option value="" disabled>Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Stok</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Masukkan stok produk"
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Gambar</label>
                  <div className={styles.uploadContainer} onClick={triggerFileInput}>
                    <div className={styles.uploadPreview}>
                      {fotoPreview ? (
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          className={styles.uploadPreviewImg}
                        />
                      ) : (
                        <div className={styles.uploadIcon}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className={styles.uploadLabelText}>
                      {submitting && (
                        <svg className={styles.uploadIconSpinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                        </svg>
                      )}
                      <span>Upload Gambar</span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className={styles.fileInput}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className={styles.formActions}>
              {editMode && (
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : editMode ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
