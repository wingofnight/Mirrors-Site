<?php
header('Content-Type: application/json; charset=utf-8');

// Разрешаем CORS (для локального теста)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обрабатываем preflight-запрос (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Разрешённые файлы
$allowed_files = ['missions-data.json', 'screenshots.json'];

// Проверяем метод
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Метод не разрешён', 'method' => $_SERVER['REQUEST_METHOD']]);
    exit;
}

// Читаем тело запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Нет данных или неверный JSON']);
    exit;
}

$file = $input['file'] ?? '';
$data = $input['data'] ?? [];

if (!in_array($file, $allowed_files)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Запрещённый файл: ' . $file]);
    exit;
}

// Проверяем, что data — массив
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Поле data должно быть массивом']);
    exit;
}

// Преобразуем в красивый JSON
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($json === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка кодирования JSON: ' . json_last_error_msg()]);
    exit;
}

// Сохраняем
if (file_put_contents($file, $json)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Файл сохранён']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Не удалось записать файл', 'file' => $file]);
}
?>
