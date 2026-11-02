<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$pdo = database();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $statement = $pdo->query(
        'SELECT id, nama, harga, harga_baru AS hargaBaru, kategori, kondisi, penjual, ' .
        'whatsapp, deskripsi, foto FROM products ORDER BY created_at DESC, id DESC'
    );
    $products = $statement->fetchAll();
    foreach ($products as &$product) {
        $product['id'] = (int) $product['id'];
        $product['harga'] = (int) $product['harga'];
        $product['hargaBaru'] = (int) $product['hargaBaru'];
    }
    unset($product);
    respond(200, ['products' => $products]);
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'admin_create' || $action === 'update_image') {
        require_admin();
    } elseif ($action !== 'seller') {
        respond(400, ['error' => 'Aksi produk tidak valid.']);
    }

    $photoPath = save_uploaded_image('foto');
    if ($action === 'update_image') {
        $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            remove_product_image($photoPath);
            respond(400, ['error' => 'ID produk tidak valid.']);
        }

        $find = $pdo->prepare('SELECT foto FROM products WHERE id = ?');
        $find->execute([$id]);
        $existing = $find->fetch();
        if (!$existing) {
            remove_product_image($photoPath);
            respond(404, ['error' => 'Produk tidak ditemukan.']);
        }

        try {
            $update = $pdo->prepare('UPDATE products SET foto = ? WHERE id = ?');
            $update->execute([$photoPath, $id]);
        } catch (Throwable $error) {
            remove_product_image($photoPath);
            throw $error;
        }
        remove_product_image($existing['foto']);
        respond(200, ['foto' => $photoPath]);
    }

    $nama = trim((string) ($_POST['nama'] ?? ''));
    $kategori = trim((string) ($_POST['kategori'] ?? ''));
    $kondisi = trim((string) ($_POST['kondisi'] ?? ''));
    $penjual = trim((string) ($_POST['penjual'] ?? ''));
    $whatsapp = trim((string) ($_POST['whatsapp'] ?? ''));
    $deskripsi = trim((string) ($_POST['deskripsi'] ?? ''));
    $harga = filter_var($_POST['harga'] ?? null, FILTER_VALIDATE_INT);
    $hargaBaru = filter_var($_POST['hargaBaru'] ?? null, FILTER_VALIDATE_INT);
    $categories = ['Furnitur', 'Elektronik', 'Buku', 'Perlengkapan Kos', 'Give Away'];
    $conditions = ['Sangat Baik', 'Baik', 'Cukup Baik'];

    if (
        $nama === '' || mb_strlen($nama) > 150 ||
        $penjual === '' || mb_strlen($penjual) > 120 ||
        $deskripsi === '' ||
        !in_array($kategori, $categories, true) ||
        !in_array($kondisi, $conditions, true) ||
        !preg_match('/^62[0-9]{8,13}$/', $whatsapp) ||
        $harga === false || $harga < 0 ||
        $hargaBaru === false || $hargaBaru < 0
    ) {
        remove_product_image($photoPath);
        respond(400, ['error' => 'Periksa nama, harga, kategori, kondisi, deskripsi, dan nomor WhatsApp.']);
    }

    try {
        $insert = $pdo->prepare(
            'INSERT INTO products (nama, harga, harga_baru, kategori, kondisi, penjual, whatsapp, deskripsi, foto) ' .
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $insert->execute([
            $nama,
            $harga,
            $hargaBaru,
            $kategori,
            $kondisi,
            $penjual,
            $whatsapp,
            $deskripsi,
            $photoPath,
        ]);
    } catch (Throwable $error) {
        remove_product_image($photoPath);
        throw $error;
    }
    respond(201, ['id' => (int) $pdo->lastInsertId(), 'foto' => $photoPath]);
}

if ($method === 'DELETE') {
    require_admin();
    $body = json_decode(file_get_contents('php://input'), true);
    $id = is_array($body) ? filter_var($body['id'] ?? null, FILTER_VALIDATE_INT) : false;
    if (!$id || $id < 1) {
        respond(400, ['error' => 'ID produk tidak valid.']);
    }

    $find = $pdo->prepare('SELECT foto FROM products WHERE id = ?');
    $find->execute([$id]);
    $product = $find->fetch();
    if (!$product) {
        respond(404, ['error' => 'Produk tidak ditemukan.']);
    }

    $delete = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $delete->execute([$id]);
    remove_product_image($product['foto']);
    respond(200, ['deleted' => true]);
}

header('Allow: GET, POST, DELETE');
respond(405, ['error' => 'Metode tidak didukung.']);
