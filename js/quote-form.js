/* Keep the existing EmailJS template and its parameter names backward-compatible. */
(() => {
  'use strict';
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const button = form.querySelector('button[type="submit"]');
  const field = name => form.elements.namedItem(name);
  let sending = false;

  function selectService(value) {
    if ([...field('service').options].some(option => option.value === value)) {
      field('service').value = value;
    }
  }
  selectService(new URLSearchParams(window.location.search).get('service'));
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      selectService(link.dataset.service);
      form.scrollIntoView({ behavior: 'auto', block: 'start' });
      field('service').focus({ preventScroll: true });
    });
  });
  form.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    ['name', 'email', 'town'].forEach(name => {
      const input = field(name);
      input.value = input.value.trim();
      input.setCustomValidity(input.value ? '' : 'Please complete this field.');
    });
    if (!form.reportValidity()) return;
    if (!window.emailjs) {
      status.textContent = 'The form could not load. Please call or email us using the links below.';
      status.dataset.state = 'error';
      return;
    }
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    const original = button.textContent;
    button.textContent = 'Sending…';
    status.textContent = 'Sending your quote request…';
    status.dataset.state = 'sending';
    const service = field('service').value;
    const town = field('town').value;
    const email = field('email').value;
    const name = field('name').value;
    const params = {
      name, from_name: name, from_email: email, email, reply_to: email,
      phone: field('phone').value.trim(),
      address: [field('address').value.trim(), town].filter(Boolean).join(', '),
      service, town,
      // Include service and town in the message for older templates too.
      message: `Service: ${service}\nTown or ZIP: ${town}\n\n${field('message').value.trim()}`,
      time: new Date().toLocaleString('en-US', {
        timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short'
      }) + ' Central',
    };
    try {
      window.emailjs.init('p7J8HXntEE-QVw-_u');
      await window.emailjs.send('service_obqb3f8', 'template_02argah', params);
      window.location.assign(new URL('thank-you.html', document.baseURI).href);
    } catch (_) {
      status.textContent = 'Your request was not sent. Please try again, or call or email us below. Your details are still here.';
      status.dataset.state = 'error';
      sending = false;
      button.disabled = false;
      button.textContent = original;
      form.removeAttribute('aria-busy');
    }
  });
})();
