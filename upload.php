<?php
// upload.php — совместимый с PHP 5.6+

// Отключаем вывод ошибок (чтобы не сломать JSON)
error_reporting(0);
ini_set('display_errors', 0);

// Устанавливаем UTF-8
header('Content-Type: application/json; charset=utf-8');

// Папка для загрузки
$uploadDir = 'uploads/';

// Проверка: существует ли папка
if (!is_dir($uploadDir)) {
    echo json_encode(array('success' => false, 'error' => 'Папка uploads/ не найдена'));
    exit;
}

// Проверка: доступна ли для записи
if (!is_writable($uploadDir)) {
    echo json_encode(array('success' => false, 'error' => 'Папка uploads/ недоступна для записи'));
    exit;
}

// Проверка: передан ли файл
if (!isset($_FILES['file']) || !isset($_FILES['file']['name']) || empty($_FILES['file']['name'])) {
    echo json_encode(array('success' => false, 'error' => 'Файл не выбран'));
    exit;
}

$file = $_FILES['file'];

// Проверка ошибок
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errors = array(
        UPLOAD_ERR_INI_SIZE => 'Файл превышает размер в php.ini',
        UPLOAD_ERR_FORM_SIZE => 'Файл превышает размер в форме',
        UPLOAD_ERR_PARTIAL => 'Файл загружен частично',
        UPLOAD_ERR_NO_FILE => 'Файл не загружен',
        UPLOAD_ERR_NO_TMP_DIR => 'Нет временной папки',
        UPLOAD_ERR_CANT_WRITE => 'Не удалось записать файл',
        UPLOAD_ERR_EXTENSION => 'Загрузка остановлена расширением'
    );
    echo json_encode(array('success' => false, 'error' => $errors[$file['error']]));
    exit;
}

// Проверка размера (5 МБ макс)
if ($file['size'] > 5242880) { // 5 * 1024 * 1024
    echo json_encode(array('success' => false, 'error' => 'Файл слишком большой (макс. 5 МБ)'));
    exit;
}

// === Определяем MIME-тип (без finfo_open, если не доступен) ===
$mimeType = null;

// Способ 1: через mime_content_type (если включён)
if (function_exists('mime_content_type')) {
    $mimeType = mime_content_type($file['tmp_name']);
}

// Способ 2: через расширение файла (резерв)
if (!$mimeType) {
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $mimes = array(
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp'
    );
    $mimeType = isset($mimes[$ext]) ? $mimes[$ext] : 'application/octet-stream';
}

$allowedTypes = array('image/jpeg', 'image/png', 'image/webp');
if (!in_array($mimeType, $allowedTypes)) {
    echo json_encode(array('success' => false, 'error' => 'Недопустимый формат: ' . $mimeType));
    exit;
}

// === Генерация имени файла (без random_bytes) ===
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'scr_' . time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
$filepath = $uploadDir . $filename;

// === Попытка сохранить ===
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode(array('success' => true, 'src' => $filepath));
} else {
    echo json_encode(array('success' => false, 'error' => 'Не удалось сохранить файл. Проверьте папку uploads/'));
}
