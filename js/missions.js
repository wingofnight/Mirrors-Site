// missions.js — загружает миссии из JSON и генерирует аккордеон

const missionCache = {};

async function loadMissions() {
  try {
    const response = await fetch('missions-data.json');
    if (!response.ok) throw new Error('Не удалось загрузить данные миссий');
    const missions = await response.json();
    renderMissions(missions);
  } catch (err) {
    console.error(err);
    const container = document.getElementById('missionsDetails');
    container.innerHTML = `<div class="text-danger text-center">Ошибка: ${err.message}</div>`;
  }
}

function renderMissions(missions) {
  const container = document.getElementById('missionsDetails');

  missions.forEach(mission => {
    const { id, title, subtitle, src } = mission;

    const item = document.createElement('div');
    item.className = 'accordion-item border-start border-end';

    item.innerHTML = `
      <h3 class="accordion-header">
        <button class="accordion-button collapsed d-flex align-items-center"
                type="button"
                data-bs-toggle="collapse"
                data-mission-src="${src}"
                data-bs-target="#mission${id}"
                aria-expanded="false"
                aria-controls="mission${id}">
          <span class="badge bg-danger me-2">${id}</span>
          <strong>${title}</strong>
          <span class="text-muted small">${subtitle}</span>
        </button>
      </h3>
      <div id="mission${id}" class="accordion-collapse collapse" data-bs-parent="#missionsDetails">
        <div class="accordion-body" id="mission-content-${id}">
          <div class="text-center text-muted">
            <small>Загрузка описания...</small>
          </div>
        </div>
      </div>
    `;

    container.appendChild(item);
  });

  attachCollapseListeners();
}

function attachCollapseListeners() {
  document.querySelectorAll('[data-mission-src]').forEach(button => {
    const targetId = button.getAttribute('data-bs-target').replace('#', '');
    const contentId = `mission-content-${targetId.replace('mission', '')}`;
    const srcFile = button.getAttribute('data-mission-src');

    const collapse = document.getElementById(targetId);
    const contentDiv = document.getElementById(contentId);

    collapse.addEventListener('show.bs.collapse', function () {
      if (missionCache[srcFile]) {
        contentDiv.innerHTML = missionCache[srcFile];
        return;
      }

      contentDiv.innerHTML = `
        <div class="text-center">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
      `;

      fetch(srcFile)
        .then(r => r.text())
        .then(html => {
          contentDiv.innerHTML = html;
          missionCache[srcFile] = html;
        })
        .catch(e => {
          contentDiv.innerHTML = `<div class="text-danger">Ошибка: ${e.message}</div>`;
        });
    });
  });
}

// Запуск
document.addEventListener('DOMContentLoaded', loadMissions);
