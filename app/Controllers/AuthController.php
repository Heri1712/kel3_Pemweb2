<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class AuthController extends BaseController
{
    use ResponseTrait;

    public function index()
    {
        // If already logged in, redirect to dashboard
        if (session()->get('isLoggedIn')) {
            return redirect()->to('/dashboard');
        }
        return view('login');
    }

    public function login()
    {
        // Support JSON or standard Form inputs
        $json = $this->request->getJSON(true);
        
        $email    = $json['email'] ?? $this->request->getPost('email');
        $password = $json['password'] ?? $this->request->getPost('password');

        // Validation rules
        $rules = [
            'email'    => 'required|valid_email',
            'password' => 'required',
        ];

        $messages = [
            'email' => [
                'required'    => 'Email harus diisi.',
                'valid_email' => 'Format email tidak valid.',
            ],
            'password' => [
                'required' => 'Password harus diisi.',
            ]
        ];

        $dataToValidate = [
            'email'    => $email,
            'password' => $password,
        ];

        if (!$this->validateData($dataToValidate, $rules, $messages)) {
            return $this->response->setJSON([
                'status'   => 400,
                'error'    => true,
                'messages' => $this->validator->getErrors()
            ])->setStatusCode(400);
        }

        // Find user by email
        $userModel = new UserModel();
        $user      = $userModel->where('email', $email)->first();

        // Verify password
        if (!$user || !password_verify($password, $user['password'])) {
            return $this->response->setJSON([
                'status'   => 401,
                'error'    => true,
                'messages' => ['error' => 'Email atau Password salah.']
            ])->setStatusCode(401);
        }

        // Clear password hash from output
        unset($user['password']);

        // Set session
        $session = session();
        $session->set([
            'isLoggedIn' => true,
            'userId'     => $user['id'],
            'userName'   => $user['nama'],
            'userEmail'  => $user['email'],
            'userRole'   => $user['role'],
        ]);

        // Determine redirect URL based on role
        $redirectUrl = ($user['role'] === 'admin')
            ? base_url('admin/dashboard')
            : base_url('dashboard');

        return $this->response->setJSON([
            'status'      => 200,
            'error'       => null,
            'messages'    => ['success' => 'Login berhasil!'],
            'redirect'    => $redirectUrl,
            'data'        => $user
        ])->setStatusCode(200);
    }

    public function dashboard()
    {
        // Check if user is logged in
        $session = session();
        if (!$session->get('isLoggedIn')) {
            return redirect()->to('/login')->with('error', 'Silakan login terlebih dahulu.');
        }

        return view('dashboard', [
            'user' => [
                'nama'  => $session->get('userName'),
                'email' => $session->get('userEmail'),
                'role'  => $session->get('userRole'),
            ]
        ]);
    }

    public function logout()
    {
        session()->destroy();
        return redirect()->to('/login');
    }

    public function register()
    {
        // If already logged in, redirect to dashboard
        if (session()->get('isLoggedIn')) {
            return redirect()->to('/dashboard');
        }
        return view('register');
    }

    public function processRegister()
    {
        // Support JSON or standard Form inputs
        $json = $this->request->getJSON(true);

        $nama            = $json['nama'] ?? $this->request->getPost('nama');
        $email           = $json['email'] ?? $this->request->getPost('email');
        $password        = $json['password'] ?? $this->request->getPost('password');
        $confirmPassword = $json['confirm_password'] ?? $this->request->getPost('confirm_password');

        $rules = [
            'nama'             => 'required|min_length[3]|max_length[100]',
            'email'            => 'required|valid_email|is_unique[users.email]',
            'password'         => 'required|min_length[6]',
            'confirm_password' => 'required|matches[password]',
        ];

        $messages = [
            'nama' => [
                'required'   => 'Nama Lengkap harus diisi.',
                'min_length' => 'Nama Lengkap minimal terdiri dari 3 karakter.',
                'max_length' => 'Nama Lengkap maksimal terdiri dari 100 karakter.',
            ],
            'email' => [
                'required'    => 'E-mail harus diisi.',
                'valid_email' => 'Format E-mail tidak valid.',
                'is_unique'   => 'E-mail sudah terdaftar.',
            ],
            'password' => [
                'required'   => 'Password harus diisi.',
                'min_length' => 'Password minimal terdiri dari 6 karakter.',
            ],
            'confirm_password' => [
                'required' => 'Konfirmasi Password harus diisi.',
                'matches'  => 'Konfirmasi Password tidak cocok.',
            ]
        ];

        $dataToValidate = [
            'nama'             => $nama,
            'email'            => $email,
            'password'         => $password,
            'confirm_password' => $confirmPassword,
        ];

        if (!$this->validateData($dataToValidate, $rules, $messages)) {
            return $this->response->setJSON([
                'status'   => 400,
                'error'    => true,
                'messages' => $this->validator->getErrors()
            ])->setStatusCode(400);
        }

        $userModel = new UserModel();

        $inserted = $userModel->insert([
            'nama'     => $nama,
            'email'    => $email,
            'password' => $password, // Hashing is handled by UserModel callback
            'role'     => 'user',
        ]);

        if (!$inserted) {
            return $this->response->setJSON([
                'status'   => 500,
                'error'    => true,
                'messages' => ['error' => 'Gagal membuat akun baru.']
            ])->setStatusCode(500);
        }

        return $this->response->setJSON([
            'status'   => 200,
            'error'    => null,
            'messages' => [
                'success' => 'Registrasi berhasil! Silakan login.'
            ]
        ])->setStatusCode(200);
    }
}
