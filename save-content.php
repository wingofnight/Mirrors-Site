<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$file = trim($data['file']);
$content = $data['content'];

if (!$file || !$content) {
    echo json_encode(['success' => false, 'error' => 'Нет данных']);
    exit;
}

// Защита: только файлы в папке missions/
if (!preg_match('/^missions\/mission\d+\.html$/', $file)) {
    echo json_encode(['success' => false, 'error' => 'Недопустимое имя файла']);
    exit;
}

// Создаём папку, если её нет
$dir = dirname($file);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

// Сохраняем
if (file_put_contents($file, $content)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Не удалось записать файл']);
}
?>
