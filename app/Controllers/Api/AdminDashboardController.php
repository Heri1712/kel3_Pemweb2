<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\KategoriModel;
use App\Models\ProdukModel;
use App\Models\TransaksiModel;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class AdminDashboardController extends BaseController
{
    use ResponseTrait;

    /**
     * FR-15 Dashboard Admin
     * GET /api/admin/dashboard   (butuh Bearer Token admin)
     */
    public function index()
    {
        $userModel      = new UserModel();
        $produkModel    = new ProdukModel();
        $kategoriModel  = new KategoriModel();
        $transaksiModel = new TransaksiModel();

        $totalPendapatan = $transaksiModel
            ->selectSum('total_harga')
            ->where('status', 'selesai')
            ->first();

        return $this->respond([
            'status' => true,
            'data'   => [
                'total_pengguna'   => $userModel->where('role', 'user')->countAllResults(),
                'total_produk'     => $produkModel->countAllResults(),
                'total_kategori'   => $kategoriModel->countAllResults(),
                'total_transaksi'  => $transaksiModel->countAllResults(),
                'total_pendapatan' => (float) ($totalPendapatan['total_harga'] ?? 0),
            ],
        ]);
    }
}
