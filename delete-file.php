<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$file = $data['file'] ?? '';

if (empty($file)) {
    echo json_encode(['success' => false, 'error' => 'Файл не указан']);
    exit;
}

// Допустимые папки для удаления
$allowed_dirs = ['uploads/', 'screenshots/', 'img/'];
$dir_ok = false;
foreach ($allowed_dirs as $dir) {
    if (str_starts_with($file, $dir)) {
        $dir_ok = true;
        break;
    }
}

if (!$dir_ok) {
    echo json_encode(['success' => false, 'error' => 'Удаление из этой папки запрещено']);
    exit;
}

// Проверим, что файл существует и это не что-то системное
if (!file_exists($file)) {
    echo json_encode(['success' => true, 'message' => 'Файл уже удалён']);
    exit;
}

// Защита от попыток вверх по директориям
if (strpos($file, '..') !== false || strpos($file, '/') === 0) {
    echo json_encode(['success' => false, 'error' => 'Недопустимый путь']);
    exit;
}

// Удаляем файл
if (unlink($file)) {
    echo json_encode(['success' => true, 'message' => 'Файл удалён']);
} else {
    echo json_encode(['success' => false, 'error' => 'Не удалось удалить файл']);
}
