import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(form);
      login(data.token, data.data);
      // Redirect based on role
      if (data.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Logo / Brand */}
      <div className={styles.brand}>
        {/* <span className={styles.brandIcon}>🛒</span> */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span className={styles.brandName}>Toko Saku</span>
      </div>

      <div className={styles.card}>
        {/* Card header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Selamat Datang Kembali! 👋</p>
        </div>

        {error && (
          <div className={styles.errorBox} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Email field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="login-email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Masukan Email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="login-password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukan Password"
                value={form.password}
                onChange={handleChange}
                className={styles.input}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password visibility"
              >
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

          <button
            id="login-submit-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          Belum punya akun?{' '}
          <Link to="/register" className={styles.switchLink}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}