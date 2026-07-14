const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.messages?.error || data.message || 'Login gagal');
  return data;
}

/**
 * Register user
 * POST /api/auth/register
 */
export async function registerUser({ nama, email, password, konfirmasi_password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, email, password, konfirmasi_password }),
  });
  const data = await res.json();
  if (!res.ok) {
    // CI4 validation errors come as object
    if (data.messages && typeof data.messages === 'object') {
      const msgs = Object.values(data.messages).join(', ');
      throw new Error(msgs);
    }
    throw new Error(data.message || 'Registrasi gagal');
  }
  return data;
}

/**
 * Save JWT token and user data to localStorage
 */
export function saveSession(token, user) {
  localStorage.setItem('jwt_token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Get current token
 */
export function getToken() {
  return localStorage.getItem('jwt_token');
}

/**
 * Get current user
 */
export function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

/**
 * Clear session (logout)
 */
export function clearSession() {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}
