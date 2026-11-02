CREATE DATABASE IF NOT EXISTS revive
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE revive;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama VARCHAR(150) NOT NULL,
  harga INT UNSIGNED NOT NULL DEFAULT 0,
  harga_baru INT UNSIGNED NOT NULL DEFAULT 0,
  kategori VARCHAR(60) NOT NULL,
  kondisi VARCHAR(40) NOT NULL,
  penjual VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  deskripsi TEXT NOT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_products_category (kategori),
  INDEX idx_products_created (created_at)
) ENGINE=InnoDB;

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Meja Belajar', 85000, 250000, 'Furnitur', 'Baik', 'Raka', '6281234567890',
  'Meja belajar bekas yang masih layak digunakan.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Meja Belajar');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Kipas Angin', 60000, 150000, 'Elektronik', 'Baik', 'Dina', '6281234567891',
  'Kipas angin untuk kebutuhan kamar kos.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Kipas Angin');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Buku Algoritma', 25000, 90000, 'Buku', 'Sangat Baik', 'Fajar', '6281234567892',
  'Buku belajar algoritma dan pemrograman.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Buku Algoritma');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Lampu Meja', 0, 80000, 'Give Away', 'Baik', 'Nadia', '6281234567893',
  'Lampu meja gratis untuk yang membutuhkan.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Lampu Meja');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Monitor', 250000, 1200000, 'Elektronik', 'Baik', 'Bima', '6281234567894',
  'Monitor untuk belajar dan mengerjakan tugas.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Monitor');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Rak Perlengkapan Kos', 40000, 100000, 'Perlengkapan Kos', 'Cukup Baik',
  'Salsa', '6281234567895', 'Rak sederhana untuk kamar kos.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Rak Perlengkapan Kos');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Kasur Lipat', 120000, 350000, 'Perlengkapan Kos', 'Baik', 'Rafi', '6281234568007',
  'Kasur lipat busa tebal, cocok untuk kamar kos.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Kasur Lipat');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Rice Cooker', 75000, 220000, 'Elektronik', 'Baik', 'Putri', '6281234568008',
  'Rice cooker 1 liter, masih berfungsi normal.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Rice Cooker');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Kalkulator Ilmiah', 35000, 150000, 'Elektronik', 'Sangat Baik', 'Andi',
  '6281234568009', 'Kalkulator ilmiah untuk kuliah, baterai baru.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Kalkulator Ilmiah');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Buku Basis Data', 30000, 110000, 'Buku', 'Baik', 'Citra', '6281234568010',
  'Buku basis data lengkap, sedikit coretan pensil.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Buku Basis Data');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Kursi Belajar', 70000, 280000, 'Furnitur', 'Baik', 'Galih', '6281234568011',
  'Kursi belajar kokoh dengan sandaran empuk.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Kursi Belajar');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Lemari Plastik', 90000, 250000, 'Furnitur', 'Cukup Baik', 'Maya', '6281234568012',
  'Lemari plastik 3 pintu untuk baju dan buku.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Lemari Plastik');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Headset Gaming', 55000, 180000, 'Elektronik', 'Baik', 'Yoga', '6281234568013',
  'Headset dengan mikrofon, suara masih jernih.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Headset Gaming');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Setrika', 0, 120000, 'Give Away', 'Baik', 'Lina', '6281234568014',
  'Setrika gratis untuk anak kos yang membutuhkan.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Setrika');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Tas Ransel', 0, 200000, 'Give Away', 'Cukup Baik', 'Dewi', '6281234568015',
  'Tas ransel besar, resleting masih lancar.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Tas Ransel');

INSERT INTO products
  (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi)
SELECT 'Buku Statistika', 20000, 85000, 'Buku', 'Sangat Baik', 'Farhan',
  '6281234568016', 'Buku statistika dasar, kondisi seperti baru.'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE nama = 'Buku Statistika');
