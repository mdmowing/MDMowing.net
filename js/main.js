// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');

toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  menu.classList.toggle('open');
});

// Close nav when a link is clicked
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
  });
});

// Sticky nav background strengthens on scroll
const nav = document.getElementById('top').querySelector('.nav-header') || document.querySelector('.nav-header');

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// EmailJS
emailjs.init('p7J8HXntEE-QVw-_u');

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    emailjs.sendForm('service_obqb3f8', 'template_02argah', form)
      .then(() => {
        status.textContent = "Thanks! We'll be in touch soon.";
        status.style.color = '#a8e6b4';
        form.reset();
        btn.textContent = 'Send Request';
        btn.disabled = false;
      })
      .catch(() => {
        status.textContent = 'Something went wrong. Please call or email us directly.';
        status.style.color = '#ffb3b3';
        btn.textContent = 'Send Request';
        btn.disabled = false;
      });
  });
}
