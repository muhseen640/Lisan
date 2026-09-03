/**
 * Local persistence layer. Hand-rolled thin wrapper over IndexedDB (no
 * external dependency, so the app shell stays cacheable/offline-friendly
 * with nothing to fetch from a CDN). Everything lives in one object store
 * keyed "state", holding the full deviceLearningState document — simplest
 * possible schema for V1, easy to reason about, easy to later mirror to a
 * cloud sync API without changing callers (see lib/store.js).
 */

const DB_NAME = 'eja-db';
const DB_VERSION = 1;
const STORE = 'learningState';
const STATE_KEY = 'state';

function defaultState() {
  return {
    unlockedPacks: [],       // string[] of pack ids
    lessonProgress: {},      // { [packId]: { completedLessonIds: string[], currentLessonId: string|null } }
    quizProgress: {},        // { [packId]: { [quizId]: { correct: boolean, attempts: number } } }
    speakingProgress: {},    // { [packId]: { [lessonId]: { attempts: number, lastResult: 'ok'|'retry'|null } } }
    currentPackId: null,
    xp: 0,
    streak: 0,
    lastActivity: null,      // ISO date string (day granularity, for streak calc)
    badges: [],              // string[] badge ids earned
    uiLang: 'en',             // 'ar' | 'en' — interface language, not content language
    practiceLang: 'ar',       // 'ar' | 'en' — which language the speaking-practice mic targets
    explainLang: 'en',        // 'ar' | 'en' | 'ha' — language shown in lesson/quiz explanation
                               // notes; independent of uiLang, so switching it never changes
                               // the rest of the interface
    dialogueRole: 'you',      // 'you' | 'them' — which side of a dialogue the learner
                               // practices speaking; the other side auto-plays. Applies
                               // to whichever dialogue is open, chosen fresh each time
                               // from the pre-practice screen — not tied to one pack.
    deviceId: null,           // generated once in store.js#initStore; identifies this install
                               // to the unlock-code API so a redeemed code can be re-verified
                               // on the same device without counting as reuse by someone else
  };
}

let _dbPromise = null;
function openDb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** In-memory fallback used if IndexedDB is unavailable/corrupted, so the
 *  app never crashes — it just won't persist across sessions. */
let _memoryState = null;

export async function loadState() {
  try {
    const raw = await idbGet(STATE_KEY);
    if (!raw) {
      const fresh = defaultState();
      await idbSet(STATE_KEY, fresh);
      return fresh;
    }
    // Merge with defaults so a future schema addition never crashes an
    // existing learner's saved state.
    return { ...defaultState(), ...raw };
  } catch (err) {
    console.warn('[db] falling back to in-memory state:', err);
    _memoryState = _memoryState || defaultState();
    return _memoryState;
  }
}

export async function saveState(state) {
  try {
    await idbSet(STATE_KEY, state);
  } catch (err) {
    console.warn('[db] save failed, keeping in-memory only:', err);
    _memoryState = state;
  }
}

export { defaultState };
