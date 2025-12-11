<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$file = $data['file'] ?? '';

if (empty($file)) {
    echo json_encode(['success' => false, 'error' => 'Файл не указан']);
    exit;
}

// Проверим, что файл находится в папке missions и это .html
if (!str_starts_with($file, 'missions/') || !str_ends_with($file, '.html')) {
    echo json_encode(['success' => false, 'error' => 'Запрещённый путь']);
    exit;
}

if (!file_exists($file)) {
    echo json_encode(['success' => true, 'message' => 'Файл уже удалён']);
    exit;
}

if (unlink($file)) {
    echo json_encode(['success' => true, 'message' => 'Файл удалён']);
} else {
    echo json_encode(['success' => false, 'error' => 'Не удалось удалить файл']);
}
