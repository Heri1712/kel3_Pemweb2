<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ProdukModel;
use CodeIgniter\API\ResponseTrait;

class ProdukController extends BaseController
{
    use ResponseTrait;

    protected ProdukModel $produkModel;

    public function __construct()
    {
        $this->produkModel = new ProdukModel();
    }

    /**
     * FR-04 Lihat Katalog Produk
     * FR-05 Cari dan Filter Produk
     * GET /api/produk?search=keyword&kategori=id_kategori
     */
    public function index()
    {
        $keyword  = $this->request->getGet('search');
        $kategori = $this->request->getGet('kategori');

        $builder = $this->produkModel
            ->select('produk.*, kategori.nama_kategori')
            ->join('kategori', 'kategori.id = produk.id_kategori');

        if (! empty($keyword)) {
            $builder->like('produk.nama_produk', $keyword);
        }

        if (! empty($kategori)) {
            $builder->where('produk.id_kategori', $kategori);
        }

        $data = $builder->orderBy('produk.created_at', 'DESC')->findAll();

        return $this->respond([
            'status' => true,
            'data'   => $data,
        ]);
    }

    /**
     * FR-06 Detail Produk
     * GET /api/produk/{id}
     */
    public function show($id = null)
    {
        $produk = $this->produkModel
            ->select('produk.*, kategori.nama_kategori')
            ->join('kategori', 'kategori.id = produk.id_kategori')
            ->find($id);

        if (! $produk) {
            return $this->failNotFound('Produk tidak ditemukan');
        }

        return $this->respond([
            'status' => true,
            'data'   => $produk,
        ]);
    }
}
