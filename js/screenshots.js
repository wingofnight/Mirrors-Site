// js/screenshots.js

// Глобальная переменная — доступна для карусели
//let screenshots = [];

// Загружаем скриншоты из JSON
async function loadScreenshots() {
  try {
    const response = await fetch('screenshots.json');
    if (!response.ok) throw new Error('Не удалось загрузить screenshots.json');

    screenshots = await response.json();
    
    // После загрузки — инициализируем карусель (если функция есть)
    if (typeof renderCarousel === 'function') {
      renderCarousel();
    }
  } catch (err) {
    console.error('Ошибка:', err);
    screenshots = [
      { src: 'https://via.placeholder.com/400x225?text=Ошибка+загрузки', alt: 'Нет данных' }
    ];
    if (typeof renderCarousel === 'function') {
      renderCarousel();
    }
  }
}

// Запускаем загрузку после DOM
document.addEventListener('DOMContentLoaded', loadScreenshots);
