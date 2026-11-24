// Checks a translation pack against i18n/source.json. Usage: node i18n/check.js <code>
const fs = require('fs'), path = require('path');
const code = process.argv[2];
const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'source.json'), 'utf8'));
let pack;
try { pack = JSON.parse(fs.readFileSync(path.join(__dirname, code + '.json'), 'utf8')); } catch (e) { console.log('NOT VALID JSON: ' + e.message); process.exit(1); }
const problems = [];
const keys = new Set(src.map(x => x.k));
for (const k of Object.keys(pack)) if (!keys.has(k)) problems.push(`unknown key: ${k}`);
const SCRIPT = { ru: /[А-Яа-яЁё]/, am: /[ሀ-፿]/, yi: /[֐-׿]/, fr: /[A-Za-zÀ-ÿ]/, es: /[A-Za-zÀ-ÿ]/ }[code];
for (const x of src) {
  const v = pack[x.k];
  if (typeof v !== 'string' || !v.trim()) { problems.push(`missing: ${x.k}`); continue; }
  for (const ph of ['{n}', '[[', ']]']) if (x.en.includes(ph) !== v.includes(ph)) problems.push(`placeholder ${ph}: ${x.k}`);
  if ((x.en.match(/\n/g) || []).length !== (v.match(/\n/g) || []).length) problems.push(`paragraph breaks differ: ${x.k}`);
  const ny = s => (s.match(/\b(1[89]\d\d|20[0-2]\d)\b/g) || []).sort().join(',');
  if (ny(x.en) !== ny(v)) problems.push(`civil years differ (${ny(x.en)} vs ${ny(v)}): ${x.k}`);
  if (/^["“”«»״„]/.test(v) && /\.quote$/.test(x.k)) problems.push(`outer quotation marks: ${x.k}`);
  if (SCRIPT && !SCRIPT.test(v) && !/^[\d\s–-]+$/.test(v)) problems.push(`not in target script: ${x.k}`);
  if (v === x.en && x.en.length > 25 && code !== 'en') problems.push(`left in English: ${x.k}`);
  if (/^(chart|comm|ui\.nav|ui\.views|home\.stat)/.test(x.k) && v.length > x.en.length * 1.9 + 8) problems.push(`too long for its place (${v.length} vs ${x.en.length}): ${x.k}`);
  if (code !== 'en' && /\bGod\b|\bDieu\b|\bDios\b|Бог[аеуо]?м?\b|גאט\b/.test(v)) problems.push(`G-d spelling: ${x.k}`);
}
console.log(problems.length ? problems.join('\n') : `OK: ${Object.keys(pack).length} of ${src.length} strings.`);
process.exit(problems.length ? 1 : 0);
