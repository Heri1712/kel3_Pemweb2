import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Placeholder home page shown after successful login.
 * You can replace this with your actual app content.
 */
export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 40px',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(99,102,241,0.1)',
        maxWidth: 400,
        width: '100%',
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          Selamat Datang!
        </h1>
        <p style={{ color: '#64748b', margin: '0 0 4px' }}>
          Login sebagai:
        </p>
        <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 24px' }}>
          {user?.nama} ({user?.role})
        </p>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 32px' }}>
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 32px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
