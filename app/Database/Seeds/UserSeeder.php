<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use App\Models\UserModel;

class UserSeeder extends Seeder
{
    public function run()
    {
        $userModel = new UserModel();

        // Check if admin already exists
        $admin = $userModel->where('email', 'admin@gmail.com')->first();
        if (!$admin) {
            $userModel->insert([
                'nama'     => 'Administrator',
                'email'    => 'admin@gmail.com',
                'password' => 'password123', // Will be hashed by UserModel callback
                'role'     => 'admin',
            ]);
        }

        // Check if regular user already exists
        $user = $userModel->where('email', 'user@gmail.com')->first();
        if (!$user) {
            $userModel->insert([
                'nama'     => 'Regular User',
                'email'    => 'user@gmail.com',
                'password' => 'password123', // Will be hashed by UserModel callback
                'role'     => 'user',
            ]);
        }
    }
}
