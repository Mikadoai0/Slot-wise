/* confirmation.js */
document.addEventListener('DOMContentLoaded', () => {

  const bk = JSON.parse(localStorage.getItem('sw_last') || 'null');

  if (bk) {
    document.getElementById('conf-name').textContent = bk.name || '—';
    document.getElementById('conf-email').textContent = bk.email || '—';
    document.getElementById('conf-phone').textContent = bk.phone || '—';
    document.getElementById('conf-service').textContent = bk.service || '—';
    document.getElementById('conf-date').textContent = formatDate(bk.date);
    document.getElementById('conf-time').textContent = bk.time || '—';
    document.getElementById('conf-id').textContent = bk.id || '—';
  } else {
    ['conf-name','conf-email','conf-phone','conf-service','conf-date','conf-time']
      .forEach(id => { const el = document.getElementById(id); if(el) el.textContent = 'Demo'; });
    const ci = document.getElementById('conf-id'); if(ci) ci.textContent = 'SW-DEMO';
  }

  setTimeout(() => {
    showToast('Booking confirmed!', 'Saved to your dashboard.', 'success', 5000);
  }, 1000);

  // Confetti
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize(); window.addEventListener('resize', resize);

  // Warm editorial confetti colors
  const COLS = ['#c0451a','#b87d1a','#4a6741','#1a1108','#f5f0e8','#c8bfae','#8a6a4a'];

  class P {
    constructor(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height * -0.5 : -16;
      this.w = Math.random() * 10 + 4;
      this.h = this.w * (Math.random() * 0.6 + 0.3);
      this.color = COLS[Math.floor(Math.random() * COLS.length)];
      this.vx = (Math.random() - 0.5) * 2.5;
      this.vy = Math.random() * 2.5 + 1.5;
      this.rot = Math.random() * 360;
      this.drot = (Math.random() - 0.5) * 5;
      this.alpha = 0.85 + Math.random() * 0.15;
    }
    tick() {
      this.x += this.vx; this.y += this.vy; this.rot += this.drot;
      if (this.y > canvas.height + 20) Object.assign(this, new P(false));
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
      ctx.restore();
    }
  }

  const parts = Array.from({length: 100}, () => new P(true));
  let frame = 0, animId;
  const run = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(p => { p.tick(); p.draw(); });
    if (++frame < 320) animId = requestAnimationFrame(run);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  setTimeout(() => run(), 300);
});
