# Archived packs

Airport English, Hotel English, Restaurant English, and Jobs & Interview
English (and their Hausa translation files) were removed from the app
so only Arabic Basics remains. They're kept here, unregistered, rather
than deleted outright — the app currently ignores this folder entirely
(nothing imports from `_archive/`).

## To bring one back

1. Move its file back up to `content/` (and its `hausa/*.ha.js`
   companion back to `content/hausa/`, if present).
2. In `content/packs.js`, add its import and its `attachHausa(...)`
   call back, and add it to the `ALL_PACKS` array.
3. Add its `content/<slug>.js` (and `content/hausa/<slug>.ha.js`) path
   back to `sw.js`'s `SHELL_FILES` and bump `CACHE_NAME`.

That mirrors the normal "adding a new pack" steps in `../README.md` —
nothing else in the app needs to change either way, since every screen
already renders packs generically from `ALL_PACKS`.

## A note on learners' existing progress

If someone had already unlocked or made progress in one of these packs
before it was removed, that progress data stays in their local
storage under the old pack id — it isn't deleted, just orphaned (the
app no longer resolves that id to a pack, so it won't show up
anywhere). `lib/store.js#getOverallStats()` explicitly filters these
out so they don't inflate the Progress screen's totals. Re-adding a
pack with the *same* `id` later would make that old progress live
again automatically, since it's still sitting in their storage under
that id.
