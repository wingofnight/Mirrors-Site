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
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    const text = await response.text();
    if (!text.trim()) {
      screenshots = [];
    } else {
      screenshots = JSON.parse(text);
    }
    renderScreenshotsList();
  } catch (err) {
    console.error('Ошибка загрузки screenshots.json:', err);
    screenshots = [
      { id: 1, src: "https://via.placeholder.com/800x450?text=No+Image", alt: "Ошибка загрузки" }
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
        <div class="text-muted small">${m.subtitle}</div>
      </div>
      <div>
        <button data-id="${m.id}" class="btn btn-warning btn-sm edit me-1">✏️</button>
        <button data-id="${m.id}" class="btn btn-danger btn-sm delete">🗑️</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', editMission));
  document.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', deleteMission));
}

// ==============
// 📷 Рендер скриншотов
// ==============
function renderScreenshotsList() {
  const list = document.getElementById('screenshotsList');
  if (!list) return;
  list.innerHTML = '';

  screenshots.forEach(s => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center p-3';

    li.innerHTML = `
      <div style="flex-shrink:0; width:60px; height:60px; overflow:hidden; border-radius:8px; margin-right:15px; cursor:pointer;" onclick="showFullscreen('${s.src}')">
        <img src="${s.src}" alt="${s.alt}" style="width:100%; height:100%; object-fit:cover;">
      </div>
      <div class="flex-grow-1">
        <strong>${s.alt || 'Без описания'}</strong>
      </div>
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
// ✏️ Редактирование миссии — открывает модальное окно
// ==============
function editMission(e) {
  const id = +e.target.closest('.edit')?.dataset.id || +e.target.dataset.id;
  const m = missions.find(m => m.id === id);
  if (!m) return;

  const modal = new bootstrap.Modal(document.getElementById('addMissionModal'));
  modal.show();

  document.querySelector('#addMissionModal .modal-title').textContent = 'Редактировать миссию';
  document.getElementById('newMissionId').value = m.id;
  document.getElementById('newMissionId').readOnly = true;
  document.getElementById('newMissionTitle').value = m.title;
  document.getElementById('newMissionSubtitle').value = m.subtitle;
  document.getElementById('newMissionEditor').innerHTML = m.content || '';

  const saveBtn = document.getElementById('saveNewMission');
  saveBtn.textContent = '✅ Сохранить изменения';
  saveBtn.classList.remove('btn-success');
  saveBtn.classList.add('btn-primary');
}

// ==============
// 🗑️ Удаление миссии (объект + файл)
// ==============
async function deleteMission(e) {
  const id = +e.target.closest('.delete')?.dataset.id || +e.target.dataset.id;
  const m = missions.find(m => m.id === id);
  if (!m) return;

  if (!confirm(`Удалить миссию №${id} — "${m.title}"?`)) return;

  // Удаляем файл
  const deleted = await deleteMissionFile(m.src);
  if (!deleted) {
    // Не удаляем из списка, если файл не удалился
    return;
  }

  // Удаляем из массива
  missions = missions.filter(mission => mission.id !== id);
  renderMissionList();

  // Сохраняем обновлённый missions-data.json
  try {
    const response = await fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'missions-data.json', data: missions })
    });

    const result = await response.json();
    if (result.success) {
      alert(`✅ Миссия №${id} и файл удалены`);
    } else {
      alert('⚠️ Данные обновлены, но ошибка при сохранении JSON');
    }
  } catch (err) {
    alert('❌ Ошибка при сохранении missions-data.json: ' + err.message);
  }
}


// ==============
// 🖼️ Редактирование скриншота
// ==============
let editingScreenshotId = null;

function editScreenshot(e) {
  const id = +e.target.closest('.edit-screenshot')?.dataset.id || +e.target.dataset.id;
  const s = screenshots.find(s => s.id === id);
  if (!s) return;

  editingScreenshotId = id;
  document.getElementById('editScreenshotAlt').value = s.alt;

  const previewImg = document.getElementById('editScreenshotPreview');
  previewImg.src = s.src;
  previewImg.onerror = () => {
    previewImg.src = 'https://via.placeholder.com/400x225?text=Ошибка';
    previewImg.style.objectFit = 'contain';
  };

  previewImg.onclick = () => {
    const modal = document.getElementById('fullscreenModal');
    const img = document.getElementById('fullscreenImage');
    if (!modal || !img || previewImg.src.includes('placeholder')) return;
    img.src = previewImg.src;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  new bootstrap.Modal(document.getElementById('editScreenshotModal')).show();
}

function showFullscreen(src) {
  document.getElementById('fullscreenImage').src = src;
  document.getElementById('fullscreenModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
  const modal = document.getElementById('fullscreenModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  document.getElementById('fullscreenImage').src = '';
}

document.addEventListener('click', e => {
  const modal = document.getElementById('fullscreenModal');
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('fullscreenModal');
    if (modal?.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      document.getElementById('fullscreenImage').src = '';
    }
  }
});

// ==============
// ➕ Добавление изображения в редактор
// ==============
function insertTextToEditor(html) {
  document.execCommand('insertHTML', false, html);
  document.getElementById('newMissionEditor').focus();
}

async function addImageToNewEditor() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('upload.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const img = `<p><img src="${result.src}" alt="Изображение" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></p>`;
        insertTextToEditor(img);

        // Добавляем в галерею
        const id = screenshots.length ? Math.max(...screenshots.map(s => s.id)) + 1 : 1;
        screenshots.push({
          id: id,
          src: result.src,
          alt: `Скриншот из миссии ${document.getElementById('newMissionTitle').value || 'без названия'}`
        });
        renderScreenshotsList();
      } else {
        alert('Ошибка загрузки: ' + result.error);
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  input.click();
}

// ==============
// 📄 Формирование HTML-файла миссии
// ==============
function generateMissionHTML(id, title, subtitle, content) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="../css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f8f9fa;
      font-family: 'Arial', sans-serif;
      color: #333;
      line-height: 1.8;
      padding: 60px 20px;
      margin: 0;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 15px;
    }
    h1 {
      color: #e74c3c;
      font-size: 2.5rem;
      text-align: center;
      border-bottom: 3px solid #e74c3c;
      padding-bottom: 10px;
      margin: 1.5rem 0;
    }
    h3 {
      color: #c0392b;
      margin-top: 30px;
      border-bottom: 2px solid #eee;
      padding-bottom: 8px;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 1.2rem;
    }
    em {
      color: #666;
      font-style: italic;
    }
    strong {
      color: #333;
      font-weight: 600;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.2);
      margin: 20px auto;
    }
    hr {
      border: 1px solid #ddd;
      margin: 40px 0;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      font-size: 1rem;
      border: 2px solid #333;
      color: #333;
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.3s;
    }
    .btn:hover {
      background: #333;
      color: white;
    }
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .container { max-width: 600px; }
      body { padding: 40px 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p><em>${subtitle}</em></p>
    ${content}
    <hr>
    <a href="../index.html" class="btn">&larr; Назад к фан-сайту</a>
  </div>
</body>
</html>`;
}

// ==============
// 📄 Оборачиваем "висячий" текст в <p>
// ==============
function wrapContentInParagraphs(html) {
  if (!html) return '';
  return html
    .replace(/</g, ' <')
    .replace(/>/g, '> ')
    .split(/(<\/?p[^>]*>|<h\d>.*?<\/h\d>|<img.*?>|<hr>|<ul>.*?<\/ul>|<ol>.*?<\/ol>|<br\s*\/?>)/gi)
    .filter(Boolean)
    .map(block => {
      block = block.trim();
      if (!block || block.startsWith('<p') || block.startsWith('<h') || block.startsWith('<img') || block.startsWith('<hr') || block.startsWith('<ul') || block.startsWith('<ol') || block.startsWith('<br')) {
        return block;
      }
      return `<p>${block}</p>`;
    })
    .join('')
    .replace(/<p><\/p>/g, '');
}

// ==============
// 💾 Сохранение на сервер
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
// 🚀 Инициализация
// ==============
document.addEventListener('DOMContentLoaded', function () {
  // === Сохранение миссии (новая или редактирование) ===
  document.getElementById('saveNewMission')?.addEventListener('click', async function () {
    const id = parseInt(document.getElementById('newMissionId').value);
    const title = document.getElementById('newMissionTitle').value;
    const subtitle = document.getElementById('newMissionSubtitle').value;
    const rawContent = document.getElementById('newMissionEditor').innerHTML.trim();

    if (!id || !title || !rawContent) {
      alert('Заполните номер, название и текст миссии!');
      return;
    }

    const content = wrapContentInParagraphs(rawContent);
    const src = `missions/mission${id}.html`;
    const htmlContent = generateMissionHTML(id, title, subtitle, content);

    try {
      const response = await fetch('save-content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: src, content: htmlContent })
      });

      const result = await response.json();

      if (result.success) {
        const exists = missions.some(m => m.id === id);

        if (exists) {
          const m = missions.find(m => m.id === id);
          Object.assign(m, { id, title, subtitle, src, content });
        } else {
          missions.push({ id, title, subtitle, src, content });
          missions.sort((a, b) => a.id - b.id);
        }

        renderMissionList();

        // Сброс формы
        document.getElementById('newMissionId').value = '';
        document.getElementById('newMissionId').readOnly = false;
        document.getElementById('newMissionTitle').value = '';
        document.getElementById('newMissionSubtitle').value = '';
        document.getElementById('newMissionEditor').innerHTML = '';

        const saveBtn = document.getElementById('saveNewMission');
        saveBtn.textContent = '➕ Добавить';
        saveBtn.classList.remove('btn-primary');
        saveBtn.classList.add('btn-success');

        document.querySelector('#addMissionModal .modal-title').textContent = 'Добавить миссию';

        bootstrap.Modal.getInstance(document.getElementById('addMissionModal')).hide();

        alert('✅ Миссия сохранена!');
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (err) {
      alert('❌ Ошибка сети: ' + err.message);
    }
  });

  // === Сброс формы при закрытии модального окна ===
  document.getElementById('addMissionModal')?.addEventListener('hidden.bs.modal', function () {
    document.getElementById('newMissionId').value = '';
    document.getElementById('newMissionId').readOnly = false;
    document.getElementById('newMissionTitle').value = '';
    document.getElementById('newMissionSubtitle').value = '';
    document.getElementById('newMissionEditor').innerHTML = '';

    const saveBtn = document.getElementById('saveNewMission');
    saveBtn.textContent = '➕ Добавить';
    saveBtn.classList.remove('btn-primary');
    saveBtn.classList.add('btn-success');

    document.querySelector('#addMissionModal .modal-title').textContent = 'Добавить миссию';
  });

  // === Редактирование скриншота — сохранение ===
  document.getElementById('saveEditScreenshot')?.addEventListener('click', function () {
    if (!editingScreenshotId) return;
    const s = screenshots.find(s => s.id === editingScreenshotId);
    if (!s) return;
    s.alt = document.getElementById('editScreenshotAlt').value;
    renderScreenshotsList();
    bootstrap.Modal.getInstance(document.getElementById('editScreenshotModal')).hide();
  });

  // === Переключение источника скриншота ===
  document.querySelectorAll('input[name="srcType"]').forEach(radio => {
    radio.addEventListener('change', function () {
      document.getElementById('urlField').style.display = document.getElementById('srcUrl').checked ? 'block' : 'none';
      document.getElementById('fileField').style.display = document.getElementById('srcFile').checked ? 'block' : 'none';
    });
  });

  // === Форма добавления скриншота ===
  document.getElementById('screenshotForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const alt = document.getElementById('screenshotAlt').value;
    if (!alt) {
      alert('Введите описание (alt)!');
      return;
    }

    let src = '';
    if (document.getElementById('srcUrl').checked) {
      src = document.getElementById('screenshotSrc').value;
      if (!src) {
        alert('Введите ссылку!');
        return;
      }
      addScreenshot(src, alt);
    } else if (document.getElementById('srcFile').checked) {
      const file = document.getElementById('screenshotFile').files[0];
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
          addScreenshot(result.src, alt);
        } else {
          alert('Ошибка: ' + result.error);
        }
      } catch (err) {
        alert('Ошибка сети: ' + err.message);
      }
    }
  });

  // === Проверка авторизации ===
  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadMissions();
    loadScreenshotsData();
  } else {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('adminPassword')?.focus();
  }
});

// ==============
// 📷 Добавление скриншота
// ==============
function addScreenshot(src, alt) {
  const id = screenshots.length ? Math.max(...screenshots.map(s => s.id)) + 1 : 1;
  screenshots.push({ id, src, alt });
  renderScreenshotsList();
  document.getElementById('screenshotForm').reset();
  document.getElementById('urlField').style.display = 'block';
  document.getElementById('fileField').style.display = 'none';
}
// Удаление HTML-файла миссии
async function deleteMissionFile(src) {
  try {
    const response = await fetch('delete-mission.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: src })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return true;
  } catch (err) {
    alert('⚠️ Не удалось удалить файл: ' + err.message);
    return false;
  }
}
// ==============
// 🗑️ Удаление скриншота (объект + файл, если локальный)
// ==============
async function deleteScreenshot(e) {
  const id = +e.target.closest('.delete-screenshot')?.dataset.id || +e.target.dataset.id;
  const s = screenshots.find(s => s.id === id);
  if (!s) return;

  const alt = s.alt || 'Скриншот';
  if (!confirm(`Удалить скриншот "${alt}"?`)) return;

  // Проверим, локальный ли файл (загружался ли через админку)
  if (s.src.startsWith('uploads/')) {
    // Отправляем запрос на удаление файла
    try {
      const response = await fetch('delete-file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: s.src })
      });

      const result = await response.json();
      if (!result.success) {
        alert('⚠️ Не удалось удалить файл: ' + result.error);
        return; // Не удаляем из списка, если файл не удалился
      }
    } catch (err) {
      alert('❌ Ошибка при удалении файла: ' + err.message);
      return;
    }
  }
  // Если это внешняя ссылка — ничего не удаляем на сервере

  // Удаляем из массива
  screenshots = screenshots.filter(ss => ss.id !== id);
  renderScreenshotsList();

  // Сохраняем обновлённый screenshots.json
  try {
    const response = await fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'screenshots.json', data: screenshots })
    });

    const result = await response.json();
    if (result.success) {
      alert(`✅ Скриншот "${alt}" удалён`);
    } else {
      alert('⚠️ Ошибка при сохранении screenshots.json');
    }
  } catch (err) {
    alert('❌ Ошибка при сохранении: ' + err.message);
  }
}
