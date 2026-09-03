# Recorded audio for the Arabic Basics pack

Drop your mp3 files directly in this folder (`/audio/`, next to
`index.html`) using these exact filenames — `content/arabic-basics.js`
already points each lesson at these paths, so nothing else needs to
change once the files are here.

24 lessons × 2 files each = 48 files:

```
ar_1.mp3    en_1.mp3
ar_2.mp3    en_2.mp3
ar_3.mp3    en_3.mp3
ar_4.mp3    en_4.mp3
ar_5.mp3    en_5.mp3
ar_6.mp3    en_6.mp3
ar_7.mp3    en_7.mp3
ar_8.mp3    en_8.mp3
ar_9.mp3    en_9.mp3
ar_10.mp3   en_10.mp3
ar_11.mp3   en_11.mp3
ar_12.mp3   en_12.mp3
ar_13.mp3   en_13.mp3
ar_14.mp3   en_14.mp3
ar_15.mp3   en_15.mp3
ar_31.mp3   en_31.mp3
ar_32.mp3   en_32.mp3
ar_33.mp3   en_33.mp3
ar_34.mp3   en_34.mp3
ar_35.mp3   en_35.mp3
ar_36.mp3   en_36.mp3
ar_37.mp3   en_37.mp3
ar_38.mp3   en_38.mp3
ar_39.mp3   en_39.mp3
```

(The numbering skips around because it matches the ids from your
original source data — lesson order in the app follows the order in
`content/arabic-basics.js`, not these numbers.)

## Behavior while files are missing

Nothing breaks. `lib/speech.js#playClip()` tries the mp3 first; if a
file 404s or fails to load, it transparently falls back to the
browser's built-in text-to-speech for that one sentence. So you can add
recordings incrementally — lessons with a file play your voice,
lessons without one just use TTS until you get to them.

## Adding recordings to another pack

Any pack can use recordings the same way — add `arAudio`/`enAudio`
(paths to your mp3s) to a lesson object in that pack's content file.
Packs that don't set these fields keep using TTS automatically; nothing
elsewhere needs to change.

## Offline caching

These files aren't in `sw.js`'s install-time `SHELL_FILES` list (since
the service worker install would fail if one were missing before
you've added them). Instead they're cached the first time they're
played, via the same runtime cache-on-fetch logic that already handles
everything else — so once a learner has played a clip once, it works
offline from then on.
