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

/**
 * Fetch all products
 * GET /api/produk
 */
export async function getProducts() {
  const res = await fetch(`${BASE_URL}/produk`, {
    method: 'GET'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat daftar produk');
  }
  return data;
}

/**
 * Fetch all categories
 * GET /api/kategori
 */
export async function getCategories() {
  const res = await fetch(`${BASE_URL}/kategori`, {
    method: 'GET'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat daftar kategori');
  }
  return data;
}

/**
 * Create a new product (Multipart Form Data)
 * POST /api/admin/produk
 */
export async function createProduct(formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/produk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal menambahkan produk');
  }
  return data;
}

/**
 * Update an existing product (Multipart Form Data)
 * POST /api/admin/produk/:id
 */
export async function updateProduct(id, formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/produk/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal memperbarui produk');
  }
  return data;
}

/**
 * Delete a product
 * DELETE /api/admin/produk/:id
 */
export async function deleteProduct(id) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/produk/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal menghapus produk');
  }
  return data;
}

/**
 * Create a new category
 * POST /api/admin/kategori
 */
export async function createCategory(categoryData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/kategori`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal menambahkan kategori');
  }
  return data;
}

/**
 * Update an existing category
 * PUT /api/admin/kategori/:id
 */
export async function updateCategory(id, categoryData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/kategori/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(categoryData)
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal memperbarui kategori');
  }
  return data;
}

/**
 * Delete a category
 * DELETE /api/admin/kategori/:id
 */
export async function deleteCategory(id) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/kategori/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal menghapus kategori');
  }
  return data;
}

/**
 * Get all transaksi (admin)
 * GET /api/admin/transaksi
 */
export async function getAdminTransaksi() {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/transaksi`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat data transaksi');
  }
  return data;
}

/**
 * Get detail satu transaksi (admin)
 * GET /api/admin/transaksi/:id
 */
export async function getAdminTransaksiDetail(id) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/admin/transaksi/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat detail transaksi');
  }
  return data;
}
