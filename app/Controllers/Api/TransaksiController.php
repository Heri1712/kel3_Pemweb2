<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\DetailTransaksiModel;
use App\Models\KeranjangModel;
use App\Models\ProdukModel;
use App\Models\TransaksiModel;
use CodeIgniter\API\ResponseTrait;
use Config\Database;

class TransaksiController extends BaseController
{
    use ResponseTrait;

    protected KeranjangModel $keranjangModel;
    protected ProdukModel $produkModel;
    protected TransaksiModel $transaksiModel;
    protected DetailTransaksiModel $detailModel;

    public function __construct()
    {
        $this->keranjangModel = new KeranjangModel();
        $this->produkModel    = new ProdukModel();
        $this->transaksiModel = new TransaksiModel();
        $this->detailModel    = new DetailTransaksiModel();
    }

    /**
     * FR-09 Checkout dan Transaksi
     * BR-06 Stok berkurang otomatis setelah checkout
     * BR-08 Wajib login untuk checkout
     * POST /api/checkout   (butuh Bearer Token user)
     * body: { "alamat": "Jl. Contoh No. 123, Jakarta" }
     */
    public function checkout()
    {
        $userId = $this->request->userData->id;
        $data   = $this->input();

        $rules = [
            'alamat' => 'required|min_length[10]',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $items = $this->keranjangModel->where('id_user', $userId)->findAll();

        if (empty($items)) {
            return $this->fail('Keranjang belanja kosong', 400);
        }

        // Validasi stok seluruh item terlebih dahulu sebelum simpan apa pun
        $totalHarga   = 0;
        $produkDetail = [];

        foreach ($items as $item) {
            $produk = $this->produkModel->find($item['id_produk']);

            if (! $produk) {
                return $this->fail("Produk dengan ID {$item['id_produk']} tidak ditemukan", 404);
            }

            if ($produk['stok'] < $item['jumlah']) {
                return $this->fail("Stok produk '{$produk['nama_produk']}' tidak mencukupi", 409);
            }

            $totalHarga    += $produk['harga'] * $item['jumlah'];
            $produkDetail[] = [
                'id_produk'     => $produk['id'],
                'nama_produk'   => $produk['nama_produk'],
                'jumlah'        => $item['jumlah'],
                'harga_satuan'  => $produk['harga'],
                'stok_sekarang' => $produk['stok'],
            ];
        }

        $db = Database::connect();
        $db->transStart();

        $transaksiId = $this->transaksiModel->insert([
            'id_user'     => $userId,
            'total_harga' => $totalHarga,
            'status'      => 'selesai',
            'alamat'      => $data['alamat'],
        ], true);

        foreach ($produkDetail as $pd) {
            $this->detailModel->insert([
                'id_transaksi' => $transaksiId,
                'id_produk'    => $pd['id_produk'],
                'jumlah'       => $pd['jumlah'],
                'harga_satuan' => $pd['harga_satuan'],
            ]);

            // BR-06: kurangi stok otomatis
            $this->produkModel->update($pd['id_produk'], [
                'stok' => $pd['stok_sekarang'] - $pd['jumlah'],
            ]);
        }

        // Kosongkan keranjang setelah checkout
        $this->keranjangModel->where('id_user', $userId)->delete();

        $db->transComplete();

        if ($db->transStatus() === false) {
            return $this->fail('Transaksi gagal diproses, silakan coba lagi', 500);
        }

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Checkout berhasil, transaksi tersimpan',
            'data'    => [
                'id_transaksi' => $transaksiId,
                'total_harga'  => $totalHarga,
                'status'       => 'selesai',
                'detail'       => $produkDetail,
            ],
        ]);
    }

    /**
     * FR-10 Riwayat Transaksi User
     * GET /api/transaksi   (butuh Bearer Token user)
     */
    public function index()
    {
        $userId = $this->request->userData->id;

        $riwayat = $this->transaksiModel
            ->where('id_user', $userId)
            ->orderBy('created_at', 'DESC')
            ->findAll();

        foreach ($riwayat as &$trx) {
            $trx['detail'] = $this->detailModel
                ->select('detail_transaksi.*, produk.nama_produk, produk.foto')
                ->join('produk', 'produk.id = detail_transaksi.id_produk')
                ->where('id_transaksi', $trx['id'])
                ->findAll();
        }

        return $this->respond(['status' => true, 'data' => $riwayat]);
    }

    /**
     * Detail satu transaksi milik user (untuk nota)
     * GET /api/transaksi/{id}   (butuh Bearer Token user)
     */
    public function show($id = null)
    {
        $userId = $this->request->userData->id;

        $trx = $this->transaksiModel->where('id_user', $userId)->find($id);
        if (! $trx) {
            return $this->failNotFound('Transaksi tidak ditemukan');
        }

        $trx['detail'] = $this->detailModel
            ->select('detail_transaksi.*, produk.nama_produk, produk.foto')
            ->join('produk', 'produk.id = detail_transaksi.id_produk')
            ->where('id_transaksi', $id)
            ->findAll();

        return $this->respond(['status' => true, 'data' => $trx]);
    }
}
