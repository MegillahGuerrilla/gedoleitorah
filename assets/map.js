/* Map of where the rabbis were born and served. Data: window.MAPDATA (built by build.js). */
(function () {
  const D = window.MAPDATA; if (!D || !window.d3 || !window.topojson) return;
  const svg = d3.select('#rmap-svg'), W = 960, H = 600;
  svg.attr('viewBox', `0 0 ${W} ${H}`);
  const VIEWS = {
    europe: { lon: [-6, 48], lat: [10, 57] },
    israel: { lon: [33.9, 36.2], lat: [29.4, 33.4] },
    america: { lon: [-84, -69], lat: [38.5, 46.5] },
    world: { lon: [-120, 160], lat: [-45, 62] }
  };
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const color = c => css(c === 'territories' ? '--terr' : '--el');
  const proj = d3.geoMercator(), path = d3.geoPath(proj);
  const gLand = svg.append('g'), gLinks = svg.append('g'), gDots = svg.append('g');
  const P = D.places, byPlace = {};
  D.rabbis.forEach(r => {
    if (r.born && P[r.born]) (byPlace[r.born] ||= { born: [], served: [] }).born.push(r);
    (r.served || []).forEach(s => { if (P[s]) (byPlace[s] ||= { born: [], served: [] }).served.push(r); });
  });
  let land, view = 'europe';
  const active = new Set(D.colls.map(c => c.id));
  const on = r => active.has(r.coll);
  function fit() {
    const b = VIEWS[view];
    proj.fitExtent([[20, 20], [W - 20, H - 20]], { type: 'MultiPoint', coordinates: [[b.lon[0], b.lat[0]], [b.lon[1], b.lat[1]]] });
  }
  function draw() {
    fit();
    gLand.selectAll('path').data(land.features).join('path').attr('d', path).attr('class', 'land');
    const links = [];
    D.rabbis.filter(on).forEach(r => {
      const pts = [r.born, ...(r.served || [])].filter(k => k && P[k]);
      for (let i = 1; i < pts.length; i++) if (pts[i] !== pts[i - 1]) links.push({ r, a: P[pts[i - 1]], b: P[pts[i]] });
    });
    gLinks.selectAll('path').data(links).join('path').attr('class', 'link').attr('stroke', d => color(d.r.coll))
      .attr('d', d => { const [x1, y1] = proj([d.a.lon, d.a.lat]), [x2, y2] = proj([d.b.lon, d.b.lat]); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.18; return `M${x1},${y1}Q${mx},${my} ${x2},${y2}`; });
    const keys = Object.keys(byPlace).filter(k => [...byPlace[k].born, ...byPlace[k].served].some(on));
    gDots.selectAll('g.pt').data(keys, k => k).join(enter => { const g = enter.append('g').attr('class', 'pt').attr('tabindex', 0).attr('role', 'button'); g.append('circle'); g.append('text'); return g; })
      .attr('transform', k => { const [x, y] = proj([P[k].lon, P[k].lat]); return `translate(${x},${y})`; })
      .attr('aria-label', k => P[k].name)
      .each(function (k) {
        const e = byPlace[k], all = [...e.born, ...e.served].filter(on), servedHere = e.served.some(on);
        const [x, y] = proj([P[k].lon, P[k].lat]);
        const inView = x > 0 && x < W && y > 0 && y < H;
        const both = new Set(all.map(r => r.coll)).size > 1;
        const c = color(all[0].coll);
        d3.select(this).style('display', inView ? null : 'none');
        d3.select(this).select('circle').attr('r', Math.min(4 + Math.sqrt(all.length) * 2.4, 15))
          .attr('fill', servedHere ? (both ? css('--gold') : c) : css('--surface')).attr('stroke', both ? css('--gold') : c).attr('stroke-width', servedHere ? 1.5 : 2.5);
        const label = all.length > 2 || view === 'israel' || view === 'america';
        d3.select(this).select('text').text(label ? P[k].name : '').attr('x', D.lang === 'he' ? -10 : 10).attr('y', 4).attr('text-anchor', D.lang === 'he' ? 'end' : 'start');
      })
      .on('click keydown', (ev, k) => { if (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return; ev.preventDefault(); show(k); });
  }
  function show(k) {
    const e = byPlace[k], box = document.getElementById('rmap-info');
    const served = e.served.filter(on), born = e.born.filter(r => on(r) && !served.includes(r));
    const li = (r, how) => `<li><a href="${D.t.base}rabbis/${r.slug}/"><span class="dot" style="background:${color(r.coll)}"></span>${r.name}</a> <small>${how}</small></li>`;
    box.innerHTML = `<h4>${P[k].name}</h4><ul>${served.map(r => li(r, D.t.servedHere)).join('')}${born.map(r => li(r, D.t.bornHere)).join('')}</ul>`;
  }
  document.querySelectorAll('#rmap-views button').forEach(b => b.addEventListener('click', () => {
    view = b.dataset.v; document.querySelectorAll('#rmap-views button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); if (land) draw();
  }));
  document.querySelectorAll('#rmap-legend button').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.c; if (active.has(id) && active.size > 1) active.delete(id); else active.add(id);
    b.setAttribute('aria-pressed', String(active.has(id))); if (land) draw();
  }));
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json').then(r => r.json())
    .then(t => { land = topojson.feature(t, t.objects.countries); draw(); })
    .catch(() => { document.getElementById('rmap-info').textContent = D.t.fail; });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => land && draw());
})();
