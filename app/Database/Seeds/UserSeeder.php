<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\UserModel;

class UserSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();

        // 1. Users
        $userModel = new UserModel();

        // Check and create users
        $admin = $userModel->where('email', 'admin@gmail.com')->first();
        if (!$admin) {
            $userModel->insert([
                'nama'     => 'Administrator',
                'email'    => 'admin@gmail.com',
                'password' => 'password123',
                'role'     => 'admin',
            ]);
        }

        // Add additional users from mockup: Riri, Rara, Rere, Melsa, Sarah, Ina
        $mockUsers = [
            ['nama' => 'Riri', 'email' => 'riri@gmail.com', 'password' => 'password123', 'role' => 'user'],
            ['nama' => 'Rara', 'email' => 'rara@gmail.com', 'password' => 'password123', 'role' => 'user'],
            ['nama' => 'Rere', 'email' => 'rere@gmail.com', 'password' => 'password123', 'role' => 'user'],
            ['nama' => 'Melsa', 'email' => 'melsa@gmail.com', 'password' => 'password123', 'role' => 'user'],
            ['nama' => 'Sarah', 'email' => 'sarah@gmail.com', 'password' => 'password123', 'role' => 'user'],
            ['nama' => 'Ina', 'email' => 'ina@gmail.com', 'password' => 'password123', 'role' => 'user'],
        ];

        foreach ($mockUsers as $mu) {
            if (!$userModel->where('email', $mu['email'])->first()) {
                $userModel->insert($mu);
            }
        }

        // 2. Kategori
        $kategoriTable = $db->table('kategori');
        if ($kategoriTable->countAll() === 0) {
            $kategoriTable->insertBatch([
                ['nama_kategori' => 'Baju', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
                ['nama_kategori' => 'Celana', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
                ['nama_kategori' => 'Sepatu', 'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')],
            ]);
        }

        // Get kategori IDs
        $kategoriList = $kategoriTable->get()->getResultArray();
        $kategoriIds = [];
        foreach ($kategoriList as $k) {
            $kategoriIds[$k['nama_kategori']] = $k['id'];
        }

        // 3. Produk
        $produkTable = $db->table('produk');
        if ($produkTable->countAll() === 0) {
            $produkTable->insertBatch([
                [
                    'nama_produk' => 'Crop Top Hitam',
                    'deskripsi'   => 'Baju crop top wanita berwarna hitam trendy.',
                    'harga'       => 75000.00,
                    'stok'        => 12,
                    'foto'        => 'croptop.jpg',
                    'id_kategori' => $kategoriIds['Baju'],
                    'created_at'  => date('Y-m-d H:i:s')
                ],
                [
                    'nama_produk' => 'Jeans Longgar',
                    'deskripsi'   => 'Celana jeans model loose fit yang nyaman dipakai.',
                    'harga'       => 180000.00,
                    'stok'        => 12,
                    'foto'        => 'jeans.jpg',
                    'id_kategori' => $kategoriIds['Celana'],
                    'created_at'  => date('Y-m-d H:i:s')
                ]
            ]);
        }

        // Get product list
        $produkList = $produkTable->get()->getResultArray();

        // Ensure transaksi table has 'metode_pembayaran' column
        if (!$db->fieldExists('metode_pembayaran', 'transaksi')) {
            $forge = \Config\Database::forge();
            $forge->addColumn('transaksi', [
                'metode_pembayaran' => [
                    'type'       => 'VARCHAR',
                    'constraint' => 50,
                    'default'    => 'Transfer Bank',
                    'null'       => true,
                    'after'      => 'alamat'
                ]
            ]);
        }

        // 4. Transaksi
        $transaksiTable = $db->table('transaksi');
        $detailTable    = $db->table('detail_transaksi');

        if ($transaksiTable->countAll() === 0 && !empty($produkList)) {
            $riri  = $userModel->where('email', 'riri@gmail.com')->first();
            $rara  = $userModel->where('email', 'rara@gmail.com')->first();
            $rere  = $userModel->where('email', 'rere@gmail.com')->first();
            $melsa = $userModel->where('email', 'melsa@gmail.com')->first();
            $sarah = $userModel->where('email', 'sarah@gmail.com')->first();
            $ina   = $userModel->where('email', 'ina@gmail.com')->first();

            $transactionsData = [
                [
                    'id_user'           => $riri['id'],
                    'total_harga'       => 160000.00,
                    'status'            => 'Selesai',
                    'alamat'            => 'Jl. Merdeka No. 10',
                    'metode_pembayaran' => 'Transfer Bank',
                    'created_at'        => date('Y-m-d H:i:s', strtotime('-5 days'))
                ],
                [
                    'id_user'           => $rara['id'],
                    'total_harga'       => 85000.00,
                    'status'            => 'Dibatalkan',
                    'alamat'            => 'Jl. Diponegoro No. 22',
                    'metode_pembayaran' => 'COD',
                    'created_at'        => date('Y-m-d H:i:s', strtotime('-3 days'))
                ],
                [
                    'id_user'           => $rere['id'],
                    'total_harga'       => 250000.00,
                    'status'            => 'Selesai',
                    'alamat'            => 'Jl. Sudirman No. 5',
                    'metode_pembayaran' => 'QRIS',
                    'created_at'        => date('Y-m-d H:i:s', strtotime('-1 days'))
                ],
                [
                    'id_user'           => $melsa['id'],
                    'total_harga'       => 120000.00,
                    'status'            => 'Selesai',
                    'alamat'            => 'Jl. Kartini No. 8',
                    'metode_pembayaran' => 'Transfer Bank',
                    'created_at'        => date('Y-m-d H:i:s', strtotime('-4 days'))
                ],
                [
                    'id_user'           => $sarah['id'],
                    'total_harga'       => 260000.00,
                    'status'            => 'Selesai',
                    'alamat'            => 'Jl. Gajah Mada No. 15',
                    'metode_pembayaran' => 'COD',
                    'created_at'        => date('Y-m-d H:i:s', strtotime('-2 days'))
                ],
                [
                    'id_user'           => $ina['id'],
                    'total_harga'       => 150000.00,
                    'status'            => 'Selesai',
                    'alamat'            => 'Jl. Thamrin No. 3',
                    'metode_pembayaran' => 'QRIS',
                    'created_at'        => date('Y-m-d H:i:s')
                ]
            ];

            foreach ($transactionsData as $tx) {
                $transaksiTable->insert($tx);
                $txId = $db->insertID();

                $detailTable->insert([
                    'id_transaksi' => $txId,
                    'id_produk'    => $produkList[0]['id'],
                    'jumlah'       => 1,
                    'harga_satuan' => $produkList[0]['harga']
                ]);
            }
        }
    }
}
