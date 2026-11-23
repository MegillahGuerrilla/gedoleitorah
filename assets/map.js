/* Night map of where the rabbis were born and served. Colors mark communities. Data: window.MAPDATA. */
(function () {
  const D = window.MAPDATA; if (!D || !window.d3 || !window.topojson) return;
  const svg = d3.select('#rmap-svg'), W = innerWidth < 700 ? 600 : 960, H = 560;
  svg.attr('viewBox', `0 0 ${W} ${H}`);
  const VIEWS = {
    europe: { lon: [-8, 50], lat: [11, 57] },
    israel: { lon: [34.0, 36.1], lat: [30.9, 33.2] },
    america: { lon: [-83, -70], lat: [38.5, 46.5] },
    world: { lon: [-100, 150], lat: [-42, 60] }
  };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const proj = d3.geoMercator().fitExtent([[0, 0], [W, H]], { type: 'MultiPoint', coordinates: [[-125, -48], [165, 66]] });
  const path = d3.geoPath(proj);
  const root = svg.append('g'), gLand = root.append('g'), gLinks = root.append('g'), gDots = root.append('g');
  const P = D.places, XY = {}, byPlace = {};
  Object.keys(P).forEach(k => XY[k] = proj([P[k].lon, P[k].lat]));
  D.rabbis.forEach(r => {
    if (r.born && P[r.born]) (byPlace[r.born] ||= { born: [], served: [] }).born.push(r);
    (r.served || []).forEach(s => { if (P[s]) (byPlace[s] ||= { born: [], served: [] }).served.push(r); });
  });
  const comms = new Set(Object.keys(D.comms)), colls = new Set(['territories', 'elections']);
  const on = r => comms.has(r.comm) && colls.has(r.coll);
  const col = c => `var(--c-${c})`;
  let k = 1, land = null, selected = null, first = true;
  const pie = d3.pie().sort(null).value(d => d[1]);

  const zoom = d3.zoom().scaleExtent([1, 90]).translateExtent([[-80, -80], [W + 80, H + 80]])
    .filter(ev => ev.type === 'wheel' ? ev.ctrlKey || ev.metaKey : (!ev.touches || ev.touches.length > 1) && !ev.button)
    .on('zoom', ev => { root.attr('transform', ev.transform); k = ev.transform.k; rescale(); });
  svg.call(zoom).on('dblclick.zoom', null);
  svg.style('touch-action', 'pan-y');

  function rescale() {
    gLand.selectAll('path').attr('stroke-width', 0.5 / k);
    gLinks.selectAll('path').attr('stroke-width', 1.25 / k);
    gDots.selectAll('g.pt').attr('transform', p => `translate(${XY[p][0]},${XY[p][1]}) scale(${1 / k})`)
      .select('text').style('display', function (p) { return count(p) >= 3 || k > 3.2 || p === selected ? null : 'none'; });
  }
  const members = p => [...byPlace[p].born, ...byPlace[p].served].filter(on);
  const count = p => new Set(members(p).map(r => r.slug)).size;

  function draw() {
    if (!land) return;
    gLand.selectAll('path').data(land.features).join('path').attr('d', path).attr('class', 'land');
    const links = [];
    D.rabbis.filter(on).forEach(r => {
      const pts = [r.born, ...(r.served || [])].filter(p => p && P[p]);
      for (let i = 1; i < pts.length; i++) if (pts[i] !== pts[i - 1]) links.push({ r, a: XY[pts[i - 1]], b: XY[pts[i]], id: r.slug + i });
    });
    const ls = gLinks.selectAll('path').data(links, d => d.id).join('path').attr('class', 'link').attr('stroke', d => col(d.r.comm))
      .attr('d', d => { const [x1, y1] = d.a, [x2, y2] = d.b, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.2; return `M${x1},${y1}Q${mx},${my} ${x2},${y2}`; });
    if (first && !still) {
      ls.each(function () { const n = this.getTotalLength(); d3.select(this).attr('stroke-dasharray', n).attr('stroke-dashoffset', n); })
        .transition().delay((d, i) => 300 + i * 22).duration(1400).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)
        .on('end', function () { d3.select(this).attr('stroke-dasharray', null); });
    }
    const keys = Object.keys(byPlace).filter(p => members(p).length).sort((a, b) => count(b) - count(a));
    const pts = gDots.selectAll('g.pt').data(keys, p => p).join(enter => {
      const g = enter.append('g').attr('class', 'pt').attr('tabindex', 0).attr('role', 'button');
      g.append('g').attr('class', 'pie'); g.append('circle').attr('class', 'hit'); g.append('text'); return g;
    }).attr('aria-label', p => `${P[p].name} (${count(p)})`).classed('sel', p => p === selected)
      .each(function (p) {
        const ms = members(p), served = byPlace[p].served.filter(on), n = count(p);
        const r = Math.min(4 + Math.sqrt(n) * 2.3, 17), hollow = !served.length;
        const tally = d3.rollups(hollow ? ms : served, v => v.length, d => d.comm);
        const arc = d3.arc().innerRadius(hollow ? r - 2.4 : 0).outerRadius(r);
        d3.select(this).select('.pie').selectAll('path').data(pie(tally)).join('path').attr('d', arc).attr('fill', d => col(d.data[0]));
        d3.select(this).select('.hit').attr('r', Math.max(r + 5, 13));
        d3.select(this).select('text').text(P[p].name).attr('x', D.lang === 'he' ? -(r + 5) : r + 5).attr('y', 4).attr('text-anchor', D.lang === 'he' ? 'end' : 'start');
      })
      .on('click keydown', (ev, p) => { if (ev.type === 'keydown' && ev.key !== 'Enter' && ev.key !== ' ') return; ev.preventDefault(); show(p); });
    if (first && !still) pts.style('opacity', 0).transition().delay((d, i) => 200 + i * 14).duration(500).style('opacity', 1);
    first = false; rescale();
    if (selected && !members(selected).length) { selected = null; }
    if (selected) show(selected, true);
  }
  function show(p, quiet) {
    selected = p;
    gDots.selectAll('g.pt').classed('sel', d => d === p); rescale();
    const e = byPlace[p], box = document.getElementById('rmap-info');
    const served = e.served.filter(on), born = e.born.filter(r => on(r) && !served.includes(r));
    const li = (r, how) => `<li><a href="${D.t.base}rabbis/${r.slug}/">${r.thumb ? `<img src="${r.thumb}" alt="" loading="lazy">` : `<span class="av" style="background:${col(r.comm)}"></span>`}<span><b>${r.name}</b><small><i style="background:${col(r.comm)}"></i>${D.comms[r.comm]} · ${how}</small></span></a></li>`;
    box.innerHTML = `<h3>${P[p].name}</h3><p class="n">${served.length + born.length}</p><ul>${served.map(r => li(r, D.t.servedHere)).join('')}${born.map(r => li(r, D.t.bornHere)).join('')}</ul>`;
    if (!quiet) box.scrollTop = 0;
  }
  function goto(v, instant) {
    const b = VIEWS[v], [x0, y1] = proj([b.lon[0], b.lat[0]]), [x1, y0] = proj([b.lon[1], b.lat[1]]);
    const s = Math.min(90, 0.94 * Math.min(W / (x1 - x0), H / (y1 - y0)));
    const tr = d3.zoomIdentity.translate(W / 2, H / 2).scale(s).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    (instant || still ? svg : svg.transition().duration(900)).call(zoom.transform, tr);
    document.querySelectorAll('#rmap-views button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
  }
  document.querySelectorAll('#rmap-views button').forEach(b => b.addEventListener('click', () => goto(b.dataset.v)));
  document.getElementById('rmap-in').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1.8));
  document.getElementById('rmap-out').addEventListener('click', () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.8));
  const toggle = (set, sel, attr) => document.querySelectorAll(sel).forEach(b => b.addEventListener('click', () => {
    const id = b.dataset[attr];
    if (set.has(id) && set.size > 1) set.delete(id); else set.add(id);
    b.setAttribute('aria-pressed', String(set.has(id))); draw();
  }));
  toggle(comms, '#rmap-legend button', 'c'); toggle(colls, '#rmap-colls button', 'k');
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json').then(r => r.json())
    .then(t => { land = topojson.feature(t, t.objects.countries); goto(innerWidth < 700 ? 'europe' : 'world', true); draw(); if (byPlace.jerusalem) show('jerusalem', true); })
    .catch(() => { document.getElementById('rmap-info').textContent = D.t.fail; });
})();
