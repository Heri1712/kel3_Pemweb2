<?php

namespace App\Models;

use CodeIgniter\Model;

class ProdukModel extends Model
{
    protected $table            = 'produk';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['nama_produk', 'deskripsi', 'harga', 'stok', 'foto', 'id_kategori'];

    protected $useTimestamps = false;

    protected $validationRules = [
        'nama_produk' => 'required|max_length[100]',
        'harga'       => 'required|numeric',
        'stok'        => 'required|is_natural',
        'id_kategori' => 'required|is_natural_no_zero',
    ];

    /**
     * Get all products with category name joined.
     */
    public function getAllWithKategori()
    {
        return $this->db->table('produk p')
            ->select('p.*, k.nama_kategori')
            ->join('kategori k', 'k.id = p.id_kategori', 'left')
            ->get()
            ->getResultArray();
    }
}
