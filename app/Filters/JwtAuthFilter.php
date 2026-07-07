<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Filter untuk memvalidasi JWT Token pada request.
 *
 * Penggunaan di Routes.php:
 *   ['filter' => 'jwtAuth']         -> wajib login (role apa saja)
 *   ['filter' => 'jwtAuth:admin']   -> wajib login DAN role harus admin
 */
class JwtAuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        helper('jwt');

        $header = $request->getHeaderLine('Authorization');

        if (empty($header) || stripos($header, 'Bearer ') !== 0) {
            return service('response')
                ->setJSON([
                    'status'  => false,
                    'message' => 'Token tidak ditemukan, silakan login terlebih dahulu',
                ])
                ->setStatusCode(401);
        }

        $token   = trim(substr($header, 7));
        $decoded = decodeToken($token);

        if (! $decoded) {
            return service('response')
                ->setJSON([
                    'status'  => false,
                    'message' => 'Token tidak valid atau sudah kadaluarsa',
                ])
                ->setStatusCode(401);
        }

        if (! empty($arguments) && in_array('admin', $arguments, true) && $decoded->role !== 'admin') {
            return service('response')
                ->setJSON([
                    'status'  => false,
                    'message' => 'Akses ditolak, endpoint ini khusus admin',
                ])
                ->setStatusCode(403);
        }

        // Simpan data hasil decode token agar bisa dipakai controller
        // via $this->request->userData
        $request->userData = $decoded;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // tidak digunakan
    }
}
