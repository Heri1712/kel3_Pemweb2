<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DetailTransaksiModel;
use App\Models\TransaksiModel;
use CodeIgniter\API\ResponseTrait;

class AdminTransaksiController extends BaseController
{
    use ResponseTrait;

    protected TransaksiModel $transaksiModel;
    protected DetailTransaksiModel $detailModel;

    public function __construct()
    {
        $this->transaksiModel = new TransaksiModel();
        $this->detailModel    = new DetailTransaksiModel();
    }

    /**
     * FR-14 Lihat Semua Transaksi
     * GET /api/admin/transaksi   (butuh Bearer Token admin)
     */
    public function index()
    {
        $data = $this->transaksiModel
            ->select('transaksi.*, users.nama as nama_pelanggan, users.email')
            ->join('users', 'users.id = transaksi.id_user')
            ->orderBy('transaksi.created_at', 'DESC')
            ->findAll();

        return $this->respond(['status' => true, 'data' => $data]);
    }

    /**
     * Detail satu transaksi (untuk admin)
     * GET /api/admin/transaksi/{id}   (butuh Bearer Token admin)
     */
    public function show($id = null)
    {
        $trx = $this->transaksiModel
            ->select('transaksi.*, users.nama as nama_pelanggan, users.email')
            ->join('users', 'users.id = transaksi.id_user')
            ->find($id);

        if (! $trx) {
            return $this->failNotFound('Transaksi tidak ditemukan');
        }

        $trx['detail'] = $this->detailModel
            ->select('detail_transaksi.*, produk.nama_produk')
            ->join('produk', 'produk.id = detail_transaksi.id_produk')
            ->where('id_transaksi', $id)
            ->findAll();

        return $this->respond(['status' => true, 'data' => $trx]);
    }
}
