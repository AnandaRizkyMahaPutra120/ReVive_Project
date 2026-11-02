<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $authenticated = !empty($_SESSION['revive_admin']);
    if ($authenticated && empty($_SESSION['revive_csrf'])) {
        $_SESSION['revive_csrf'] = bin2hex(random_bytes(32));
    }

    respond(200, [
        'authenticated' => $authenticated,
        'csrfToken' => $authenticated ? $_SESSION['revive_csrf'] : '',
    ]);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $password = is_array($body) ? ($body['password'] ?? '') : '';
    $configuredPassword = app_config()['admin_password'] ?? '';

    if (
        !is_string($configuredPassword) ||
        strlen($configuredPassword) < 12 ||
        $configuredPassword === 'GANTI_DENGAN_PASSWORD_ADMIN_YANG_KUAT'
    ) {
        respond(503, ['error' => 'Atur password admin yang kuat di api/config.php terlebih dahulu.']);
    }

    if (!is_string($password) || !hash_equals($configuredPassword, $password)) {
        respond(401, ['error' => 'Password admin salah.']);
    }

    session_regenerate_id(true);
    $_SESSION['revive_admin'] = true;
    $_SESSION['revive_csrf'] = bin2hex(random_bytes(32));
    respond(200, ['authenticated' => true, 'csrfToken' => $_SESSION['revive_csrf']]);
}

if ($method === 'DELETE') {
    require_admin();
    $_SESSION = [];
    session_destroy();
    respond(200, ['authenticated' => false]);
}

header('Allow: GET, POST, DELETE');
respond(405, ['error' => 'Metode tidak didukung.']);
