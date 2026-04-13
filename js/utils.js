/* ============================================================
   utils.js — Slotwise shared utilities
   ============================================================ */

// ── Theme ──────────────────────────────────────────────────
function initTheme() {
  const t = localStorage.getItem('sw_theme') || 'light';
  applyTheme(t);
}
function applyTheme(t) {
  document.body.classList.toggle('dark-mode', t === 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.title = t === 'dark' ? 'Switch to light' : 'Switch to dark';
  localStorage.setItem('sw_theme', t);
}
function toggleTheme() {
  const c = localStorage.getItem('sw_theme') || 'light';
  applyTheme(c === 'light' ? 'dark' : 'light');
}

// ── Toast ──────────────────────────────────────────────────
function showToast(title, msg, type = 'info', dur = 3500) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const icons = { success: '✓', error: '✕', info: 'i', warning: '!' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
    <span class="toast-icon">${icons[type]||'i'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <span class="toast-close">✕</span>
  `;
  c.appendChild(t);
  t.querySelector('.toast-close').addEventListener('click', () => removeToast(t));
  setTimeout(() => removeToast(t), dur);
}
function removeToast(t) {
  t.classList.add('removing');
  setTimeout(() => t.remove(), 230);
}

// ── Ripple ─────────────────────────────────────────────────
function addRipple(e) {
  const btn = e.currentTarget;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height) * 2;
  const x = e.clientX - r.left - size / 2;
  const y = e.clientY - r.top - size / 2;
  const el = document.createElement('span');
  el.className = 'ripple';
  el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
function initRipples() {
  document.querySelectorAll('.btn').forEach(b => b.addEventListener('click', addRipple));
}

// ── Scroll reveals ─────────────────────────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); ob.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => ob.observe(el));
}

// ── Count up ───────────────────────────────────────────────
function animateCountUp(el, target, dur = 900) {
  const start = performance.now();
  const update = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
function initCountUps() {
  const els = document.querySelectorAll('.count-up');
  if (!els.length) return;
  const ob = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCountUp(e.target, parseInt(e.target.dataset.target));
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => ob.observe(el));
}

// ── Hamburger ──────────────────────────────────────────────
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
}

// ── LocalStorage ───────────────────────────────────────────
function getBookings() {
  try { return JSON.parse(localStorage.getItem('sw_bookings') || '[]'); }
  catch { return []; }
}
function saveBookings(b) { localStorage.setItem('sw_bookings', JSON.stringify(b)); }
function generateId() { return 'SW-' + Math.random().toString(36).substr(2, 7).toUpperCase(); }
function formatDate(s) {
  if (!s) return '—';
  return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRipples();
  initScrollAnimations();
  initCountUps();
  initHamburger();
  const tt = document.getElementById('themeToggle');
  if (tt) tt.addEventListener('click', toggleTheme);
});
