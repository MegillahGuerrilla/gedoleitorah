// Builds gedoleitorah.com: Hebrew at the root, English under /en/, other languages from i18n/<code>.json.
// Run: node build.js   (node build.js --source rewrites i18n/source.json for translators)
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const COMMON = read('common.json');
// Entries marked hold are kept in the data but left off the site.
const EL = read('elections.json').filter(x => !x.hold);
EL.forEach((it, i) => { it.no = i + 1; });
const TR = read('territories.json');
const OT = read('others.json');
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
    nav: { home: 'ראשי', territories: 'החזרת שטחים', elections: 'הבחירות לכנסת', rabbis: 'הרבנים', map: 'מפה', others: 'עוד מגדולי ישראל', connect: 'הקשר בין השאלות', archive: 'הדפים המקוריים' },
    q1: 'שאלה ראשונה', q2: 'שאלה שנייה',
    terrTitle: 'החזרת שטחים', terrQ: 'האם מותר למסור חלק מארץ ישראל?',
    terrMeta: '20 מאמרים של 19 רבנים, מתוך ״גדולי תורה על החזרת שטחים״, בני ברק תש״מ (1980), ודברים ממקורות נוספים',
    elTitle: 'הבחירות לכנסת', elQ: 'האם מותר להשתתף בבחירות לכנסת?',
    elMeta: '{n} רבנים, מתוך הקונטרס ״זכרון בספר״, ירושלים תשס״ט (2009)',
    toCollection: 'לאוסף', rabbisN: 'רבנים', sayingsN: 'מאמרים', questionsN: 'שאלות',
    homeLede: 'כאן מרוכזים דברי גדולי התורה על שאלות שעמדו לפני עם ישראל, כל שאלה באוסף משלה: הדברים בלשון אומרם, עם המקור, התאריך והדף המקורי.',
    howTitle: 'איך לקרוא את האתר',
    how: ['כל אוסף עומד בפני עצמו. הוא מביא את דברי הרבנים שהשיבו על שאלה אחת, ואינו מייחס להם עמדה בשאלה האחרת. אין רב שמופיע בשני האוספים.',
      'בכל אוסף מצוין מי עמד יחד: רבנים מקהילות ומחוגים שונים, מירושלים ועד התפוצות, שהגיעו לאותה תשובה.',
      'על שתי השאלות השיבו רבנים שונים, ולא הייתה להם דעה אחת על המדינה. ומה מחבר ביניהן? מן הרבנים שאסרו למסור את הארץ יש שכתבו במפורש שהפסק אינו תלוי בדעה על המדינה, שכן יסודו בפיקוח נפש. ולפי רבני האוסף השני, הבוחר ששולח נציג לכנסת שותף למה שהיא מחליטה על הארץ.'],
    connectTeaser: 'שתי שאלות, נקודת מפגש אחת',
    terrMoreH: 'ממקורות נוספים', terrMoreP: 'דברים מאותן שנים שנדפסו מחוץ לקובץ. המקור מצוין ליד כל אחד.',
    together: 'מי עמד יחד', theSayings: 'הדברים', page: 'עמ׳', inAppendix: 'בנספחים',
    terrSource: 'מתוך הקובץ ״גדולי תורה על החזרת שטחים״, בני ברק תש״מ (1980). מספרי העמודים הם של הספר.',
    elSource: 'מתוך הקונטרס ״זכרון בספר״: דברי גדולי ישראל נגד ההשתתפות בבחירות לכנסת. יצא לאור בירושלים על ידי ״דרכי רבותינו״, לקראת הבחירות של ט״ז בשבט תשס״ט (2009).',
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
    skip: 'דילוג לתוכן', navLabel: 'ניווט', notFound: 'הדף לא נמצא', origLabel: 'המקור בעברית', langLabel: 'שפה',
  },
  en: {
    dir: 'ltr', site: 'Torah Leaders on the Questions of the Hour', other: 'he', otherName: 'עברית',
    tagline: 'What the Torah leaders said on the questions facing the Jewish people, in their own words, with source and date.',
    nav: { home: 'Home', territories: 'Giving up land', elections: 'Knesset elections', rabbis: 'The rabbis', map: 'Map', others: 'More Torah leaders', connect: 'How they connect', archive: 'Original pages' },
    q1: 'First question', q2: 'Second question',
    terrTitle: 'Giving Up Land', terrQ: 'May any part of the Land of Israel be handed over?',
    terrMeta: '20 sayings by 19 rabbis, from Gedolei Torah al Hachzarat Shetachim, Bnei Brak 1980, with statements from other sources',
    elTitle: 'Knesset Elections', elQ: 'May a Jew take part in the Knesset elections?',
    elMeta: '{n} rabbis, from the pamphlet Zichron BaSefer, Jerusalem 2009',
    toCollection: 'Open the collection', rabbisN: 'rabbis', sayingsN: 'sayings', questionsN: 'questions',
    homeLede: 'This site gathers what the Torah leaders said on questions that came before the Jewish people, each question in a collection of its own: their words as they said them, with the source, the date and the original page.',
    howTitle: 'How to read this site',
    how: ['Each collection stands on its own. It brings the words of the rabbis who answered one question and attributes to them no position on the other. No rabbi appears in both collections.',
      'Each collection shows who stood together: rabbis of different communities and circles, from Jerusalem to the Diaspora, who reached the same answer.',
      'The two questions were answered by different rabbis, and those rabbis did not share one view of the state. What joins them? Among the rabbis who forbade giving up land, some wrote plainly that the ruling does not depend on one\u2019s view of the state, because it rests on danger to life. And by the ruling of the rabbis of the second collection, the voter who sends a representative to the Knesset is a partner in what it decides about the Land.'],
    connectTeaser: 'Two questions, one meeting point',
    terrMoreH: 'From other sources', terrMoreP: 'Statements from the same years, printed outside the 1980 collection. The source is given with each.',
    together: 'Who stood together', theSayings: 'The sayings', page: 'p.', inAppendix: 'appendix',
    terrSource: 'From the collection Gedolei Torah al Hachzarat Shetachim (Torah Greats on Returning Territories), Bnei Brak, 5740 (1980). Page numbers are the book’s. English translations were made for this site.',
    elSource: 'From the pamphlet Zichron BaSefer: the words of Torah greats against taking part in the Knesset elections. Published in Jerusalem by Darkei Rabboseinu for the elections of 16 Shevat 5769 (2009). English translations were made for this site.',
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
    skip: 'Skip to content', navLabel: 'Main', notFound: 'Page not found', origLabel: 'Hebrew original', langLabel: 'Language',
  }
};
// Hebrew and English are written here. Every other language is built through the English code path:
// its translation pack is swapped into the English slots (see applyPack), and CUR names the language.
const LANGS = [
  { code: 'he', name: 'עברית', dir: 'rtl' }, { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'yi', name: 'אידיש', dir: 'rtl' }, { code: 'ru', name: 'Русский', dir: 'ltr' }, { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' }, { code: 'am', name: 'አማርኛ', dir: 'ltr' },
];
let CUR = null;
const code = lang => (lang === 'he' ? 'he' : CUR || 'en');
const urlFor = (c, p = '') => (c === 'he' ? '/' : `/${c}/`) + p;
const url = (lang, p = '') => urlFor(code(lang), p);
const isRtl = lang => L[lang].dir === 'rtl';
const arrow = lang => (isRtl(lang) ? '←' : '→');

// ---------- people ----------
const people = [];
const lazy = (o, defs) => { for (const [k, fn] of Object.entries(defs)) Object.defineProperty(o, k, { get: fn, enumerable: true }); return o; };
for (const it of EL) {
  { const m = /(\d{4})\)?$/.exec(it.en_date); it.year = m ? +m[1] : null; }
  people.push(lazy({
    slug: it.slug, coll: 'elections', comm: it.community, born: it.born, served: it.served, n: it.n,
    he: { name: it.he_name, title: it.he_title, when: `${L.he.died} ${it.he_death.replace(/^נלב״ע\s*/, '')}`, bio: it.he_bio },
    sayings: [lazy({ n: it.n, no: it.no, he: it.he_quote, he_src: it.he_date, scan: it.scan }, { en: () => it.en_quote, en_src: () => it.en_date })],
    links: it.links, verify: it.verify,
  }, { en: () => ({ name: it.en_name, title: it.en_title, when: '', bio: it.en_bio }) }));
}
for (const [k, r] of Object.entries(TR.rabbis)) {
  const says = TR.sayings.filter(s => s.rabbi === k);
  people.push(lazy({
    slug: r.slug, coll: 'territories', comm: r.community, born: r.born, served: r.served, n: says[0].n,
    he: { name: r.he_name, title: '', when: r.years, bio: r.he_bio || TR.pending_bio.he, context: r.he_context, fromBook: !!r.he_bio, short: r.he_short },
    sayings: says.map(s => lazy({ n: s.n, he: s.he_quote, he_src: `${L.he.page} ${s.page}${s.appendix ? ` (${L.he.inAppendix})` : ''}`, he_note: s.he_note },
      { en: () => s.en_quote, en_src: () => `${L.en.page} ${s.page}${s.appendix ? ` (${L.en.inAppendix})` : ''}`, en_note: () => s.en_note })),
    links: [], verify: false,
  }, { en: () => ({ name: r.en_name, title: '', when: r.years, bio: r.en_bio || TR.pending_bio.en, context: r.en_context, fromBook: !!r.en_bio, short: r.en_short }) }));
}
for (const o of TR.more || []) {
  people.push(lazy({
    slug: o.slug, coll: 'territories', comm: o.community, born: o.born, served: o.served, n: o.n, year: o.year, more: true,
    he: { name: o.he_name, title: o.he_title, when: o.years, bio: o.he_bio, short: o.he_short },
    sayings: [lazy({ n: o.n, he: o.he_quote, he_src: o.he_src }, { en: () => o.en_quote, en_src: () => o.en_src })],
    links: o.links || [], verify: false,
  }, { en: () => ({ name: o.en_name, title: o.en_title, when: o.years, bio: o.en_bio, short: o.en_short }) }));
}
for (const o of OT) {
  people.push(lazy({
    slug: o.slug, coll: 'others', comm: o.community, born: o.born, served: o.served, n: o.n, year: o.year,
    he: { name: o.he_name, title: o.he_title, when: o.years, bio: o.he_bio, short: o.he_short },
    sayings: [lazy({ n: o.n, he: o.he_quote, he_src: o.he_src }, { en: () => o.en_quote, en_src: () => o.en_src })],
    links: o.links || [], verify: false,
  }, { en: () => ({ name: o.en_name, title: o.en_title, when: o.years, bio: o.en_bio, short: o.en_short }) }));
}
const OTX = {
  he: { title: 'עוד מגדולי ישראל', label: 'בכתביהם', q: 'מה כתבו גדולי ישראל אחרים על אותן שאלות?', meta: 'דברים מתוך ספריהם ומכתביהם, עם המקור',
    src: 'גדולי ישראל שאינם בשני האוספים, וכתבו על אותן שאלות בספריהם ובמכתביהם. הדברים מובאים בלשונם, עם שם הספר והעמוד. מקומם כאן נפרד, משום שאינם חלק מאחד משני הקבצים שנדפסו.' },
  en: { title: 'More Torah Leaders', label: 'In their own writings', q: 'What did other Torah leaders write on the same questions?', meta: 'Passages from their books and letters, with the source',
    src: 'Torah leaders who are not in the two collections and who wrote on the same questions in their own books and letters. Their words are given as they wrote them, with the book and page. They are kept separate here because they are not part of either printed collection.' },
};
const bySlug = Object.fromEntries(people.map(p => [p.slug, p]));
const collName = (lang, c) => c === 'territories' ? L[lang].terrTitle : c === 'others' ? OTX[lang].title : L[lang].elTitle;

// ---------- layout ----------
function layout(lang, p, { title, desc, body, og, active, wide, bleed }) {
  const t = L[lang];
  const full = title ? `${title} | ${t.site}` : t.site;
  const navKeys = ['territories', 'elections', 'others', 'rabbis', 'map', 'connect', 'archive'];
  const cur = code(lang);
  const fonts = { ru: '&family=Noto+Serif:wght@400;500;700&family=Noto+Sans:wght@400;500;700', am: '&family=Noto+Serif+Ethiopic:wght@400;500;700&family=Noto+Sans+Ethiopic:wght@400;500;700' }[cur] || '';
  return `<!doctype html>
<html lang="${cur}" dir="${t.dir}">
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
${og ? `<meta property="og:image" content="https://gedoleitorah.com${og}">\n` : ''}${SITE_LANGS.map(l => `<link rel="alternate" hreflang="${l.code}" href="https://gedoleitorah.com${urlFor(l.code, p)}">`).join('\n')}
<link rel="icon" href="/assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@400;500;700${fonts}&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body class="${cur}">
<a class="skip" href="#main">${esc0(t.skip)}</a>
<header class="top">
  <div class="wrap toprow">
    <a class="brand" href="${url(lang)}">${esc0(t.site)}</a>
    <details class="langs"><summary aria-label="${esc0(t.langLabel)}">${LANGS.find(l => l.code === cur).name}</summary><ul>${SITE_LANGS.filter(l => l.code !== cur).map(l => `<li><a href="${urlFor(l.code, p)}" hreflang="${l.code}" lang="${l.code}" dir="${l.dir}">${l.name}</a></li>`).join('')}</ul></details>
  </div>
  <nav class="wrap nav" aria-label="${esc0(t.navLabel)}">
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
const quoteEn = s => `<blockquote class="q${isRtl('en') ? '' : ' en'}" lang="${code('en')}" dir="${L.en.dir}">${paras(s)}</blockquote>`;
const quotes = (lang, he, en) => lang === 'he' ? quoteHe(he) : quoteEn(en) + `<details class="orig"><summary>${code('en') === 'yi' ? '' : 'עברית · '}${esc0(L.en.origLabel)}</summary>${quoteHe(he)}</details>`;
const commChip = (lang, c) => `<span class="chip c-${c}">${esc(COMM[c][lang])}</span>`;
const collBadge = (lang, c) => `<a class="badge b-${c}" href="${url(lang, c + '/')}">${esc(collName(lang, c))}</a>`;

function together(lang, coll) {
  const ps = people.filter(p => p.coll === coll);
  const groups = COMMON.communities.map(c => ({ c, list: ps.filter(p => p.comm === c.id) })).filter(g => g.list.length);
  return `<section class="together"><h2>${esc(L[lang].together)}</h2><div class="groups">${groups.map(g => `
    <div class="group c-${g.c.id}"><h3><span class="count">${g.list.length}</span> ${esc(g.c[lang])}</h3>
    <p>${g.list.sort((a, b) => a.n - b.n).map(p => `<a href="${url(lang, 'rabbis/' + p.slug + '/')}">${esc(shortName(lang, p))}</a>`).join(' · ')}</p></div>`).join('')}</div></section>`;
}
// a name without its closing honorific, for lists, charts and page titles
const bare = s => String(s).replace(/\s*(זצוק״ל|זצ״ל)$/, '');
function shortName(lang, p) {
  if (p.coll === 'others') return p[lang].short;
  if (p.coll === 'territories') return p[lang].short;
  return bare(p[lang].name);
}

// ---------- pages ----------
// ---------- visual home: map + timeline ----------
const H = {
  he: {
    kicker: 'דעת תורה, בלשון אומריה',
    statR: 'רבנים', statC: 'חוגים וקהילות', statP: 'ערים', statK: 'יבשות',
    stone: {
      hint: 'געו באבן', open: 'פתיחת האבן: {n} פאות, רב אחד על כל פאה',
      kicker: 'האבן שבכתר', h: '{n} רבנים, פאה לכל אחד',
      upper: 'החצי העליון', lower: 'החצי התחתון', top: 'הפאה העליונה',
      topNote: 'נהרג על קידוש השם בשנת תש״א, קודם שנשאלו שתי השאלות',
      more: 'לדברים המלאים', prev: 'הקודם', next: 'הבא', auto: 'מסתובבת מעצמה', names: 'שמות על הפאות',
      aria: 'יהלום מלוטש בן {n} פאות. על כל פאה שמו של רב אחד. הכפתורים ״הקודם״ ו״הבא״ מביאים את דבריהם בזה אחר זה.',
    },
    mapH: 'שתי שאלות. על כל אחת, תשובה אחת מכל קצות תבל',
    mapP: 'כל נקודה היא עיר שבה נולד אחד הרבנים או כיהן בה, וכל קו הוא דרכו של רב ממקום למקום. הצבע מסמן את החוג שלו. לחצו על נקודה.',
    colls: 'אוסף', zoomIn: 'הגדלה', zoomOut: 'הקטנה', all: 'הכול',
    tlH: 'ציר הזמן', tlP: 'מתי נאמרו הדברים, שנה אחר שנה. לחצו על דף כדי לקרוא אותו.',
    oldest: 'מהישן לחדש', newest: 'מהחדש לישן', undated: 'ללא תאריך',
    book1980: 'יוצא לאור ״גדולי תורה על החזרת שטחים״, ובו דברי תשעה־עשר רבנים:',
    pamph2009: 'יוצא לאור בירושלים הקונטרס ״זכרון בספר״, המקבץ את דברי הרבנים.',
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
    stone: {
      hint: 'Touch the stone', open: 'Open the stone: {n} facets, one rabbi on each',
      kicker: 'The stone from the crown', h: '{n} rabbis, one facet each',
      upper: 'Upper half', lower: 'Lower half', top: 'The top facet',
      topNote: 'Killed for the sanctification of G-d’s name in 1941, before either question was asked',
      more: 'Read the full statement', prev: 'Previous', next: 'Next', auto: 'Turns by itself', names: 'Names on the facets',
      aria: 'A cut diamond with {n} facets. Each facet carries the name of one rabbi. The Previous and Next buttons bring their statements one after another.',
    },
    mapH: 'Two Questions. On Each, One Answer from Every Corner of the World',
    mapP: 'Each point is a city where one of the rabbis was born or served, and each line is a rabbi’s path from place to place. The color marks his circle. Tap a point.',
    colls: 'Collection', zoomIn: 'Zoom in', zoomOut: 'Zoom out', all: 'All',
    tlH: 'Timeline', tlP: 'When the words were said, year by year. Tap a page to read it.',
    oldest: 'Oldest first', newest: 'Newest first', undated: 'Undated',
    book1980: 'Gedolei Torah al Hachzarat Shetachim is published, with the words of nineteen rabbis:',
    pamph2009: 'The pamphlet Zichron BaSefer is published in Jerusalem, gathering the rabbis\u2019 words.',
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
const plain = (lang, p) => bare(p[lang].name);
const thumbOf = p => p.sayings[0].scan ? `/img/zb/t/${p.sayings[0].scan}` : null;

function mapBlock(lang, full) {
  const t = L[lang], h = H[lang];
  const data = {
    rtl: isRtl(lang), places: Object.fromEntries([...usedPlaces].map(k => [k, { name: PLACES[k][lang], lat: PLACES[k].lat, lon: PLACES[k].lon }])),
    rabbis: people.map(p => ({ slug: p.slug, name: plain(lang, p), coll: p.coll, comm: p.comm, born: p.born, served: p.served, thumb: thumbOf(p), quote: lang === 'he' ? p.sayings[0].he : p.sayings[0].en })),
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
    <div class="mapfoot"><div id="rmap-colls" role="group" aria-label="${esc0(h.colls)}"><button type="button" data-k="territories" aria-pressed="true">${esc(t.terrTitle)} · ${people.filter(p => p.coll === 'territories').length}</button><button type="button" data-k="elections" aria-pressed="true">${esc(t.elTitle)} · ${people.filter(p => p.coll === 'elections').length}</button><button type="button" data-k="others" aria-pressed="true">${esc(OTX[lang].title)} · ${people.filter(p => p.coll === 'others').length}</button></div>${full ? '' : `<a class="maplink" href="${url(lang, 'map/')}">${esc(h.fullMap)} ${arrow(lang)}</a>`}</div>
  </div>
</section>
<script>window.MAPDATA=${JSON.stringify(data)};</script>
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"></script>
<script src="/assets/map.js"></script>`;
}

// ---------- chart of lives, in the manner of a year-by-year chart ----------
const C = {
  he: {
    h: 'דור לדור: חייהם, זה לצד זה', p: 'כל פס הוא חייו של אחד הרבנים, מלידתו ועד פטירתו, בצבע החוג שלו. המעוין מסמן את השנה שבה אמר את דבריו. גללו לצדדים.',
    lg: ['חיי הרב', 'השנה שבה אמר את דבריו', 'דבריו נדפסו בספר (תש״מ)', 'שנת בחירות לכנסת', 'שנת שמיטה'],
    left: 'גלילה שמאלה', right: 'גלילה ימינה', hint: 'גללו לצדדים כדי לראות את כל השנים', elections: 'הבחירות לכנסת', shmita: 'שמיטה', jewish: 'עם ישראל והארץ', world: 'בעולם', rule: 'השלטון בארץ',
    eras: { ott: 'השלטון העות׳מאני', brit: 'השלטון הבריטי', lab: 'מפא״י, המערך והעבודה', lik: 'הליכוד', uni: 'ממשלות אחדות', kad: 'קדימה' },
    ev: [[1881, 'פרעות ברוסיה'], [1897, 'הקונגרס הציוני הראשון'], [1912, 'ייסוד אגודת ישראל'], [1917, 'הצהרת בלפור'], [1937, 'ועדת פיל מציעה חלוקה'], [1939, 'השואה', 1945], [1947, 'החלטת החלוקה באו״ם'], [1948, 'הקמת המדינה'],
      [1967, 'מלחמת ששת הימים'], [1973, 'מלחמת יום הכיפורים'], [1978, 'הסכמי קמפ דייוויד'], [1980, 'יוצא ״גדולי תורה על החזרת שטחים״', 0, 1], [1982, 'הושלמה הנסיגה מסיני'], [1993, 'הסכמי אוסלו'], [2005, 'הגירוש מגוש קטיף'], [2009, 'יוצא ״זכרון בספר״', 0, 1]],
    wv: [[1914, 'מלחמת העולם הראשונה', 1918], [1917, 'המהפכה ברוסיה'], [1929, 'המשבר הכלכלי הגדול'], [1939, 'מלחמת העולם השנייה', 1945], [1979, 'המהפכה באיראן'], [1989, 'נפילת חומת ברלין'], [1991, 'התפרקות ברית המועצות'], [2001, 'פיגועי 11 בספטמבר'], [2003, 'מלחמת עיראק']],
  },
  en: {
    h: 'Generation to Generation: Their Lives, Side by Side', p: 'Each bar is one rabbi’s life, from birth to passing, in the color of his circle. The diamond marks the year he spoke. Scroll sideways.',
    lg: ['A rabbi’s life', 'The year he spoke', 'His words printed in the 1980 book', 'Knesset election year', 'Shmita year'],
    left: 'Scroll left', right: 'Scroll right', hint: 'Scroll sideways to see all the years', elections: 'Knesset elections', shmita: 'Shmita', jewish: 'The Jewish people and the Land', world: 'In the world', rule: 'Rule in the Land',
    eras: { ott: 'Ottoman rule', brit: 'British rule', lab: 'Mapai, Alignment and Labor', lik: 'Likud', uni: 'Unity governments', kad: 'Kadima' },
    ev: [[1881, 'Pogroms in Russia'], [1897, 'First Zionist Congress'], [1912, 'Agudath Israel founded'], [1917, 'Balfour Declaration'], [1937, 'Peel Commission proposes partition'], [1939, 'The Holocaust', 1945], [1947, 'UN partition vote'], [1948, 'The State is declared'],
      [1967, 'Six-Day War'], [1973, 'Yom Kippur War'], [1978, 'Camp David Accords'], [1980, 'Gedolei Torah al Hachzarat Shetachim is published', 0, 1], [1982, 'Sinai withdrawal completed'], [1993, 'Oslo Accords'], [2005, 'Expulsion from Gush Katif'], [2009, 'Zichron BaSefer is published', 0, 1]],
    wv: [[1914, 'World War I', 1918], [1917, 'Russian Revolution'], [1929, 'The Great Depression begins'], [1939, 'World War II', 1945], [1979, 'Revolution in Iran'], [1989, 'Fall of the Berlin Wall'], [1991, 'Soviet Union dissolves'], [2001, 'September 11 attacks'], [2003, 'Iraq War']],
  },
};
const ELECTION_DATES = [[1949, 1], [1951, 7], [1955, 7], [1959, 11], [1961, 8], [1965, 11], [1969, 10], [1973, 12], [1977, 5], [1981, 6], [1984, 7], [1988, 11], [1992, 6], [1996, 5], [1999, 5], [2003, 1], [2006, 3], [2009, 2]];
const ERAS = [['ott', 1858, 1917.95], ['brit', 1917.95, 1948.37], ['lab', 1948.37, 1977.47], ['lik', 1977.47, 1984.7], ['uni', 1984.7, 1990.45], ['lik', 1990.45, 1992.53], ['lab', 1992.53, 1996.46], ['lik', 1996.46, 1999.51], ['lab', 1999.51, 2001.18], ['lik', 2001.18, 2005.9], ['kad', 2005.9, 2009.25]];
const GEM = { 'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400 };
function hebDeathYear(s) { // "נלב״ע י״ז טבת תש״ל" -> civil year
  const w = s.trim().split(/\s+/), last = w[w.length - 1];
  if (!/^ת[שר]/.test(last)) return null;
  const hy = 5000 + [...last].reduce((a, ch) => a + (GEM[ch] || 0), 0);
  return hy - (/תשרי|חשון|כסלו/.test(s) ? 3761 : 3760);
}
const HEB_DECADE = { 5620: 'תר״ך', 5630: 'תר״ל', 5640: 'תר״ם', 5650: 'תר״ן', 5660: 'תר״ס', 5670: 'תר״ע', 5680: 'תר״ף', 5690: 'תר״ץ', 5700: 'ת״ש', 5710: 'תש״י', 5720: 'תש״ך', 5730: 'תש״ל', 5740: 'תש״ם', 5750: 'תש״ן', 5760: 'תש״ס', 5770: 'תש״ע', 5780: 'תש״ף' };

const LIVES = people.map(p => {
  let b = null, d = null, s = null;
  if (p.coll === 'elections') {
    const it = EL.find(x => x.slug === p.slug), bio = it.en_bio;
    let m = /^(\d{4})–(\d{4})/.exec(bio);
    if (m) { b = +m[1]; d = +m[2]; }
    else {
      d = hebDeathYear(it.he_death); m = /Born (\d{4})/.exec(bio); if (m) b = +m[1];
      m = /Died (\d{4}), aged (\d+)/.exec(bio); if (m) b = +m[1] - +m[2];
    }
    s = it.year;
  } else {
    const m = /^(\d{4})–(\d{4})/.exec(p.he.when || ''); if (m) { b = +m[1]; d = +m[2]; }
    if (p.coll === 'others' || p.more) s = p.year; else if (p.sayings.some(x => x.n === 1)) s = 1978;
  }
  return { p, b, d, s, book: p.coll === 'territories' && !p.more };
});

function chart(lang) {
  const c = C[lang], t = L[lang], rtl = isRtl(lang), cw = { am: 9.4, ru: 6.6 }[code(lang)] || (rtl ? 6.1 : 5.9);
  const P = 8.5, Y0 = 1858, Y1 = 2022, PADE = 150, PADL = 26, RH = 19;
  const W = PADE + (Y1 - Y0) * P + PADL;
  const X = y => rtl ? W - PADE - (y - Y0) * P : PADE + (y - Y0) * P;
  const span = (a, b) => [Math.min(X(a), X(b)), Math.abs(X(b) - X(a))];
  const before = rtl ? 1 : -1;               // direction pointing to earlier years
  const anchorBefore = rtl ? 'start' : 'end', anchorAfter = rtl ? 'end' : 'start';
  const o = [], labels = [];
  let y = 0;
  // era band
  const eraY = y; y += 18;
  ERAS.forEach(([k, a, b]) => { const [x, w] = span(a, b); o.push(`<rect class="era era-${k}" x="${x.toFixed(1)}" y="${eraY}" width="${w.toFixed(1)}" height="16"><title>${esc0(c.eras[k])}</title></rect>`); if (w > c.eras[k].length * (cw + 0.3) + 8) o.push(`<text class="eral" x="${(x + w / 2).toFixed(1)}" y="${eraY + 12}" text-anchor="middle">${esc0(c.eras[k])}</text>`); });
  labels.push([eraY, c.rule, 'lane']);
  // scales
  const scaleY = y; y += 40;
  const gridTop = y;
  const grid = [];
  for (let hy = 5620; hy <= 5780; hy += 10) { const x = X(hy - 3761 + 0.72); o.push(`<text class="hy" x="${x.toFixed(1)}" y="${scaleY + 17}" text-anchor="middle">${rtl ? HEB_DECADE[hy] : hy}</text>`); }
  for (let cy = 1860; cy <= 2020; cy += 10) { const x = X(cy); o.push(`<text class="cy" x="${x.toFixed(1)}" y="${scaleY + 33}" text-anchor="middle">${cy}</text>`); grid.push(x); }
  const body = [];
  // community bands
  usedComms.forEach(cm => {
    const rows = LIVES.filter(l => l.p.comm === cm.id).sort((a, b) => (a.b || (a.s || a.d || 1980) - 70) - (b.b || (b.s || b.d || 1980) - 70));
    body.push(`<rect class="bandh" x="0" y="${y}" width="${W}" height="20" style="fill:var(--c-${cm.id})"/>`);
    labels.push([y, `${rows.length} · ${cm[lang]}`, 'band', cm.id]); y += 22;
    rows.forEach(l => {
      const cy0 = y + RH / 2, name = plain(lang, l.p), col = `var(--c-${cm.id})`, g = [];
      if (l.b && l.d) { const [x, w] = span(l.b, l.d + 0.99); g.push(`<rect class="life" x="${x.toFixed(1)}" y="${y + 3}" width="${w.toFixed(1)}" height="${RH - 6}" rx="3" style="fill:${col}"/>`); }
      else if (l.d && l.s) { g.push(`<path class="tail" d="M${X(l.s + 0.5).toFixed(1)},${cy0}L${X(l.d + 0.5).toFixed(1)},${cy0}" style="stroke:${col}"/><path class="tail" d="M${X(l.d + 0.5).toFixed(1)},${y + 4}v${RH - 8}" style="stroke:${col}"/>`); }
      const dia = (yr, cls) => { const x = X(yr + 0.5); return `<path class="${cls}" d="M${x.toFixed(1)},${y + 2.5}l6,7l-6,7l-6,-7z"/>`; };
      if (l.book) g.push(dia(1980, 'dia open'));
      if (l.s) g.push(dia(l.s, 'dia'));
      g.push(`<text class="nm" x="${(X((l.s || 1980) + 0.5) + before * 10).toFixed(1)}" y="${y + 13.5}" text-anchor="${anchorBefore}">${esc0(name)}</text>`);
      const tip = `${name}${l.b && l.d ? ` (${l.b}–${l.d})` : ''}`;
      body.push(`<a href="${url(lang, 'rabbis/' + l.p.slug + '/')}"><title>${esc0(tip)}</title><rect class="rowhit" x="0" y="${y}" width="${W}" height="${RH}"/>${g.join('')}</a>`);
      y += RH;
    });
    y += 6;
  });
  // elections row
  const elY = y; labels.push([elY + 2, c.elections, 'lane']); y += 26;
  const elCols = [];
  ELECTION_DATES.forEach(([yr, mo], i) => { const x = X(yr + (mo - 0.5) / 12); elCols.push(`<rect class="elcol" x="${(x - P / 2).toFixed(1)}" y="${gridTop}" width="${P}" height="${elY - gridTop + 24}"/>`); body.push(`<circle class="eln" cx="${x.toFixed(1)}" cy="${elY + 12}" r="8"/><text class="elt" x="${x.toFixed(1)}" y="${elY + 15.5}" text-anchor="middle">${i + 1}</text>`); });
  // shmita strip
  const shY = y; labels.push([shY - 1, c.shmita, 'lane']); y += 20;
  for (let hy = 5619; hy <= 5781; hy++) { const [x, w] = span(hy - 3761 + 0.72, hy - 3760 + 0.72); const sh = hy % 7 === 0; body.push(`<rect class="${sh ? 'shm on' : 'shm'}" x="${x.toFixed(1)}" y="${shY}" width="${w.toFixed(1)}" height="14"/>${sh ? `<text class="sht" x="${(x + w / 2).toFixed(1)}" y="${shY + 10.5}" text-anchor="middle">ש</text>` : ''}`); }
  // event lanes
  const lane = (title, evs, cls) => {
    const top = y; labels.push([top, title, 'lane']); y += 22;
    const rowsEnd = [];
    const placed = evs.map(([yr, txt, end, gold]) => {
      const x0 = X(yr + 0.5), wTxt = txt.length * cw + 14;
      const a = rtl ? x0 - wTxt : x0, b = rtl ? x0 : x0 + wTxt;
      let r = 0; while (rowsEnd[r] && rowsEnd[r].some(([p, q]) => a < q + 6 && b > p - 6)) r++;
      (rowsEnd[r] ||= []).push([a, b]);
      return { yr, txt, end, gold, r, x0 };
    });
    placed.forEach(e => {
      const ty = y + e.r * 17 + 12;
      if (e.end) { const [x, w] = span(e.yr, e.end + 0.99); body.push(`<rect class="dur ${cls}" x="${x.toFixed(1)}" y="${top + 12}" width="${w.toFixed(1)}" height="5"/>`); }
      body.push(`<path class="evl ${cls}" d="M${e.x0.toFixed(1)},${top + 17}V${ty - 3}h${-before * 6}"/><text class="evt${e.gold ? ' gold' : ''}" x="${(e.x0 - before * 9).toFixed(1)}" y="${ty}" text-anchor="${anchorAfter}">${esc0(e.txt)}</text>`);
    });
    y += rowsEnd.length * 17 + 10;
  };
  lane(c.jewish, c.ev, 'j'); lane(c.world, c.wv, 'w');
  const H = y + 4;
  const gridLines = grid.map(x => `<path class="grid" d="M${x.toFixed(1)},${gridTop}V${H}"/>`).join('');
  const svg = `<svg class="lchart" width="${W.toFixed(0)}" height="${H}" viewBox="0 0 ${W.toFixed(0)} ${H}" role="img" aria-label="${esc0(c.h)}">${elCols.join('')}${gridLines}${o.join('')}${body.join('')}</svg>`;
  const lab = labels.map(([top, txt, kind, id]) => `<span class="cl cl-${kind}" style="top:${top}px${id ? `;--cc:var(--c-${id})` : ''}">${esc(txt)}</span>`).join('');
  const lg = `<ul class="clegend"><li><i class="k-life"></i>${esc(c.lg[0])}</li><li><i class="k-dia"></i>${esc(c.lg[1])}</li><li><i class="k-open"></i>${esc(c.lg[2])}</li><li><i class="k-el"></i>${esc(c.lg[3])}</li><li><i class="k-sh">ש</i>${esc(c.lg[4])}</li>${['lab', 'lik', 'uni', 'kad'].map(k => `<li><i class="k-era era-${k}"></i>${esc(c.eras[k])}</li>`).join('')}</ul>`;
  return `<section class="wrap wide chartsec"><div class="tlhead"><div><h2>${esc(c.h)}</h2><p class="lede">${esc(c.p)}</p></div></div>
${lg}
<div class="cnav" dir="ltr"><button type="button" class="carrow" data-d="-1" aria-label="${esc0(c.left)}">◀</button><div class="ctrack" aria-hidden="true"><div class="cthumb"></div></div><button type="button" class="carrow" data-d="1" aria-label="${esc0(c.right)}">▶</button></div>
<div class="cscroll${rtl ? ' rtl' : ''}" id="cscroll" dir="ltr" tabindex="0" data-focus="${(X(1964) / W).toFixed(4)}"><div class="cinner" style="width:${W.toFixed(0)}px"><div class="clabels" dir="${t.dir}">${lab}</div>${svg}</div></div>
<div class="cnav" dir="ltr"><button type="button" class="carrow" data-d="-1" aria-label="${esc0(c.left)}">◀</button><div class="ctrack" aria-hidden="true"><div class="cthumb"></div></div><button type="button" class="carrow" data-d="1" aria-label="${esc0(c.right)}">▶</button></div>
${lg}</section>`;
}

function timeline(lang) {
  const t = L[lang], h = H[lang];
  const byYear = {};
  const add = (y, e) => (byYear[y] ||= []).push(e);
  const dlg = {};
  for (const it of EL) {
    const p = bySlug[it.slug];
    dlg[it.n] = { name: p[lang].name, title: p[lang].title, quote: lang === 'he' ? it.he_quote : it.en_quote, date: lang === 'he' ? it.he_date : it.en_date, img: `/img/zb/${it.scan}`, url: url(lang, 'rabbis/' + it.slug + '/'), comm: COMM[it.community][lang], c: it.community };
    add(it.year || 9999, { kind: 'el', n: it.n, p });
  }
  const decl = TR.opening.find(o => o.kind === 'decl');
  add(1937, { kind: 'doc', title: lang === 'he' ? decl.hhe : decl.hen, quote: lang === 'he' ? decl.he : decl.en });
  for (const p of people.filter(x => x.coll === 'others')) add(p.year, { kind: 'tr', s: { he_quote: p.sayings[0].he, en_quote: p.sayings[0].en }, p });
  for (const p of people.filter(x => x.more)) add(p.year, { kind: 'tr', s: { he_quote: p.sayings[0].he, en_quote: p.sayings[0].en }, p });
  for (const s of TR.sayings) add(s.n === 1 ? 1978 : 1980, { kind: 'tr', s, p: people.find(x => x.coll === 'territories' && x.sayings.some(y => y.n === s.n)) });
  const years = [...new Set([...Object.keys(byYear).map(Number), ...Object.keys(h.ctx).map(Number)])].sort((a, b) => a - b);
  const elCard = e => `<button type="button" class="tcard c-${e.p.comm}" data-n="${e.n}"><img src="/img/zb/t/${e.p.sayings[0].scan}" alt="" loading="lazy" width="420" height="606"><span class="tn">${esc(plain(lang, e.p))}</span></button>`;
  const trCard = e => `<a class="tcard text c-${e.p.comm}" href="${url(lang, 'rabbis/' + e.p.slug + '/')}"><span class="tq" lang="${code(lang)}">${esc(lang === 'he' ? e.s.he_quote : e.s.en_quote)}</span><span class="tn">${esc(shortName(lang, e.p))}</span></a>`;
  const sections = years.map(y => {
    const es = byYear[y] || [], els = es.filter(e => e.kind === 'el'), trs = es.filter(e => e.kind === 'tr'), docs = es.filter(e => e.kind === 'doc');
    const ctx = (y !== 9999 && h.ctx[y] || []).map(c => `<p class="ctx ctx-${c[0]}">${esc(c[1])}</p>`).join('');
    const extra = y === 1980 ? `<p class="ctx ctx-w">${esc(h.book1980)}</p>` : y === 2009 ? `<p class="ctx ctx-k">${esc(h.pamph2009)}</p>` : '';
    return `<section class="yr${es.length ? '' : ' quiet'}${y === 9999 ? ' undated' : ''}"><h3 class="y"${y === 9999 ? ' aria-hidden="true"' : ''}>${y === 9999 ? '' : y}</h3><div class="ybody">${ctx}${extra}
      ${docs.map(d => `<a class="tdoc" href="${url(lang, 'territories/')}"><b>${esc(d.title)}</b><span lang="${code(lang)}">${esc(d.quote)}</span></a>`).join('')}
      ${trs.length ? `<div class="tgrid text">${trs.map(trCard).join('')}</div>` : ''}
      ${els.length ? `<div class="tgrid">${els.map(elCard).join('')}</div>` : ''}</div></section>`;
  }).join('');
  return `<section class="wrap wide tlsec"><div class="tlhead"><div><h2>${esc(h.tlH)}</h2><p class="lede">${esc(h.tlP)}</p></div>
    <div class="seg" role="group"><button type="button" id="tl-old" aria-pressed="true">${esc(h.oldest)}</button><button type="button" id="tl-new" aria-pressed="false">${esc(h.newest)}</button></div></div>
    <div class="tl" id="tl">${sections}</div></section>
<dialog id="tdlg" aria-labelledby="tdlg-name"><button type="button" class="dx" id="tdlg-x" aria-label="${esc0(h.close)}">×</button><div class="dgrid"><a id="tdlg-a" target="_blank" rel="noopener"><img id="tdlg-img" alt=""></a><div class="dtext"><span class="chip" id="tdlg-comm"></span><h3 id="tdlg-name"></h3><p class="ttl" id="tdlg-title"></p><blockquote class="q${isRtl(lang) ? '' : ' en'}" lang="${code(lang)}"><p id="tdlg-q"></p></blockquote><p class="src" id="tdlg-date"></p><a class="more" id="tdlg-url">${esc(h.toRabbi)} ${arrow(lang)}</a></div></div></dialog>
<script>window.TL=${JSON.stringify(dlg)};</script><script src="/assets/home.js"></script>`;
}

function home(lang) {
  const t = L[lang], h = H[lang];
  const card = (k, label, title, q, meta) => `<a class="qcard b-${k}" href="${url(lang, k + '/')}"><span class="qlabel">${esc(label)}</span><span class="qtitle">${esc(title)}</span><span class="qq">${esc(q)}</span><span class="qmeta">${esc(meta)}</span><span class="qgo">${esc(t.toCollection)} ${arrow(lang)}</span></a>`;
  // the stone: a facet for each rabbi, set in the crown of the Aron and shown full size under it
  const s = h.stone, N = people.length, nOf = x => x.replace('{n}', N);
  const cutq = (q, n) => { q = String(q).replace(/\s+/g, ' ').trim(); if (q.length <= n) return q; const c = q.slice(0, n); return c.slice(0, c.lastIndexOf(' ')).replace(/[\s,;:.…–-]+$/, '') + '…'; };
  const plainName = x => String(x).replace(/\s*(זצוק״ל|זצ״ל|הי״ד|שליט״א|זי״ע|ז״ל)$/, '');
  const stoneData = people.map(p => { const v = p[lang], nm = plainName(v.name);
    return { g: p.coll === 'elections' ? 'el' : p.coll === 'territories' ? 'tr' : 'ot', u: url(lang, `rabbis/${p.slug}/`), n: v.name, f: nm.includes(',') ? '' : nm, s: v.short ? plainName(v.short) : '', t: [v.title, p.coll === 'others' ? s.topNote : ''].filter(Boolean).join(' · '), q: cutq(p.sayings[0][lang], lang === 'he' ? 210 : 250) }; });
  const cnt = g => stoneData.filter(d => d.g === g).length;
  const stoneFont = { ru: "'Noto Serif'", am: "'Noto Serif Ethiopic'" }[code(lang)];
  const STONE = { d: stoneData, font: `${stoneFont ? stoneFont + ',' : ''}'Frank Ruhl Libre',David,'Times New Roman',serif`,
    t: { upper: s.upper, lower: s.lower, el: t.elTitle, tr: t.terrTitle, top: s.top } };
  const stone = `<section class="stonestage" id="stone" hidden><div class="stonegrid">
<div class="stonehead"><p class="skick">${esc(s.kicker)}</p><h2>${esc(nOf(s.h))}</h2></div>
<div class="stonecv"><canvas id="st-gem" tabindex="0" role="img" aria-label="${esc0(nOf(s.aria))}"></canvas></div>
<div class="stonewords" id="st-words" aria-live="off"><span class="schip" id="st-chip"><i></i><span></span></span><h3 id="st-name"></h3><p class="smeta" id="st-meta"></p><p class="squote" id="st-quote"></p><a class="smore" id="st-more" href="${url(lang, 'rabbis/')}">${esc(s.more)} ${arrow(lang)}</a></div>
<div class="stonebar"><ul class="slegend"><li><i class="sw-el"></i><b>${esc(t.elTitle)}</b><span>${esc(s.upper)} · ${cnt('el')}</span></li><li><i class="sw-tr"></i><b>${esc(t.terrTitle)}</b><span>${esc(s.lower)} · ${cnt('tr')}</span></li></ul>
<div class="sctl"><button type="button" id="st-prev">${esc(s.prev)}</button><button type="button" id="st-next">${esc(s.next)}</button><button type="button" id="st-auto" aria-pressed="true">${esc(s.auto)}</button><label for="st-names"><input type="checkbox" id="st-names" checked><span>${esc(s.names)}</span></label></div></div>
</div></section>
<script>window.STONE=${JSON.stringify(STONE).replace(/</g, '\\u003c')};</script><script src="/assets/diamond.js"></script>`;
  const body = `<section class="heroband"><button type="button" class="jewel" id="st-jewelbtn" aria-label="${esc0(nOf(s.open))}" hidden><canvas id="st-jewel"></canvas></button><div class="wrap wide hero2"><p class="stonehint">${esc(s.hint)}</p><p class="kicker">${esc(h.kicker)}</p><h1>${esc(t.site)}</h1>
<div class="stats"><span><b>${people.length}</b> ${h.statR}</span><span><b>${usedComms.length}</b> ${h.statC}</span><span><b>${usedPlaces.size}</b> ${h.statP}</span><span><b>6</b> ${h.statK}</span></div></div></section>
${stone}
${mapBlock(lang, false)}
${chart(lang)}
${timeline(lang)}
<section class="wrap wide"><h2>${esc(h.twoQ)}</h2><div class="qcards">
${card('territories', t.q1, t.terrTitle, t.terrQ, t.terrMeta)}
${card('elections', t.q2, t.elTitle, t.elQ, t.elMeta.replace('{n}', EL.length))}
${card('others', OTX[lang].label, OTX[lang].title, OTX[lang].q, OTX[lang].meta)}
</div>
<div class="prose">${t.how.map(x => `<p>${esc(x)}</p>`).join('')}<p><a class="more" href="${url(lang, 'connect/')}">${esc(t.connectTeaser)} ${arrow(lang)}</a></p></div></section>`;
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
  const moreItems = people.filter(p => p.more).map(p => { const s = p.sayings[0]; return `<li class="say" id="s${s.n}"><div class="saytop">${commChip(lang, p.comm)}</div>
      ${quotes(lang, s.he, s.en)}
      <p class="who"><a href="${url(lang, 'rabbis/' + p.slug + '/')}">${esc(p[lang].name)}</a></p>
      <p class="src">${esc(lang === 'he' ? s.he_src : s.en_src)}</p></li>`; }).join('');
  const more = moreItems ? `<section><h2>${esc(t.terrMoreH)}</h2><p class="note">${esc(t.terrMoreP)}</p><ol class="sayings">${moreItems}</ol></section>` : '';
  const appx = `<section class="prose"><h2>${esc(t.appendixDocs)}</h2><ul>${TR.appendix_docs.map(d => `<li>${esc(d[lang])} (${t.page} ${d.p})</li>`).join('')}</ul></section>`;
  const body = `<header class="phead b-territories"><p class="qlabel">${esc(t.q1)}</p><h1>${esc(t.terrTitle)}</h1><p class="qq">${esc(t.terrQ)}</p><p class="srcline">${esc(t.terrSource)}</p></header>
${together(lang, 'territories')}
<section><h2>${esc(t.opening)}</h2><div class="docs">${open}</div></section>
<section><h2>${esc(t.theSayings)}</h2><ol class="sayings">${items}</ol></section>
${more}
${appx}`;
  return layout(lang, 'territories/', { title: t.terrTitle, desc: t.terrQ, body, active: 'territories' });
}

function elections(lang) {
  const t = L[lang];
  const items = EL.map(it => {
    const p = bySlug[it.slug];
    return `<li class="say" id="s${it.n}"><div class="saytop"><span class="num">${it.no}</span>${commChip(lang, it.community)}</div>
      ${quotes(lang, it.he_quote, it.en_quote)}
      <p class="who"><a href="${url(lang, 'rabbis/' + it.slug + '/')}">${esc(p[lang].name)}</a><span class="ttl">${esc(p[lang].title)}</span></p>
      <p class="src">${esc(lang === 'he' ? it.he_date : it.en_date)} · <a href="/img/zb/${it.scan}" target="_blank" rel="noopener">${esc(t.origPage)}</a>${it.verify ? ` · <em>${esc(t.verify)}</em>` : ''}</p></li>`;
  }).join('');
  const body = `<header class="phead b-elections"><p class="qlabel">${esc(t.q2)}</p><h1>${esc(t.elTitle)}</h1><p class="qq">${esc(t.elQ)}</p><p class="srcline">${esc(t.elSource)}</p></header>
${together(lang, 'elections')}
<section><h2>${esc(t.theSayings)}</h2><p class="note">${esc(t.elOrder)}</p><ol class="sayings">${items}</ol></section>`;
  return layout(lang, 'elections/', { title: t.elTitle, desc: t.elQ, body, active: 'elections', og: '/img/zb/00a.jpg' });
}

function others(lang) {
  const t = L[lang], x = OTX[lang];
  const items = people.filter(p => p.coll === 'others').map(p => { const s = p.sayings[0]; return `<li class="say" id="s${s.n}"><div class="saytop"><span class="num">${s.n}</span>${commChip(lang, p.comm)}</div>
      ${quotes(lang, s.he, s.en)}
      <p class="who"><a href="${url(lang, 'rabbis/' + p.slug + '/')}">${esc(p[lang].name)}</a><span class="ttl">${esc(p[lang].title)}</span></p>
      <p class="src">${esc(lang === 'he' ? s.he_src : s.en_src)}</p></li>`; }).join('');
  const body = `<header class="phead b-others"><p class="qlabel">${esc(x.label)}</p><h1>${esc(x.title)}</h1><p class="qq">${esc(x.q)}</p><p class="srcline">${esc(x.src)}</p></header>
<section><h2>${esc(t.theSayings)}</h2><ol class="sayings">${items}</ol></section>`;
  return layout(lang, 'others/', { title: x.title, desc: x.q, body, active: 'others' });
}

function placeList(lang, p) {
  const t = L[lang], out = [];
  if (p.born && PLACES[p.born]) out.push(`${t.born}${lang === 'he' ? '' : ' '}${esc(PLACES[p.born][lang])}`);
  if (p.served.length) out.push(`${t.served}${lang === 'he' ? '' : ' '}${p.served.map(s => esc(PLACES[s][lang])).join(lang === 'he' ? ', ' : ', ')}`);
  return out.length ? `<p class="places"><b>${t.places}:</b> ${out.join(' · ')}</p>` : '';
}

function rabbiPage(lang, p) {
  const t = L[lang], d = p[lang];
  const says = p.sayings.map(s => `<div class="say solo">${quotes(lang, s.he, s.en)}<p class="src">${esc(lang === 'he' ? s.he_src : s.en_src)}${(lang === 'he' ? s.he_note : s.en_note) ? ' · ' + esc(lang === 'he' ? s.he_note : s.en_note) : ''} · <a href="${url(lang, p.coll + '/')}#s${s.n}">${esc(collName(lang, p.coll))}${p.more ? '' : ', ' + (s.no || s.n)}</a>${p.verify ? ` · <em>${esc(t.verify)}</em>` : ''}</p>${s.scan ? `<a class="scan" href="/img/zb/${s.scan}" target="_blank" rel="noopener"><img src="/img/zb/t/${s.scan}" alt="${esc0(t.origPage)}" loading="lazy" width="420" height="606"><span>${esc(t.origPage)}</span></a>` : ''}</div>`).join('');
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
  return layout(lang, `rabbis/${p.slug}/`, { title: bare(d.name), desc: lang === 'he' ? first.he : first.en, body, active: 'rabbis', og: first.scan ? `/img/zb/t/${first.scan}` : null });
}

function rabbisIndex(lang) {
  const t = L[lang];
  const block = coll => {
    const ps = people.filter(p => p.coll === coll);
    return `<section class="rindex b-${coll}"><h2><a href="${url(lang, coll + '/')}">${esc(collName(lang, coll))}</a> <span class="count">${ps.length}</span></h2>
    ${COMMON.communities.map(c => { const l = ps.filter(p => p.comm === c.id).sort((a, b) => a.n - b.n); return l.length ? `<h3>${esc(c[lang])}</h3><ul class="rlist">${l.map(p => `<li><a href="${url(lang, 'rabbis/' + p.slug + '/')}"><span class="rn">${esc(bare(p[lang].name))}</span>${p[lang].title ? `<span class="rt">${esc(p[lang].title)}</span>` : ''}</a></li>`).join('')}</ul>` : ''; }).join('')}</section>`;
  };
  const body = `<header class="phead"><h1>${esc(t.nav.rabbis)}</h1><p class="lede">${esc(t.rabbisLede)}</p></header><div class="rcols">${block('territories')}${block('elections')}${block('others')}</div>`;
  return layout(lang, 'rabbis/', { title: t.nav.rabbis, body, active: 'rabbis', wide: true });
}

const CN = {
  he: { title: 'שתי שאלות, נקודת מפגש אחת',
    p1: 'האוסף הראשון באתר עוסק בשאלה אם מותר למסור חלק מארץ ישראל. האוסף השני עוסק בשאלה אם מותר להשתתף בבחירות לכנסת. אלה שתי שאלות נפרדות, ושתי קבוצות שונות של רבנים השיבו עליהן. אף רב אינו מופיע בשני האוספים, ואין לייחס לאיש מהם עמדה בשאלה שלא השיב עליה.',
    p1b: 'לרבני האתר לא הייתה דעה אחת על המדינה. הרב זוין, למשל, כותב ששלוש השבועות אינן אוסרות את מלחמות ישראל, בתשובה ל״גדול בתורה אחד״ שסבר שהן אוסרות. המשותף לרבני האוסף הראשון הוא הפסק עצמו: אדמה שבידי ישראל אסור למוסרה.',
    h0: 'מתנגדים למדינה, ואוסרים למסור את הארץ',
    p0: 'הפסק הזה אינו תלוי בדעתו של הרב על המדינה. כך כתבו רבנים מן האוסף הראשון עצמם:',
    q1: 'הנה זה ברור לכל מבין שאף מי שמתנגד לרעיון הציוני, כמו שרוב גדולי ישראל בזמן שעבר... ומי שאינו מקבל את הסברא שיש אצל כמה מבנ״י שכאילו ח״ו יש אתחלתא דגאולה וכדומה אלא אדרבא... שהוא חושך כפול ומכופל... ודאי שאין לזה שום קשר לשאלה הנז׳ שמשום פיקוח נפשות, ואפילו משום ספק ספיקא של סכנת נפשות הרי יש איסור מפורש בפוסקים ואין מערער ע״ז.',
    q2: 'כל ילד יודע שאין הערבים מבחינים בין יהודי מהישוב הישן לבין יהודי מן המחנה החילוני, ואם ח״ו תהא בידם האפשרות, ישמידו את כ״א, בין יהודי ׳נטורי קרתא׳ ובין יהודי ׳מזרחי׳ או ׳מפא״י׳... דעתי זו אינה קשורה כאמור לעמדה פוליטית כלשהי כי אם לדעת תורה: את השטחים אסור להחזיר כי זה יסכן אלפים מישראל.',
    p0b: 'וכך מוגדרת התקופה בספר ״דעת תורה״ של הרב שלום דב וולפא, המיוסד על שיחותיו של הרבי מליובאוויטש:',
    q3: 'הצלת נפשות — כן! אפשרות של לימוד תורה וקיום מצות מתוך מנוחה — כן! אבל האם ׳זו משהו׳ בכיוון הגאולה או התחלתה ע״י הקמת השלטון העצמי של היהודים בארה״ק — לא ולא! כי ברור הדבר שאין לזה שום שייכות לגאולה או לאתחלתא דגאולה.',
    c3: '״דעת תורה בעניני המצב בארץ הקדש״, פרק א׳, עמ׳ 24',
    p2: 'ושתי השאלות עצמן נפגשות בנקודה אחת: בבוחר עצמו.', h1: 'הבוחר שולח שליח',
    p3: 'הטיעון המרכזי של רבני ״זכרון בספר״ הוא השליחות. הנציג פועל בשם מי שבחר בו, ו[[שלוחו של אדם כמותו]]. מכאן שמי ששולח נציג לכנסת נעשה שותף למה שנעשה בה:',
    p4: 'יש שיענו ש[[אין שליח לדבר עבירה]]. אבל הרבנים האלה לא נשענו על השליחות בלבד. הם כתבו שהבוחר עצמו מודה בשלטון ונותן לו כוח, וזה מעשה שלו, לא של שלוחו:',
    h2: 'והכנסת מחליטה על הארץ', p5: 'רבני ״גדולי תורה על החזרת שטחים״ קבעו שאסור למסור שום חלק מארץ ישראל, ושאין לשום ממשלה רשות לעשות זאת:',
    p6: 'ממשלה שמוסרת שטח מקבלת את כוחה מהכנסת, והכנסת מקבלת את כוחה מהבוחרים. מי שמקבל את שני הפסקים יחד, שמסירת הארץ אסורה ושהבוחר שותף למעשי נציגיו, אינו יכול לראות בקולו עניין פרטי. זו מסקנה של מי שקורא את שני האוספים זה לצד זה, ולא דבריו של רב מסוים.',
    toTerr: 'להחזרת שטחים', toEl: 'לבחירות לכנסת' },
  en: { title: 'Two Questions, One Meeting Point',
    p1: 'The first collection on this site asks whether any part of the Land of Israel may be handed over. The second asks whether a Jew may take part in the Knesset elections. These are separate questions, answered by two different groups of rabbis. No rabbi appears in both collections, and none of them should be credited with a position on a question he did not answer.',
    p1b: 'The rabbis on this site did not share one view of the state. Rabbi Zevin, for one, writes that the Three Oaths do not forbid Israel\u2019s wars, in answer to \u201cone great Torah scholar\u201d who held that they do. What the rabbis of the first collection share is the ruling itself: land in Jewish hands may not be handed over.',
    h0: 'Opposing the state, and forbidding the surrender of land',
    p0: 'That ruling does not depend on a rabbi\u2019s view of the state. Rabbis of the first collection say so themselves:',
    q1: 'It is clear to anyone who understands that even one who opposes the Zionist idea, as most of the great rabbis of Israel did in times past\u2026 and who does not accept the notion held by some that this is, Heaven forbid, the beginning of the redemption, but holds on the contrary\u2026 that it is a doubled and redoubled darkness\u2026 certainly this has no connection to the question at hand. For on grounds of danger to life, even a doubt of a doubt of danger to life, there is an explicit prohibition in the poskim, and no one disputes it.',
    q2: 'Every child knows that the Arabs do not distinguish between a Jew of the old yishuv and a Jew of the secular camp, and if, Heaven forbid, they had the chance, they would destroy every one: a \u2018Neturei Karta\u2019 Jew, a \u2018Mizrachi\u2019 Jew or a \u2018Mapai\u2019 Jew alike\u2026 This view of mine, as I said, is tied to no political position, only to Da\u2019at Torah: the territories may not be returned, for that would endanger thousands of Jews.',
    p0b: 'And this is how the period is defined in Da\u2019at Torah, the book by Rabbi Shalom Dov Wolpo based on the talks of the Lubavitcher Rebbe:',
    q3: 'Rescue of lives: yes! The possibility of Torah study and keeping the mitzvot in tranquility: yes! But is this \u2018something\u2019 in the direction of the redemption, or its beginning, through the establishment of the Jews\u2019 own rule in the Holy Land? No and no! For it is clear that this has no connection to the redemption or to the beginning of the redemption.',
    c3: 'Da\u2019at Torah be\u2019Inyanei haMatzav be\u2019Eretz haKodesh, chapter 1, p. 24',
    p2: 'The two questions themselves meet at one point: the voter himself.', h1: 'The voter sends an agent',
    p3: 'The central argument of the Zichron BaSefer rabbis is agency. A representative acts in the name of those who chose him, and [[a person\u2019s agent is like himself]]. So whoever sends a representative to the Knesset becomes a partner in what is done there:',
    p4: 'Some will answer that [[there is no agency for a transgression]]. But these rabbis did not rest on agency alone. They wrote that the voter himself acknowledges the regime and gives it strength, and that is his own act, not his agent\u2019s:',
    h2: 'And the Knesset decides about the Land', p5: 'The rabbis of Gedolei Torah al Hachzarat Shetachim ruled that no part of the Land of Israel may be handed over, and that no government has the authority to do it:',
    p6: 'A government that hands over land draws its power from the Knesset, and the Knesset draws its power from the voters. Whoever accepts both rulings together, that handing over the Land is forbidden and that the voter is a partner in what his representatives do, cannot treat his vote as a private matter. That is the conclusion of a reader who sets the two collections side by side, not the words of any one rabbi.',
    toTerr: 'Giving up land', toEl: 'Knesset elections' },
};
function connect(lang) {
  const q = n => EL.find(x => x.n === n);
  const tq = n => TR.sayings.find(x => x.n === n);
  const pr = slug => url(lang, 'rabbis/' + slug + '/');
  const cite = (it, he) => `<p class="src"><a href="${pr(it.slug)}">${esc(he ? bySlug[it.slug].he.name : bySlug[it.slug].en.name)}</a>, ${esc(he ? it.he_date : it.en_date)}</p>`;
  const s14 = tq(14), nissim = people.find(p => p.coll === 'territories' && p.sayings.some(s => s.n === 14));
  const tp = key => people.find(p => p.coll === 'territories' && p.slug === TR.rabbis[key].slug);
  const tcite = (key, pg, he) => `<p class="src"><a href="${pr(tp(key).slug)}">${esc(bare(he ? tp(key).he.name : tp(key).en.name))}</a>, ${he ? 'עמ׳' : L.en.page} ${pg}</p>`;
  const sef41 = 'https://www.sefaria.org/Kiddushin.41b', sef42 = 'https://www.sefaria.org/Kiddushin.42b';
  const he = `
<h1>שתי שאלות, נקודת מפגש אחת</h1>
<p>האוסף הראשון באתר עוסק בשאלה אם מותר למסור חלק מארץ ישראל. האוסף השני עוסק בשאלה אם מותר להשתתף בבחירות לכנסת. אלה שתי שאלות נפרדות, ושתי קבוצות שונות של רבנים השיבו עליהן. אף רב אינו מופיע בשני האוספים, ואין לייחס לאיש מהם עמדה בשאלה שלא השיב עליה.</p>
<p>${esc(CN.he.p1b)}</p>
<h2>${esc(CN.he.h0)}</h2>
<p>${esc(CN.he.p0)}</p>
${quoteHe(CN.he.q1)}${tcite('trebnik', 69, true)}
${quoteHe(CN.he.q2)}${tcite('sawitzki', 76, true)}
<p>${esc(CN.he.p0b)}</p>
${quoteHe(CN.he.q3)}<p class="src">${esc(CN.he.c3)}</p>
<p>${esc(CN.he.p2)}</p>
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
  const k = CN.en, link = (txt, href) => txt.replace('[[', `<a href="${href}" target="_blank" rel="noopener">`).replace(']]', '</a>');
  const en = `
<h1>${esc(k.title)}</h1>
<p>${esc(k.p1)}</p>
<p>${esc(k.p1b)}</p>
<h2>${esc(k.h0)}</h2>
<p>${esc(k.p0)}</p>
${quoteEn(k.q1)}${tcite('trebnik', 69, false)}
${quoteEn(k.q2)}${tcite('sawitzki', 76, false)}
<p>${esc(k.p0b)}</p>
${quoteEn(k.q3)}<p class="src">${esc(k.c3)}</p>
<p>${esc(k.p2)}</p>
<h2>${esc(k.h1)}</h2>
<p>${link(esc(k.p3), sef41)}</p>
${quoteEn(q(30).en_quote)}${cite(q(30), false)}
${quoteEn(q(31).en_quote)}${cite(q(31), false)}
<p>${link(esc(k.p4), sef42)}</p>
${quoteEn(q(19).en_quote)}${cite(q(19), false)}
<h2>${esc(k.h2)}</h2>
<p>${esc(k.p5)}</p>
${quoteEn(s14.en_quote)}<p class="src"><a href="${pr(nissim.slug)}">${esc(nissim.en.name)}</a>, ${L.en.page} ${s14.page}</p>
<p>${esc(k.p6)}</p>
<p><a class="more" href="${url(lang, 'territories/')}">${esc(k.toTerr)} ${arrow('en')}</a> &nbsp; <a class="more" href="${url(lang, 'elections/')}">${esc(k.toEl)} ${arrow('en')}</a></p>`;
  return layout(lang, 'connect/', { title: lang === 'he' ? CN.he.title : CN.en.title, body: `<article class="prose long">${lang === 'he' ? he : en}</article>`, active: 'connect' });
}

function archive(lang) {
  const t = L[lang];
  const cap = f => {
    if (f === '00a') return t.cover; if (f === '00b') return t.titlePage; if (f === '43') return t.note43; if (f === '44') return t.back;
    const it = EL.find(x => x.n === +f); return `${it.no}. ${bare(lang === 'he' ? it.he_name : it.en_name)}`;
  };
  const files = ['00a', '00b', ...EL.map(x => String(x.n).padStart(2, '0')), '43', '44'];
  const grid = files.map(f => `<figure><a href="/img/zb/${f}.jpg" target="_blank" rel="noopener"><img src="/img/zb/t/${f}.jpg" alt="${esc0(cap(f))}" loading="lazy" width="420" height="606"></a><figcaption>${esc(cap(f))}</figcaption></figure>`).join('');
  const body = `<header class="phead"><h1>${esc(t.archiveTitle)}</h1><p class="lede">${esc(t.archiveLede)}</p></header>
<section><h2>${esc(t.zbArchive)}</h2><div class="scans">${grid}</div></section>
<section><h2>${esc(t.terrArchive)}</h2><p class="note">${esc(t.terrScans)}</p></section>`;
  return layout(lang, 'archive/', { title: t.archiveTitle, desc: t.archiveLede, body, active: 'archive', wide: true });
}

function notFound(lang) {
  return layout(lang, '', { title: '404', body: `<section class="prose"><h1>${esc(L[lang].notFound)}</h1><p><a href="${url(lang)}">${esc(L[lang].site)}</a></p></section>` });
}

// ---------- write ----------
const VER = Object.fromEntries(['site.css', 'map.js', 'home.js', 'diamond.js'].map(a => [a, require('crypto').createHash('md5').update(fs.readFileSync(path.join(ROOT, 'assets', a))).digest('hex').slice(0, 8)]));
const written = [];
function out(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  html = html.replace(/\/assets\/(site\.css|map\.js|home\.js|diamond\.js)"/g, (m, a) => `/assets/${a}?v=${VER[a]}"`);
  fs.writeFileSync(f, rel.startsWith('en/') ? html.replace(/\bGod\b/g, 'G-d') : html);
  written.push(rel);
}
// ---------- translation packs ----------
// Every English string on the site is bound to a key. flatten() lists them with their Hebrew counterpart
// (i18n/source.json, what translators work from); applyPack() puts a translation into the English slots.
const B = [];
const bind = (key, he, obj, prop) => { if (typeof obj[prop] === 'string' && obj[prop]) B.push({ key, he: he || '', obj, prop, orig: obj[prop] }); };
const walk = (pre, en, he, skip) => { for (const k of Object.keys(en)) { const v = en[k], h = he == null ? undefined : he[k]; if (skip && skip(k, v)) continue; if (typeof v === 'string') { if (v.length > 1) bind(`${pre}.${k}`, typeof h === 'string' ? h : '', en, k); } else if (v && typeof v === 'object') walk(`${pre}.${k}`, v, h, skip); } };
walk('ui', L.en, L.he, k => ['dir', 'other', 'otherName'].includes(k));
walk('home', H.en, H.he); walk('chart', C.en, C.he); walk('more', OTX.en, OTX.he); walk('connect', CN.en, CN.he);
COMMON.communities.forEach(c => bind(`comm.${c.id}`, c.he, c, 'en'));
Object.entries(PLACES).forEach(([k, v]) => { if (usedPlaces.has(k)) bind(`place.${k}`, v.he, v, 'en'); });
EL.forEach(it => ['name', 'title', 'quote', 'date', 'bio'].forEach(f => bind(`el.${it.n}.${f}`, it['he_' + f], it, 'en_' + f)));
TR.themes.forEach(x => bind(`tr.theme.${x.id}`, x.he, x, 'en'));
Object.entries(TR.rabbis).forEach(([k, r]) => ['name', 'short', 'bio', 'context'].forEach(f => bind(`tr.rabbi.${k}.${f}`, r['he_' + f], r, 'en_' + f)));
TR.sayings.forEach(x => ['quote', 'note'].forEach(f => bind(`tr.say.${x.n}.${f}`, x['he_' + f], x, 'en_' + f)));
TR.opening.forEach((o, i) => { [['hen', 'hhe', 'title'], ['en', 'he', 'text'], ['nen', 'nhe', 'note'], ['ben', 'bhe', 'bio'], ['plen', 'plhe', 'place']].forEach(([e, h, f]) => bind(`tr.open.${i}.${f}`, o[h], o, e)); (o.list || []).forEach((m, j) => bind(`tr.open.${i}.member.${j}`, m[0], m, 1)); });
TR.appendix_docs.forEach((d, i) => bind(`tr.appx.${i}`, d.he, d, 'en'));
bind('tr.pending', TR.pending_bio.he, TR.pending_bio, 'en');
(TR.more || []).forEach(o => ['name', 'short', 'title', 'bio', 'quote', 'src'].forEach(f => bind(`tr.more.${o.key}.${f}`, o['he_' + f], o, 'en_' + f)));
OT.forEach(o => ['name', 'short', 'title', 'bio', 'quote', 'src'].forEach(f => bind(`more.${o.slug}.${f}`, o['he_' + f], o, 'en_' + f)));
const flatten = () => B.map(b => ({ k: b.key, he: b.he, en: b.orig }));
function applyPack(pack, dir) { const missing = []; B.forEach(b => { const v = pack[b.key]; if (typeof v === 'string' && v.trim()) b.obj[b.prop] = v; else { b.obj[b.prop] = b.orig; missing.push(b.key); } }); L.en.dir = dir; return missing; }
function restore() { B.forEach(b => { b.obj[b.prop] = b.orig; }); L.en.dir = 'ltr'; }

if (process.argv.includes('--source')) {
  fs.mkdirSync(path.join(ROOT, 'i18n'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'i18n', 'source.json'), JSON.stringify(flatten(), null, 1));
  console.log(`Wrote i18n/source.json with ${B.length} strings.`); process.exit(0);
}
const packOf = c => { const f = path.join(ROOT, 'i18n', c + '.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; };
// A language goes on the site only once its pack has passed independent review and is listed in i18n/published.json.
const PUBLISHED = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', 'published.json'), 'utf8'));
const SITE_LANGS = LANGS.filter(l => l.code === 'he' || l.code === 'en' || (PUBLISHED.includes(l.code) && packOf(l.code)));
function buildLang(lang, pre) {
  out(pre + 'index.html', home(lang));
  out(pre + 'territories/index.html', territories(lang));
  out(pre + 'elections/index.html', elections(lang));
  out(pre + 'others/index.html', others(lang));
  out(pre + 'rabbis/index.html', rabbisIndex(lang));
  for (const p of people) out(pre + `rabbis/${p.slug}/index.html`, rabbiPage(lang, p));
  out(pre + 'map/index.html', mapPage(lang));
  out(pre + 'connect/index.html', connect(lang));
  out(pre + 'archive/index.html', archive(lang));
}
buildLang('he', ''); buildLang('en', 'en/');
for (const l of SITE_LANGS.filter(l => l.code !== 'he' && l.code !== 'en')) {
  const missing = applyPack(packOf(l.code), l.dir); CUR = l.code;
  buildLang('en', l.code + '/');
  CUR = null; restore();
  if (missing.length) console.log(`${l.code}: ${missing.length} strings missing, shown in English (first: ${missing.slice(0, 5).join(', ')})`);
}
out('404.html', notFound('he'));
console.log(`Wrote ${written.length} pages; ${people.length} rabbis.`);
