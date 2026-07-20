Aplikasi ini terdiri dari dua bagian utama:
1. **Backend**: Menggunakan framework PHP CodeIgniter 4.
2. **Frontend**: Menggunakan React JS dengan Vite.

Berikut adalah panduan langkah demi langkah untuk menginstal dan menjalankan aplikasi di komputer lokal Anda.

## Prasyarat (Persiapan Lingkungan)

Sebelum memulai, pastikan perangkat lunak berikut telah terinstal di komputer Anda:
- **XAMPP / Laragon** (untuk menjalankan MySQL dan server web lokal)
- **PHP** (minimal versi 8.2)
- **Composer** (untuk mengelola dependensi CodeIgniter)
- **Node.js dan NPM** (minimal versi 18, untuk menjalankan Frontend React)
- **Git** (opsional, untuk kloning repositori)

---

## 1. Konfigurasi Database

1. Buka **XAMPP** atau **Laragon**, lalu jalankan modul **MySQL**.
2. Buka phpMyAdmin (biasanya di `http://localhost/phpmyadmin`) atau aplikasi manajemen database lainnya (misal: HeidiSQL/DBeaver).
3. Buat database baru dengan nama `db_perusahaan` (sesuaikan dengan nama yang diinginkan).
4. Import file `db_perusahaan.sql` yang berada di direktori utama (root) proyek ini ke dalam database yang baru saja dibuat.

---

## 2. Instalasi dan Menjalankan Backend (CodeIgniter 4)

1. Buka terminal atau Command Prompt.
2. Navigasikan ke direktori utama proyek (root folder `kel3_Pemweb2`):
   ```bash
   cd path/ke/folder/kel3_Pemweb2
   ```
3. Instal dependensi PHP menggunakan Composer:
   ```bash
   composer install
   ```
4. Salin file `.env` (jika belum ada, salin dari `env`):
   ```bash
   cp env .env
   ```
5. Buka file `.env` menggunakan teks editor (VS Code, Notepad, dll), kemudian konfigurasikan bagian database:
   ```env
   database.default.hostname = localhost
   database.default.database = db_perusahaan
   database.default.username = root
   database.default.password = 
   database.default.DBDriver = MySQLi
   database.default.port     = 3306
   ```
   *(Sesuaikan `username` dan `password` dengan konfigurasi MySQL Anda)*
6. Jalankan server backend CodeIgniter:
   ```bash
   php spark serve
   ```
   Backend (API) Anda sekarang berjalan di `http://localhost:8080`. Biarkan terminal ini tetap terbuka.

---

## 3. Instalasi dan Menjalankan Frontend (React + Vite)

1. Buka tab/jendela terminal **baru** (biarkan terminal backend tetap berjalan).
2. Navigasikan ke dalam folder `frontend`:
   ```bash
   cd path/ke/folder/kel3_Pemweb2/frontend
   ```
3. Instal dependensi Node.js:
   ```bash
   npm install
   ```
4. Setelah instalasi selesai, jalankan server *development* frontend:
   ```bash
   npm run dev
   ```
5. Terminal akan menampilkan URL lokal untuk mengakses frontend (biasanya di `http://localhost:5173`). 
6. Buka URL tersebut di browser Anda untuk menggunakan aplikasi.

---

## Catatan Tambahan

- Pastikan URL API pada kode frontend (React) mengarah ke URL backend yang benar (biasanya `http://localhost:8080` atau alamat virtual host Laragon seperti `http://kel3_pemweb2.test`).
- Jika Anda menggunakan Laragon, Anda tidak perlu menjalankan `php spark serve`, Anda dapat langsung mengaksesnya melalui domain lokal yang digenerate oleh Laragon (misal: `http://kel3_pemweb2.test`).

1	[Heri Hermawan]  	         2306700017  System Analyst / Project Manager	Menganalisis kebutuhan sistem, menyusun SRS, mengoordinasikan jadwal dan pembagian kerja tim
2	[Melsa Afrianti]    	     2306700020  UI/UX Designer	Merancang wireframe/mockup antarmuka, alur pengguna (user flow), dan tampilan aplikasi
3	[Rizki Adhitya Rukmama]    2306700009  Database Engineer	Merancang skema basis data (ERD), pembuatan tabel, dan relasi antar tabel pada MySQL
4	[Andy Rulkiadi Rawa]	     2306700030  Backend Developer	Membangun REST API menggunakan CodeIgniter 4, autentikasi JWT, dan logika bisnis sistem
5	[Muhammad Surya Ramadhan]  2306700025  Frontend Developer	Membangun antarmuka aplikasi menggunakan React dan mengintegrasikannya dengan REST API


## Prototype Figma

Seluruh hasil desain dan prototype interaktif dapat diakses melalui tautan berikut:

**Figma:**
`https://www.figma.com/design/uDFbehttPrPIYULbqX3wx3/RetailShopp?node-id=0-1&t=6baleBcIfpg0CMZ6-1`

**Postman:**
`https://.postman.co/workspace/kel3_pemweb2~e7bf401e-4cc6-4a47-b2a9-80736b0361a4/collection/55377776-44a91c6d-2ffe-4ad5-b6d8-a490485beff6?action=share&creator=55377776`
## Deskripsi

Repository ini berisi hasil perancangan **User Interface (UI)** dan **User Experience (UX)** untuk aplikasi **Mini Retail** yang dibuat menggunakan **Figma**. Desain dikembangkan dengan mengutamakan kemudahan penggunaan (usability), konsistensi tampilan, serta pengalaman pengguna yang intuitif untuk mendukung proses transaksi pada aplikasi retail berbasis web.
Perancangan antarmuka mencakup kebutuhan pengguna (user) dalam melakukan aktivitas belanja secara online, serta kebutuhan administrator (admin) dalam mengelola data dan transaksi melalui dashboard yang terstruktur.

## Fitur yang Dirancang

### User

* Login
* Registrasi
* Beranda
* Melihat Daftar Produk
* Detail Produk
* Keranjang Belanja
* Checkout
* Riwayat Pembelian

### Admin

* Login Admin
* Dashboard
* Kelola Produk (CRUD)
* Kelola Kategori
* Kelola Stok
* Kelola Transaksi

## Tujuan Proyek

Proyek ini dibuat sebagai bagian dari tugas perancangan sistem untuk menerapkan konsep **UI/UX Design** pada aplikasi Mini Retail. Tujuan utama dari desain ini adalah menghasilkan antarmuka yang sederhana, modern, mudah dipahami, serta mampu memberikan pengalaman pengguna yang efektif dan efisien.




## Catatan

Repository ini berfokus pada proses **perancangan antarmuka (UI/UX)** dan tidak mencakup implementasi atau pengembangan aplikasi menggunakan bahasa pemrograman.
