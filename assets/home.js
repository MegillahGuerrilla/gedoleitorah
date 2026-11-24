/* Home page: timeline order switch and the page dialog. */
(function () {
  const tl = document.getElementById('tl'), bo = document.getElementById('tl-old'), bn = document.getElementById('tl-new');
  let newest = false;
  function order(n, save) {
    if (n !== newest) { [...tl.children].reverse().forEach(c => tl.appendChild(c)); tl.querySelectorAll('.undated').forEach(c => tl.appendChild(c)); newest = n; }
    bo.setAttribute('aria-pressed', String(!n)); bn.setAttribute('aria-pressed', String(n));
    if (save) try { localStorage.setItem('gt-order', n ? 'new' : 'old'); } catch (e) {}
  }
  bo.addEventListener('click', () => order(false, true)); bn.addEventListener('click', () => order(true, true));
  try { if (localStorage.getItem('gt-order') === 'new') order(true); } catch (e) {}

  const d = document.getElementById('tdlg'), $ = id => document.getElementById(id);
  tl.addEventListener('click', ev => {
    const b = ev.target.closest('button.tcard'); if (!b) return;
    const x = window.TL[b.dataset.n]; if (!x) return;
    $('tdlg-img').src = x.img; $('tdlg-a').href = x.img;
    $('tdlg-name').textContent = x.name; $('tdlg-title').textContent = x.title;
    $('tdlg-q').textContent = x.quote; $('tdlg-date').textContent = x.date; $('tdlg-url').href = x.url;
    const c = $('tdlg-comm'); c.textContent = x.comm; c.className = 'chip c-' + x.c;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  });
  $('tdlg-x').addEventListener('click', () => d.close());
  d.addEventListener('click', ev => { if (ev.target === d) d.close(); });

  // open the chart of lives on the decades where most of the statements fall
  const cs = document.getElementById('cscroll');
  if (cs) cs.scrollLeft = Math.max(0, cs.scrollWidth * parseFloat(cs.dataset.focus) - cs.clientWidth / 2);
  // our own scroll bars above and below the chart (always visible, also on phones), plus arrow buttons
  if (cs) {
    const tracks = [...document.querySelectorAll('.ctrack')];
    const paint = () => tracks.forEach(tr => {
      const th = tr.firstElementChild, w = tr.clientWidth, sw = cs.scrollWidth;
      th.style.width = Math.max(36, w * cs.clientWidth / sw) + 'px';
      th.style.transform = `translateX(${(w - th.offsetWidth) * (cs.scrollLeft / Math.max(1, sw - cs.clientWidth))}px)`;
    });
    cs.addEventListener('scroll', paint, { passive: true }); addEventListener('resize', paint); paint();
    tracks.forEach(tr => {
      const th = tr.firstElementChild; let start = null;
      const to = x => { const r = tr.getBoundingClientRect(), f = (x - r.left - th.offsetWidth / 2) / Math.max(1, r.width - th.offsetWidth); cs.scrollLeft = Math.min(1, Math.max(0, f)) * (cs.scrollWidth - cs.clientWidth); };
      tr.addEventListener('pointerdown', ev => { start = true; tr.setPointerCapture(ev.pointerId); to(ev.clientX); ev.preventDefault(); });
      tr.addEventListener('pointermove', ev => { if (start) to(ev.clientX); });
      ['pointerup', 'pointercancel'].forEach(e => tr.addEventListener(e, () => { start = null; }));
    });
    document.querySelectorAll('.carrow').forEach(b => b.addEventListener('click', () => cs.scrollBy({ left: +b.dataset.d * Math.max(240, cs.clientWidth * 0.7), behavior: 'smooth' })));
  }
})();
