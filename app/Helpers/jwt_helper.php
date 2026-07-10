<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if (! function_exists('generateToken')) {
    /**
     * Membuat JWT token dari payload user.
     */
    function generateToken(array $payload): string
    {
        $key       = getenv('JWT_SECRET_KEY') ?: 'tokosaku-secret-key-yang-sangat-panjang-dan-aman';
        $issuedAt  = time();

        $payload['iat'] = $issuedAt;
        // Tanpa batas waktu (claim 'exp' tidak diset)

        return JWT::encode($payload, $key, 'HS256');
    }
}

if (! function_exists('decodeToken')) {
    /**
     * Decode & verifikasi JWT token. Return null jika tidak valid / kadaluarsa.
     *
     * @return object|null
     */
    function decodeToken(string $token)
    {
        $key = getenv('JWT_SECRET_KEY') ?: 'tokosaku-secret-key-yang-sangat-panjang-dan-aman';

        try {
            return JWT::decode($token, new Key($key, 'HS256'));
        } catch (\Throwable $e) {
            return null;
        }
    }
}
