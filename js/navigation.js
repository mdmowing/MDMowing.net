(() => {
  'use strict';
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;
  const close = () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      close();
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', close);
})();
