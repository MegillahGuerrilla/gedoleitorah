# Translation brief: gedoleitorah.com

## What this is

A website that records what leading rabbis ("Gedolei Torah") said on two questions, each in its own collection:

1. **Giving up land** (keys `tr.*`): 20 sayings by 19 rabbis from the Hebrew book *Gedolei Torah al Hachzarat Shetachim* (Bnei Brak, 1980), against handing over any part of the Land of Israel.
2. **Knesset elections** (keys `el.*`): 41 rabbis from the Hebrew pamphlet *Zichron BaSefer* (Jerusalem, 2009), against taking part in Knesset elections.

A third small group (`more.*`) holds other sages quoted from their own writings. The rest is interface text: a map of where the rabbis lived, a chart of their lifespans, a timeline, and a page (`connect.*`) on how the two questions relate.

The site exists in Hebrew and English. You are producing one more language. Readers are Orthodox Jews who read that language. The register is a dignified documentary record: plain, exact, no flourish, no softening and no sharpening.

## Files

- **Read:** `/home/claude/gedoleitorah/i18n/source.json`. An array of 591 items: `{"k": key, "he": Hebrew text, "en": English text}`.
- **Write:** `/home/claude/gedoleitorah/i18n/<code>.json`. One flat JSON object: `{"key": "translation", ...}` containing **every one of the 591 keys**, nothing else. Valid UTF-8 JSON. Write it in several steps if needed, but the final file must be one object.
- **Check:** run `node /home/claude/gedoleitorah/i18n/check.js <code>` and fix everything it reports. Finish only when it prints `OK`.

Do not edit any other file. Do not run the site build. Do not use git.

## What to translate from

- **The rabbis' words** (`el.N.quote`, `tr.say.N.quote`, `tr.open.N.text`, `more.*.quote`): translate from the **Hebrew**. The Hebrew is the original. The English shows how the passage was understood; use it to resolve doubts, not as your source. Be faithful: add nothing, drop nothing, keep bracketed glosses, keep the force of the original.
- **Biographies from the 1980 book** (`tr.rabbi.*.bio`, `tr.open.*.bio`): the Hebrew is the book's own text; translate from it, with the English as reference.
- **Everything else** (`ui.*`, `home.*`, `chart.*`, `more.*` other than quotes, `connect.*`, `el.N.bio`, `el.N.title`, `el.N.date`, notes): Hebrew and English are parallel texts written for the site. Convey the full content of the English, using the Hebrew to pin down meaning. Where the English says "English translations were made for this site", say that the translations into **your** language were made for this site.

## Rules that the site depends on

1. **Placeholders.** Keep `{n}` exactly. Keep `[[` and `]]` around the phrase that corresponds to the bracketed phrase in the source (it becomes a link).
2. **Paragraph breaks.** Where the source has line breaks (`\n`), keep the same number, in the same places.
3. **No outer quotation marks** on quotes. The site adds them. For a quotation inside a quote, use your language's secondary marks.
4. **Civil years** (1951, 1980 …) must all stay, as digits. Keep Hebrew years where the English keeps them (e.g. "5740 (1980)").
5. **Short labels stay short.** Keys starting `chart.`, `comm.`, `ui.nav.`, `ui.views.`, `home.stat` sit in tight spaces. Keep them about as long as the English.
6. **Names must be consistent.** The same rabbi appears under several keys (for example `tr.rabbi.X.name`, `tr.rabbi.X.short`, inside biographies, in `tr.open.*.member.*`). Use one spelling throughout. `short` is the brief form used in lists.

## Names, titles and terms

- Write rabbis' names in the form Orthodox readers of your language know them, in your script. Follow the Ashkenazi or Sephardi form the English uses for each man (e.g. "Yoel Teitelbaum", "Ovadia Yosef").
- The Hebrew names carry honorifics (זצוק״ל, זצ״ל, הי״ד). The English drops זצוק״ל and זצ״ל; do the same, except in Yiddish (see below). Keep "הי״ד" in the manner customary in your language for a martyr.
- Hebrew book titles are transliterated, not translated, as the English does.
- Place names: use your language's standard name. Where the English adds the Jewish name in parentheses ("Satu Mare (Satmar)"), keep it.
- Keep the terms of the source. "Returning territories", "handing over land", "the Knesset", "the expulsion from Gush Katif", "the regime" stay what they are; do not substitute milder or harsher words.
- Halachic terms the English leaves in transliteration (pikuach nefesh, milchemet mitzvah, shmita, beit din, gaavad) stay transliterated in your language's usual way, with a gloss only where the English has one.
- Hebrew months and dates: transliterate month names in your language's usual way ("Tammuz 5711 (1951)").

### The Name
Never write the word for G-d in full. Use the form already used on this publisher's other sites:

| Language | Write | 
|---|---|
| French | D.ieu |
| Spanish | D-os |
| Russian | Б-г (Б-га, Б-гу, Б-гом) |
| Yiddish | ג-ט, or השי״ת / דער אויבערשטער where natural |
| Amharic | ፈጣሪ or አምላክ; for "Hashem" in a quote, ሃሼም. Do not use እግዚአብሔር |

### Usage on this publisher's existing editions (follow it)
- **Spanish:** neutral Latin American. "Rabí" before a name; Torá, Knéset, halajá, Tierra de Israel.
- **French:** "Rabbi" (or "Rav" where the English says Rav); Torah, Knesset, halakha, Terre d'Israël. French punctuation: « guillemets » with non-breaking spaces, space before : ; ? !
- **Russian:** "рав" or "рабби" before a name (Ребе for a Hasidic rebbe); Тора, Кнессет, алаха, Земля Израиля. Use «ёлочки».
- **Amharic:** ረቢ before a name; ቶራ, ክኔሴት, የእስራኤል ምድር. Transliterate Hebrew book titles and names into Ethiopic script. Use Western digits for years.
- **Yiddish:** Hasidic spelling as on yi.jewishhome.news. No vowel points, no YIVO diacritics or ligatures (write וו, יי, not װ, ײ; never אַ אָ פּ פֿ). נישט, not ניט. אידן, אידיש. Words of Hebrew origin are spelled as in Hebrew. Keep the honorifics זצוק״ל / זצ״ל on names as the Hebrew has them. The rabbis' quotes are in Hebrew; still render them in Yiddish (the site shows the Hebrew original beneath). Use ״ ״ for quotation marks. Hebrew dates stay in Hebrew form (ט״ז שבט תשס״ט), with the civil year where the English has it.

## What to hand back

When `check.js` prints OK, reply with a short report (under 300 words):
- the conventions you chose for names and titles;
- a list of keys where you were unsure of the meaning or made a judgment call, with one line each.
