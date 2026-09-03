# Editing Hausa explanations

Each pack has a matching file here — e.g. `airport-english.ha.js` for
`../airport-english.js`. To change a Hausa translation:

1. Open the `.ha.js` file for the pack you want.
2. Find the id (it's the same id used in the pack's main content file
   — `air-01`, `q-air-01`, etc.).
3. Edit the text between the quotes. Save.

That's it — nothing else needs to change. `../packs.js` picks up every
`.ha.js` file automatically and attaches the text to the matching
lesson/quiz at startup, so a pack's own content file (sentence data,
ids, quiz options, audio paths) is never touched just to fix a
translation.

## What's in each file

```js
export const lessons = {
  'air-01': 'Hausa text for this lesson\u2019s usage note...',
  ...
};

export const quizzes = {
  'q-air-01': {
    question: 'Hausa quiz question...',
    explain: 'Hausa answer explanation...',
  },
  ...
};
```

- `lessons` — one line per lesson: the Hausa version of that lesson's
  usage note (shown in the explain box under the sentence, when Hausa
  is selected).
- `quizzes` — one entry per quiz: the Hausa question prompt and the
  Hausa explanation shown after answering.

## Adding Hausa to a pack that doesn't have it yet

Create `<pack-slug>.ha.js` here in the same shape, then in `../packs.js`:

```js
import * as haYourPack from './hausa/<pack-slug>.ha.js';
// ...
attachHausa(yourPack, haYourPack);
```

A lesson or quiz with no entry in the `.ha.js` file just has no Hausa
note — the app falls back to English for that one item, so you can
translate a pack gradually instead of all at once.

## Formatting notes

- Keep the `'...'` single-quote style and escape any literal `'`
  inside the text as `\'` (e.g. `masu shayarwa\'` — very rare in
  Hausa, but the standard Hausa apostrophe-like glottal marks in
  words such as `ka'ida` do need this).
- The special Hausa letters — ɓ, ɗ, ƙ, and the hooked capital forms —
  are just regular UTF-8 text; paste them in directly, no escaping
  needed.
