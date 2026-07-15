import { getToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

/**
 * Fetch admin dashboard statistics
 * GET /api/admin/dashboard
 */
export async function getAdminDashboard() {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat data dashboard');
  }
  return data;
}
