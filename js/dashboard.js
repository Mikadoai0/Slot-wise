/* dashboard.js */
document.addEventListener('DOMContentLoaded', () => {

  let pendingDeleteId = null, pendingEditId = null;
  let tChart = null, pChart = null;

  // ── Sidebar ──────────────────────────────────────────────
  const sidebar = document.getElementById('dashSidebar');
  const main = document.getElementById('dashMain');
  const sBtn = document.getElementById('sidebarToggle');
  const mBtn = document.getElementById('mobileSidebarToggle');

  if (localStorage.getItem('sw_sidebar') === '1') {
    sidebar.classList.add('collapsed'); main.classList.add('wide');
  }
  sBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed'); main.classList.toggle('wide');
    localStorage.setItem('sw_sidebar', sidebar.classList.contains('collapsed') ? '1' : '0');
  });
  mBtn?.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
  document.addEventListener('click', e => {
    if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && mBtn && !mBtn.contains(e.target))
      sidebar.classList.remove('mobile-open');
  });

  // ── Seed demo ────────────────────────────────────────────
  function seed() {
    const svcs = ['Consultation','Strategy Session','Deep Dive','Quick Check-in','Workshop'];
    const names = ['Alma Hartley','Declan Royce','Saoirse Flynn','Matteo Ricci','Priya Nair',
                   'Hugo Larsson','Camille Bernard','Reuben Ashby','Naomi Osei','Felix Wagner'];
    const times = ['9:00 AM','10:30 AM','1:00 PM','2:30 PM','4:00 PM','11:00 AM','3:00 PM'];
    const stats = ['pending','pending','pending','completed','completed'];
    const rows = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 18));
      rows.push({
        id: generateId(), name: names[i % names.length],
        email: names[i % names.length].split(' ')[0].toLowerCase() + '@client.co',
        phone: '+1 555 ' + (Math.floor(Math.random() * 900)+100),
        service: svcs[i % svcs.length],
        date: d.toISOString().split('T')[0],
        time: times[i % times.length],
        status: stats[i % stats.length],
        createdAt: d.toISOString()
      });
    }
    saveBookings(rows); return rows;
  }
  let bookings = getBookings();
  if (!bookings.length) bookings = seed();

  // ── Stats ────────────────────────────────────────────────
  function refreshStats() {
    const bk = getBookings();
    animateCountUp(document.getElementById('stat-total'), bk.length, 700);
    animateCountUp(document.getElementById('stat-done'), bk.filter(b => b.status==='completed').length, 700);
    animateCountUp(document.getElementById('stat-pending'), bk.filter(b => b.status==='pending').length, 700);
    animateCountUp(document.getElementById('stat-svcs'), [...new Set(bk.map(b=>b.service))].length, 700);
  }

  // ── Charts ───────────────────────────────────────────────
  function chartColors() {
    const dark = document.body.classList.contains('dark-mode');
    return {
      grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(26,17,8,0.06)',
      text: dark ? '#8a7d68' : '#7a6a52',
      line: dark ? '#c0451a' : '#c0451a',
      fill: dark ? 'rgba(192,69,26,0.1)' : 'rgba(192,69,26,0.08)'
    };
  }
  function buildTrend() {
    const bk = getBookings(); const days=[],cnts=[];
    for (let i=6;i>=0;i--) {
      const d=new Date(); d.setDate(d.getDate()-i);
      const key=d.toISOString().split('T')[0];
      days.push(d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'}));
      cnts.push(bk.filter(b=>b.date===key).length + (i>0 ? Math.floor(Math.random()*2):0));
    }
    return {days,cnts};
  }
  function buildPie() {
    const bk=getBookings(), map={};
    bk.forEach(b=>{ map[b.service]=(map[b.service]||0)+1; });
    return {labels:Object.keys(map), data:Object.values(map)};
  }

  function initCharts() {
    const cc = chartColors();
    const {days,cnts} = buildTrend();
    const pie = buildPie();

    const tEl = document.getElementById('trendChart');
    if (tEl) {
      if (tChart) tChart.destroy();
      tChart = new Chart(tEl, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Bookings',
            data: cnts,
            backgroundColor: cnts.map(() => cc.fill.replace('0.08','0.6')),
            borderColor: cc.line,
            borderWidth: 2,
            borderRadius: 0,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: cc.grid }, ticks: { color: cc.text, font: { size: 11, family: 'Syne' } } },
            y: { grid: { color: cc.grid }, ticks: { color: cc.text, font: { size: 11, family: 'Syne' }, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }

    const pEl = document.getElementById('pieChart');
    if (pEl) {
      if (pChart) pChart.destroy();
      pChart = new Chart(pEl, {
        type: 'doughnut',
        data: {
          labels: pie.labels.length ? pie.labels : ['No data'],
          datasets: [{
            data: pie.data.length ? pie.data : [1],
            backgroundColor: ['#c0451a','#b87d1a','#4a6741','#1a1108','#8a7d68'],
            borderColor: document.body.classList.contains('dark-mode') ? '#1e1810' : '#f5f0e8',
            borderWidth: 3, hoverOffset: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: cc.text, font: { size: 11, family: 'Syne' }, padding: 12, boxWidth: 10 }
            }
          }
        }
      });
    }
  }

  // ── Render Table ─────────────────────────────────────────
  function render() {
    const bk = getBookings();
    const q = (document.getElementById('searchInput')?.value||'').toLowerCase();
    const st = document.getElementById('filterStatus')?.value||'';
    const sv = document.getElementById('filterService')?.value||'';

    const f = bk.filter(b => {
      const ms = !q || b.name.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
      return ms && (!st||b.status===st) && (!sv||b.service===sv);
    }).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));

    const list = document.getElementById('bookingsList');
    const empty = document.getElementById('emptyState');
    if (!list) return;

    if (!f.length) { list.innerHTML=''; empty.style.display='flex'; return; }
    empty.style.display='none';

    list.innerHTML = f.map((b, i) => `
      <div class="booking-row${b.status==='completed'?' done':''}" style="animation-delay:${i*30}ms">
        <div class="br-cell br-idx">${i+1}</div>
        <div class="br-cell">
          <span class="br-name">${b.name}</span>
          <span class="br-meta">${b.email}</span>
        </div>
        <div class="br-cell">${b.service}</div>
        <div class="br-cell">${formatDate(b.date)}</div>
        <div class="br-cell">${b.time}</div>
        <div class="br-cell">
          <span class="badge ${b.status==='completed'?'badge-sage':'badge-rust'}">${b.status==='completed'?'Done':'Pending'}</span>
        </div>
        <div class="br-cell br-actions">
          ${b.status!=='completed'?`<button class="btn btn-ghost btn-sm complete-btn" data-id="${b.id}" title="Mark done">✓</button>`:''}
          <button class="btn btn-ghost btn-sm edit-btn" data-id="${b.id}" title="Edit">✎</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${b.id}" title="Delete">✕</button>
        </div>
      </div>
    `).join('');

    initRipples();
    list.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => openDelete(btn.dataset.id)));
    list.querySelectorAll('.complete-btn').forEach(btn => btn.addEventListener('click', () => markDone(btn.dataset.id)));
    list.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => openEdit(btn.dataset.id)));
  }

  // ── Skeletons ────────────────────────────────────────────
  function showSkel() {
    const list = document.getElementById('bookingsList');
    if (!list) return;
    list.innerHTML = Array(6).fill(`
      <div class="row-skeleton">
        <div class="skeleton skel-box skel-a"></div>
        <div class="skeleton skel-box skel-b"></div>
        <div class="skeleton skel-box skel-c"></div>
      </div>
    `).join('');
  }

  // ── Delete ───────────────────────────────────────────────
  function openDelete(id) { pendingDeleteId = id; document.getElementById('deleteModal').classList.add('open'); }
  document.getElementById('deleteModalClose')?.addEventListener('click', () => document.getElementById('deleteModal').classList.remove('open'));
  document.getElementById('deleteCancelBtn')?.addEventListener('click', () => document.getElementById('deleteModal').classList.remove('open'));
  document.getElementById('deleteConfirmBtn')?.addEventListener('click', () => {
    saveBookings(getBookings().filter(b => b.id !== pendingDeleteId));
    document.getElementById('deleteModal').classList.remove('open');
    showToast('Deleted', 'Booking removed.', 'error');
    refresh();
  });

  // ── Mark done ────────────────────────────────────────────
  function markDone(id) {
    const bk = getBookings(); const idx = bk.findIndex(b => b.id===id);
    if (idx>-1) { bk[idx].status='completed'; saveBookings(bk); showToast('Marked complete', '', 'success'); refresh(); }
  }

  // ── Edit ─────────────────────────────────────────────────
  function openEdit(id) {
    const bk = getBookings().find(b=>b.id===id); if(!bk) return;
    pendingEditId = id;
    document.getElementById('edit-name').value = bk.name;
    document.getElementById('edit-email').value = bk.email;
    document.getElementById('edit-service').value = bk.service;
    document.getElementById('edit-date').value = bk.date;
    document.getElementById('edit-time').value = bk.time;
    document.getElementById('editModal').classList.add('open');
  }
  document.getElementById('editModalClose')?.addEventListener('click', () => document.getElementById('editModal').classList.remove('open'));
  document.getElementById('editCancelBtn')?.addEventListener('click', () => document.getElementById('editModal').classList.remove('open'));
  document.getElementById('editSaveBtn')?.addEventListener('click', () => {
    const bk=getBookings(); const idx=bk.findIndex(b=>b.id===pendingEditId);
    if(idx>-1) {
      bk[idx].name = document.getElementById('edit-name').value.trim()||bk[idx].name;
      bk[idx].email = document.getElementById('edit-email').value.trim()||bk[idx].email;
      bk[idx].service = document.getElementById('edit-service').value;
      bk[idx].date = document.getElementById('edit-date').value||bk[idx].date;
      bk[idx].time = document.getElementById('edit-time').value.trim()||bk[idx].time;
      saveBookings(bk); document.getElementById('editModal').classList.remove('open');
      showToast('Saved', 'Booking updated.', 'info'); refresh();
    }
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(m => m.addEventListener('click', e => { if(e.target===m) m.classList.remove('open'); }));

  // Search / filter
  let sTimer;
  document.getElementById('searchInput')?.addEventListener('input', () => { clearTimeout(sTimer); sTimer=setTimeout(render, 180); });
  document.getElementById('filterStatus')?.addEventListener('change', render);
  document.getElementById('filterService')?.addEventListener('change', render);

  // Theme change → re-render charts
  document.getElementById('themeToggle')?.addEventListener('click', () => setTimeout(initCharts, 150));

  function refresh() { refreshStats(); render(); initCharts(); }

  showSkel();
  setTimeout(() => { refreshStats(); render(); initCharts(); }, 700);
});
