<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\KeranjangModel;
use App\Models\ProdukModel;
use CodeIgniter\API\ResponseTrait;

class KeranjangController extends BaseController
{
    use ResponseTrait;

    protected KeranjangModel $keranjangModel;
    protected ProdukModel $produkModel;

    public function __construct()
    {
        $this->keranjangModel = new KeranjangModel();
        $this->produkModel    = new ProdukModel();
    }

    /**
     * FR-08 Kelola Keranjang - lihat isi
     * GET /api/keranjang   (butuh Bearer Token user)
     */
    public function index()
    {
        $userId = $this->request->userData->id;

        $items = $this->keranjangModel
            ->select('keranjang.id, keranjang.id_produk, keranjang.jumlah, produk.nama_produk, produk.harga, produk.foto, produk.stok')
            ->join('produk', 'produk.id = keranjang.id_produk')
            ->where('keranjang.id_user', $userId)
            ->findAll();

        $total = 0;
        foreach ($items as $item) {
            $total += $item['harga'] * $item['jumlah'];
        }

        return $this->respond([
            'status'      => true,
            'data'        => $items,
            'total_harga' => $total,
        ]);
    }

    /**
     * FR-07 Tambah ke Keranjang
     * POST /api/keranjang   (butuh Bearer Token user)
     * body: { "id_produk": 1, "jumlah": 2 }
     */
    public function store()
    {
        $userId = $this->request->userData->id;
        $data   = $this->input();

        $rules = [
            'id_produk' => 'required|is_natural_no_zero',
            'jumlah'    => 'required|is_natural_no_zero',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $produk = $this->produkModel->find($data['id_produk']);
        if (! $produk) {
            return $this->failNotFound('Produk tidak ditemukan');
        }

        if ($produk['stok'] < $data['jumlah']) {
            return $this->fail('Stok produk tidak mencukupi', 409);
        }

        $existing = $this->keranjangModel
            ->where('id_user', $userId)
            ->where('id_produk', $data['id_produk'])
            ->first();

        if ($existing) {
            $this->keranjangModel->update($existing['id'], [
                'jumlah' => $existing['jumlah'] + (int) $data['jumlah'],
            ]);
        } else {
            $this->keranjangModel->insert([
                'id_user'   => $userId,
                'id_produk' => $data['id_produk'],
                'jumlah'    => $data['jumlah'],
            ]);
        }

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Produk berhasil ditambahkan ke keranjang',
        ]);
    }

    /**
     * FR-08 Kelola Keranjang - hapus item
     * DELETE /api/keranjang/{id}   (butuh Bearer Token user)
     */
    public function destroy($id = null)
    {
        $userId = $this->request->userData->id;

        $item = $this->keranjangModel->where('id_user', $userId)->find($id);
        if (! $item) {
            return $this->failNotFound('Item keranjang tidak ditemukan');
        }

        $this->keranjangModel->delete($id);

        return $this->respondDeleted([
            'status'  => true,
            'message' => 'Item berhasil dihapus dari keranjang',
        ]);
    }
}
