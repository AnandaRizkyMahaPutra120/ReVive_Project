<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'httponly' => true,
    'secure' => $isHttps,
    'samesite' => 'Strict',
]);
session_start();

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function app_config(): array
{
    static $config;
    if ($config !== null) {
        return $config;
    }

    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        respond(500, ['error' => 'Konfigurasi belum tersedia. Salin api/config.example.php menjadi api/config.php.']);
    }

    $config = require $path;
    if (!is_array($config)) {
        respond(500, ['error' => 'Konfigurasi aplikasi tidak valid.']);
    }

    return $config;
}

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = app_config();
    try {
        $pdo = new PDO(
            'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
            $config['db_user'],
            $config['db_password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (PDOException $error) {
        error_log('ReVive database connection failed: ' . $error->getMessage());
        respond(503, ['error' => 'Database belum terhubung. Periksa konfigurasi dan pastikan MySQL berjalan.']);
    }

    return $pdo;
}

function require_admin(): void
{
    if (empty($_SESSION['revive_admin'])) {
        respond(401, ['error' => 'Silakan masuk sebagai admin terlebih dahulu.']);
    }

    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $expected = $_SESSION['revive_csrf'] ?? '';
    if (!is_string($provided) || $expected === '' || !hash_equals($expected, $provided)) {
        respond(403, ['error' => 'Sesi keamanan tidak valid. Muat ulang halaman admin dan masuk kembali.']);
    }
}

function save_uploaded_image(string $field): string
{
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        respond(400, ['error' => 'Pilih foto produk yang valid.']);
    }

    $file = $_FILES[$field];
    if ($file['size'] < 1 || $file['size'] > 5 * 1024 * 1024) {
        respond(400, ['error' => 'Ukuran foto maksimal 5 MB.']);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    if (!isset($extensions[$mime]) || @getimagesize($file['tmp_name']) === false) {
        respond(400, ['error' => 'Format foto harus JPEG, PNG, atau WebP.']);
    }

    $directory = dirname(__DIR__) . '/uploads/products';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        respond(500, ['error' => 'Folder foto tidak dapat dibuat. Periksa izin folder uploads.']);
    }

    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $filename)) {
        respond(500, ['error' => 'Foto gagal disimpan. Periksa izin folder uploads.']);
    }

    return 'uploads/products/' . $filename;
}

function remove_product_image(?string $path): void
{
    if (!$path || !preg_match('~^uploads/products/[a-f0-9]{32}\.(jpg|png|webp)$~', $path)) {
        return;
    }

    $file = dirname(__DIR__) . '/' . $path;
    if (is_file($file) && !unlink($file)) {
        error_log('ReVive could not remove product image: ' . $file);
    }
}

set_exception_handler(static function (Throwable $error): void {
    error_log('ReVive API error: ' . $error->getMessage());
    respond(500, ['error' => 'Terjadi kesalahan server. Periksa log PHP untuk detail.']);
});
