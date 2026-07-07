<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\KategoriModel;
use App\Models\ProdukModel;
use CodeIgniter\API\ResponseTrait;

class AdminProdukController extends BaseController
{
    use ResponseTrait;

    protected ProdukModel $produkModel;
    protected KategoriModel $kategoriModel;

    public function __construct()
    {
        $this->produkModel   = new ProdukModel();
        $this->kategoriModel = new KategoriModel();
    }

    /**
     * FR-12 Kelola Produk - tambah (mendukung upload foto)
     * POST /api/admin/produk   (form-data, butuh Bearer Token admin)
     * fields: nama_produk, deskripsi, harga, stok, id_kategori, foto (file, opsional)
     */
    public function store()
    {
        $data = $this->input();

        $rules = [
            'nama_produk' => 'required|min_length[3]|max_length[100]',
            'deskripsi'   => 'required',
            'harga'       => 'required|numeric',
            'stok'        => 'required|is_natural',
            'id_kategori' => 'required|is_natural_no_zero',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        if (! $this->kategoriModel->find($data['id_kategori'])) {
            return $this->fail('Kategori tidak ditemukan', 404);
        }

        $fotoName = 'default.png';
        $file     = $this->request->getFile('foto');

        if ($file && $file->isValid() && ! $file->hasMoved()) {
            $fotoName = $file->getRandomName();
            $file->move(FCPATH . 'uploads/produk', $fotoName);
        }

        $id = $this->produkModel->insert([
            'nama_produk' => $data['nama_produk'],
            'deskripsi'   => $data['deskripsi'],
            'harga'       => $data['harga'],
            'stok'        => $data['stok'],
            'foto'        => $fotoName,
            'id_kategori' => $data['id_kategori'],
        ], true);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Produk berhasil ditambahkan',
            'data'    => $this->produkModel->find($id),
        ]);
    }

    /**
     * FR-12 Kelola Produk - ubah (mendukung ganti foto)
     * Gunakan method POST (bukan PUT) agar file upload terbaca oleh PHP.
     * POST /api/admin/produk/{id}   (form-data, butuh Bearer Token admin)
     */
    public function update($id = null)
    {
        $produk = $this->produkModel->find($id);
        if (! $produk) {
            return $this->failNotFound('Produk tidak ditemukan');
        }

        $data = $this->input();

        $rules = [
            'nama_produk' => 'permit_empty|min_length[3]|max_length[100]',
            'deskripsi'   => 'permit_empty',
            'harga'       => 'permit_empty|numeric',
            'stok'        => 'permit_empty|is_natural',
            'id_kategori' => 'permit_empty|is_natural_no_zero',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        if (! empty($data['id_kategori']) && ! $this->kategoriModel->find($data['id_kategori'])) {
            return $this->fail('Kategori tidak ditemukan', 404);
        }

        $updateData = [];
        foreach (['nama_produk', 'deskripsi', 'harga', 'stok', 'id_kategori'] as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                $updateData[$field] = $data[$field];
            }
        }

        $file = $this->request->getFile('foto');
        if ($file && $file->isValid() && ! $file->hasMoved()) {
            $fotoName = $file->getRandomName();
            $file->move(FCPATH . 'uploads/produk', $fotoName);
            $updateData['foto'] = $fotoName;
        }

        if (! empty($updateData)) {
            $this->produkModel->update($id, $updateData);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Produk berhasil diperbarui',
            'data'    => $this->produkModel->find($id),
        ]);
    }

    /**
     * FR-12 Kelola Produk - hapus
     * DELETE /api/admin/produk/{id}   (butuh Bearer Token admin)
     */
    public function destroy($id = null)
    {
        $produk = $this->produkModel->find($id);
        if (! $produk) {
            return $this->failNotFound('Produk tidak ditemukan');
        }

        $this->produkModel->delete($id);

        return $this->respondDeleted([
            'status'  => true,
            'message' => 'Produk berhasil dihapus',
        ]);
    }
}
