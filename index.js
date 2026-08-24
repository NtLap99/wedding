const MIU_WEDDING_DATE = new Date("2026-10-25T10:00:00+07:00").getTime();
const MIU_PHOTOS = [
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576300/MSO00046.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576342/MSO00163.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576337/MSO09469.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576333/MSO00453.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576328/MSO09775.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576328/MSO00426.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576327/MSO00438.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576327/MSO09759.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576323/MSO00528.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576322/MSO00392.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576320/MSO00334.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576314/MSO00298.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576313/MSO00525.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576313/MSO00202.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576313/MSO00199.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576313/MSO00248.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576305/MSO09786.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576305/MSO00142.jpg",
  "https://res.cloudinary.com/vltl1tcn/image/upload/v1787576342/MSO09519.jpg",
];

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const query = new URLSearchParams(window.location.search);

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function guestName() {
  const params = new URLSearchParams(window.location.search);
  let guest = params.get("name") || params.get("guest") || params.get("to") || params.get("g") || params.get("n") || params.get("khach");

  if (!guest || !guest.trim()) return "Quý khách";

  guest = guest.trim();

  const nt = params.get("nt") || params.get("with") || params.get("plus");
  if (nt) {
    const ntLabel = (nt === "1" || nt === "true") ? "NT" : nt.trim();
    if (!guest.toLowerCase().includes("nt") && !guest.toLowerCase().includes(ntLabel.toLowerCase())) {
      guest += ` + ${ntLabel}`;
    }
  }

  guest = guest.replace(/\s*\+\s*/g, " + ").replace(/\s*&\s*/g, " & ").replace(/\s+/g, " ");

  return guest.slice(0, 80);
}

function hydrateGuest() {
  const guest = guestName();
  $$('[data-guest]').forEach((node) => { node.textContent = guest; });
  $$('[data-guest-input]').forEach((input) => {
    if (guest !== "Quý khách") input.value = guest;
  });
}

function setupConfetti() {
  const canvas = $('#miu-confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = 0;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  window.triggerConfetti = (originX = window.innerWidth / 2, originY = window.innerHeight / 2) => {
    const colors = ['#527b42', '#ae8750', '#8cb691', '#ff6b8b', '#d4af37', '#ffffff'];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 12 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
        isHeart: Math.random() > 0.3,
      });
    }
    if (!animId) loop();
  };

  const drawHeart = (ctx, x, y, size) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.rotation += p.rSpeed;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      if (p.isHeart) {
        drawHeart(ctx, p.x, p.y, p.size);
      } else {
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });

    particles = particles.filter((p) => p.life > 0);
    if (particles.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = 0;
    }
  };
}

function setupOpening() {
  const opening = $('#opening');
  const music = $('#miu-music');
  let isOpened = false;

  const open = (event) => {
    if (isOpened) return;
    isOpened = true;

    opening.classList.add('is-open');
    opening.style.pointerEvents = 'none';

    document.body.classList.remove('is-locked');
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.touchAction = 'auto';

    music.play().catch(() => {});
    document.dispatchEvent(new CustomEvent('miu:opened'));

    if (window.triggerConfetti && event && event.clientX) {
      window.triggerConfetti(event.clientX, event.clientY);
    }

    window.setTimeout(() => {
      opening.classList.add('is-hidden');
      opening.style.display = 'none';
    }, 1350);
  };

  const targets = [$('#open-invitation'), $('#open-invitation-text'), opening].filter(Boolean);
  targets.forEach((node) => {
    node.addEventListener('click', open);
    node.addEventListener('touchstart', open, { passive: true });
    node.addEventListener('pointerdown', open, { passive: true });
  });

  if (query.get('preview') === '1' || opening.classList.contains('is-open')) {
    open();
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
  let animFrameId = 0;
  let startTimer = 0;
  let lastTime = 0;
  let accumulatedScroll = 0;
  let userTouching = false;
  let touchStartY = 0;
  const customSpeed = Number(query.get('speed') || query.get('autoscrollspeed'));
  const pixelsPerSecond = customSpeed && customSpeed >= 20 && customSpeed <= 1200 ? customSpeed : 75;

  const render = () => {
    if (!button) return;
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Tắt tự động cuộn' : 'Bật tự động cuộn');
  };

  const stop = () => {
    active = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = 0;
    window.clearTimeout(startTimer);
    document.documentElement.style.scrollBehavior = '';
    render();
  };

  const step = (timestamp) => {
    if (!active) return;
    if (lastTime === 0) {
      lastTime = timestamp;
      animFrameId = requestAnimationFrame(step);
      return;
    }
    const delta = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    accumulatedScroll += pixelsPerSecond * delta;
    const scrollPx = Math.floor(accumulatedScroll);
    if (scrollPx > 0) {
      window.scrollBy(0, scrollPx);
      accumulatedScroll -= scrollPx;
    }

    const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (currentScroll >= maxScroll - 4) {
      stop();
      return;
    }

    animFrameId = requestAnimationFrame(step);
  };

  const start = () => {
    if (active) return;
    active = true;
    lastTime = 0;
    accumulatedScroll = 0;
    /* Tắt smooth scroll trong CSS để tránh xung đột animation gây đơ trên điện thoại */
    document.documentElement.style.scrollBehavior = 'auto';
    render();
    animFrameId = requestAnimationFrame(step);
  };

  const scheduleStart = (delay = 1500) => {
    if (query.get('autoscroll') === 'false') return;
    window.clearTimeout(startTimer);
    startTimer = window.setTimeout(start, delay);
  };

  if (button) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      active ? stop() : start();
    });
  }

  window.addEventListener('wheel', () => {
    if (active) stop();
  }, { passive: true });

  window.addEventListener('touchstart', (event) => {
    if (event.target.closest('.floating-actions')) return;
    userTouching = true;
    const touch = event.touches && event.touches[0];
    if (touch) touchStartY = touch.clientY;
    if (active) stop();
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    const touch = event.touches && event.touches[0];
    /* Chỉ hủy hẹn giờ cuộn nếu ngón tay thực sự kéo trượt màn hình > 10px */
    if (userTouching && touch && Math.abs(touch.clientY - touchStartY) > 10) {
      window.clearTimeout(startTimer);
      if (active) stop();
    }
  }, { passive: true });

  window.addEventListener('touchend', () => { userTouching = false; }, { passive: true });
  window.addEventListener('touchcancel', () => { userTouching = false; }, { passive: true });

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

function setupTimelineFocus() {
  const timeline = $('.timeline');
  if (!timeline) return;

  const items = $$('article', timeline);
  const progress = $('.timeline__line span', timeline);
  if (!items.length || !progress) return;

  let ticking = false;
  let activeIndex = -1;

  const setActive = (index) => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));

    if (safeIndex !== activeIndex) {
      items.forEach((item, itemIndex) => {
        item.classList.toggle('is-active', itemIndex === safeIndex);
        item.classList.toggle('is-complete', itemIndex < safeIndex);
      });
      activeIndex = safeIndex;
    }

    const ratio = items.length > 1 ? safeIndex / (items.length - 1) : 1;
    progress.style.height = `${ratio * 100}%`;
  };

  const update = () => {
    const timelineRect = timeline.getBoundingClientRect();

    if (timelineRect.top > window.innerHeight) {
      items.forEach((item) => item.classList.remove('is-active', 'is-complete'));
      progress.style.height = '0%';
      activeIndex = -1;
      ticking = false;
      return;
    }

    if (timelineRect.bottom < 0) {
      setActive(items.length - 1);
      ticking = false;
      return;
    }

    const focusY = window.innerHeight * 0.53;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const node = $('i', item);
      const rect = (node || item).getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - focusY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActive(closestIndex);
    ticking = false;
  };

  const scheduleUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  document.addEventListener('miu:opened', scheduleUpdate);
  scheduleUpdate();
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
      if (node) {
        const formatted = String(value).padStart(key === 'days' ? 3 : 2, '0');
        if (node.textContent !== formatted) {
          node.textContent = formatted;
          node.style.transform = 'scale(1.12)';
          setTimeout(() => { node.style.transform = 'scale(1)'; }, 150);
        }
      }
    });
  };
  update();
  window.setInterval(update, 1000);
}

let toastTimer;
function showToast(message) {
  const toast = $('.miu-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
}

function setupRsvp() {
  const form = $('#miu-rsvp-form');
  const modal = $('.miu-rsvp-modal');
  if (!form || !modal) return;

  $$('[data-open-miu-rsvp]').forEach((button) => button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    modal.showModal();
  }));
  $('[data-close-miu-rsvp]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });
  if (query.get('modal') === 'rsvp') window.addEventListener('load', () => modal.showModal(), { once: true });

  const attendanceSelect = form.querySelector('[name="attendance"]');
  const guestsLabel = form.querySelector('[name="guests"]')?.closest('label');
  if (attendanceSelect && guestsLabel) {
    attendanceSelect.addEventListener('change', (event) => {
      if (event.target.value === 'no') {
        guestsLabel.style.display = 'none';
      } else {
        guestsLabel.style.display = '';
      }
    });
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    
    // Save to Firebase Firestore
    if (typeof WeddingDB !== 'undefined') {
      WeddingDB.saveRsvp(values);
    }

    showToast(`Cảm ơn ${values.name}! Phản hồi của bạn đã được gửi thành công.`);
    if (window.triggerConfetti) {
      window.triggerConfetti(window.innerWidth / 2, window.innerHeight / 3);
    }
    modal.close();
  });
}

function setupGiftModal() {
  const groomModal = $('.miu-gift-groom-modal');
  const brideModal = $('.miu-gift-bride-modal');
  if (!groomModal || !brideModal) return;

  $$('[data-open-miu-gift-groom]').forEach((button) => button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    groomModal.showModal();
  }));
  $$('[data-open-miu-gift-bride]').forEach((button) => button.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('miu:pause-auto-scroll'));
    brideModal.showModal();
  }));

  $$('[data-close-miu-gift-groom]').forEach((button) => button.addEventListener('click', () => groomModal.close()));
  $$('[data-close-miu-gift-bride]').forEach((button) => button.addEventListener('click', () => brideModal.close()));

  groomModal.addEventListener('click', (event) => {
    if (event.target === groomModal) groomModal.close();
  });
  brideModal.addEventListener('click', (event) => {
    if (event.target === brideModal) brideModal.close();
  });

  if (query.get('modal') === 'gift-groom') window.addEventListener('load', () => groomModal.showModal(), { once: true });
  if (query.get('modal') === 'gift-bride') window.addEventListener('load', () => brideModal.showModal(), { once: true });
}

function setupGallery() {
  const dialog = $('.photo-viewer');
  if (!dialog) return;
  const image = $('img', dialog);
  let currentIndex = 0;

  const showPhoto = (index) => {
    if (index < 0) index = MIU_PHOTOS.length - 1;
    if (index >= MIU_PHOTOS.length) index = 0;
    currentIndex = index;
    image.src = MIU_PHOTOS[currentIndex];
  };

  $$('[data-photo]').forEach((button) => button.addEventListener('click', () => {
    showPhoto(Number(button.dataset.photo) || 0);
    dialog.showModal();
  }));

  $('[data-prev-photo]').addEventListener('click', () => showPhoto(currentIndex - 1));
  $('[data-next-photo]').addEventListener('click', () => showPhoto(currentIndex + 1));
  $('[data-close-photo]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function setupWishes() {
  const form = $('#miu-wishes-form');
  const wall = $('#wishes-wall');
  if (!form || !wall) return;

  const INITIAL_VISIBLE = 5;
  let currentWishes = [];
  let expanded = false;

  // Tự tạo nút nếu HTML hiện tại chưa có.
  let toggle = $('#wishes-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'wishes-toggle';
    toggle.className = 'wishes__toggle';
    toggle.type = 'button';
    toggle.hidden = true;
    toggle.setAttribute('aria-controls', 'wishes-wall');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `
      <span class="wishes__toggle-label">Xem thêm lời chúc</span>
      <i aria-hidden="true">↓</i>
    `;
    wall.insertAdjacentElement('afterend', toggle);
  }

  const toggleLabel = $('.wishes__toggle-label', toggle) || $('span', toggle);
  const toggleIcon = $('i', toggle);

  const updateToggle = () => {
    const remaining = Math.max(0, currentWishes.length - INITIAL_VISIBLE);
    const hasMore = currentWishes.length > INITIAL_VISIBLE;

    if (!hasMore) expanded = false;

    toggle.hidden = !hasMore;
    toggle.setAttribute('aria-expanded', String(expanded));

    if (toggleLabel) {
      toggleLabel.textContent = expanded
        ? 'Thu gọn'
        : `Xem thêm ${remaining} lời chúc`;
    }

    /*
     * Luôn giữ ký tự ↓ trong DOM.
     * Khi mở rộng, aria-expanded="true" để CSS xoay thành ↑
     * hoặc đổi nội dung bằng ::before. Cách này tránh icon bị xoay hai lần.
     */
    if (toggleIcon) toggleIcon.textContent = '↓';
  };

  const renderWishes = (wishesList) => {
    if (Array.isArray(wishesList)) currentWishes = wishesList;

    if (currentWishes.length <= INITIAL_VISIBLE) expanded = false;

    const visibleWishes = expanded
      ? currentWishes
      : currentWishes.slice(0, INITIAL_VISIBLE);

    wall.innerHTML = visibleWishes.map((wish) => `
      <article class="wish-card">
        <div class="wish-card__header">
          <strong class="wish-card__author">${escapeHtml(wish.name)}</strong>
          <span class="wish-card__time">${escapeHtml(wish.date || 'Vừa xong')}</span>
        </div>
        <p class="wish-card__text">“${escapeHtml(wish.message)}”</p>
      </article>
    `).join('');

    wall.classList.toggle(
      'is-expanded',
      expanded && currentWishes.length > INITIAL_VISIBLE
    );

    updateToggle();
  };

  toggle.addEventListener('click', () => {
    if (currentWishes.length <= INITIAL_VISIBLE) return;

    expanded = !expanded;
    renderWishes();

    if (!expanded) {
      wall.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  renderWishes([]);

  // Nhận danh sách lời chúc theo thời gian thực từ Firebase Firestore.
  if (typeof WeddingDB !== 'undefined') {
    WeddingDB.onWishesUpdate((remoteWishes) => {
      renderWishes(Array.isArray(remoteWishes) ? remoteWishes : []);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const message = (data.get('message') || '').trim();
    if (!name || !message) return;

    if (typeof WeddingDB !== 'undefined') {
      WeddingDB.addWish(name, message);
    }

    form.reset();
    showToast('Cảm ơn lời chúc mừng ý nghĩa của bạn!');

    if (window.triggerConfetti) {
      const rect = form.getBoundingClientRect();
      window.triggerConfetti(rect.left + rect.width / 2, rect.top);
    }
  });
}

function setupTouchSparkles() {
  let lastTime = 0;
  const symbols = ['✨', '✦', '★', '♥'];
  const colors = ['#ffd700', '#ff85a2', '#8cb691', '#ffffff', '#e8b974'];

  const createSparkle = (x, y) => {
    const el = document.createElement('i');
    el.className = 'touch-sparkle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  };

  const handleMove = (e) => {
    const now = Date.now();
    if (now - lastTime < 60) return;
    lastTime = now;
    const touch = e.touches && e.touches[0];
    const x = e.clientX || (touch && touch.clientX);
    const y = e.clientY || (touch && touch.clientY);
    if (x && y) createSparkle(x, y);
  };

  window.addEventListener('mousemove', handleMove, { passive: true });
  window.addEventListener('touchmove', handleMove, { passive: true });
}

hydrateGuest();
setupConfetti();
setupOpening();
setupReveal();
setupTimelineFocus();
setupScroll();
setupMusic();
setupAutoScroll();
setupCountdown();
setupRsvp();
setupGiftModal();
setupGallery();
setupWishes();
setupTouchSparkles();
