import { loadState, saveState } from './db.js';
import { getPackBySlug } from '../content/packs.js';

const XP_PER_LESSON = 10;
const XP_PER_QUIZ_CORRECT = 15;

let state = null;
const listeners = new Set();

export async function initStore() {
  state = await loadState();
  if (!state.deviceId) {
    state.deviceId = (crypto.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  }
  applyStreakOnOpen();
  await persist();
  return state;
}
export function getState() {
  return state;
}
/** Stable per-install id sent to the unlock-code API — lets the same
 *  device re-verify a code it already redeemed without that counting
 *  as a second person using it. Never sent anywhere else. */
export function getDeviceId() {
  return state.deviceId;
}
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notify() {
  for (const fn of listeners) fn(state);
}
async function persist() {
  await saveState(state);
  notify();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function applyStreakOnOpen() {
  const today = todayStr();
  if (!state.lastActivity) {
    state.streak = 0; // streak starts once they actually complete something
    return;
  }
  const last = new Date(state.lastActivity);
  const diffDays = Math.round((new Date(today) - new Date(last.toISOString().slice(0, 10))) / 86400000);
  if (diffDays >= 2) {
    state.streak = 0; // missed a day — streak resets, but past XP/progress is untouched
  }
}

function markActivity() {
  const today = todayStr();
  if (state.lastActivity !== today) {
    const last = state.lastActivity ? new Date(state.lastActivity) : null;
    const diffDays = last ? Math.round((new Date(today) - new Date(last.toISOString().slice(0, 10))) / 86400000) : null;
    state.streak = diffDays === 1 ? state.streak + 1 : 1;
    state.lastActivity = today;
  }
}

function awardBadge(id) {
  if (!state.badges.includes(id)) state.badges.push(id);
}

export function getUiLang() {
  return state.uiLang || 'en';
}
export async function setUiLang(lang) {
  state.uiLang = lang === 'ar' ? 'ar' : 'en';
  await persist();
}

/** Which language the speaking-practice mic currently targets. */
export function getPracticeLang() {
  return state.practiceLang || 'ar';
}
export async function setPracticeLang(lang) {
  state.practiceLang = lang === 'en' ? 'en' : 'ar';
  await persist();
}

/** Language shown in lesson/quiz explanation notes — independent of
 *  uiLang, so a learner can read explanations in Hausa (or Arabic)
 *  while the rest of the interface stays in whichever language they
 *  picked for uiLang. */
export function getExplainLang() {
  return state.explainLang || 'en';
}
export async function setExplainLang(lang) {
  state.explainLang = ['ar', 'en', 'ha'].includes(lang) ? lang : 'en';
  await persist();
}

/** Which side of a dialogue the learner practices speaking — the other
 *  side auto-plays. See DialogueTurn.speaker in content/types.js. */
export function getDialogueRole() {
  return state.dialogueRole === 'them' ? 'them' : 'you';
}
export async function setDialogueRole(role) {
  state.dialogueRole = role === 'them' ? 'them' : 'you';
  await persist();
}

export function isUnlocked(packId) {
  const pack = getPackBySlug(packId);
  return !!pack && (pack.access === 'free' || state.unlockedPacks.includes(packId));
}

export async function unlockPack(packId) {
  if (!state.unlockedPacks.includes(packId)) {
    state.unlockedPacks.push(packId);
    await persist();
  }
}

/**
 * Restart a finished pack from lesson 1 ("Practice Again"). Clears this
 * pack's lesson/quiz progress so the progress bar and quiz UI go back to
 * a clean slate, without touching XP/badges already earned, unlock
 * status, or any other pack's progress.
 */
export async function resetPackProgress(packId) {
  const pack = getPackBySlug(packId);
  const firstLessonId = pack && pack.lessons.length ? pack.lessons[0].id : null;
  state.lessonProgress[packId] = { completedLessonIds: [], currentLessonId: firstLessonId };
  state.quizProgress[packId] = {};
  state.currentPackId = packId;
  await persist();
}

export function getPackProgress(packId) {
  const pack = getPackBySlug(packId);
  if (!pack) return null;
  const lp = state.lessonProgress[packId] || { completedLessonIds: [], currentLessonId: null };
  const total = pack.lessons.length;
  const done = lp.completedLessonIds.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const qp = state.quizProgress[packId] || {};
  const attempted = Object.values(qp);
  const quizAvg = attempted.length
    ? Math.round((attempted.filter(a => a.correct).length / attempted.length) * 100)
    : null;

  // currentLessonId is only trusted as "next" while it's actually still
  // incomplete — a lesson/dialogue finishing without explicitly
  // advancing currentLessonId (anything that completes via a path other
  // than the phrasebook lesson flow) would otherwise leave this pointing
  // at an already-finished item forever, sending "Continue Learning"
  // back to something with nothing left to do instead of the next item.
  const nextLesson =
    (lp.currentLessonId && !lp.completedLessonIds.includes(lp.currentLessonId)
      ? pack.lessons.find(l => l.id === lp.currentLessonId)
      : null) ||
    pack.lessons.find(l => !lp.completedLessonIds.includes(l.id)) ||
    null;

  return { total, done, pct, quizAvg, nextLesson, completedLessonIds: lp.completedLessonIds };
}

export function getContinuePack() {
  if (!state.currentPackId) return null;
  const progress = getPackProgress(state.currentPackId);
  if (!progress || progress.pct >= 100) return null;
  return { pack: getPackBySlug(state.currentPackId), progress };
}

export async function setCurrentLesson(packId, lessonId) {
  state.currentPackId = packId;
  state.lessonProgress[packId] = state.lessonProgress[packId] || { completedLessonIds: [], currentLessonId: null };
  state.lessonProgress[packId].currentLessonId = lessonId;
  await persist();
}

export async function completeLesson(packId, lessonId) {
  const lp = (state.lessonProgress[packId] = state.lessonProgress[packId] || { completedLessonIds: [], currentLessonId: null });
  if (!lp.completedLessonIds.includes(lessonId)) {
    lp.completedLessonIds.push(lessonId);
    state.xp += XP_PER_LESSON;
    markActivity();
    if (lp.completedLessonIds.length === 1) awardBadge('first-lesson');
    if (state.streak === 3) awardBadge('streak-3');

    const pack = getPackBySlug(packId);
    if (pack && lp.completedLessonIds.length === pack.lessons.length) {
      awardBadge('pack-complete-' + packId);
    }
  }
  await persist();
}

/** A quiz's recorded result, if it's been answered — null if it hasn't
 *  (i.e. skipped, or not yet reached). Lets a screen reconstruct
 *  "already answered" UI state from persisted progress rather than a
 *  transient variable that a page reload would otherwise wipe. */
export function getQuizResult(packId, quizId) {
  return state.quizProgress[packId]?.[quizId] || null;
}

/**
 * Records a quiz's result — but only the FIRST time it's answered.
 * This is the whole scoring guarantee: one quiz answered correctly is
 * worth exactly one mark, once, forever (until the pack is reset via
 * resetPackProgress). A quiz that's already been recorded is a no-op
 * here — no XP change, no overwriting a prior correct result with a
 * later one — so nothing (a page reload, revisiting the quiz screen,
 * a stray duplicate click) can inflate XP or flip an already-scored
 * result. A quiz that's never answered simply never gets an entry, so
 * it correctly contributes nothing to quizAvg either way.
 */
export async function recordQuizResult(packId, quizId, correct) {
  const qp = (state.quizProgress[packId] = state.quizProgress[packId] || {});
  if (qp[quizId]) return; // already scored — first attempt stands
  qp[quizId] = { correct, attempts: 1 };
  if (correct) {
    state.xp += XP_PER_QUIZ_CORRECT;
    markActivity();
  }
  await persist();
}

export async function recordSpeakingAttempt(packId, lessonId, result) {
  const sp = (state.speakingProgress[packId] = state.speakingProgress[packId] || {});
  const prev = sp[lessonId]?.attempts || 0;
  sp[lessonId] = { attempts: prev + 1, lastResult: result };
  await persist();
}

export function getOverallStats() {
  let lessonsCompleted = 0;
  const quizResults = [];
  // Only count data for packs that still exist. A pack that's since been
  // removed (or renamed) can leave behind lessonProgress/quizProgress/
  // unlockedPacks entries under its old id — without this filter those
  // orphaned entries would silently keep inflating these totals forever,
  // showing a "lessons completed" or "packs unlocked" number higher than
  // anything actually visible in the app.
  for (const packId of Object.keys(state.lessonProgress)) {
    if (!getPackBySlug(packId)) continue;
    lessonsCompleted += state.lessonProgress[packId].completedLessonIds.length;
  }
  for (const packId of Object.keys(state.quizProgress)) {
    if (!getPackBySlug(packId)) continue;
    Object.values(state.quizProgress[packId]).forEach(q => quizResults.push(q.correct));
  }
  const packsUnlocked = state.unlockedPacks.filter(packId => getPackBySlug(packId)).length;
  return {
    lessonsCompleted,
    quizAverage: quizResults.length ? Math.round((quizResults.filter(Boolean).length / quizResults.length) * 100) : null,
    packsUnlocked,
    streak: state.streak,
    xp: state.xp,
    badges: state.badges,
  };
}
