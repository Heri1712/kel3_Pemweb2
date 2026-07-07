<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\KategoriModel;
use App\Models\ProdukModel;
use CodeIgniter\API\ResponseTrait;

class KategoriController extends BaseController
{
    use ResponseTrait;

    protected KategoriModel $kategoriModel;
    protected ProdukModel $produkModel;

    public function __construct()
    {
        $this->kategoriModel = new KategoriModel();
        $this->produkModel   = new ProdukModel();
    }

    /**
     * Lihat daftar kategori (dipakai publik untuk filter & admin untuk kelola)
     * GET /api/kategori
     */
    public function index()
    {
        return $this->respond([
            'status' => true,
            'data'   => $this->kategoriModel->orderBy('nama_kategori', 'ASC')->findAll(),
        ]);
    }

    /**
     * FR-11 Kelola Kategori - tambah
     * POST /api/admin/kategori
     */
    public function store()
    {
        $data = $this->input();

        $rules = [
            'nama_kategori' => 'required|min_length[3]|max_length[100]|is_unique[kategori.nama_kategori]',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $id = $this->kategoriModel->insert(['nama_kategori' => $data['nama_kategori']], true);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data'    => $this->kategoriModel->find($id),
        ]);
    }

    /**
     * FR-11 Kelola Kategori - ubah
     * PUT /api/admin/kategori/{id}
     */
    public function update($id = null)
    {
        $kategori = $this->kategoriModel->find($id);
        if (! $kategori) {
            return $this->failNotFound('Kategori tidak ditemukan');
        }

        $data = $this->input();

        $rules = [
            'nama_kategori' => "required|min_length[3]|max_length[100]|is_unique[kategori.nama_kategori,id,{$id}]",
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $this->kategoriModel->update($id, ['nama_kategori' => $data['nama_kategori']]);

        return $this->respond([
            'status'  => true,
            'message' => 'Kategori berhasil diperbarui',
            'data'    => $this->kategoriModel->find($id),
        ]);
    }

    /**
     * FR-11 Kelola Kategori - hapus
     * BR-10 Kategori yang masih digunakan produk tidak dapat dihapus
     * DELETE /api/admin/kategori/{id}
     */
    public function destroy($id = null)
    {
        $kategori = $this->kategoriModel->find($id);
        if (! $kategori) {
            return $this->failNotFound('Kategori tidak ditemukan');
        }

        $jumlahProduk = $this->produkModel->where('id_kategori', $id)->countAllResults();
        if ($jumlahProduk > 0) {
            return $this->fail('Kategori tidak dapat dihapus karena masih digunakan oleh produk', 409);
        }

        $this->kategoriModel->delete($id);

        return $this->respondDeleted([
            'status'  => true,
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
