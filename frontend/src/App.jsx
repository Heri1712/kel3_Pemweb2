import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminLoginPage from './pages/AdminLogin';
import AdminDashboardPage from './pages/AdminDashboard';
import AdminProdukPage from './pages/AdminProduk';
import AdminKategoriPage from './pages/AdminKategori';
import AdminStokPage from './pages/AdminStok';
import AdminTransaksiPage from './pages/AdminTransaksi';
import HomePage from './pages/Home';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/produk"
            element={
              <AdminProtectedRoute>
                <AdminProdukPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/kategori"
            element={
              <AdminProtectedRoute>
                <AdminKategoriPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/stok"
            element={
              <AdminProtectedRoute>
                <AdminStokPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/transaksi"
            element={
              <AdminProtectedRoute>
                <AdminTransaksiPage />
              </AdminProtectedRoute>
            }
          />

          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

