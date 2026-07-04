<?php

namespace App\Models;

use CodeIgniter\Model;

class TransaksiModel extends Model
{
    protected $table            = 'transaksi';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['id_user', 'total_harga', 'status', 'alamat', 'metode_pembayaran'];

    protected $useTimestamps = false;

    /**
     * Get all transactions with user name joined.
     */
    public function getAllWithUser(?string $status = null, ?string $dateFrom = null, ?string $dateTo = null)
    {
        $builder = $this->db->table('transaksi t')
            ->select('t.*, u.nama AS nama_user')
            ->join('users u', 'u.id = t.id_user', 'left');

        if ($status) {
            $builder->where('t.status', $status);
        }
        if ($dateFrom) {
            $builder->where('t.created_at >=', $dateFrom . ' 00:00:00');
        }
        if ($dateTo) {
            $builder->where('t.created_at <=', $dateTo . ' 23:59:59');
        }

        $builder->orderBy('t.created_at', 'DESC');
        return $builder->get()->getResultArray();
    }

    /**
     * Get recent N transactions for dashboard.
     */
    public function getRecent(int $limit = 5)
    {
        return $this->db->table('transaksi t')
            ->select('t.*, u.nama AS nama_user')
            ->join('users u', 'u.id = t.id_user', 'left')
            ->orderBy('t.created_at', 'DESC')
            ->limit($limit)
            ->get()
            ->getResultArray();
    }
}
