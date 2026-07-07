<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\API\ResponseTrait;

class AdminUserController extends BaseController
{
    use ResponseTrait;

    protected UserModel $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
    }

    /**
     * FR-13 Lihat Data Pengguna
     * GET /api/admin/users   (butuh Bearer Token admin)
     */
    public function index()
    {
        $users = $this->userModel
            ->select('id, nama, email, created_at')
            ->where('role', 'user')
            ->orderBy('created_at', 'DESC')
            ->findAll();

        return $this->respond(['status' => true, 'data' => $users]);
    }
}
