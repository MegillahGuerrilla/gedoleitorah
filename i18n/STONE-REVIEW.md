# Review brief: independent check of 14 new interface labels (the stone on the home page)

You are the independent reviewer. Someone else translated these strings. You have not seen their notes and should not
look for them. Find and fix every error before the text goes on a public site that carries the words of leading rabbis.

## What the labels are for
The home page of gedoleitorah.com now opens with a cut diamond ("the stone"). It sits, small, in the crown drawn on
top of the Aron Kodesh (the Torah ark) at the head of the page. When the visitor touches it, the page shows the same
stone at full size. The stone has one flat face (a "facet") for each rabbi on the site, with the rabbi's name on it,
and it turns slowly by itself. Beside it the page shows the words of one rabbi at a time.

The 14 keys, all beginning `home.stone.`:
- `hint`: three words under the crown, inviting the visitor to touch the stone. Polite form, as the pack addresses readers elsewhere.
- `open`: the spoken label of the button that is the small stone. `{n}` is replaced by the number 62.
- `kicker`: a small line over the heading of the full-size stone: the stone that came from the crown of the Aron.
- `h`: the heading. It will read "62 rabbis, one facet each". `{n}` is replaced by 62; the noun must be right after 62.
- `upper`, `lower`: "Upper half" and "Lower half" of the stone. Shown as "<upper> · 41" and "<lower> · 20", and before a collection name.
- `top`: "The top facet", the large flat face on top of the stone.
- `topNote`: shown under the name of Rabbi Elchanan Wasserman, after his title. He was murdered in Kovno in 1941.
  It must use the same wording for "killed for the sanctification of G-d's name" as the pack's `more.elchanan-wasserman.bio`,
  and the same way of writing the Name. "Either question" means the two questions of the site: giving up land, and the Knesset elections.
- `more`: a link to the rabbi's full statement. Use the pack's own word for a rabbi's statement (see `ui.theSayings`).
- `prev`, `next`: two buttons that step from one rabbi to the next.
- `auto`: a switch. When on, the stone turns by itself. Agree it with the grammatical gender of "stone" in your language.
- `names`: a checkbox that shows or hides the names written on the facets.
- `aria`: a description read aloud by screen readers. The two button names quoted in it must be exactly the texts of `prev` and `next`.

## Files
- `/home/claude/gedoleitorah/i18n/BRIEF.md`: the rules every translator of this site was given. They bind you too. Read it first.
- `/home/claude/gedoleitorah/i18n/tmp-delta/delta.json`: the 14 items, each with `k`, `he` (Hebrew) and `en` (English).
- `/home/claude/gedoleitorah/i18n/<code>.json`: the pack. **Correct it in place.** Touch only these 14 keys.

## For each key ask
1. **Meaning.** Nothing added, dropped, softened or sharpened, against both the Hebrew and the English.
2. **Language.** Correct and natural for an educated Orthodox reader; the right register and orthography for this language.
   Is the word for "facet" the one a reader would know for the cut face of a gemstone? Is the word for the "crown" the one
   used for the crown of a Torah ark or Torah scroll?
3. **Grammar with numbers.** `{n}` stays in the text exactly as written. The number will be 62.
4. **Consistency with the rest of the pack.** The same terms the pack already uses for rabbi, statement, the two collections.
5. **Mechanics.** No outer quotation marks; the year 1941 present in `topNote`; the Name written as the brief requires.

`node /home/claude/gedoleitorah/i18n/check.js <code>` must print `OK: 623 of 623 strings.` when you finish.
Do not edit any other file. Do not run the site build. Do not use git.

Report in under 200 words: which of the 14 you changed and why (old text, new text), anything you could not settle,
and your verdict: fit to publish?
