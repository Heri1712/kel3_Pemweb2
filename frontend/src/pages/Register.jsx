import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import styles from './Register.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasi_password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.nama.trim() || form.nama.length < 3) {
      return 'Nama lengkap minimal 3 karakter.';
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Format email tidak valid.';
    }
    if (form.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }
    if (form.password !== form.konfirmasi_password) {
      return 'Konfirmasi password tidak cocok.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await registerUser(form);
      setSuccess('Akun berhasil dibuat! Mengarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Brand */}
      <div className={styles.brand}>
        {/* <span className={styles.brandIcon}>🛒</span> */}
        {/* <span className={styles.brandName}>Mini Retail</span> */}
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Buat Akun Baru</h1>
          <p className={styles.subtitle}>Daftar untuk mulai berbelanja </p>
        </div>

        {error && (
          <div className={styles.errorBox} role="alert">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className={styles.successBox} role="status">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Nama Lengkap */}
          <div className={styles.fieldGroup}>
            <label htmlFor="reg-nama" className={styles.label}>Nama Lengkap</label>
            <div className={styles.inputWrapper}>
              <input
                id="reg-nama"
                name="nama"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={handleChange}
                className={styles.input}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label htmlFor="reg-email" className={styles.label}>E-mail</label>
            <div className={styles.inputWrapper}>
              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label htmlFor="reg-password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                autoComplete="new-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)} aria-label="Toggle password">
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className={styles.fieldGroup}>
            <label htmlFor="reg-confirm" className={styles.label}>Konfirmasi Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="reg-confirm"
                name="konfirmasi_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Konfirmasi password"
                value={form.konfirmasi_password}
                onChange={handleChange}
                className={`${styles.input} ${form.konfirmasi_password && form.password !== form.konfirmasi_password
                  ? styles.inputError
                  : ''
                  }`}
                autoComplete="new-password"
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                {showConfirm ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {form.konfirmasi_password && form.password !== form.konfirmasi_password && (
              <span className={styles.matchError}>Password tidak cocok</span>
            )}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : 'DAFTAR'}
          </button>
        </form>

        <p className={styles.switchText}>
          Sudah punya akun?{' '}
          <Link to="/login" className={styles.switchLink}>
            Login
          </Link>
        </p>
      </div>
    </div >
  );
}
