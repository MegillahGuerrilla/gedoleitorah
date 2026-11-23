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
})();
