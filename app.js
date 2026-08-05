/*
 * Chỉnh toàn bộ nội dung thiệp tại đây.
 * Các trường chưa có dữ liệu chính thức đang dùng câu chữ dự phòng.
 */
const WEDDING = {
  groomFirst: "Thanh Lập",
  brideFirst: "Nguyễn Sa",
  weddingDate: "2026-10-25T10:00:00+07:00",
  ceremonyTime: "10:00",
  receptionTime: "11:00",
  dayNumber: "25",
  monthLabel: "Tháng 10",
  dayMonth: "25.10",
  year: "2026",
  dateDisplay: "25.10.2026",
  footerDate: "25 · 10 · 2026",
  weekdayTime: "Chủ Nhật · 10 giờ 00",
  rsvpDeadlineDisplay: "15.10.2026",
  lunarDate: "Nhằm ngày đẹp tháng lành năm Bính Ngọ",
  groomParents: "Ông bà thân sinh của chú rể",
  brideParents: "Ông bà thân sinh của cô dâu",
  groomAddress: "Địa chỉ nhà trai sẽ được cập nhật",
  brideAddress: "Địa chỉ nhà gái sẽ được cập nhật",
  ceremonyVenue: "Tại tư gia nhà trai",
  receptionVenue: "Địa điểm sẽ được cập nhật",
  venueName: "Tư gia nhà trai",
  venueAddress: "Địa chỉ cụ thể sẽ được gia đình gửi tới quý khách",
  mapUrl: "https://maps.google.com",
};

const galleryImages = [
  "assets/images/hero.jpg",
  "assets/images/garden.jpg",
  "assets/images/portrait.jpg",
  "assets/images/veil.jpg",
];

const animationDisabled = new URLSearchParams(window.location.search).get('animate') === 'false';
if (animationDisabled) document.documentElement.style.scrollBehavior = 'auto';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

function getGuestName() {
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

function hydrateContent() {
  $$('[data-config]').forEach((element) => {
    const key = element.dataset.config;
    if (WEDDING[key]) element.textContent = WEDDING[key];
  });

  const guest = getGuestName();
  $$('[data-guest]').forEach((element) => { element.textContent = guest; });
  $$('[data-guest-input]').forEach((guestInput) => {
    if (guest !== "Quý khách") guestInput.value = guest;
  });
  if ($('[data-map-link]')) $('[data-map-link]').href = WEDDING.mapUrl;
  const alternateLink = $('[data-alt-link]');
  if (alternateLink && guest !== "Quý khách") alternateLink.href = `miu.html?name=${encodeURIComponent(guest)}`;
}

function setupOpening() {
  const opening = $('#index-opening');
  const openButtons = $$('[data-open-index]');
  const showCover = () => $$('.cover .reveal').forEach((item) => item.classList.add('is-visible'));
  let opened = false;

  const openInvitation = (event) => {
    if (opened) return;
    opened = true;

    if (opening) {
      opening.classList.add('is-open');
      opening.style.pointerEvents = 'none';
    }

    document.body.classList.remove('no-scroll');
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.touchAction = 'auto';

    $('#background-music').play().catch(() => {});
    window.setTimeout(showCover, animationDisabled ? 0 : 280);
    window.setTimeout(() => {
      if (opening) {
        opening.classList.add('is-hidden');
        opening.style.display = 'none';
      }
    }, animationDisabled ? 0 : 1350);
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', openInvitation);
    button.addEventListener('touchstart', openInvitation, { passive: true });
    button.addEventListener('pointerdown', openInvitation, { passive: true });
  });

  if (opening) {
    opening.addEventListener('click', openInvitation);
    opening.addEventListener('touchstart', openInvitation, { passive: true });
    opening.addEventListener('pointerdown', openInvitation, { passive: true });
  }

  if (new URLSearchParams(window.location.search).get('preview') === '1') {
    openInvitation();
    window.addEventListener('load', showCover, { once: true });
  } else {
    document.body.classList.add('no-scroll');
  }

  if (animationDisabled && window.location.hash) {
    openInvitation();
    const anchor = $(window.location.hash);
    if (anchor) window.setTimeout(() => anchor.scrollIntoView({ behavior: 'auto', block: 'start' }), 50);
  }
}

function setupHeader() {
  const header = $('.site-header');
  if (!header) return;
  const menuButton = $('.site-header__menu');
  const nav = $('.site-header nav');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  $$('.site-header nav a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

function setupRevealAnimations() {
  const items = $$('.reveal:not(.cover .reveal)');
  if (animationDisabled || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -30px' });
  items.forEach((item) => observer.observe(item));
}

function setupScrollEffects() {
  const progressBar = $('.scroll-progress span');
  const cover = $('.cover');
  const closing = $('.closing');
  const parallaxImages = $$('.family-row__photo img, .mini-gallery img, .album__grid img');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;

  const update = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
    progressBar.style.transform = `scaleX(${progress})`;

    if (!animationDisabled && !reduceMotion) {
      const coverScroll = Math.min(window.scrollY, 900);
      cover.style.setProperty('--cover-heading-shift', `${coverScroll * 0.045}px`);
      cover.style.setProperty('--cover-photo-shift', `${coverScroll * 0.018}px`);
      cover.style.setProperty('--cover-copy-shift', `${coverScroll * 0.008}px`);

      const closingRect = closing.getBoundingClientRect();
      const closingProgress = Math.min(1, Math.max(0, (window.innerHeight - closingRect.top) / (window.innerHeight + closingRect.height)));
      closing.style.setProperty('--closing-shift', `${-7 + closingProgress * 8}%`);

      parallaxImages.forEach((image) => {
        const rect = image.parentElement.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight + rect.height);
        const shift = Math.max(-21, Math.min(-3, -12 - centerOffset * 24));
        image.style.setProperty('--image-shift', `${shift}px`);
      });
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function setupSectionActivation() {
  const sections = $$('.invitation-page > section');
  if (animationDisabled || !('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-section-active'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-section-active');
    });
  }, { threshold: 0.16, rootMargin: '-8% 0px -8%' });
  sections.forEach((section) => observer.observe(section));
}

function setupCountdown() {
  const target = new Date(WEDDING.weddingDate).getTime();
  const fields = {
    days: $('[data-count="days"]'),
    hours: $('[data-count="hours"]'),
    minutes: $('[data-count="minutes"]'),
    seconds: $('[data-count="seconds"]'),
  };
  if (!fields.days) return;

  const update = () => {
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    fields.days.textContent = String(days).padStart(3, '0');
    fields.hours.textContent = String(hours).padStart(2, '0');
    fields.minutes.textContent = String(minutes).padStart(2, '0');
    fields.seconds.textContent = String(seconds).padStart(2, '0');
  };
  update();
  window.setInterval(update, 1000);
}

let toastTimer;
function showToast(message) {
  const toast = $('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function setupRsvp() {
  const form = $('.rsvp-form');
  const saved = window.localStorage.getItem('wedding-rsvp');
  if (saved) {
    try {
      const values = JSON.parse(saved);
      Object.entries(values).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
    } catch (_) { /* Ignore invalid saved values. */ }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    window.localStorage.setItem('wedding-rsvp', JSON.stringify(values));
    showToast(`Cảm ơn ${values.name}! Phản hồi của bạn đã được lưu trên thiết bị này.`);
  });
}

function setupModals() {
  const giftModal = $('.gift-modal');
  $('[data-open-gift]').addEventListener('click', () => giftModal.showModal());
  $('[data-close-modal]').addEventListener('click', () => giftModal.close());
  giftModal.addEventListener('click', (event) => {
    if (event.target === giftModal) giftModal.close();
  });

  const rsvpModal = $('.rsvp-modal');
  $('[data-open-rsvp]').addEventListener('click', () => rsvpModal.showModal());
  $('[data-close-rsvp]').addEventListener('click', () => rsvpModal.close());
  rsvpModal.addEventListener('click', (event) => {
    if (event.target === rsvpModal) rsvpModal.close();
  });

  const lightbox = $('.lightbox');
  const image = $('.lightbox img');
  const caption = $('.lightbox figcaption');
  let activeIndex = 0;
  const showImage = (index) => {
    activeIndex = (index + galleryImages.length) % galleryImages.length;
    image.src = galleryImages[activeIndex];
    caption.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
  };
  $$('[data-gallery-index]').forEach((button) => button.addEventListener('click', () => {
    showImage(Number(button.dataset.galleryIndex));
    lightbox.showModal();
  }));
  $('.lightbox__close').addEventListener('click', () => lightbox.close());
  $('.lightbox__nav--prev').addEventListener('click', () => showImage(activeIndex - 1));
  $('.lightbox__nav--next').addEventListener('click', () => showImage(activeIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  window.addEventListener('keydown', (event) => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
    if (event.key === 'ArrowRight') showImage(activeIndex + 1);
  });
}

function setupBackgroundMusic() {
  const button = $('.sound-toggle');
  const audio = $('#background-music');
  audio.volume = 0.58;
  let userDisabled = false;

  const syncButton = () => {
    const playing = !audio.paused;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  };

  const cleanupGestureStart = () => {
    document.removeEventListener('pointerdown', startAfterInteraction);
    document.removeEventListener('keydown', startAfterInteraction);
  };

  const playMusic = async () => {
    try {
      await audio.play();
      syncButton();
      cleanupGestureStart();
      return true;
    } catch (_) {
      syncButton();
      return false;
    }
  };

  button.addEventListener('click', async () => {
    if (audio.paused) {
      userDisabled = false;
      await playMusic();
    } else {
      userDisabled = true;
      audio.pause();
      cleanupGestureStart();
    }
  });

  audio.addEventListener('play', syncButton);
  audio.addEventListener('pause', syncButton);
  audio.addEventListener('error', () => showToast('Không thể tải nhạc nền. Vui lòng thử tải lại trang.'));

  const startAfterInteraction = async (event) => {
    if (userDisabled || button.contains(event.target)) return;
    await playMusic();
  };
  document.addEventListener('pointerdown', startAfterInteraction, { passive: true });
  document.addEventListener('keydown', startAfterInteraction);

  window.addEventListener('load', () => {
    if (!userDisabled) playMusic();
  });
}

hydrateContent();
setupOpening();
setupHeader();
setupRevealAnimations();
setupScrollEffects();
setupSectionActivation();
setupCountdown();
setupRsvp();
setupModals();
setupBackgroundMusic();
