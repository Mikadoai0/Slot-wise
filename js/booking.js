/* booking.js */
document.addEventListener('DOMContentLoaded', () => {

  let step = 1;
  let selectedSlot = null;

  const SLOTS = [
    '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM',
    '11:30 AM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
    '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'
  ];

  // Set min date
  const fdEl = document.getElementById('fdate');
  if (fdEl) fdEl.min = new Date().toISOString().split('T')[0];

  // ── Progress ─────────────────────────────────────────────
  function goStep(n) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${n}`).classList.add('active');

    [1,2,3].forEach(i => {
      const tab = document.getElementById(`tab${i}`);
      const num = document.getElementById(`tabnum${i}`);
      if (!tab) return;
      tab.classList.remove('active', 'done');
      if (i < n) { tab.classList.add('done'); num.textContent = '✓'; }
      else if (i === n) { tab.classList.add('active'); num.textContent = i; }
      else { num.textContent = i; }
    });

    const pct = n === 1 ? 33 : n === 2 ? 66 : 100;
    document.getElementById('progressFill').style.width = pct + '%';
    step = n;
  }

  // ── Validation ───────────────────────────────────────────
  function clearErrs() {
    document.querySelectorAll('.form-control').forEach(e => e.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
  }
  function err(fid, eid) {
    document.getElementById(fid)?.classList.add('error');
    document.getElementById(eid)?.classList.add('show');
  }

  function v1() {
    clearErrs(); let ok = true;
    const n = document.getElementById('fname').value.trim();
    const em = document.getElementById('femail').value.trim();
    const ph = document.getElementById('fphone').value.trim();
    if (n.length < 2) { err('fname','err-fname'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { err('femail','err-femail'); ok = false; }
    if (!/^[\d\s\+\-\(\)]{7,}$/.test(ph)) { err('fphone','err-fphone'); ok = false; }
    return ok;
  }
  function v2() {
    clearErrs(); let ok = true;
    const today = new Date().toISOString().split('T')[0];
    if (!document.getElementById('fservice').value) { err('fservice','err-fservice'); ok = false; }
    if (!fdEl.value || fdEl.value < today) { err('fdate','err-fdate'); ok = false; }
    if (!selectedSlot) { document.getElementById('err-fslot').classList.add('show'); ok = false; }
    return ok;
  }

  // ── Slots ────────────────────────────────────────────────
  fdEl?.addEventListener('change', () => {
    if (!fdEl.value) return;
    selectedSlot = null;
    const note = document.getElementById('slotsNote');
    const grid = document.getElementById('slotsGrid');
    note.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    const booked = getBookings().filter(b => b.date === fdEl.value).map(b => b.time);
    SLOTS.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn' + (booked.includes(s) ? ' booked' : '');
      btn.textContent = s;
      if (!booked.includes(s)) {
        btn.addEventListener('click', () => {
          grid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlot = s;
          document.getElementById('err-fslot').classList.remove('show');
        });
      } else {
        btn.disabled = true;
      }
      grid.appendChild(btn);
    });
  });

  // ── Navigation ───────────────────────────────────────────
  document.getElementById('nextStep1')?.addEventListener('click', () => { if (v1()) goStep(2); });
  document.getElementById('prevStep2')?.addEventListener('click', () => goStep(1));
  document.getElementById('nextStep2')?.addEventListener('click', () => {
    if (v2()) { populateReview(); goStep(3); }
  });
  document.getElementById('prevStep3')?.addEventListener('click', () => goStep(2));

  function populateReview() {
    document.getElementById('rev-name').textContent = document.getElementById('fname').value;
    document.getElementById('rev-email').textContent = document.getElementById('femail').value;
    document.getElementById('rev-phone').textContent = document.getElementById('fphone').value;
    document.getElementById('rev-service').textContent = document.getElementById('fservice').value;
    document.getElementById('rev-date').textContent = formatDate(fdEl.value);
    document.getElementById('rev-time').textContent = selectedSlot;
  }

  // ── Confirm ──────────────────────────────────────────────
  document.getElementById('confirmBtn')?.addEventListener('click', () => {
    const btn = document.getElementById('confirmBtn');
    document.getElementById('confirmBtnText').style.display = 'none';
    document.getElementById('confirmSpinner').style.display = 'block';
    btn.disabled = true;

    setTimeout(() => {
      const bk = {
        id: generateId(),
        name: document.getElementById('fname').value.trim(),
        email: document.getElementById('femail').value.trim(),
        phone: document.getElementById('fphone').value.trim(),
        service: document.getElementById('fservice').value,
        date: fdEl.value,
        time: selectedSlot,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      const all = getBookings(); all.push(bk); saveBookings(all);
      localStorage.setItem('sw_last', JSON.stringify(bk));
      window.location.href = 'confirmation.html';
    }, 2000);
  });

  // Clear error on input
  document.querySelectorAll('.form-control').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
});
