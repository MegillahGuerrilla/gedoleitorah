# Delta brief: 21 new or changed strings

The site gained a few passages after the packs were published. Only the strings listed in
`/home/claude/gedoleitorah/i18n/tmp-delta/delta.json` need work. Each item there has `k`, `he`, `en`, and `status`:
`new` (not in the pack yet) or `changed` (the pack holds a translation of the OLD text, given as `old_en` / `old_he`;
replace it with a translation of the new text).

Everything in `/home/claude/gedoleitorah/i18n/BRIEF.md` still binds you. Read it first. In addition:

- **Edit the pack in place** (`/home/claude/gedoleitorah/i18n/<code>.json`): add the new keys, replace the changed ones,
  and leave every other key exactly as it is. The file must stay one flat JSON object and end with all 609 keys.
  `node /home/claude/gedoleitorah/i18n/check.js <code>` must print `OK: 609 of 609 strings.`
- **Stay consistent with the pack.** Before translating, look up how the pack already renders: the names of Rabbi
  Trebnik, Rabbi Sawitzki and Rabbi Zevin (`tr.rabbi.trebnik.*`, `tr.rabbi.sawitzki.*`, `tr.rabbi.zevin.*`), the book
  titles (`ui.terrMeta`, `ui.terrSource`), the names of the two collections (`ui.terrTitle`, `ui.elTitle`), "Knesset",
  "Land of Israel", "Da'at Torah", "pikuach nefesh"/danger to life, the Three Oaths, Brooklyn, and the wording of the
  old `connect.*` strings. Use the same spellings and terms.
- **Three of the strings are rabbis' words** and are translated from the HEBREW, faithfully, ellipses kept where the
  Hebrew has them: `connect.q1` (Rabbi Trebnik), `connect.q2` (Rabbi Sawitzki), `tr.more.schneerson.quote`
  (the Lubavitcher Rebbe). `connect.q3` is a passage from the book Da'at Torah; translate it from the Hebrew too.
  Expand the Hebrew abbreviations as the English does (ח״ו = Heaven forbid; בנ״י = Jews; אנ״ש = our own chasidim;
  כאו״א = every single one; ארה״ק = the Holy Land; ע״ז = on this).
- The Rebbe is "the Lubavitcher Rebbe"; write his name and title in the form readers of your language know.
  In Yiddish keep the honorific as the Hebrew has it.
- `home.mapH` is a heading: keep it short and in the same two-sentence shape.
- `place.nikolaev` is the city of Nikolaev (Mykolaiv) in Ukraine; use the name Jewish readers of your language know.
- **Numbers.** The home page now shows "62 <home.statR>" and "79 <home.statP>" (it was 61 and 78). If your language
  needs a different noun form after 62 or 79, correct `home.statR` / `home.statP` and say so.

Do not edit any other file. Do not run the site build. Do not use git.

Report back in under 200 words: the keys you were unsure of, and any existing key you had to touch besides the 21.
