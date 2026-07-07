<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class AuthController extends BaseController
{
    use ResponseTrait;

    protected UserModel $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * FR-01 Registrasi User
     * POST /api/auth/register
     */
    public function register()
    {
        $data = $this->input();

        $rules = [
            'nama'                => 'required|min_length[3]|max_length[100]',
            'email'               => 'required|valid_email|is_unique[users.email]',
            'password'            => 'required|min_length[6]',
            'konfirmasi_password' => 'required|matches[password]',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $this->userModel->insert([
            'nama'     => $data['nama'],
            'email'    => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role'     => 'user',
        ]);

        return $this->respondCreated([
            'status'  => true,
            'message' => 'Registrasi berhasil, silakan login.',
        ]);
    }

    /**
     * FR-02 Login User
     * POST /api/auth/login
     */
    public function login()
    {
        $data = $this->input();

        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $user = $this->userModel->where('email', $data['email'])->where('role', 'user')->first();

        if (! $user || ! password_verify($data['password'], $user['password'])) {
            return $this->fail('Email atau password salah', 401);
        }

        $token = generateToken([
            'id'    => $user['id'],
            'nama'  => $user['nama'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Login berhasil',
            'token'   => $token,
            'data'    => [
                'id'    => $user['id'],
                'nama'  => $user['nama'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ],
        ]);
    }

    /**
     * FR-03 Login Admin
     * POST /api/auth/admin-login
     */
    public function adminLogin()
    {
        $data = $this->input();

        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        if (! $this->validateInput($rules, $data)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $admin = $this->userModel->where('email', $data['email'])->where('role', 'admin')->first();

        if (! $admin || ! password_verify($data['password'], $admin['password'])) {
            return $this->fail('Email atau password admin salah', 401);
        }

        $token = generateToken([
            'id'    => $admin['id'],
            'nama'  => $admin['nama'],
            'email' => $admin['email'],
            'role'  => $admin['role'],
        ]);

        return $this->respond([
            'status'  => true,
            'message' => 'Login admin berhasil',
            'token'   => $token,
            'data'    => [
                'id'    => $admin['id'],
                'nama'  => $admin['nama'],
                'email' => $admin['email'],
                'role'  => $admin['role'],
            ],
        ]);
    }
}
