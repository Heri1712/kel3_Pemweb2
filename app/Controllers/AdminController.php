<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\ProdukModel;
use App\Models\KategoriModel;
use App\Models\TransaksiModel;
use CodeIgniter\API\ResponseTrait;

class AdminController extends BaseController
{
    use ResponseTrait;

    /**
     * Middleware: cek apakah user sudah login dan berperan sebagai admin.
     */
    private function isAdmin(): bool
    {
        return session()->get('isLoggedIn') && session()->get('userRole') === 'admin';
    }

    /**
     * Redirect ke login jika bukan admin.
     */
    private function requireAdmin()
    {
        if (!$this->isAdmin()) {
            return redirect()->to('/login')->with('error', 'Akses ditolak. Silakan login sebagai admin.');
        }
        return null;
    }

    // =========================================================================
    // HALAMAN UI ADMIN
    // =========================================================================

    public function dashboard()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/dashboard', ['activePage' => 'dashboard']);
    }

    public function produk()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/produk', ['activePage' => 'produk']);
    }

    public function kategori()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/kategori', ['activePage' => 'kategori']);
    }

    public function stok()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/stok', ['activePage' => 'stok']);
    }

    public function transaksi()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/transaksi', ['activePage' => 'transaksi']);
    }

    public function user()
    {
        $redirect = $this->requireAdmin();
        if ($redirect) return $redirect;

        return view('admin/user', ['activePage' => 'user']);
    }

    // =========================================================================
    // RESTful API: DASHBOARD STATS
    // =========================================================================

    public function getDashboardStats()
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $produkModel   = new ProdukModel();
        $kategoriModel = new KategoriModel();
        $userModel     = new UserModel();
        $transaksiModel = new TransaksiModel();

        $totalProduk   = $produkModel->countAll();
        $totalKategori = $kategoriModel->countAll();
        $totalStok     = (int) $produkModel->selectSum('stok')->first()['stok'];
        $totalTransaksi = $transaksiModel->countAll();

        $recentTransaksi = $transaksiModel->getRecent(5);

        return $this->response->setJSON([
            'status' => 200,
            'data'   => [
                'total_produk'   => $totalProduk,
                'total_kategori' => $totalKategori,
                'total_stok'     => $totalStok,
                'total_transaksi' => $totalTransaksi,
                'recent_transaksi' => $recentTransaksi,
            ]
        ])->setStatusCode(200);
    }

    // =========================================================================
    // RESTful API: PRODUK
    // =========================================================================

    public function getProduk()
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $produkModel = new ProdukModel();
        $data = $produkModel->getAllWithKategori();

        return $this->response->setJSON([
            'status' => 200,
            'data'   => $data
        ])->setStatusCode(200);
    }

    public function saveProduk($id = null)
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $json = $this->request->getJSON(true);

        $nama_produk = $json['nama_produk'] ?? $this->request->getPost('nama_produk');
        $deskripsi   = $json['deskripsi'] ?? $this->request->getPost('deskripsi');
        $harga       = $json['harga'] ?? $this->request->getPost('harga');
        $stok        = $json['stok'] ?? $this->request->getPost('stok');
        $id_kategori = $json['id_kategori'] ?? $this->request->getPost('id_kategori');
        $foto        = $json['foto'] ?? $this->request->getPost('foto') ?? '';

        $rules = [
            'nama_produk' => 'required|max_length[100]',
            'harga'       => 'required|numeric',
            'stok'        => 'required|is_natural',
            'id_kategori' => 'required|is_natural_no_zero',
        ];

        if (!$this->validateData([
            'nama_produk' => $nama_produk,
            'harga'       => $harga,
            'stok'        => $stok,
            'id_kategori' => $id_kategori,
        ], $rules)) {
            return $this->response->setJSON([
                'status'   => 400,
                'error'    => true,
                'messages' => $this->validator->getErrors()
            ])->setStatusCode(400);
        }

        $produkModel = new ProdukModel();
        $produkData = [
            'nama_produk' => $nama_produk,
            'deskripsi'   => $deskripsi ?? '',
            'harga'       => $harga,
            'stok'        => $stok,
            'foto'        => $foto,
            'id_kategori' => $id_kategori,
        ];

        if ($id) {
            $produkModel->update($id, $produkData);
            $msg = 'Produk berhasil diperbarui.';
        } else {
            $produkModel->insert($produkData);
            $msg = 'Produk berhasil ditambahkan.';
        }

        return $this->response->setJSON([
            'status'   => 200,
            'error'    => null,
            'messages' => ['success' => $msg]
        ])->setStatusCode(200);
    }

    public function deleteProduk($id)
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $produkModel = new ProdukModel();
        $produkModel->delete($id);

        return $this->response->setJSON([
            'status'   => 200,
            'messages' => ['success' => 'Produk berhasil dihapus.']
        ])->setStatusCode(200);
    }

    public function updateStok($id)
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $json = $this->request->getJSON(true);
        $tambah  = (int) ($json['tambah'] ?? $this->request->getPost('tambah') ?? 0);
        $kurangi = (int) ($json['kurangi'] ?? $this->request->getPost('kurangi') ?? 0);

        $produkModel = new ProdukModel();
        $produk = $produkModel->find($id);

        if (!$produk) {
            return $this->response->setJSON([
                'status'   => 404,
                'error'    => true,
                'messages' => ['error' => 'Produk tidak ditemukan.']
            ])->setStatusCode(404);
        }

        $newStok = $produk['stok'] + $tambah - $kurangi;
        if ($newStok < 0) {
            return $this->response->setJSON([
                'status'   => 400,
                'error'    => true,
                'messages' => ['error' => 'Stok tidak boleh kurang dari 0.']
            ])->setStatusCode(400);
        }

        $produkModel->update($id, ['stok' => $newStok]);

        return $this->response->setJSON([
            'status'   => 200,
            'error'    => null,
            'messages' => ['success' => 'Stok berhasil diperbarui.'],
            'data'     => ['stok_baru' => $newStok]
        ])->setStatusCode(200);
    }

    // =========================================================================
    // RESTful API: KATEGORI
    // =========================================================================

    public function getKategori()
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $kategoriModel = new KategoriModel();
        $data = $kategoriModel->findAll();

        return $this->response->setJSON([
            'status' => 200,
            'data'   => $data
        ])->setStatusCode(200);
    }

    public function saveKategori($id = null)
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $json = $this->request->getJSON(true);
        $nama_kategori = $json['nama_kategori'] ?? $this->request->getPost('nama_kategori');
        $katId         = $json['id'] ?? $this->request->getPost('id') ?? null;

        if (!$this->validateData(['nama_kategori' => $nama_kategori], ['nama_kategori' => 'required|max_length[100]'])) {
            return $this->response->setJSON([
                'status'   => 400,
                'error'    => true,
                'messages' => $this->validator->getErrors()
            ])->setStatusCode(400);
        }

        $kategoriModel = new KategoriModel();

        if ($katId) {
            $kategoriModel->update($katId, ['nama_kategori' => $nama_kategori]);
            $msg = 'Kategori berhasil diperbarui.';
        } else {
            $kategoriModel->insert(['nama_kategori' => $nama_kategori]);
            $msg = 'Kategori berhasil ditambahkan.';
        }

        return $this->response->setJSON([
            'status'   => 200,
            'error'    => null,
            'messages' => ['success' => $msg]
        ])->setStatusCode(200);
    }

    public function deleteKategori($id)
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $kategoriModel = new KategoriModel();
        $kategoriModel->delete($id);

        return $this->response->setJSON([
            'status'   => 200,
            'messages' => ['success' => 'Kategori berhasil dihapus.']
        ])->setStatusCode(200);
    }

    // =========================================================================
    // RESTful API: TRANSAKSI
    // =========================================================================

    public function getTransaksi()
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $status   = $this->request->getGet('status');
        $dateFrom = $this->request->getGet('from');
        $dateTo   = $this->request->getGet('to');

        $transaksiModel = new TransaksiModel();
        $data = $transaksiModel->getAllWithUser(
            $status ?: null,
            $dateFrom ?: null,
            $dateTo ?: null
        );

        return $this->response->setJSON([
            'status' => 200,
            'data'   => $data
        ])->setStatusCode(200);
    }

    // =========================================================================
    // RESTful API: USER
    // =========================================================================

    public function getUser()
    {
        if (!$this->isAdmin()) {
            return $this->response->setJSON(['error' => 'Unauthorized'])->setStatusCode(401);
        }

        $userModel = new UserModel();
        $users = $userModel->select('id, nama, email, role, created_at, updated_at')->findAll();

        return $this->response->setJSON([
            'status' => 200,
            'data'   => $users
        ])->setStatusCode(200);
    }
}
