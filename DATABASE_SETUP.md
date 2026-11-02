# Setup database ReVive (XAMPP)

1. Pasang dan jalankan Apache serta MySQL dari XAMPP.
2. Salin folder proyek ke `C:\xampp\htdocs\ReVive_Project`.
3. Buka `http://localhost/phpmyadmin`, pilih **Import**, lalu impor file `database.sql`. Ini membuat database `revive`, tabel `products`, dan produk contoh.
4. Salin `api/config.example.php` menjadi `api/config.php`. Pada Windows PowerShell:

   ```powershell
   Copy-Item api\config.example.php api\config.php
   ```

5. Edit `api/config.php` bila akun MySQL Anda berbeda dari pengaturan XAMPP standar. Ganti `admin_password` dengan password pribadi minimal 12 karakter.
6. Pastikan PHP mengaktifkan ekstensi `pdo_mysql`, `fileinfo`, dan `mbstring`. Untuk foto maksimal 5 MB, `upload_max_filesize` harus minimal `5M` dan `post_max_size` minimal `6M` pada `php.ini`; restart Apache setelah mengubahnya.
7. Pastikan Apache memiliki izin menulis ke folder `uploads\products`.
8. Buka `http://localhost/ReVive_Project/` untuk katalog dan `http://localhost/ReVive_Project/admin.html` untuk admin.

Produk dan metadata fotonya disimpan pada tabel MySQL `products`. File foto disimpan sebagai file di `uploads/products` dan URL/path-nya dicatat di database. Unggah produk dari form publik tetap tersedia; tambah/hapus produk dan ganti foto di halaman admin memerlukan password admin.

Jangan publikasikan `api/config.php`. Jika situs dipindahkan ke server hosting, gunakan HTTPS dan ubah konfigurasi database serta password admin sesuai hosting.
