<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('users');

        // Hapus jika sudah ada untuk menghindari error duplicate entry
        $builder->where('email', 'admin@gmail.com')->delete();

        $data = [
            'nama'       => 'Admin MiniRetail',
            'email'      => 'admin@gmail.com',
            'password'   => password_hash('admin123', PASSWORD_BCRYPT),
            'role'       => 'admin',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        $builder->insert($data);
    }
}
