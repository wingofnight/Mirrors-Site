// =====================
// 🔐 АДМИНКА: Управление миссиями и скриншотами
// =====================

// 🔐 Пароль
const ADMIN_PASSWORD = 'Wing777'; // ← смени на свой

// Глобальные данные
let missions = [];
let screenshots = [];

// ==============
// 🔐 Проверка пароля
// ==============
function checkPassword() {
  const input = document.getElementById('adminPassword');
  const error = document.getElementById('passwordError');

  if (input.value === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuthenticated', 'true');
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadMissions();
    loadScreenshotsData();
  } else {
    error.classList.remove('d-none');
    input.value = '';
    input.focus();
  }
}

document.getElementById('adminPassword')?.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') checkPassword();
});

// ==============
// 📥 Загрузка миссий
// ==============
async function loadMissions() {
  try {
    const response = await fetch('missions-data.json');
    if (!response.ok) throw new Error('Файл не найден');
    missions = await response.json();
    renderMissionList();
  } catch (err) {
    console.error('Ошибка загрузки missions-data.json:', err);
    missions = [];
    renderMissionList();
  }
}

// ==============
// 🖼️ Загрузка скриншотов
// ==============
async function loadScreenshotsData() {
  try {
    const response = await fetch('screenshots.json');
    
    // Проверяем, что запрос успешен
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    // Читаем тело как текст
    const text = await response.text();

    // Если пусто — возвращаем пустой массив
    if (!text.trim()) {
      console.warn('screenshots.json пустой');
      screenshots = [];
      renderScreenshotsList();
      return;
    }

    // Пробуем распарсить
    screenshots = JSON.parse(text);
    renderScreenshotsList();

  } catch (err) {
    console.error('Ошибка загрузки или парсинга screenshots.json:', err);
    
    // Если ошибка — подставляем fallback
    screenshots = [
      {
        id: 1,
        src: "https://via.placeholder.com/800x450?text=No+Image",
        alt: "Пример скриншота (ошибка загрузки)"
      }
    ];
    renderScreenshotsList();
  }
}

// ==============
// 📝 Рендер миссий
// ==============
function renderMissionList() {
  const list = document.getElementById('missionsList');
  if (!list) return;
  list.innerHTML = '';

  missions.forEach(m => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <div>
        <strong>${m.id}. ${m.title}</strong>
        <div class="text-muted small">${m.subtitle} | ${m.src}</div>
      </div>
      <div>
        <button data-id="${m.id}" class="btn btn-warning btn-sm edit">✏️</button>
        <button data-id="${m.id}" class="btn btn-danger btn-sm delete">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', editMission));
  document.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', deleteMission));
}

// ==============
// 📷 Рендер скриншотов (с превью)
// ==============
function renderScreenshotsList() {
  const list = document.getElementById('screenshotsList');
  if (!list) return;
  list.innerHTML = '';

  screenshots.forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center p-3';

    li.innerHTML = `
  <!-- Миниатюра слева -->
  <div style="
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    overflow: hidden;
    border-radius: 8px;
    margin-right: 15px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  " 
  onclick="showFullscreen('${s.src}')">
    <img src="${s.src}" 
         alt="${s.alt}" 
         style="
           width: 100%;
           height: 100%;
           object-fit: cover;
         "
         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2QxM2IzZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+4oCQPC90ZXh0Pjwvc3ZnPg=='; this.style.objectFit='contain';">
  </div>

  <!-- Описание -->
  <div class="flex-grow-1">
    <strong>${s.alt || 'Без описания'}</strong>
    <div class="text-muted small">${s.src.length > 50 ? s.src.slice(0, 50) + '...' : s.src}</div>
  </div>

  <!-- Кнопки -->
  <div>
    <button data-id="${s.id}" class="btn btn-warning btn-sm edit-screenshot me-1">✏️</button>
    <button data-id="${s.id}" class="btn btn-danger btn-sm delete-screenshot">🗑️</button>
  </div>
`;
    list.appendChild(li);
  });

  document.querySelectorAll('.edit-screenshot').forEach(btn => btn.addEventListener('click', editScreenshot));
  document.querySelectorAll('.delete-screenshot').forEach(btn => btn.addEventListener('click', deleteScreenshot));
}

// ==============
// ➕ Добавление миссии
// ==============
document.getElementById('missionForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const id = +document.getElementById('id').value;
  const title = document.getElementById('title').value;
  const subtitle = document.getElementById('subtitle').value;
  const src = document.getElementById('src').value;

  if (missions.some(m => m.id === id)) {
    alert(`Миссия №${id} уже существует!`);
    return;
  }

  missions.push({ id, title, subtitle, src });
  missions.sort((a, b) => a.id - b.id);
  renderMissionList();
  this.reset();
});

// ==============
// ➕ Добавление скриншота
// ==============
document.getElementById('screenshotForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const alt = document.getElementById('screenshotAlt').value;
  if (!alt) {
    alert('Введите описание (alt)!');
    return;
  }

  let src = '';

  // === Способ 1: по ссылке ===
  if (document.getElementById('srcUrl').checked) {
    src = document.getElementById('screenshotSrc').value;
    if (!src) {
      alert('Введите ссылку!');
      return;
    }

    // Добавляем сразу
    addScreenshot(src, alt);
  }

  // === Способ 2: файл с компьютера ===
  else if (document.getElementById('srcFile').checked) {
    const fileInput = document.getElementById('screenshotFile');
    const file = fileInput.files[0];

    if (!file) {
      alert('Выберите файл!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('upload.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        src = result.src;
        addScreenshot(src, alt);
      } else {
        alert('Ошибка: ' + result.error);
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  }
});

// Вспомогательная функция добавления
function addScreenshot(src, alt) {
  const id = screenshots.length ? Math.max(...screenshots.map(s => s.id)) + 1 : 1;
  screenshots.push({ id, src, alt });
  renderScreenshotsList();
  document.getElementById('screenshotForm').reset();

  // Сброс вкладок
  document.getElementById('urlField').style.display = 'block';
  document.getElementById('fileField').style.display = 'none';
}

// Переключение полей
document.querySelectorAll('input[name="srcType"]').forEach(radio => {
  radio.addEventListener('change', function () {
    document.getElementById('urlField').style.display = document.getElementById('srcUrl').checked ? 'block' : 'none';
    document.getElementById('fileField').style.display = document.getElementById('srcFile').checked ? 'block' : 'none';
  });
});

// ==============
// ✏️ Редактирование миссии
// ==============
function editMission(e) {
  const id = +e.target.dataset.id;
  const m = missions.find(m => m.id === id);

  const newTitle = prompt('Название', m.title);
  if (newTitle === null) return;

  const newSubtitle = prompt('Кратко', m.subtitle);
  const newSrc = prompt('Файл описания', m.src);

  m.title = newTitle;
  m.subtitle = newSubtitle;
  m.src = newSrc;

  renderMissionList();
}

// ==============
// ✏️ Редактирование скриншота
// ==============
// Глобальная переменная для хранения ID редактируемого скриншота
// Глобальная переменная для ID редактируемого скриншота
let editingScreenshotId = null;

// ✏️ Редактирование скриншота — с предпросмотром и кликом
function editScreenshot(e) {
  const id = +e.target.dataset.id;
  const s = screenshots.find(s => s.id === id);

  if (!s) return;

  // Сохраняем ID
  editingScreenshotId = id;

  // Заполняем поля
  document.getElementById('editScreenshotAlt').value = s.alt;
  //document.getElementById('editScreenshotSrc').value = s.src;

  // Обновляем превью
  const previewImg = document.getElementById('editScreenshotPreview');
  previewImg.src = s.src;

  // Обработка ошибки
  previewImg.onerror = () => {
    previewImg.src = 'https://via.placeholder.com/400x225?text=Ошибка';
    previewImg.style.objectFit = 'contain';
  };

  // === КЛИК ПО ПРЕВЬЮ ===
  previewImg.onclick = function () {
    const fullModal = document.getElementById('fullscreenModal');
    const fullImg = document.getElementById('fullscreenImage');

    if (!fullModal || !fullImg) return;
    if (previewImg.src.includes('placeholder')) return;

    fullImg.src = previewImg.src;

    fullModal.style.display = 'flex'; 
    fullModal.classList.add('show'); // Оставляем класс для обработчика Escape

    document.body.style.overflow = 'hidden';
  };

  // Показываем модальное окно
  const modal = new bootstrap.Modal(document.getElementById('editScreenshotModal'));
  modal.show();
}

function showFullscreen(src) {
  const modal = document.getElementById('fullscreenModal');
  const img = document.getElementById('fullscreenImage');

  img.src = src;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// ==============
// ❌ Закрытие полноэкранного просмотра
// ==============
function closeFullscreen() {
  const modal = document.getElementById('fullscreenModal');
  const img = document.getElementById('fullscreenImage');

  if (modal) {
   // 1. Прячем модальное окно, переопределяя inline-стиль
    modal.style.display = 'none'; 
    // 2. Убираем класс 'show' (для чистоты)
    modal.classList.remove('show'); 
    // 3. Восстанавливаем прокрутку страницы
    document.body.style.overflow = '';
  }
  
  // Очистка src, чтобы изображение не висело в памяти
  if (img) img.src = '';
}

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('fullscreenModal');
  const img = document.getElementById('fullscreenImage');

  // === Закрытие по клику на фон ===
  modal.addEventListener('click', function (e) {
   
    if (e.target === this) {
      this.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // === Закрытие по Escape ===
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      
    }
  });
});

// ==============
// 🗑️ Удаление миссии
// ==============
function deleteMission(e) {
  const id = +e.target.dataset.id;
  if (confirm(`Удалить миссию №${id}?`)) {
    missions = missions.filter(m => m.id !== id);
    renderMissionList();
  }
}

// ==============
// 🗑️ Удаление скриншота
// ==============
function deleteScreenshot(e) {
  const id = +e.target.dataset.id;
  if (confirm(`Удалить скриншот "${screenshots.find(s => s.id === id).alt}"?`)) {
    screenshots = screenshots.filter(s => s.id !== id);
    renderScreenshotsList();
  }
}

// ==============
// 💾 Сохранение на сервер (PHP)
// ==============
async function saveToServer() {
  const data = [
    { file: 'missions-data.json', data: missions },
    { file: 'screenshots.json', data: screenshots }
  ];

  for (const item of data) {
    try {
      const response = await fetch('save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      alert(`❌ Ошибка: ${err.message}`);
      return;
    }
  }

  alert('✅ Все данные сохранены на сервере!');
}

// ==============
// 🔘 Кнопка "Сохранить"
// ==============
document.getElementById('saveJson')?.addEventListener('click', saveToServer);
document.getElementById('saveScreenshots')?.addEventListener('click', saveToServer);






// ==============
// 🚀 Запуск
// ==============
document.addEventListener('DOMContentLoaded', function () {
  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadMissions();
    loadScreenshotsData();
  } else {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('adminPassword').focus();
  }
});
