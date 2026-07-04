<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');
$routes->get('login', 'AuthController::index');
$routes->get('register', 'AuthController::register');
$routes->post('api/login', 'AuthController::login');
$routes->post('api/register', 'AuthController::processRegister');
$routes->get('dashboard', 'AuthController::dashboard');
$routes->get('logout', 'AuthController::logout');

// Admin UI routes
$routes->get('admin/dashboard', 'AdminController::dashboard');
$routes->get('admin/produk', 'AdminController::produk');
$routes->get('admin/kategori', 'AdminController::kategori');
$routes->get('admin/stok', 'AdminController::stok');
$routes->get('admin/transaksi', 'AdminController::transaksi');
$routes->get('admin/user', 'AdminController::user');

// Admin RESTful API routes
$routes->get('api/admin/dashboard-stats', 'AdminController::getDashboardStats');
$routes->get('api/admin/produk', 'AdminController::getProduk');
$routes->post('api/admin/produk', 'AdminController::saveProduk');
$routes->post('api/admin/produk/update/(:num)', 'AdminController::saveProduk/$1');
$routes->post('api/admin/produk/delete/(:num)', 'AdminController::deleteProduk/$1');
$routes->post('api/admin/produk/update-stok/(:num)', 'AdminController::updateStok/$1');
$routes->get('api/admin/kategori', 'AdminController::getKategori');
$routes->post('api/admin/kategori', 'AdminController::saveKategori');
$routes->post('api/admin/kategori/delete/(:num)', 'AdminController::deleteKategori/$1');
$routes->get('api/admin/transaksi', 'AdminController::getTransaksi');
$routes->get('api/admin/user', 'AdminController::getUser');
