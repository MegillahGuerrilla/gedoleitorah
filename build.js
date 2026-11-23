// Builds gedoleitorah.com: Hebrew at the root, English under /en/. Run: node build.js
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const COMMON = read('common.json');
const EL = read('elections.json');
const TR = read('territories.json');
const PLACES = COMMON.places;
const COMM = Object.fromEntries(COMMON.communities.map(c => [c.id, c]));
const INDEX = false; // flip to true when the site is approved for search engines

const esc0 = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// keep year ranges like 1887–1979 in reading order inside Hebrew text
const esc = s => esc0(s).replace(/(\d{3,4}(?:\/\d{1,2})?[–-]\d{2,4})/g, '<bdi dir="ltr">$1</bdi>');
const L = {
  he: {
    dir: 'rtl', site: 'גדולי תורה בשאלות השעה', other: 'en', otherName: 'English',
    tagline: 'דברי גדולי התורה על השאלות שעמדו לפני עם ישראל, בלשונם, עם המקור והתאריך.',
    nav: { home: 'ראשי', territories: 'החזרת שטחים', elections: 'הבחירות לכנסת', rabbis: 'הרבנים', map: 'מפה', connect: 'הקשר בין השאלות', archive: 'הדפים המקוריים' },
    q1: 'שאלה ראשונה', q2: 'שאלה שנייה',
    terrTitle: 'החזרת שטחים', terrQ: 'האם מותר למסור חלק מארץ ישראל?',
    terrMeta: '20 מאמרים של 19 רבנים, מתוך ״גדולי תורה על החזרת שטחים״, בני ברק תש״מ (1980)',
    elTitle: 'הבחירות לכנסת', elQ: 'האם מותר להשתתף בבחירות לכנסת?',
    elMeta: '42 רבנים, מתוך הקונטרס ״זכרון בספר״, ירושלים תשס״ט (2009)',
    toCollection: 'לאוסף', rabbisN: 'רבנים', sayingsN: 'מאמרים', questionsN: 'שאלות',
    homeLede: 'כאן מרוכזים דברי גדולי התורה על שאלות שעמדו לפני עם ישראל, כל שאלה באוסף משלה: הדברים בלשון אומרם, עם המקור, התאריך והדף המקורי.',
    howTitle: 'איך לקרוא את האתר',
    how: ['כל אוסף עומד בפני עצמו. הוא מביא את דברי הרבנים שהשיבו על שאלה אחת, ואינו מייחס להם עמדה בשאלה האחרת. אין רב שמופיע בשני האוספים.',
      'בכל אוסף מצוין מי עמד יחד: רבנים מקהילות ומחוגים שונים, מירושלים ועד התפוצות, שהגיעו לאותה תשובה.'],
    connectTeaser: 'שתי שאלות, נקודת מפגש אחת',
    together: 'מי עמד יחד', theSayings: 'הדברים', page: 'עמ׳', inAppendix: 'בנספחים',
    terrSource: 'מתוך הקובץ ״גדולי תורה על החזרת שטחים״, בני ברק תש״מ (1980). מספרי העמודים הם של הספר.',
    elSource: 'מתוך הקונטרס ״זכרון בספר״: דברי ארבעים ושניים מגדולי ישראל נגד ההשתתפות בבחירות לכנסת. יצא לאור בירושלים על ידי ״דרכי רבותינו״, לקראת הבחירות של ט״ז בשבט תשס״ט (2009).',
    elOrder: 'הרבנים מובאים לפי סדר הקונטרס. תאריכי פטירה שנמסרו בקונטרס בטעות תוקנו כאן.',
    appendixDocs: 'בנספחי הספר', origPage: 'הדף המקורי', said: 'נאמר', died: 'נלב״ע',
    fromBook: 'מתוך הספר (תש״מ)', places: 'מקומות', born: 'נולד ב', served: 'כיהן ב',
    sources: 'מקורות וקריאה נוספת', verify: 'מקור הדברים נמצא בבדיקה.', note: 'הערה',
    collection: 'אוסף', allRabbis: 'כל הרבנים', rabbisLede: 'כל הרבנים שדבריהם מובאים באתר, לפי האוסף והקהילה.',
    mapTitle: 'מאין באו ואיפה כיהנו',
    mapLede: 'כל נקודה היא מקום שבו נולד אחד הרבנים או כיהן בו. לחצו על נקודה כדי לראות מי. מקומות שלא אומתו אינם מסומנים.',
    views: { europe: 'אירופה והמזרח התיכון', israel: 'ארץ ישראל', america: 'צפון אמריקה', world: 'כל העולם' },
    servedHere: 'כיהן כאן', bornHere: 'נולד כאן', mapFail: 'קווי המפה לא נטענו.', mapPick: 'בחרו נקודה במפה.',
    archiveTitle: 'הדפים המקוריים', archiveLede: 'הדפים כפי שנדפסו, לעיון ולהשוואה.',
    zbArchive: '״זכרון בספר״ (תשס״ט)', terrArchive: '״גדולי תורה על החזרת שטחים״ (תש״מ)',
    terrScans: 'סריקות הספר יתווספו כאן.',
    cover: 'כריכה קדמית', titlePage: 'שער', note43: 'פתק בכתב יד, ט״ז שבט תשס״ט', back: 'כריכה אחורית',
    themes: 'נושא', back2: 'חזרה', footer: 'הדברים מובאים מתוך הספרים שנדפסו. התרגומים לאנגלית נעשו עבור אתר זה.',
    opening: 'בפתח הספר', members: 'חברי המועצה',
  },
  en: {
    dir: 'ltr', site: 'Torah Leaders on the Questions of the Hour', other: 'he', otherName: 'עברית',
    tagline: 'What the Torah leaders said on the questions facing the Jewish people, in their own words, with source and date.',
    nav: { home: 'Home', territories: 'Giving up land', elections: 'Knesset elections', rabbis: 'The rabbis', map: 'Map', connect: 'How they connect', archive: 'Original pages' },
    q1: 'First question', q2: 'Second question',
    terrTitle: 'Giving Up Land', terrQ: 'May any part of the Land of Israel be handed over?',
    terrMeta: '20 sayings by 19 rabbis, from Gedolei Torah al Hachzarat Shetachim, Bnei Brak 1980',
    elTitle: 'Knesset Elections', elQ: 'May a Jew take part in the Knesset elections?',
    elMeta: '42 rabbis, from the pamphlet Zichron BaSefer, Jerusalem 2009',
    toCollection: 'Open the collection', rabbisN: 'rabbis', sayingsN: 'sayings', questionsN: 'questions',
    homeLede: 'This site gathers what the Torah leaders said on questions that came before the Jewish people, each question in a collection of its own: their words as they said them, with the source, the date and the original page.',
    howTitle: 'How to read this site',
    how: ['Each collection stands on its own. It brings the words of the rabbis who answered one question and attributes to them no position on the other. No rabbi appears in both collections.',
      'Each collection shows who stood together: rabbis of different communities and circles, from Jerusalem to the Diaspora, who reached the same answer.'],
    connectTeaser: 'Two questions, one meeting point',
    together: 'Who stood together', theSayings: 'The sayings', page: 'p.', inAppendix: 'appendix',
    terrSource: 'From the collection Gedolei Torah al Hachzarat Shetachim (Torah Greats on Returning Territories), Bnei Brak, 5740 (1980). Page numbers are the book’s. English translations were made for this site.',
    elSource: 'From the pamphlet Zichron BaSefer: the words of forty-two Torah greats against taking part in the Knesset elections. Published in Jerusalem by Darkei Rabboseinu for the elections of 16 Shevat 5769 (2009). English translations were made for this site.',
    elOrder: 'The rabbis appear in the pamphlet’s order. Dates of death the pamphlet gave in error have been corrected here.',
    appendixDocs: 'In the book’s appendices', origPage: 'Original page', said: 'Said', died: 'Died',
    fromBook: 'From the book (1980)', places: 'Places', born: 'Born in', served: 'Served in',
    sources: 'Sources and further reading', verify: 'The source of this statement is being verified.', note: 'Note',
    collection: 'Collection', allRabbis: 'All the rabbis', rabbisLede: 'Every rabbi whose words appear on this site, by collection and community.',
    mapTitle: 'Where They Came From and Where They Served',
    mapLede: 'Each point is a place where one of the rabbis was born or served. Tap a point to see who. Places that have not been verified are left off.',
    views: { europe: 'Europe & Middle East', israel: 'Land of Israel', america: 'North America', world: 'Whole world' },
    servedHere: 'served here', bornHere: 'born here', mapFail: 'The map outline could not load.', mapPick: 'Choose a point on the map.',
    archiveTitle: 'Original Pages', archiveLede: 'The pages as they were printed, for reading and comparison.',
    zbArchive: 'Zichron BaSefer (2009)', terrArchive: 'Gedolei Torah al Hachzarat Shetachim (1980)',
    terrScans: 'Scans of the book will be added here.',
    cover: 'Front cover', titlePage: 'Title page', note43: 'Handwritten note, 16 Shevat 5769', back: 'Back cover',
    themes: 'Theme', back2: 'Back', footer: 'The sayings are quoted from the printed books. The English translations were made for this site.',
    opening: 'Opening the book', members: 'Members of the Council',
  }
};
const base = lang => (lang === 'he' ? '/' : '/en/');
const url = (lang, p = '') => base(lang) + p;

// ---------- people ----------
const people = [];
for (const it of EL) {
  people.push({
    slug: it.slug, coll: 'elections', comm: it.community, born: it.born, served: it.served, n: it.n,
    he: { name: it.he_name, title: it.he_title, when: `${L.he.died} ${it.he_death.replace(/^נלב״ע\s*/, '')}`, bio: it.he_bio },
    en: { name: it.en_name, title: it.en_title, when: '', bio: it.en_bio },
    sayings: [{ n: it.n, he: it.he_quote, en: it.en_quote, he_src: it.he_date, en_src: it.en_date, scan: it.scan }],
    links: it.links, verify: it.verify,
  });
}
for (const [k, r] of Object.entries(TR.rabbis)) {
  const says = TR.sayings.filter(s => s.rabbi === k);
  people.push({
    slug: r.slug, coll: 'territories', comm: r.community, born: r.born, served: r.served, n: says[0].n,
    he: { name: r.he_name, title: '', when: r.years, bio: r.he_bio || TR.pending_bio.he, context: r.he_context, fromBook: !!r.he_bio },
    en: { name: r.en_name, title: '', when: r.years, bio: r.en_bio || TR.pending_bio.en, context: r.en_context, fromBook: !!r.en_bio },
    sayings: says.map(s => ({ n: s.n, he: s.he_quote, en: s.en_quote, he_src: `${L.he.page} ${s.page}${s.appendix ? ` (${L.he.inAppendix})` : ''}`, en_src: `${L.en.page} ${s.page}${s.appendix ? ` (${L.en.inAppendix})` : ''}`, he_note: s.he_note, en_note: s.en_note })),
    links: [], verify: false,
  });
}
const bySlug = Object.fromEntries(people.map(p => [p.slug, p]));
const collName = (lang, c) => c === 'territories' ? L[lang].terrTitle : L[lang].elTitle;

// ---------- layout ----------
function layout(lang, p, { title, desc, body, og, active, wide, bleed }) {
  const t = L[lang];
  const full = title ? `${title} | ${t.site}` : t.site;
  const navKeys = ['territories', 'elections', 'rabbis', 'map', 'connect', 'archive'];
  const other = url(t.other, p);
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${INDEX ? '' : '<meta name="robots" content="noindex">\n'}<title>${esc0(full)}</title>
<meta name="description" content="${esc0(desc || t.tagline)}">
<meta property="og:title" content="${esc0(title || t.site)}">
<meta property="og:description" content="${esc0(desc || t.tagline)}">
<meta property="og:site_name" content="${esc0(t.site)}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://gedoleitorah.com${url(lang, p)}">
${og ? `<meta property="og:image" content="https://gedoleitorah.com${og}">\n` : ''}<link rel="alternate" hreflang="he" href="https://gedoleitorah.com${url('he', p)}">
<link rel="alternate" hreflang="en" href="https://gedoleitorah.com${url('en', p)}">
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500;700&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body class="${lang}">
<a class="skip" href="#main">${lang === 'he' ? 'דילוג לתוכן' : 'Skip to content'}</a>
<header class="top">
  <div class="wrap toprow">
    <a class="brand" href="${url(lang)}">${esc0(t.site)}</a>
    <a class="lang" href="${other}" hreflang="${t.other}" lang="${t.other}">${t.otherName}</a>
  </div>
  <nav class="wrap nav" aria-label="${lang === 'he' ? 'ניווט' : 'Main'}">
    ${navKeys.map(k => `<a href="${url(lang, k + '/')}"${active === k ? ' aria-current="page"' : ''}>${esc0(t.nav[k])}</a>`).join('')}
  </nav>
</header>
<main id="main" class="${bleed ? 'bleed' : 'wrap' + (wide ? ' wide' : '')}">
${body}
</main>
<footer class="foot"><div class="wrap"><p>${esc0(t.footer)}</p><p><a href="${url(lang)}">${esc0(t.site)}</a> · gedoleitorah.com</p></div></footer>
</body>
</html>
`;
}

// ---------- pieces ----------
const paras = s => String(s).split('\n').filter(x => x.trim()).map(x => `<p>${esc(x)}</p>`).join('');
const quoteHe = s => `<blockquote class="q" lang="he" dir="rtl">${paras(s)}</blockquote>`;
const quoteEn = s => `<blockquote class="q en" lang="en" dir="ltr">${paras(s)}</blockquote>`;
const quotes = (lang, he, en) => lang === 'he' ? quoteHe(he) : quoteEn(en) + `<details class="orig"><summary>עברית · Hebrew original</summary>${quoteHe(he)}</details>`;
const commChip = (lang, c) => `<span class="chip c-${c}">${esc(COMM[c][lang])}</span>`;
const collBadge = (lang, c) => `<a class="badge b-${c}" href="${url(lang, c + '/')}">${esc(collName(lang, c))}</a>`;

function together(lang, coll) {
  const ps = people.filter(p => p.coll === coll);
  const groups = COMMON.communities.map(c => ({ c, list: ps.filter(p => p.comm === c.id) })).filter(g => g.list.length);
  return `<section class="together"><h2>${esc(L[lang].together)}</h2><div class="groups">${groups.map(g => `
    <div class="group c-${g.c.id}"><h3><span class="count">${g.list.length}</span> ${esc(g.c[lang])}</h3>
    <p>${g.list.sort((a, b) => a.n - b.n).map(p => `<a href="${url(lang, 'rabbis/' + p.slug + '/')}">${esc(shortName(lang, p))}</a>`).join(' · ')}</p></div>`).join('')}</div></section>`;
}
function shortName(lang, p) {
  if (p.coll === 'territories') { const r = Object.values(TR.rabbis).find(r => r.slug === p.slug); return lang === 'he' ? r.he_short : r.en_short; }
  return lang === 'he' ? p.he.name.replace(/\s*זצוק״ל$/, '') : p.en.name;
}

// ---------- pages ----------
// ---------- visual home: map + timeline ----------
const H = {
  he: {
    kicker: 'דעת תורה, בלשון אומריה',
    statR: 'רבנים', statC: 'חוגים וקהילות', statP: 'ערים', statK: 'יבשות',
    mapH: 'מכל קצות העולם, תשובה אחת',
    mapP: 'כל נקודה היא עיר שבה נולד אחד הרבנים או כיהן בה, וכל קו הוא דרכו של רב ממקום למקום. הצבע מסמן את החוג שלו. לחצו על נקודה.',
    colls: 'אוסף', zoomIn: 'הגדלה', zoomOut: 'הקטנה', all: 'הכול',
    tlH: 'ציר הזמן', tlP: 'מתי נאמרו הדברים, שנה אחר שנה. לחצו על דף כדי לקרוא אותו.',
    oldest: 'מהישן לחדש', newest: 'מהחדש לישן', undated: 'ללא תאריך',
    book1980: 'יוצא לאור ״גדולי תורה על החזרת שטחים״, ובו דברי תשעה־עשר רבנים:',
    pamph2009: 'יוצא לאור בירושלים הקונטרס ״זכרון בספר״, המקבץ את דברי ארבעים ושניים הרבנים.',
    toRabbi: 'לדף הרב', close: 'סגירה', twoQ: 'שתי השאלות', fullMap: 'למפה המלאה',
    ctx: {
      1937: [['w', 'ועדת פיל מציעה לחלק את הארץ; הכנסיה הגדולה השלישית מתכנסת במרינבד']],
      1949: [['k', 'הבחירות לאספה המכוננת, הכנסת הראשונה (25 בינואר)']],
      1951: [['k', 'הבחירות לכנסת השנייה (30 ביולי)']],
      1955: [['k', 'הבחירות לכנסת השלישית (26 ביולי)']],
      1959: [['k', 'הבחירות לכנסת הרביעית (3 בנובמבר)']],
      1961: [['k', 'הבחירות לכנסת החמישית (15 באוגוסט)']],
      1965: [['k', 'הבחירות לכנסת השישית (2 בנובמבר)']],
      1967: [['w', 'מלחמת ששת הימים']],
      1977: [['k', 'הבחירות לכנסת התשיעית (17 במאי); אגודת ישראל מצטרפת לקואליציה']],
      1978: [['w', 'הסכמי קמפ דייוויד (ספטמבר)']],
      1979: [['w', 'הסכם השלום עם מצרים (מרץ)']],
      1982: [['w', 'הושלמה הנסיגה מסיני (אפריל)']],
      1988: [['k', 'הבחירות לכנסת השתים־עשרה (1 בנובמבר)']],
      1992: [['k', 'הבחירות לכנסת השלוש־עשרה (23 ביוני)']],
      2003: [['k', 'הבחירות לכנסת השש־עשרה (28 בינואר)']],
      2006: [['k', 'הבחירות לכנסת השבע־עשרה (28 במרץ)']],
      2009: [['k', 'הבחירות לכנסת השמונה־עשרה (10 בפברואר, ט״ז בשבט תשס״ט)']],
    },
  },
  en: {
    kicker: 'Da’at Torah, in their own words',
    statR: 'rabbis', statC: 'circles and communities', statP: 'cities', statK: 'continents',
    mapH: 'From Every Corner of the World, One Answer',
    mapP: 'Each point is a city where one of the rabbis was born or served, and each line is a rabbi’s path from place to place. The color marks his circle. Tap a point.',
    colls: 'Collection', zoomIn: 'Zoom in', zoomOut: 'Zoom out', all: 'All',
    tlH: 'Timeline', tlP: 'When the words were said, year by year. Tap a page to read it.',
    oldest: 'Oldest first', newest: 'Newest first', undated: 'Undated',
    book1980: 'Gedolei Torah al Hachzarat Shetachim is published, with the words of nineteen rabbis:',
    pamph2009: 'The pamphlet Zichron BaSefer is published in Jerusalem, gathering the words of the forty-two rabbis.',
    toRabbi: 'Open his page', close: 'Close', twoQ: 'The two questions', fullMap: 'Open the full map',
    ctx: {
      1937: [['w', 'The Peel Commission proposes partitioning the Land; the Third Knessia Gedola meets in Marienbad']],
      1949: [['k', 'Elections to the Constituent Assembly, the first Knesset (January 25)']],
      1951: [['k', 'Elections to the Second Knesset (July 30)']],
      1955: [['k', 'Elections to the Third Knesset (July 26)']],
      1959: [['k', 'Elections to the Fourth Knesset (November 3)']],
      1961: [['k', 'Elections to the Fifth Knesset (August 15)']],
      1965: [['k', 'Elections to the Sixth Knesset (November 2)']],
      1967: [['w', 'The Six-Day War']],
      1977: [['k', 'Elections to the Ninth Knesset (May 17); Agudath Israel joins the coalition']],
      1978: [['w', 'The Camp David Accords (September)']],
      1979: [['w', 'The peace treaty with Egypt (March)']],
      1982: [['w', 'The withdrawal from Sinai is completed (April)']],
      1988: [['k', 'Elections to the Twelfth Knesset (November 1)']],
      1992: [['k', 'Elections to the Thirteenth Knesset (June 23)']],
      2003: [['k', 'Elections to the Sixteenth Knesset (January 28)']],
      2006: [['k', 'Elections to the Seventeenth Knesset (March 28)']],
      2009: [['k', 'Elections to the Eighteenth Knesset (February 10; 16 Shevat 5769)']],
    },
  },
};
const usedPlaces = new Set(); people.forEach(p => { if (p.born) usedPlaces.add(p.born); p.served.forEach(s => usedPlaces.add(s)); });
const usedComms = COMMON.communities.filter(c => people.some(p => p.comm === c.id));
const plain = (lang, p) => lang === 'he' ? p.he.name.replace(/\s*זצוק״ל$/, '').replace(/\s*זצ״ל$/, '') : p.en.name;
const thumbOf = p => p.sayings[0].scan ? `/img/zb/t/${p.sayings[0].scan}` : null;

function mapBlock(lang, full) {
  const t = L[lang], h = H[lang];
  const data = {
    lang, places: Object.fromEntries([...usedPlaces].map(k => [k, { name: PLACES[k][lang], lat: PLACES[k].lat, lon: PLACES[k].lon }])),
    rabbis: people.map(p => ({ slug: p.slug, name: plain(lang, p), coll: p.coll, comm: p.comm, born: p.born, served: p.served, thumb: thumbOf(p) })),
    comms: Object.fromEntries(usedComms.map(c => [c.id, c[lang]])),
    t: { servedHere: t.servedHere, bornHere: t.bornHere, fail: t.mapFail, pick: t.mapPick, base: url(lang) },
  };
  return `<section class="mapband" id="rmap" aria-label="${esc0(h.mapH)}">
  <div class="mapwrap">
    <div class="maphead"><h2>${esc(h.mapH)}</h2><p>${esc(h.mapP)}</p></div>
    <div id="rmap-legend" class="cbar" role="group">${usedComms.map(c => { const n = people.filter(p => p.comm === c.id).length; return `<button type="button" data-c="${c.id}" aria-pressed="true" style="flex-grow:${n};--cc:var(--c-${c.id})"><b>${n}</b> ${esc(c[lang])}</button>`; }).join('')}</div>
    <div class="mapgrid">
      <div class="mapbox"><svg id="rmap-svg" role="img" aria-label="${esc0(h.mapH)}"></svg>
        <div id="rmap-views" role="group">${Object.entries(t.views).map(([k, v]) => `<button type="button" data-v="${k}" aria-pressed="false">${esc(v)}</button>`).join('')}</div>
        <div class="zoombtns"><button type="button" id="rmap-in" aria-label="${esc0(h.zoomIn)}">+</button><button type="button" id="rmap-out" aria-label="${esc0(h.zoomOut)}">−</button></div>
      </div>
      <aside id="rmap-info" class="mapinfo" aria-live="polite"><p class="muted">${esc(t.mapPick)}</p></aside>
    </div>
    <div class="mapfoot"><div id="rmap-colls" role="group" aria-label="${esc0(h.colls)}"><button type="button" data-k="territories" aria-pressed="true">${esc(t.terrTitle)} · ${people.filter(p => p.coll === 'territories').length}</button><button type="button" data-k="elections" aria-pressed="true">${esc(t.elTitle)} · ${people.filter(p => p.coll === 'elections').length}</button></div>${full ? '' : `<a class="maplink" href="${url(lang, 'map/')}">${esc(h.fullMap)} ${lang === 'he' ? '←' : '→'}</a>`}</div>
  </div>
</section>
<script>window.MAPDATA=${JSON.stringify(data)};</script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<script src="/assets/map.js"></script>`;
}

function timeline(lang) {
  const t = L[lang], h = H[lang];
  const byYear = {};
  const add = (y, e) => (byYear[y] ||= []).push(e);
  const dlg = {};
  for (const it of EL) {
    const p = bySlug[it.slug], m = /(\d{4})\)?$/.exec(it.en_date) || /\((?:\w+ )?(\d{4})\)/.exec(it.en_date);
    dlg[it.n] = { name: p[lang].name, title: p[lang].title, quote: lang === 'he' ? it.he_quote : it.en_quote, date: lang === 'he' ? it.he_date : it.en_date, img: `/img/zb/${it.scan}`, url: url(lang, 'rabbis/' + it.slug + '/'), comm: COMM[it.community][lang], c: it.community };
    add(m ? +m[1] : 9999, { kind: 'el', n: it.n, p });
  }
  const decl = TR.opening.find(o => o.kind === 'decl');
  add(1937, { kind: 'doc', title: lang === 'he' ? decl.hhe : decl.hen, quote: lang === 'he' ? decl.he : decl.en });
  for (const s of TR.sayings) add(s.n === 1 ? 1978 : 1980, { kind: 'tr', s, p: people.find(x => x.coll === 'territories' && x.sayings.some(y => y.n === s.n)) });
  const years = [...new Set([...Object.keys(byYear).map(Number), ...Object.keys(h.ctx).map(Number)])].sort((a, b) => a - b);
  const elCard = e => `<button type="button" class="tcard c-${e.p.comm}" data-n="${e.n}"><img src="/img/zb/t/${e.p.sayings[0].scan}" alt="" loading="lazy" width="420" height="606"><span class="tn">${esc(plain(lang, e.p))}</span></button>`;
  const trCard = e => `<a class="tcard text c-${e.p.comm}" href="${url(lang, 'rabbis/' + e.p.slug + '/')}"><span class="tq" lang="${lang}">${esc(lang === 'he' ? e.s.he_quote : e.s.en_quote)}</span><span class="tn">${esc(shortName(lang, e.p))}</span></a>`;
  const sections = years.map(y => {
    const es = byYear[y] || [], els = es.filter(e => e.kind === 'el'), trs = es.filter(e => e.kind === 'tr'), docs = es.filter(e => e.kind === 'doc');
    const ctx = (y !== 9999 && h.ctx[y] || []).map(c => `<p class="ctx ctx-${c[0]}">${esc(c[1])}</p>`).join('');
    const extra = y === 1980 ? `<p class="ctx ctx-w">${esc(h.book1980)}</p>` : y === 2009 ? `<p class="ctx ctx-k">${esc(h.pamph2009)}</p>` : '';
    return `<section class="yr${es.length ? '' : ' quiet'}${y === 9999 ? ' undated' : ''}"><h3 class="y">${y === 9999 ? esc(h.undated) : y}</h3><div class="ybody">${ctx}${extra}
      ${docs.map(d => `<a class="tdoc" href="${url(lang, 'territories/')}"><b>${esc(d.title)}</b><span lang="${lang}">${esc(d.quote)}</span></a>`).join('')}
      ${trs.length ? `<div class="tgrid text">${trs.map(trCard).join('')}</div>` : ''}
      ${els.length ? `<div class="tgrid">${els.map(elCard).join('')}</div>` : ''}</div></section>`;
  }).join('');
  return `<section class="wrap wide tlsec"><div class="tlhead"><div><h2>${esc(h.tlH)}</h2><p class="lede">${esc(h.tlP)}</p></div>
    <div class="seg" role="group"><button type="button" id="tl-old" aria-pressed="true">${esc(h.oldest)}</button><button type="button" id="tl-new" aria-pressed="false">${esc(h.newest)}</button></div></div>
    <div class="tl" id="tl">${sections}</div></section>
<dialog id="tdlg" aria-labelledby="tdlg-name"><button type="button" class="dx" id="tdlg-x" aria-label="${esc0(h.close)}">×</button><div class="dgrid"><a id="tdlg-a" target="_blank" rel="noopener"><img id="tdlg-img" alt=""></a><div class="dtext"><span class="chip" id="tdlg-comm"></span><h3 id="tdlg-name"></h3><p class="ttl" id="tdlg-title"></p><blockquote class="q${lang === 'he' ? '' : ' en'}" lang="${lang}"><p id="tdlg-q"></p></blockquote><p class="src" id="tdlg-date"></p><a class="more" id="tdlg-url">${esc(h.toRabbi)} ${lang === 'he' ? '←' : '→'}</a></div></div></dialog>
<script>window.TL=${JSON.stringify(dlg)};</script><script src="/assets/home.js"></script>`;
}

function home(lang) {
  const t = L[lang], h = H[lang];
  const card = (k, label, title, q, meta) => `<a class="qcard b-${k}" href="${url(lang, k + '/')}"><span class="qlabel">${esc(label)}</span><span class="qtitle">${esc(title)}</span><span class="qq">${esc(q)}</span><span class="qmeta">${esc(meta)}</span><span class="qgo">${esc(t.toCollection)} ${lang === 'he' ? '←' : '→'}</span></a>`;
  const body = `<section class="wrap wide hero2"><p class="kicker">${esc(h.kicker)}</p><h1>${esc(t.site)}</h1>
<div class="stats"><span><b>${people.length}</b> ${h.statR}</span><span><b>${usedComms.length}</b> ${h.statC}</span><span><b>${usedPlaces.size}</b> ${h.statP}</span><span><b>6</b> ${h.statK}</span></div></section>
${mapBlock(lang, false)}
${timeline(lang)}
<section class="wrap wide"><h2>${esc(h.twoQ)}</h2><div class="qcards">
${card('territories', t.q1, t.terrTitle, t.terrQ, t.terrMeta)}
${card('elections', t.q2, t.elTitle, t.elQ, t.elMeta)}
</div>
<div class="prose">${t.how.map(x => `<p>${esc(x)}</p>`).join('')}<p><a class="more" href="${url(lang, 'connect/')}">${esc(t.connectTeaser)} ${lang === 'he' ? '←' : '→'}</a></p></div></section>`;
  return layout(lang, '', { title: '', body, active: 'home', bleed: true, og: '/img/zb/00a.jpg' });
}

function mapPage(lang) {
  const t = L[lang];
  return layout(lang, 'map/', { title: t.mapTitle, desc: t.mapLede, body: mapBlock(lang, true), active: 'map', bleed: true });
}

function territories(lang) {
  const t = L[lang];
  const th = Object.fromEntries(TR.themes.map(x => [x.id, x]));
  const open = TR.opening.map(o => {
    const note = lang === 'he' ? o.nhe : o.nen, bio = lang === 'he' ? o.bhe : o.ben;
    const src = o.p ? `${t.page} ${o.p}` : (lang === 'he' ? o.plhe : o.plen);
    return `<article class="doc"><h3>${esc(lang === 'he' ? o.hhe : o.hen)}</h3>${bio ? `<p class="note">${esc(bio)}</p>` : ''}${o.list ? `<ul class="members">${o.list.map(m => `<li>${esc(lang === 'he' ? m[0] : m[1])}</li>`).join('')}</ul>` : ''}${note ? `<p class="note">${esc(note)}</p>` : ''}${o.he ? quotes(lang, o.he, o.en) : ''}<p class="src">${esc(src)}</p></article>`;
  }).join('');
  const items = TR.sayings.map(s => {
    const p = people.find(x => x.coll === 'territories' && x.sayings.some(y => y.n === s.n));
    const note = lang === 'he' ? s.he_note : s.en_note;
    return `<li class="say" id="s${s.n}"><div class="saytop"><span class="num">${s.n}</span><span class="chip t-${s.theme}">${esc(th[s.theme][lang])}</span></div>
      ${quotes(lang, s.he_quote, s.en_quote)}
      <p class="who"><a href="${url(lang, 'rabbis/' + p.slug + '/')}">${esc(p[lang].name)}</a></p>
      <p class="src">${t.page} ${s.page}${s.appendix ? ` (${t.inAppendix})` : ''}${note ? ' · ' + esc(note) : ''}</p></li>`;
  }).join('');
  const appx = `<section class="prose"><h2>${esc(t.appendixDocs)}</h2><ul>${TR.appendix_docs.map(d => `<li>${esc(d[lang])} (${t.page} ${d.p})</li>`).join('')}</ul></section>`;
  const body = `<header class="phead b-territories"><p class="qlabel">${esc(t.q1)}</p><h1>${esc(t.terrTitle)}</h1><p class="qq">${esc(t.terrQ)}</p><p class="srcline">${esc(t.terrSource)}</p></header>
${together(lang, 'territories')}
<section><h2>${esc(t.opening)}</h2><div class="docs">${open}</div></section>
<section><h2>${esc(t.theSayings)}</h2><ol class="sayings">${items}</ol></section>
${appx}`;
  return layout(lang, 'territories/', { title: t.terrTitle, desc: t.terrQ, body, active: 'territories' });
}

function elections(lang) {
  const t = L[lang];
  const items = EL.map(it => {
    const p = bySlug[it.slug];
    return `<li class="say" id="s${it.n}"><div class="saytop"><span class="num">${it.n}</span>${commChip(lang, it.community)}</div>
      ${quotes(lang, it.he_quote, it.en_quote)}
      <p class="who"><a href="${url(lang, 'rabbis/' + it.slug + '/')}">${esc(p[lang].name)}</a><span class="ttl">${esc(p[lang].title)}</span></p>
      <p class="src">${esc(lang === 'he' ? it.he_date : it.en_date)} · <a href="/img/zb/${it.scan}" target="_blank" rel="noopener">${esc(t.origPage)}</a>${it.verify ? ` · <em>${esc(t.verify)}</em>` : ''}</p></li>`;
  }).join('');
  const body = `<header class="phead b-elections"><p class="qlabel">${esc(t.q2)}</p><h1>${esc(t.elTitle)}</h1><p class="qq">${esc(t.elQ)}</p><p class="srcline">${esc(t.elSource)}</p></header>
${together(lang, 'elections')}
<section><h2>${esc(t.theSayings)}</h2><p class="note">${esc(t.elOrder)}</p><ol class="sayings">${items}</ol></section>`;
  return layout(lang, 'elections/', { title: t.elTitle, desc: t.elQ, body, active: 'elections', og: '/img/zb/00a.jpg' });
}

function placeList(lang, p) {
  const t = L[lang], out = [];
  if (p.born && PLACES[p.born]) out.push(`${t.born}${lang === 'he' ? '' : ' '}${esc(PLACES[p.born][lang])}`);
  if (p.served.length) out.push(`${t.served}${lang === 'he' ? '' : ' '}${p.served.map(s => esc(PLACES[s][lang])).join(lang === 'he' ? ', ' : ', ')}`);
  return out.length ? `<p class="places"><b>${t.places}:</b> ${out.join(' · ')}</p>` : '';
}

function rabbiPage(lang, p) {
  const t = L[lang], d = p[lang];
  const says = p.sayings.map(s => `<div class="say solo">${quotes(lang, s.he, s.en)}<p class="src">${esc(lang === 'he' ? s.he_src : s.en_src)}${(lang === 'he' ? s.he_note : s.en_note) ? ' · ' + esc(lang === 'he' ? s.he_note : s.en_note) : ''} · <a href="${url(lang, p.coll + '/')}#s${s.n}">${esc(collName(lang, p.coll))}, ${s.n}</a>${p.verify ? ` · <em>${esc(t.verify)}</em>` : ''}</p>${s.scan ? `<a class="scan" href="/img/zb/${s.scan}" target="_blank" rel="noopener"><img src="/img/zb/t/${s.scan}" alt="${esc0(t.origPage)}" loading="lazy" width="420" height="606"><span>${esc(t.origPage)}</span></a>` : ''}</div>`).join('');
  const links = p.links.length ? `<section class="links"><h2>${esc(t.sources)}</h2><ul>${p.links.map(l => `<li><a href="${esc0(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a></li>`).join('')}</ul></section>` : '';
  const ctx = d.context ? `<aside class="context"><b>${esc(t.note)}</b> ${esc(d.context)}</aside>` : '';
  const when = d.when ? `<p class="when">${esc(d.when)}</p>` : '';
  const body = `<p class="crumbs"><a href="${url(lang, 'rabbis/')}">${esc(t.allRabbis)}</a></p>
<header class="rhead"><div class="badges">${collBadge(lang, p.coll)} ${commChip(lang, p.comm)}</div><h1>${esc(d.name)}</h1>${d.title ? `<p class="rtitle">${esc(d.title)}</p>` : ''}${when}</header>
<section class="bio">${d.fromBook ? `<p class="label">${esc(t.fromBook)}</p>` : ''}<p>${esc(d.bio)}</p>${placeList(lang, p)}</section>
${ctx}
<section>${says}</section>
${links}`;
  const first = p.sayings[0];
  return layout(lang, `rabbis/${p.slug}/`, { title: d.name.replace(/\s*זצוק״ל$/, ''), desc: lang === 'he' ? first.he : first.en, body, active: 'rabbis', og: first.scan ? `/img/zb/t/${first.scan}` : null });
}

function rabbisIndex(lang) {
  const t = L[lang];
  const block = coll => {
    const ps = people.filter(p => p.coll === coll);
    return `<section class="rindex b-${coll}"><h2><a href="${url(lang, coll + '/')}">${esc(collName(lang, coll))}</a> <span class="count">${ps.length}</span></h2>
    ${COMMON.communities.map(c => { const l = ps.filter(p => p.comm === c.id).sort((a, b) => a.n - b.n); return l.length ? `<h3>${esc(c[lang])}</h3><ul class="rlist">${l.map(p => `<li><a href="${url(lang, 'rabbis/' + p.slug + '/')}"><span class="rn">${esc(lang === 'he' ? p.he.name.replace(/\s*זצוק״ל$/, '') : p.en.name)}</span>${p[lang].title ? `<span class="rt">${esc(p[lang].title)}</span>` : ''}</a></li>`).join('')}</ul>` : ''; }).join('')}</section>`;
  };
  const body = `<header class="phead"><h1>${esc(t.nav.rabbis)}</h1><p class="lede">${esc(t.rabbisLede)}</p></header><div class="rcols">${block('territories')}${block('elections')}</div>`;
  return layout(lang, 'rabbis/', { title: t.nav.rabbis, body, active: 'rabbis', wide: true });
}

function connect(lang) {
  const q = n => EL.find(x => x.n === n);
  const tq = n => TR.sayings.find(x => x.n === n);
  const pr = slug => url(lang, 'rabbis/' + slug + '/');
  const cite = (it, he) => `<p class="src"><a href="${pr(it.slug)}">${esc(he ? bySlug[it.slug].he.name : bySlug[it.slug].en.name)}</a>, ${esc(he ? it.he_date : it.en_date)}</p>`;
  const s14 = tq(14), nissim = people.find(p => p.coll === 'territories' && p.sayings.some(s => s.n === 14));
  const sef41 = 'https://www.sefaria.org/Kiddushin.41b', sef42 = 'https://www.sefaria.org/Kiddushin.42b';
  const he = `
<h1>שתי שאלות, נקודת מפגש אחת</h1>
<p>האוסף הראשון באתר עוסק בשאלה אם מותר למסור חלק מארץ ישראל. האוסף השני עוסק בשאלה אם מותר להשתתף בבחירות לכנסת. אלה שתי שאלות נפרדות, ושתי קבוצות שונות של רבנים השיבו עליהן. אף רב אינו מופיע בשני האוספים, ואין לייחס לאיש מהם עמדה בשאלה שלא השיב עליה.</p>
<p>ובכל זאת השאלות נפגשות בנקודה אחת: בבוחר עצמו.</p>
<h2>הבוחר שולח שליח</h2>
<p>הטיעון המרכזי של רבני ״זכרון בספר״ הוא השליחות. הנציג פועל בשם מי שבחר בו, ו<a href="${sef41}?lang=he" target="_blank" rel="noopener">שלוחו של אדם כמותו</a>. מכאן שמי ששולח נציג לכנסת נעשה שותף למה שנעשה בה:</p>
${quoteHe(q(30).he_quote)}${cite(q(30), true)}
${quoteHe(q(31).he_quote)}${cite(q(31), true)}
<p>יש שיענו ש<a href="${sef42}?lang=he" target="_blank" rel="noopener">אין שליח לדבר עבירה</a>. אבל הרבנים האלה לא נשענו על השליחות בלבד. הם כתבו שהבוחר עצמו מודה בשלטון ונותן לו כוח, וזה מעשה שלו, לא של שלוחו:</p>
${quoteHe(q(19).he_quote)}${cite(q(19), true)}
<h2>והכנסת מחליטה על הארץ</h2>
<p>רבני ״גדולי תורה על החזרת שטחים״ קבעו שאסור למסור שום חלק מארץ ישראל, ושאין לשום ממשלה רשות לעשות זאת:</p>
${quoteHe(s14.he_quote)}<p class="src"><a href="${pr(nissim.slug)}">${esc(nissim.he.name)}</a>, עמ׳ ${s14.page}</p>
<p>ממשלה שמוסרת שטח מקבלת את כוחה מהכנסת, והכנסת מקבלת את כוחה מהבוחרים. מי שמקבל את שני הפסקים יחד, שמסירת הארץ אסורה ושהבוחר שותף למעשי נציגיו, אינו יכול לראות בקולו עניין פרטי. זו מסקנה של מי שקורא את שני האוספים זה לצד זה, ולא דבריו של רב מסוים.</p>
<p><a class="more" href="${url(lang, 'territories/')}">להחזרת שטחים ←</a> &nbsp; <a class="more" href="${url(lang, 'elections/')}">לבחירות לכנסת ←</a></p>`;
  const en = `
<h1>Two Questions, One Meeting Point</h1>
<p>The first collection on this site asks whether any part of the Land of Israel may be handed over. The second asks whether a Jew may take part in the Knesset elections. These are separate questions, answered by two different groups of rabbis. No rabbi appears in both collections, and none of them should be credited with a position on a question he did not answer.</p>
<p>Even so, the questions meet at one point: the voter himself.</p>
<h2>The voter sends an agent</h2>
<p>The central argument of the Zichron BaSefer rabbis is agency. A representative acts in the name of those who chose him, and <a href="${sef41}" target="_blank" rel="noopener">a person’s agent is like himself</a>. So whoever sends a representative to the Knesset becomes a partner in what is done there:</p>
${quoteEn(q(30).en_quote)}${cite(q(30), false)}
${quoteEn(q(31).en_quote)}${cite(q(31), false)}
<p>Some will answer that <a href="${sef42}" target="_blank" rel="noopener">there is no agency for a transgression</a>. But these rabbis did not rest on agency alone. They wrote that the voter himself acknowledges the regime and gives it strength, and that is his own act, not his agent’s:</p>
${quoteEn(q(19).en_quote)}${cite(q(19), false)}
<h2>And the Knesset decides about the Land</h2>
<p>The rabbis of Gedolei Torah al Hachzarat Shetachim ruled that no part of the Land of Israel may be handed over, and that no government has the authority to do it:</p>
${quoteEn(s14.en_quote)}<p class="src"><a href="${pr(nissim.slug)}">${esc(nissim.en.name)}</a>, p. ${s14.page}</p>
<p>A government that hands over land draws its power from the Knesset, and the Knesset draws its power from the voters. Whoever accepts both rulings together, that handing over the Land is forbidden and that the voter is a partner in what his representatives do, cannot treat his vote as a private matter. That is the conclusion of a reader who sets the two collections side by side, not the words of any one rabbi.</p>
<p><a class="more" href="${url(lang, 'territories/')}">Giving up land →</a> &nbsp; <a class="more" href="${url(lang, 'elections/')}">Knesset elections →</a></p>`;
  return layout(lang, 'connect/', { title: lang === 'he' ? 'שתי שאלות, נקודת מפגש אחת' : 'Two Questions, One Meeting Point', body: `<article class="prose long">${lang === 'he' ? he : en}</article>`, active: 'connect' });
}

function archive(lang) {
  const t = L[lang];
  const cap = f => {
    if (f === '00a') return t.cover; if (f === '00b') return t.titlePage; if (f === '43') return t.note43; if (f === '44') return t.back;
    const it = EL.find(x => x.n === +f); return `${+f}. ${lang === 'he' ? it.he_name.replace(/\s*זצוק״ל$/, '') : it.en_name}`;
  };
  const files = ['00a', '00b', ...Array.from({ length: 44 }, (_, i) => String(i + 1).padStart(2, '0'))];
  const grid = files.map(f => `<figure><a href="/img/zb/${f}.jpg" target="_blank" rel="noopener"><img src="/img/zb/t/${f}.jpg" alt="${esc0(cap(f))}" loading="lazy" width="420" height="606"></a><figcaption>${esc(cap(f))}</figcaption></figure>`).join('');
  const body = `<header class="phead"><h1>${esc(t.archiveTitle)}</h1><p class="lede">${esc(t.archiveLede)}</p></header>
<section><h2>${esc(t.zbArchive)}</h2><div class="scans">${grid}</div></section>
<section><h2>${esc(t.terrArchive)}</h2><p class="note">${esc(t.terrScans)}</p></section>`;
  return layout(lang, 'archive/', { title: t.archiveTitle, desc: t.archiveLede, body, active: 'archive', wide: true });
}

function notFound(lang) {
  return layout(lang, '', { title: '404', body: `<section class="prose"><h1>${lang === 'he' ? 'הדף לא נמצא' : 'Page not found'}</h1><p><a href="${url(lang)}">${esc(L[lang].site)}</a></p></section>` });
}

// ---------- write ----------
const written = [];
function out(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, rel.startsWith('en/') ? html.replace(/\bGod\b/g, 'G-d') : html);
  written.push(rel);
}
for (const lang of ['he', 'en']) {
  const pre = lang === 'he' ? '' : 'en/';
  out(pre + 'index.html', home(lang));
  out(pre + 'territories/index.html', territories(lang));
  out(pre + 'elections/index.html', elections(lang));
  out(pre + 'rabbis/index.html', rabbisIndex(lang));
  for (const p of people) out(pre + `rabbis/${p.slug}/index.html`, rabbiPage(lang, p));
  out(pre + 'map/index.html', mapPage(lang));
  out(pre + 'connect/index.html', connect(lang));
  out(pre + 'archive/index.html', archive(lang));
}
out('404.html', notFound('he'));
console.log(`Wrote ${written.length} pages; ${people.length} rabbis.`);
