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

// Google Reviews
// To activate:
//   1. Go to console.cloud.google.com → New Project → Enable "Places API (New)" → Credentials → Create API Key → restrict to mdmowing.net
//   2. Find your Place ID: developers.google.com/maps/documentation/javascript/examples/places-placeid-finder → search "MD Mowing"
//   3. Paste both values below and push.
const GOOGLE_API_KEY  = 'AIzaSyDaU4frp2CtzlMcGWU63M5nCauyCqzgSdg';
const GOOGLE_PLACE_ID = 'ChIJyXBzI4z6AwoRfhawZ0mHP1A';

function loadGoogleReviews() {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') return;
  const s = document.createElement('script');
  s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=initGoogleReviews`;
  s.async = true;
  document.head.appendChild(s);
}

window.initGoogleReviews = function () {
  const container = document.getElementById('googleReviews');
  if (!container) return;
  const svc = new google.maps.places.PlacesService(document.createElement('div'));
  svc.getDetails(
    { placeId: GOOGLE_PLACE_ID, fields: ['reviews', 'rating', 'user_ratings_total'] },
    (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !place.reviews?.length) return;
      const reviews = place.reviews.filter(r => r.rating >= 4).slice(0, 6);
      if (!reviews.length) return;
      const sub = document.getElementById('reviewsSub');
      if (sub && place.rating) {
        sub.textContent = `${place.rating} ★ on Google · ${place.user_ratings_total}+ reviews`;
      }
      container.innerHTML = reviews.map(r => `
        <div class="testimonial-card in">
          <div class="review-header">
            <img class="reviewer-avatar" src="${r.profile_photo_url}" alt="${r.author_name}" loading="lazy" onerror="this.style.display='none'" />
            <div class="reviewer-info">
              <div class="reviewer-name">${r.author_name}</div>
              <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            </div>
            <svg class="google-icon" viewBox="0 0 24 24" aria-label="Google review" role="img">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <p>"${r.text.length > 220 ? r.text.slice(0, 220).trimEnd() + '…' : r.text}"</p>
          <div class="review-time">${r.relative_time_description}</div>
        </div>
      `).join('');
    }
  );
};

loadGoogleReviews();

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
