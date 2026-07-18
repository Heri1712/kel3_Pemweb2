import { getToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/kel3_Pemweb2/public/api';

/**
 * Fetch all items in user's cart
 * GET /api/keranjang
 */
export async function getCart() {
  const token = getToken();
  if (!token) throw new Error('Silakan login terlebih dahulu');

  const res = await fetch(`${BASE_URL}/keranjang`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat keranjang belanja');
  }
  return data;
}

/**
 * Add a product to cart
 * POST /api/keranjang
 * body: { id_produk: number, jumlah: number }
 */
export async function addToCart(id_produk, jumlah) {
  const token = getToken();
  if (!token) throw new Error('Silakan login terlebih dahulu');

  const res = await fetch(`${BASE_URL}/keranjang`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ id_produk, jumlah })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal menambahkan produk ke keranjang');
  }
  return data;
}

/**
 * Delete an item from the cart
 * DELETE /api/keranjang/:id
 */
export async function deleteCartItem(id) {
  const token = getToken();
  if (!token) throw new Error('Silakan login terlebih dahulu');

  const res = await fetch(`${BASE_URL}/keranjang/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal menghapus item dari keranjang');
  }
  return data;
}

/**
 * Checkout the cart
 * POST /api/checkout
 * body: { alamat: string }
 */
export async function checkoutCart(alamat) {
  const token = getToken();
  if (!token) throw new Error('Silakan login terlebih dahulu');

  const res = await fetch(`${BASE_URL}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ alamat })
  });

  const data = await res.json();
  if (!res.ok) {
    if (data.messages && typeof data.messages === 'object') {
      throw new Error(Object.values(data.messages).join(', '));
    }
    throw new Error(data.message || 'Gagal melakukan checkout');
  }
  return data;
}

/**
 * Get user transaction history
 * GET /api/transaksi
 */
export async function getTransactions() {
  const token = getToken();
  if (!token) throw new Error('Silakan login terlebih dahulu');

  const res = await fetch(`${BASE_URL}/transaksi`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat riwayat transaksi');
  }
  return data;
}
