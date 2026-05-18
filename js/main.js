// Parallax hero
const heroBgImg = document.getElementById('heroBg');
if (heroBgImg) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        heroBgImg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const menu   = document.getElementById('navMenu');
toggle.addEventListener('click', () => {
  toggle.classList.toggle('open');
  menu.classList.toggle('open');
});
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Carousel factory
function initCarousel(carouselId, dotsId) {
  const wrap  = document.getElementById(carouselId);
  if (!wrap) return;
  const track  = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dotsEl = document.getElementById(dotsId);
  let cur = 0, timer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function goTo(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === cur)
    );
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 4500);
  }

  wrap.querySelector('.carousel-prev').addEventListener('click', () => goTo(cur - 1));
  wrap.querySelector('.carousel-next').addEventListener('click', () => goTo(cur + 1));

  let startX = 0;
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(cur + (diff > 0 ? 1 : -1));
  });

  resetTimer();
}

initCarousel('grassCarousel', 'grassDots');
initCarousel('mulchCarousel', 'mulchDots');

// EmailJS
emailjs.init('p7J8HXntEE-QVw-_u');

const form   = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');

    const services = [...form.querySelectorAll('input[name="services"]:checked')]
      .map(c => c.value).join(', ') || 'None selected';

    const params = {
      name:       form.name.value,
      from_name:  form.name.value,
      from_email: form.email.value,
      email:      form.email.value,
      phone:      form.phone.value,
      address:    form.address.value,
      service:    services,
      message:    form.message.value,
      time:       new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    btn.disabled = true;
    btn.textContent = 'Sending…';

    emailjs.send('service_obqb3f8', 'template_02argah', params)
      .then(() => {
        status.textContent = "Thanks! We'll be in touch soon.";
        status.style.color = '#a8e6b4';
        form.reset();
        btn.textContent = 'Send Request';
        btn.disabled = false;
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        status.textContent = 'Something went wrong. Please call or email us directly.';
        status.style.color = '#ffb3b3';
        btn.textContent = 'Send Request';
        btn.disabled = false;
      });
  });
}
