# Review brief: independent check of 21 new or changed strings

You are the independent reviewer. Someone else translated these strings. You have not seen their notes and should not
look for them. Find and fix every error before the text is published under the names of leading rabbis.

Read first:
- `/home/claude/gedoleitorah/i18n/BRIEF.md` and `/home/claude/gedoleitorah/i18n/DELTA.md`: the rules the translator
  was given. They bind you too.
- `/home/claude/gedoleitorah/i18n/tmp-delta/delta.json`: the 21 items, each with `k`, `he`, `en`, `status`.
- `/home/claude/gedoleitorah/i18n/<code>.json`: the pack. **Correct it in place.** Touch only these 21 keys, plus
  `home.statR` / `home.statP` if the noun form is wrong after 62 or 79.

For each of the 21 keys compare the translation with its Hebrew and English and ask:
1. **Meaning.** Nothing added, dropped, softened or sharpened. `connect.q1`, `connect.q2`, `connect.q3` and
   `tr.more.schneerson.quote` are checked word by word against the HEBREW; ellipses stand where the Hebrew has them.
2. **Facts.** Names, places, years, page numbers, book titles.
3. **Language.** Correct and natural for an educated Orthodox reader; right register and orthography for this language.
4. **Consistency with the rest of the pack.** The same spellings of Trebnik, Sawitzki, Zevin, the book titles, the two
   collection names, Knesset, Land of Israel and the other terms as the pack already uses. The changed strings
   (`ui.terrMeta`, `home.mapH`, `connect.p2`) must translate the NEW text, not the old.
5. **Mechanics.** No outer quotation marks on quotes; civil years intact; the Name written as the brief requires.

`node /home/claude/gedoleitorah/i18n/check.js <code>` must print `OK: 609 of 609 strings.` when you finish.
Do not edit any other file. Do not run the site build. Do not use git.

Report in under 250 words: how many of the 21 you changed and why; every correction of MEANING in one of the four
quoted passages (key, what it said, what it says now); anything you could not settle; and your verdict: fit to publish?
