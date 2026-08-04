const MIU_WEDDING_DATE = new Date("2026-10-25T10:00:00+07:00").getTime();
const MIU_PHOTOS = [
  "assets/images/hero.jpg",
  "assets/images/garden.jpg",
  "assets/images/portrait.jpg",
  "assets/images/veil.jpg",
];

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const query = new URLSearchParams(window.location.search);

function guestName() {
  const guest = query.get("guest");
  return guest && guest.trim() ? guest.trim().slice(0, 80) : "Quý khách";
}

function hydrateGuest() {
  const guest = guestName();
  $$('[data-guest]').forEach((node) => { node.textContent = guest; });
  const input = $('[data-guest-input]');
  if (guest !== "Quý khách") input.value = guest;
}

function setupOpening() {
  const opening = $('#opening');
  const music = $('#miu-music');
  const open = () => {
    opening.classList.add('is-open');
    document.body.classList.remove('is-locked');
    music.play().catch(() => {});
    document.dispatchEvent(new CustomEvent('miu:opened'));
    window.setTimeout(() => opening.classList.add('is-hidden'), 1350);
  };
  $('#open-invitation').addEventListener('click', open);
  $('#open-invitation-text').addEventListener('click', open);

  if (query.get('preview') === '1') {
    opening.classList.add('is-hidden');
  } else {
    document.body.classList.add('is-locked');
  }
}

function setupReveal() {
  const nodes = $$('.reveal');
  if (query.get('preview') === '1' || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -35px' });
  nodes.forEach((node) => observer.observe(node));
}

function setupScroll() {
  const progress = $('.progress span');
  const topButton = $('#back-top');
  let ticking = false;
  const update = () => {
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, window.scrollY / range)})`;
    topButton.style.opacity = window.scrollY > 650 ? '1' : '.45';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(update);
    ticking = true;
  }, { passive: true });
  topButton.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  update();
}

function setupAutoScroll() {
  const button = $('#auto-scroll');
  let active = false;
  let scrollTimer = 0;
  let startTimer = 0;
  let previousScrollBehavior = '';

  const render = () => {
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Tắt tự động cuộn' : 'Bật tự động cuộn');
  };

  const stop = () => {
    active = false;
    window.clearInterval(scrollTimer);
    window.clearTimeout(startTimer);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    render();
  };

  const step = () => {
    if (!active) return;
    window.scrollBy(0, 1);
    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3;
    if (reachedBottom) {
      stop();
      return;
    }
  };

  const start = () => {
    if (active) return;
    active = true;
    previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    render();
    showToast('Đã bật tự động cuộn · chạm màn hình để dừng');
    scrollTimer = window.setInterval(step, 20);
  };

  const scheduleStart = (delay = 1500) => {
    if (query.get('autoscroll') === 'false') return;
    window.clearTimeout(startTimer);
    startTimer = window.setTimeout(start, delay);
  };

  button.addEventListener('click', () => active ? stop() : start());
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', (event) => {
    if (!event.target.closest('#auto-scroll')) stop();
  }, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) stop();
  });
  document.addEventListener('miu:pause-auto-scroll', stop);
  document.addEventListener('miu:opened', () => scheduleStart());
  $$('#open-invitation, #open-invitation-text').forEach((openButton) => {
    openButton.addEventListener('click', () => scheduleStart());
  });
  if (query.get('preview') === '1' && query.get('autoscroll') !== 'false') {
    if (document.readyState === 'complete') scheduleStart(800);
    else window.addEventListener('load', () => scheduleStart(800), { once: true });
  }
  render();
}

function setupMusic() {
  const audio = $('#miu-music');
  const button = $('#music-toggle');
  let manuallyPaused = false;
  const render = () => {
    const playing = !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
  };
  const tryPlay = () => {
    if (manuallyPaused) return;
    audio.play().then(render).catch(render);
  };
  button.addEventListener('click', () => {
    if (audio.paused) {
      manuallyPaused = false;
      audio.play().catch(() => {}).finally(render);
    } else {
      manuallyPaused = true;
      audio.pause();
      render();
    }
  });
  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);
  window.addEventListener('load', tryPlay, { once: true });
  document.addEventListener('pointerdown', tryPlay, { once: true });
  render();
}

function setupCountdown() {
  const update = () => {
    const remaining = Math.max(0, MIU_WEDDING_DATE - Date.now());
    const values = {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor((remaining % 86400000) / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000),
    };
    Object.entries(values).forEach(([key, value]) => {
      const node = $(`[data-count="${key}"]`);
      node.textContent = String(value).padStart(key === 'days' ? 3 : 2, '0');
    });
  };
  update();
  window.setInterval(update, 1000);
}

let toastTimer;
function showToast(message) {
  const toast = $('.miu-toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
}

function setupRsvp() {
  const form = $('#miu-rsvp-form');
  const modal = $('.miu-rsvp-modal');
  $$('[data-open-miu-rsvp]').forEach((button) => button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    modal.showModal();
  }));
  $('[data-close-miu-rsvp]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
  if (query.get('modal') === 'rsvp') window.addEventListener('load', () => modal.showModal(), { once: true });
  const saved = window.localStorage.getItem('miu-wedding-rsvp');
  if (saved) {
    try {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
    } catch (_) { /* Ignore invalid local data. */ }
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    window.localStorage.setItem('miu-wedding-rsvp', JSON.stringify(values));
    showToast(`Cảm ơn ${values.name}! Phản hồi của bạn đã được lưu.`);
    modal.close();
  });
}

function setupGiftModal() {
  const modal = $('.miu-gift-modal');
  $$('[data-open-miu-gift]').forEach((button) => button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    modal.showModal();
  }));
  $('[data-close-miu-gift]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
  if (query.get('modal') === 'gift') window.addEventListener('load', () => modal.showModal(), { once: true });
}

function setupGallery() {
  const dialog = $('.photo-viewer');
  const image = $('img', dialog);
  $$('[data-photo]').forEach((button) => button.addEventListener('click', () => {
    image.src = MIU_PHOTOS[Number(button.dataset.photo)] || MIU_PHOTOS[0];
    dialog.showModal();
  }));
  $('[data-close-photo]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

hydrateGuest();
setupOpening();
setupReveal();
setupScroll();
setupMusic();
setupAutoScroll();
setupCountdown();
setupRsvp();
setupGiftModal();
setupGallery();
