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
