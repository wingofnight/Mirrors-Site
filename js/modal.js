// modal.js — модальное окно для скриншотов
document.addEventListener("DOMContentLoaded", function () {
  const screenshots = document.querySelectorAll(".screenshot");
  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");

// Создаём элемент изображения
  const modalImg = document.createElement("img");
  modalImg.classList.add("modal-image");
  overlay.appendChild(modalImg);

    // Добавляем оверлей в body
  document.body.appendChild(overlay);

   // Клик по скриншоту
  screenshots.forEach(img => {
    img.addEventListener("click", function () {
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  // Закрытие при клике на оверлей
  overlay.addEventListener("click", () => {
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  });

  // Закрытие на клавишу Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) {
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    }
  });
});

function showFullscreen(src) {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  overlay.classList.add('show'); // чтобы сразу показать

  const img = document.createElement('img');
  img.src = src;
  img.classList.add('modal-image');

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // Закрытие при клике
  overlay.onclick = () => {
    overlay.remove();
    document.body.style.overflow = '';
  };

  // Закрытие на Escape
  const closeOnEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', closeOnEscape);
    }
  };
  document.addEventListener('keydown', closeOnEscape);

  document.body.style.overflow = 'hidden';
}


// Закрытие мобильного меню при клике вне его
document.addEventListener("click", function (e) {
  const navbarCollapse = document.getElementById("navbarNav");
  const navbarToggler = document.querySelector(".navbar-toggler");

  // Проверяем, открыто ли меню
  const isMenuOpen = navbarCollapse.classList.contains("show");

  // Если меню открыто И клик был НЕ по меню и НЕ по кнопке — закрываем
  if (isMenuOpen && !navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
    new bootstrap.Collapse(navbarCollapse).toggle(); // или .hide()
  }
});
