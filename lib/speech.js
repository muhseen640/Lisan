/**
 * Two audio sources, same callers everywhere else in the app:
 *  - speak(): browser SpeechSynthesis — zero-asset, works for any pack
 *    with no recordings.
 *  - playClip(): plays a recorded mp3 (Lesson.arAudio/enAudio) for packs
 *    that ship real voice recordings, falling back to speak() if the
 *    file is missing so a partially-recorded pack degrades gracefully
 *    instead of going silent.
 */

// The Web Speech API doesn't expose a real "gender" field on voices, so
// we match on common name patterns instead. This covers the male voices
// shipped by Chrome/Google TTS, Safari/Apple, and Edge/Microsoft for
// both English and Arabic. If none match, we fall back to whatever
// voice the browser considers default for that language.
const MALE_VOICE_HINTS = [
  'male', 'david', 'daniel', 'alex', 'fred', 'guy', 'mark', 'james',
  'george', 'ryan', 'thomas', 'oliver', 'majed', 'maged', 'hamed', 'tarik',
];
const FEMALE_VOICE_HINTS = [
  'female', 'samantha', 'victoria', 'zira', 'susan', 'karen', 'moira',
  'tessa', 'salma', 'laila', 'amira', 'hoda', 'zeina',
];

let voiceCache = [];
function refreshVoiceCache() {
  if (!('speechSynthesis' in window)) return voiceCache;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length) voiceCache = voices;
  return voiceCache;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoiceCache();
  // Chrome loads the voice list asynchronously on first use.
  window.speechSynthesis.onvoiceschanged = refreshVoiceCache;
}

function pickMaleVoice(lang) {
  const voices = voiceCache.length ? voiceCache : refreshVoiceCache();
  if (!voices.length) return null;
  const langPrefix = lang.slice(0, 2).toLowerCase();
  const sameLang = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
  const pool = sameLang.length ? sameLang : voices;

  const isMale = v => MALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h));
  const isFemale = v => FEMALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h));

  return pool.find(isMale) || pool.find(v => !isFemale(v)) || pool[0] || null;
}

export function speak(text, { slow = false, lang = 'en-US', onEnded = null } = {}) {
  if (!('speechSynthesis' in window)) {
    if (onEnded) onEnded(); // never leave a caller chaining on this waiting forever
    return false;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = slow ? 0.6 : 1;
  const voice = pickMaleVoice(lang);
  if (voice) {
    // Defensive: some browsers/webviews can reject a voice object in
    // edge cases. Never let that block playback — just fall back to
    // the browser's own default voice for this language.
    try { utter.voice = voice; } catch (err) { /* keep default voice */ }
  }
  if (onEnded) {
    // Some browsers fire both onend AND onerror for the same utterance
    // (e.g. cancel()'d mid-speech) — without this guard a caller
    // chaining clips (dialogue playback) would advance twice per turn.
    let fired = false;
    const once = () => { if (fired) return; fired = true; onEnded(); };
    utter.onend = once;
    utter.onerror = once;
  }
  window.speechSynthesis.speak(utter);
  return true;
}

/**
 * Plays a recorded mp3 for a lesson (see Lesson.arAudio/enAudio in
 * types.js) instead of synthesized speech — for packs that ship real
 * voice recordings. "Slow" is done via playbackRate rather than a
 * separate file, so one recording covers both buttons.
 *
 * If the file is missing or fails to load (e.g. not uploaded yet,
 * offline and never cached), this transparently falls back to
 * speak(fallbackText, ...) rather than staying silent — so a pack
 * with only some recordings in place still works end to end.
 *
 * onEnded (optional) fires once playback finishes — through either
 * path (the real clip, or the TTS fallback if the clip failed) — so a
 * caller chaining several clips in sequence (see dialogue playback in
 * app.js) always gets exactly one "this line is done" signal per call,
 * regardless of which audio source actually played.
 */
let currentClip = null;
export function playClip(url, { slow = false, fallbackText = null, fallbackLang = 'en-US', onEnded = null } = {}) {
  if (!url) {
    if (fallbackText) return speak(fallbackText, { slow, lang: fallbackLang, onEnded });
    if (onEnded) onEnded();
    return false;
  }
  try {
    if (currentClip) { currentClip.pause(); currentClip.currentTime = 0; }
    const audio = new Audio(url);
    audio.playbackRate = slow ? 0.65 : 1;
    currentClip = audio;

    // A failed load can trigger BOTH the element's 'error' event AND a
    // rejected play() promise — without this guard, fallback() (and
    // therefore onEnded) would fire twice for the same clip, which for
    // a chained sequence (dialogue playback) meant silently skipping
    // an extra turn every time a file was missing.
    let settled = false;
    const once = fn => { if (settled) return; settled = true; fn(); };

    const fallback = () => once(() => {
      if (fallbackText) speak(fallbackText, { slow, lang: fallbackLang, onEnded });
      else if (onEnded) onEnded();
    });
    const succeed = () => once(() => { if (onEnded) onEnded(); });

    audio.addEventListener('error', fallback, { once: true });
    audio.addEventListener('ended', succeed, { once: true });
    audio.play().catch(fallback);
    return true;
  } catch (err) {
    if (fallbackText) return speak(fallbackText, { slow, lang: fallbackLang, onEnded });
    if (onEnded) onEnded();
    return false;
  }
}

export function speechSupported() {
  return 'speechSynthesis' in window;
}

export function recognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Arabic diacritics (tashkeel) + tatweel don't affect meaning and rarely
// come back from recognition consistently, so they're stripped before
// comparing — same idea as lowercasing for English.
const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;

function normalizeFor(lang) {
  const isAr = lang.slice(0, 2).toLowerCase() === 'ar';
  return s => {
    let out = s.trim().replace(/[.,!?؟،؛]/g, '').replace(/\s+/g, ' ');
    if (isAr) {
      out = out.replace(ARABIC_DIACRITICS, '').replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    } else {
      out = out.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    }
    return out.trim();
  };
}

// Short-word-tolerant edit distance, used to forgive small ASR slips
// (a dropped or swapped letter) instead of demanding a perfect match.
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, row[j], row[j - 1]);
      prev = tmp;
    }
  }
  return row[n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true;
  const maxLen = Math.max(a.length, b.length);
  const tolerance = maxLen <= 3 ? 1 : maxLen <= 6 ? 1 : 2;
  return levenshtein(a, b) <= tolerance;
}

/**
 * How much of the target sentence is actually present in what was heard,
 * word by word (order doesn't matter, and each word only needs to be
 * "close enough" — not a perfect match) — forgiving of ASR mishearing a
 * word here or there, filler words, or a slightly different word order,
 * which is normal for a learner still building fluency.
 */
function overlapScore(targetWords, heardWords) {
  if (!targetWords.length) return 0;
  const remaining = heardWords.slice();
  let matched = 0;
  for (const tw of targetWords) {
    const idx = remaining.findIndex(hw => wordsClose(tw, hw));
    if (idx !== -1) {
      matched++;
      remaining.splice(idx, 1);
    }
  }
  return matched / targetWords.length;
}

/**
 * practiceSpeaking(targetText, lang, onResult)
 * onResult receives { supported, ok, heard } — heard is null when
 * recognition isn't supported, so the caller can fall back to a plain
 * "listen and repeat" flow without a crash. `lang` picks which
 * language's recognizer/normalizer runs (e.g. 'ar-SA' or 'en-US'),
 * so the same practice flow works for either direction.
 *
 * Matching is deliberately forgiving — a learner should pass for
 * getting the sentence across, not for a word-perfect, accent-perfect
 * recording. A short sentence (<=3 words) just needs its words heard;
 * a longer one passes once most of it (~65%) comes through.
 */
export function practiceSpeaking(targetText, lang, onResult) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    onResult({ supported: false, ok: false, heard: null });
    return;
  }
  try {
    const rec = new Recognition();
    rec.lang = lang || 'en-US';
    rec.maxAlternatives = 5;
    rec.interimResults = false;

    const normalize = normalizeFor(rec.lang);
    const targetNorm = normalize(targetText);
    const targetWords = targetNorm.split(' ').filter(Boolean);
    const threshold = targetWords.length <= 3 ? 0.5 : 0.65;

    // Exactly one outcome ever reaches the caller, however recognition
    // actually ends — a real result, an error, a silent onend with
    // neither (some browsers/webviews do this on a permission snag or
    // a timeout), or — last resort — the safety-net timer below. Without
    // this, a caller waiting on this callback (e.g. dialogue practice's
    // auto-advance) can hang indefinitely with no way to recover.
    let settled = false;
    let timeoutId = null;
    const finish = result => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      onResult(result);
    };

    rec.onresult = e => {
      const heard = e.results[0][0].transcript;
      let bestScore = 0;
      for (const alt of Array.from(e.results[0])) {
        const heardNorm = normalize(alt.transcript);
        if (heardNorm === targetNorm || heardNorm.includes(targetNorm) || targetNorm.includes(heardNorm)) {
          bestScore = 1;
          break;
        }
        const heardWords = heardNorm.split(' ').filter(Boolean);
        bestScore = Math.max(bestScore, overlapScore(targetWords, heardWords));
      }
      finish({ supported: true, ok: bestScore >= threshold, heard });
    };
    rec.onerror = () => finish({ supported: true, ok: false, heard: null, error: true });
    // Recognition ending with no result and no error (silence, the
    // browser giving up) counts the same as "didn't catch that" —
    // consistent with treating silence as a miss elsewhere in the app.
    rec.onend = () => finish({ supported: true, ok: false, heard: null });

    timeoutId = setTimeout(() => {
      finish({ supported: true, ok: false, heard: null, timedOut: true });
      try { rec.abort(); } catch (abortErr) { /* already stopped */ }
    }, 12000);

    rec.start();
  } catch (err) {
    onResult({ supported: false, ok: false, heard: null });
  }
}
