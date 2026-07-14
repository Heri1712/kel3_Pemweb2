<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API Routes
$routes->group('api', function ($routes) {
    // Handle CORS preflight (OPTIONS) for all API routes
    $routes->options('(:any)', function () {
        return \Config\Services::response()
            ->setStatusCode(200)
            ->setHeader('Access-Control-Allow-Origin', '*')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    });

    // Auth routes
    $routes->post('auth/register', '\App\Controllers\Api\AuthController::register');
    $routes->post('auth/login', '\App\Controllers\Api\AuthController::login');
    $routes->post('auth/admin-login', '\App\Controllers\Api\AuthController::adminLogin');

    // Public katalog & kategori
    $routes->get('produk', '\App\Controllers\Api\ProdukController::index');
    $routes->get('produk/(:num)', '\App\Controllers\Api\ProdukController::show/$1');
    $routes->get('kategori', '\App\Controllers\Api\KategoriController::index');

    // User authenticated routes (requires jwtAuth)
    $routes->group('', ['filter' => 'jwtAuth'], function ($routes) {
        // Keranjang
        $routes->get('keranjang', '\App\Controllers\Api\KeranjangController::index');
        $routes->post('keranjang', '\App\Controllers\Api\KeranjangController::store');
        $routes->delete('keranjang/(:num)', '\App\Controllers\Api\KeranjangController::destroy/$1');

        // Transaksi / Checkout
        $routes->post('checkout', '\App\Controllers\Api\TransaksiController::checkout');
        $routes->get('transaksi', '\App\Controllers\Api\TransaksiController::index');
        $routes->get('transaksi/(:num)', '\App\Controllers\Api\TransaksiController::show/$1');
    });

    // Admin authenticated routes (requires jwtAuth:admin)
    $routes->group('admin', ['filter' => 'jwtAuth:admin'], function ($routes) {
        // Dashboard
        $routes->get('dashboard', '\App\Controllers\Api\AdminDashboardController::index');

        // Users
        $routes->get('users', '\App\Controllers\Api\AdminUserController::index');

        // Kategori
        $routes->post('kategori', '\App\Controllers\Api\KategoriController::store');
        $routes->put('kategori/(:num)', '\App\Controllers\Api\KategoriController::update/$1');
        $routes->delete('kategori/(:num)', '\App\Controllers\Api\KategoriController::destroy/$1');

        // Produk (Ubah produk pakai POST untuk support upload file)
        $routes->post('produk', '\App\Controllers\Api\AdminProdukController::store');
        $routes->post('produk/(:num)', '\App\Controllers\Api\AdminProdukController::update/$1');
        $routes->delete('produk/(:num)', '\App\Controllers\Api\AdminProdukController::destroy/$1');

        // Transaksi
        $routes->get('transaksi', '\App\Controllers\Api\AdminTransaksiController::index');
        $routes->get('transaksi/(:num)', '\App\Controllers\Api\AdminTransaksiController::show/$1');
    });
});
