# Review brief: independent check of a translation pack

You are the independent reviewer. Someone else translated the pack. You have not seen their notes and should not look for them. Your job is to find and fix every error before the text is published under the names of leading rabbis.

## Files

- `/home/claude/gedoleitorah/i18n/BRIEF.md`: the rules the translator was given. Read it first; they bind you too.
- `/home/claude/gedoleitorah/i18n/source.json`: 609 items, `{"k", "he", "en"}`. The Hebrew is the original for the rabbis' words and for the 1980 book's biographies.
- `/home/claude/gedoleitorah/i18n/<code>.json`: the translation to review. **Correct it in place.** Keep it one flat JSON object with all 609 keys.
- `node /home/claude/gedoleitorah/i18n/check.js <code>` must print `OK` when you finish.

Do not edit any other file. Do not run the site build. Do not use git.

## How to review

Go through **all 609 items in order**, comparing each translation with its Hebrew and English. Do not sample. For each item ask:

1. **Meaning.** Does it say what the Hebrew says: nothing added, nothing dropped, nothing softened or sharpened? For the rabbis' quotes (`el.N.quote`, `tr.say.N.quote`, `tr.open.N.text`, `more.*.quote`) check against the Hebrew word by word. A halachic ruling that becomes milder or harsher in translation is a serious error.
2. **Facts.** Names, places, years, book titles, posts held: all match the source.
3. **Language.** Is it correct, natural and idiomatic for an educated Orthodox reader of this language? Fix grammar, spelling, agreement, awkward calques and wrong register.
4. **Consistency.** Each rabbi's name is spelled one way everywhere. The same term is rendered the same way everywhere. The conventions in the brief (the Name, titles, terms, orthography) are followed without exception.
5. **Mechanics.** Placeholders `{n}`, `[[ ]]`, paragraph breaks and civil years intact; no outer quotation marks on quotes; short labels short.

Fix what is wrong. Leave alone what is right: do not rewrite for taste.

Known points about the source:
- Where the Hebrew and English disagree on a fact, follow the **Hebrew** and list the key in your report.
- Numbers on the site appear before a noun as "62 <rabbis>", "7 <circles>", "79 <cities>", "6 <continents>", "2 <questions>" (keys `home.statR`, `home.statC`, `home.statP`, `home.statK`, `ui.rabbisN`, `ui.sayingsN`, `ui.questionsN`). If your language needs a different noun form after these particular numbers, choose the form that is correct for the numbers given here (62, 7, 79, 6, 2) and say so in your report.

## What to hand back

A report under 400 words:
- how many items you changed, and the kinds of errors you found;
- every correction of **meaning** in a rabbi's quote: key, what it said, what it says now;
- any item you could not settle, with the key and the doubt;
- your overall judgment: is this pack fit to publish?
