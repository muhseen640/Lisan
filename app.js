import { getPublishedPacks, getPackBySlug, getNewestPack, getCategories } from './content/packs.js';
import * as store from './lib/store.js';
import { validateCode } from './lib/unlockCode.js';
import { DISTRIBUTORS, whatsappLink } from './lib/distributors.js';
import { speak, playClip, speechSupported, recognitionSupported, practiceSpeaking } from './lib/speech.js';
import { icon } from './lib/icons.js';
import { t as translate } from './lib/i18n.js';

const app = document.getElementById('app');
let route = { screen: 'home' };
let quizState = {}; // per-quiz UI state (picked option, answered flag) —
                     // seeded from persisted store.getQuizResult() on first
                     // render of a quiz so it survives reloads; see screenQuiz
let dialogueState = {}; // per-dialogue UI state (phase, current turn, mic
                         // status) — transient, not persisted; see screenDialogue

/* ---------------- helpers ---------------- */
function h(strings, ...vals) {
  return strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function lang() { return store.getUiLang(); }
function t(key, ...args) { return translate(lang(), key, ...args); }
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}
function go(screen, params = {}) {
  route = { screen, ...params };
  render();
  window.scrollTo(0, 0);
}
function applyDocumentDirection() {
  const l = lang();
  document.documentElement.setAttribute('lang', l);
  document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
}
/** Numeric/Latin fragments (fractions, percentages) always render LTR,
 *  isolated from the surrounding paragraph direction either way. */
function num(s) { return h`<span class="en">${s}</span>`; }
/** Formats a premium pack's unlock price (e.g. "₦1,500") — always in
 *  Western digits/LTR via num(), regardless of interface language, the
 *  same way dates/percentages are handled elsewhere in the app.
 *  currencyDisplay: 'narrowSymbol' is used so the ₦ symbol renders
 *  reliably rather than falling back to the "NGN" code, which some
 *  browsers' default ICU data does for currencies not primarily
 *  associated with the 'en-US' locale.
 *  Returns '' for a pack with no price set (e.g. a free pack). */
function formatPrice(pack) {
  if (pack.price == null) return '';
  try {
    return num(new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pack.currency || 'NGN',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(pack.price));
  } catch (err) {
    return num(`${pack.currency || 'NGN'} ${pack.price}`);
  }
}
/** The pack title in whichever language is currently active. */
function primaryTitle(pack) { return lang() === 'en' ? pack.titleEn : pack.titleAr; }
/** The pack description in whichever UI language is active, wrapped so
 *  it always gets the right font/direction regardless of content. */
function packDesc(pack) {
  const isEn = lang() === 'en';
  return h`<span class="${isEn ? 'en' : 'ar'}">${esc(isEn ? pack.descEn : pack.descAr)}</span>`;
}
/** Wrap an English/Arabic content pair (lesson notes, quiz text) so it
 *  renders in whichever UI language is active, with correct font/dir. */
function bilingualText(en, ar) {
  const isEn = lang() === 'en';
  return h`<span class="${isEn ? 'en' : 'ar'}">${esc(isEn ? en : ar)}</span>`;
}
/** Which language lesson/quiz explanation notes render in — independent
 *  of the overall interface language (see lib/store.js#getExplainLang). */
function explainLang() { return store.getExplainLang(); }
/** Renders an explanation-note field (lesson usage note, quiz question
 *  or answer explanation) in whichever explanation language is active.
 *  Falls back to English if Hausa is selected but this particular item
 *  has no Hausa translation yet (packs can have partial coverage). */
function explainText(en, ar, ha) {
  const l = explainLang();
  if (l === 'ha') return ha ? h`<span class="ha">${esc(ha)}</span>` : h`<span class="en">${esc(en)}</span>`;
  if (l === 'ar') return h`<span class="ar">${esc(ar)}</span>`;
  return h`<span class="en">${esc(en)}</span>`;
}
/** Small AR/EN/HA switch for the explanation language — used above
 *  lesson usage notes and quiz question/explanation text. */
function explainLangToggle() {
  const l = explainLang();
  return h`
    <div class="explain-lang-toggle" role="group" aria-label="${t('explainLanguage')}">
      <button data-set-explain-lang="en" aria-pressed="${l === 'en'}">EN</button>
      <button data-set-explain-lang="ar" aria-pressed="${l === 'ar'}">AR</button>
      <button data-set-explain-lang="ha" aria-pressed="${l === 'ha'}">HA</button>
    </div>`;
}
/** Primary title + the *other* language as a smaller, correctly
 *  isolated/aligned secondary line — used on cards. */
function bilingualTitle(pack) {
  const isEn = lang() === 'en';
  const primary = isEn ? pack.titleEn : pack.titleAr;
  const secondary = isEn ? pack.titleAr : pack.titleEn;
  const secClass = isEn ? 'ar' : 'en';
  return h`${esc(primary)}<span class="${secClass}">${esc(secondary)}</span>`;
}

/* ---------------- app header (shared, professional) ---------------- */
function renderAppHeader() {
  const l = lang();
  return h`
  <header class="app-header">
    <div class="app-header__brand">
      <span class="app-header__mark">${icon('chat', { size: 17 })}</span>
      <span class="app-header__word">${esc(t('appName'))}</span>
    </div>
    <button class="lang-toggle" data-toggle-lang aria-label="${l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}">
      ${icon('globe', { size: 15 })}
      <span class="en">${l === 'ar' ? 'EN' : 'AR'}</span>
    </button>
  </header>`;
}

/* ---------------- bottom nav ---------------- */
function renderNav() {
  const top = ['home', 'learn', 'progress', 'settings'].includes(route.screen) ? route.screen : null;
  const items = [
    { id: 'home', i: 'home', label: t('navHome') },
    { id: 'learn', i: 'book', label: t('learn') },
    { id: 'progress', i: 'chart', label: t('navProgress') },
    { id: 'settings', i: 'settings', label: t('settings') },
  ];
  return h`<nav class="bottomnav">
    ${items.map(n => h`
      <button class="navbtn" data-nav="${n.id}" aria-current="${n.id === top}">
        <span class="icon">${icon(n.i, { size: 20 })}</span>${n.label}
      </button>`).join('')}
  </nav>`;
}

/* ---------------- pack card (boarding-pass style) ---------------- */
function packIconGlyph(pack) {
  return icon(pack.icon, { size: 24 });
}
function packCard(pack, opts = {}) {
  const progress = store.getPackProgress(pack.id);
  const unlocked = store.isUnlocked(pack.id);
  const isNew = opts.newBadge;
  return h`
  <div class="pass-card ${unlocked ? '' : 'pass-card--locked'}" data-open-pack="${pack.slug}">
    <div class="pass-card__main">
      <div class="pass-card__top">
        <span class="pass-card__icon">${packIconGlyph(pack)}</span>
        <div>
          <p class="pass-card__title">${bilingualTitle(pack)}</p>
        </div>
      </div>
      <p class="pass-card__desc">${packDesc(pack)}</p>
      ${unlocked ? h`
        <div class="progress-track"><div class="progress-fill" style="width:${progress.pct}%"></div></div>
        <div class="progress-meta"><span>${num(`${progress.done}/${progress.total}`)} ${t('lessons')}</span><span>${num(progress.pct + '%')}</span></div>
      ` : h`
        <span class="badge badge--locked">${icon('lock', { size: 12 })} ${t('subscriberExclusive')}</span>
        ${pack.price != null ? h`<span class="badge badge--price">${formatPrice(pack)}</span>` : ''}
      `}
      ${unlocked && progress.total > 0 && progress.done === progress.total ? h`<div style="margin-top:8px"><span class="badge badge--free">${icon('check', { size: 12 })} ${t('packCompleteLabel')}</span></div>`
        : isNew ? `<div style="margin-top:8px"><span class="badge badge--new">${icon('star', { size: 12 })} ${t('newThisMonth')}</span></div>`
        : pack.access === 'free' ? `<div style="margin-top:8px"><span class="badge badge--free">${t('free')}</span></div>` : ''}
    </div>
    <div class="pass-card__stub">
      <span class="icon">${icon(unlocked ? 'unlock' : 'lock', { size: 18 })}</span>
      <span class="pct">${unlocked ? progress.pct + '%' : ''}</span>
    </div>
  </div>`;
}

/* ---------------- HOME ---------------- */
function screenHome() {
  const cont = store.getContinuePack();
  const newest = getNewestPack();
  const cats = getCategories();

  return h`
    <div class="topbar">
      <h1>${esc(t('greeting'))}</h1>
      <p>${esc(t('greetingSub'))}</p>
    </div>

    ${cont ? h`
      <div class="continue-card">
        <p class="eyebrow">${t('continueLearning')}</p>
        <h3>${packIconGlyph(cont.pack)} ${esc(primaryTitle(cont.pack))}</h3>
        <div class="progress-track"><div class="progress-fill" style="width:${cont.progress.pct}%"></div></div>
        <div class="progress-meta"><span>${t('lessonLabel')} ${num(`${cont.progress.done + 1}/${cont.progress.total}`)}</span><span>${num(cont.progress.pct + '%')}</span></div>
        <button class="btn btn--gold btn--block" data-open-pack="${cont.pack.slug}">${t('continueLearning')}</button>
      </div>
    ` : h`
      <div class="empty-hero">
        <p>${t('startFirstJourney')}</p>
        <button class="btn btn--primary" data-open-pack="${getPublishedPacks()[0].slug}">${t('startNow')}</button>
      </div>
    `}

    ${newest ? h`
      <div class="section-head"><h2>${icon('star', { size: 15 })} ${t('newThisMonth')}</h2></div>
      <div class="new-banner">
        <div class="new-banner__row">
          <span class="pass-card__icon">${packIconGlyph(newest)}</span>
          <div>
            <p class="pass-card__title">${bilingualTitle(newest)}</p>
          </div>
        </div>
        <ul>
          <li>${icon('book', { size: 13 })} ${num(newest.lessons.length)} ${t('lessons')}</li>
          <li>${icon('check', { size: 13 })} ${num(newest.quizzes.length)} ${t('quizzes')}</li>
          <li>${icon('mic', { size: 13 })} ${t('speakingPractice')}</li>
        </ul>
        ${newest.access === 'premium' ? h`<span class="badge badge--locked">${icon('lock', { size: 12 })} ${t('subscriberExclusive')}</span>${newest.price != null ? h`<span class="badge badge--price">${formatPrice(newest)}</span>` : ''}<button class="btn btn--gold btn--block" style="margin-top:10px" data-open-pack="${newest.slug}">${t('openPack')}</button>`
                                      : h`<button class="btn btn--primary btn--block" data-open-pack="${newest.slug}">${t('startLearning')}</button>`}
      </div>
    ` : ''}

    <div class="section-head"><h2>${icon('book', { size: 15 })} ${t('explorePacks')}</h2></div>
    <div class="grid-2">
      ${cats.map(c => h`<div class="cat-card" data-open-pack="${getPublishedPacks().find(p => p.category === c.id).slug}">
        <span class="icon">${icon(c.icon, { size: 24 })}</span><span class="name">${esc(lang() === 'en' ? c.labelEn : c.labelAr)}</span>
      </div>`).join('')}
    </div>
  `;
}

/* ---------------- LEARN ---------------- */
function screenLearn() {
  const all = getPublishedPacks();
  const unlocked = all.filter(p => store.isUnlocked(p.id));
  const locked = all.filter(p => !store.isUnlocked(p.id));
  const newest = getNewestPack();

  return h`
    <div class="screen-title">${t('learn')}</div>
    ${unlocked.length ? h`
      <div class="section-head"><h2>${t('myUnlockedPacks')}</h2></div>
      ${unlocked.map(p => packCard(p)).join('')}
    ` : ''}
    ${locked.length ? h`
      <div class="section-head"><h2>${t('explore')}</h2></div>
      ${locked.map(p => packCard(p, { newBadge: newest && p.id === newest.id })).join('')}
    ` : ''}
  `;
}

/* ---------------- PACK DETAIL / UNLOCK ---------------- */
function screenPack(slug) {
  const pack = getPackBySlug(slug);
  if (!pack) return h`<div class="screen-title">${t('packNotFound')}</div>`;
  const unlocked = store.isUnlocked(pack.id);
  const progress = store.getPackProgress(pack.id);

  return h`
    <div class="subhead">
      <button class="backbtn" data-back>${icon('chevron', { size: 16 })}</button>
      <h2>${packIconGlyph(pack)} ${esc(primaryTitle(pack))}</h2>
    </div>
    <div style="padding:8px 20px 20px">
      <p class="pack-desc">${packDesc(pack)}</p>
      ${unlocked ? h`
        <div class="progress-track"><div class="progress-fill" style="width:${progress.pct}%"></div></div>
        <div class="progress-meta"><span>${num(`${progress.done}/${progress.total}`)} ${t('lessons')}</span><span>${num(progress.pct + '%')}</span></div>
        ${progress.quizAvg !== null ? `<p style="font-size:13px;opacity:.7;margin-top:8px">${t('quizAverage')}: ${num(progress.quizAvg + '%')}</p>` : ''}
        ${progress.total > 0 && progress.done === progress.total ? h`
          <div style="margin-top:12px"><span class="badge badge--free">${icon('check', { size: 12 })} ${t('packCompleteLabel')}</span></div>
          <button class="btn btn--primary btn--block" style="margin-top:16px" data-practice-again="${pack.slug}">${icon('flame', { size: 14 })} ${t('practiceAgain')}</button>
        ` : h`
          <button class="btn btn--primary btn--block" style="margin-top:16px" data-start-lesson="${pack.slug}:${progress.nextLesson ? progress.nextLesson.id : pack.lessons[0].id}">
            ${progress.done > 0 ? t('continueLearning') : t('startLearning')}
          </button>
        `}
      ` : h`
        <div style="margin-top:14px">
          <span class="badge badge--locked">${icon('lock', { size: 12 })} ${t('subscriberExclusive')}</span>
        </div>
        ${pack.price != null ? h`<div class="price-callout"><span class="price-callout__amount">${formatPrice(pack)}</span><span class="price-callout__note">${t('oneTimeUnlock')}</span></div>` : ''}
        <button class="btn btn--gold btn--block" style="margin-top:16px" data-unlock="${pack.slug}">${t('enterUnlockCode')}</button>
      `}
    </div>
  `;
}

/* ---------------- LESSON ---------------- */
function screenLesson(slug, lessonId) {
  const pack = getPackBySlug(slug);
  const idx = pack.lessons.findIndex(l => l.id === lessonId);
  const lesson = pack.lessons[idx];
  const quiz = pack.quizzes.find(q => q.lessonId === lessonId);
  const practiceLang = store.getPracticeLang();
  const targetText = practiceLang === 'ar' ? lesson.ar : lesson.en;
  const targetLangCode = practiceLang === 'ar' ? 'ar-SA' : 'en-US';

  return h`
    <div class="subhead">
      <button class="backbtn" data-open-pack="${pack.slug}">${icon('chevron', { size: 16 })}</button>
      <h2>${esc(primaryTitle(pack))}</h2>
    </div>
    <div class="lesson-wrap">
      <div class="lesson-progress-header">
        <span>${t('lessonLabel')} ${num(`${idx + 1}/${pack.lessons.length}`)}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round(((idx) / pack.lessons.length) * 100)}%"></div></div>
      </div>

      <div class="sentence-card">
        <div class="sentence-row">
          <p class="ar-sentence">${esc(lesson.ar)}</p>
          <button class="mini-listen" data-listen="${esc(lesson.ar)}" data-listen-lang="ar-SA" data-listen-audio="${esc(lesson.arAudio || '')}" aria-label="${t('listen')}">${icon('headphones', { size: 16 })}</button>
        </div>
        <div class="meaning-row">
          <p class="en-sentence">${esc(lesson.en)}</p>
          <button class="mini-listen" data-listen="${esc(lesson.en)}" data-listen-lang="en-US" data-listen-audio="${esc(lesson.enAudio || '')}" aria-label="${t('listen')}">${icon('headphones', { size: 16 })}</button>
        </div>
        ${lesson.ha ? h`<div class="meaning-row meaning-row--ha"><p class="ha-sentence">${esc(lesson.ha)}</p></div>` : ''}

        <div class="practice-block">
          <div class="practice-toggle">
            <button data-set-practice-lang="ar" aria-pressed="${practiceLang === 'ar'}">${t('speakArabic')}</button>
            <button data-set-practice-lang="en" aria-pressed="${practiceLang === 'en'}">${t('speakEnglish')}</button>
          </div>
          <div class="audio-row">
            <button class="btn btn--outline btn--sm" data-listen="${esc(targetText)}" data-listen-lang="${targetLangCode}" data-listen-audio="${esc((practiceLang === 'ar' ? lesson.arAudio : lesson.enAudio) || '')}">${icon('headphones', { size: 14 })} ${t('listen')}</button>
            <button class="btn btn--outline btn--sm" data-listen-slow="${esc(targetText)}" data-listen-lang="${targetLangCode}" data-listen-audio="${esc((practiceLang === 'ar' ? lesson.arAudio : lesson.enAudio) || '')}">${icon('slow', { size: 14 })} ${t('slow')}</button>
            <button class="btn btn--primary btn--sm" data-practice="${esc(targetText)}" data-practice-lang="${targetLangCode}" data-pack="${pack.slug}" data-lesson="${lesson.id}">${icon('mic', { size: 14 })} ${t('practice')}</button>
          </div>
          <div class="speak-feedback" id="speak-feedback"></div>
        </div>
      </div>

      <div class="explain-box">
        ${explainLangToggle()}
        <p>${explainText(lesson.explainEn, lesson.explainAr, lesson.explainHa)}</p>
      </div>

      <div class="lesson-actions">
        ${quiz ? h`<button class="btn btn--gold btn--block" data-open-quiz="${pack.slug}:${lesson.id}">${t('nextQuiz')}</button>`
               : h`<button class="btn btn--primary btn--block" data-complete-lesson="${pack.slug}:${lesson.id}">${t('doneNext')}</button>`}
      </div>
    </div>
  `;
}

/* ---------------- QUIZ ---------------- */
function screenQuiz(slug, lessonId) {
  const pack = getPackBySlug(slug);
  const quiz = pack.quizzes.find(q => q.lessonId === lessonId);
  const key = slug + ':' + quiz.id;
  // Reconstruct "already answered" state from persisted progress (not
  // just the transient quizState) so a page reload — or navigating back
  // to a quiz answered earlier this session — can never re-open a quiz
  // that's already been scored. picked stays null on restore since we
  // don't persist which specific wrong option was chosen, only the
  // correct/incorrect result; the correct option still highlights.
  if (!quizState[key]) {
    const persisted = store.getQuizResult(pack.id, quiz.id);
    quizState[key] = persisted ? { picked: null, answered: true, correct: persisted.correct } : { picked: null, answered: false };
  }
  const qs = quizState[key];

  return h`
    <div class="subhead">
      <button class="backbtn" data-open-pack="${pack.slug}">${icon('chevron', { size: 16 })}</button>
      <h2>${t('quizTitle')}</h2>
    </div>
    <div class="lesson-wrap">
      ${explainLangToggle()}
      <p class="quiz-q">${explainText(quiz.questionEn, quiz.questionAr, quiz.questionHa)}</p>
      <div class="quiz-opts">
        ${quiz.options.map((o, i) => {
          let cls = 'quiz-opt';
          if (qs.answered) {
            if (o.correct) cls += ' correct';
            else if (i === qs.picked) cls += ' incorrect';
          }
          return h`<button class="${cls}" data-quiz-opt="${key}:${i}" aria-pressed="${i === qs.picked}" ${qs.answered ? 'disabled' : ''}>${esc(o.ar)}</button>`;
        }).join('')}
      </div>
      ${qs.answered ? h`
        <p class="quiz-result ${qs.correct ? 'ok' : 'no'}">${qs.correct ? icon('check', { size: 16 }) + ' ' + t('correctAnswer') : t('incorrectAnswer')}</p>
        <p class="quiz-explain">${explainText(quiz.explainEn, quiz.explainAr, quiz.explainHa)}</p>
        <div class="lesson-actions">
          <button class="btn btn--primary btn--block" data-complete-lesson="${pack.slug}:${lessonId}">${t('continueBtn')}</button>
        </div>
      ` : ''}
    </div>
  `;
}

/* ---------------- DIALOGUE ---------------- */
function dialogueKey(slug, dialogueId) { return slug + ':' + dialogueId; }

function dlgFeedbackText(ds) {
  if (ds.listening) return t('listening');
  if (ds.feedback === 'correct') return t('excellent');
  if (ds.feedback === 'retry') return t('tryAgain');
  if (ds.feedback === 'reveal') return t('incorrectAnswer');
  return t('tapToSpeak');
}

/** Label for a dialogue role in the "practice as" picker — uses the
 *  pack's own labels (e.g. "Waiter"/"Customer") if it provides them,
 *  otherwise a generic "Person 1"/"Person 2" fallback. */
function roleLabel(pack, role) {
  const isEn = lang() === 'en';
  const custom = role === 'them'
    ? (isEn ? pack.themLabelEn : pack.themLabelAr)
    : (isEn ? pack.youLabelEn : pack.youLabelAr);
  return custom || t(role === 'them' ? 'roleThem' : 'roleYou');
}

function screenDialogue(slug, dialogueId) {
  const pack = getPackBySlug(slug);
  const dlg = pack.lessons.find(l => l.id === dialogueId);
  const key = dialogueKey(slug, dialogueId);
  if (!dialogueState[key]) {
    dialogueState[key] = {
      phase: 'intro',       // 'intro' | 'intro-done' | 'practice' | 'complete'
      role: null,           // locked in from store.getDialogueRole() once practice starts
      turnIndex: -1,
      attempts: 0,
      feedback: null,
      listening: false,
      correctCount: 0,
      youTurnCount: 0,       // computed once practice starts, based on the chosen role
    };
  }
  const ds = dialogueState[key];
  // Before practice starts, reflect the live role setting so switching
  // it updates the preview immediately; once locked in (practice or
  // complete), the role that was actually practiced never changes
  // retroactively just because the global preference was flipped later.
  const role = ds.role || store.getDialogueRole();

  const header = h`
    <div class="subhead">
      <button class="backbtn" data-open-pack="${pack.slug}">${icon('chevron', { size: 16 })}</button>
      <h2>${esc(lang() === 'en' ? dlg.titleEn : dlg.titleAr)}</h2>
    </div>`;

  if (ds.phase === 'complete') {
    return header + h`
      <div class="lesson-wrap">
        <div class="dlg-complete">
          <div class="dlg-complete__icon">${icon('trophy', { size: 40 })}</div>
          <h3>${t('dialogueComplete')}</h3>
          <p class="dlg-complete__score">${t('score')}: ${num(`${ds.correctCount}/${ds.youTurnCount}`)}</p>
          <button class="btn btn--primary btn--block" data-open-pack="${pack.slug}">${t('backToPack')}</button>
        </div>
      </div>`;
  }

  // During practice, only show turns up to the current one — the
  // dialogue reveals itself as it's stepped through, like the intro
  // playback did. Before practice starts (intro/intro-done), the full
  // transcript is shown since the whole thing has already been heard.
  const visibleTurns = ds.phase === 'practice' ? dlg.turns.slice(0, ds.turnIndex + 1) : dlg.turns;
  const bubbles = visibleTurns.map((turn, i) => {
    const isCurrent = ds.phase === 'practice' && i === ds.turnIndex;
    // Visual side (left/muted vs right/teal) follows the CHOSEN role,
    // not the literal 'them'/'you' tag — so playing the waiter's part
    // still shows the waiter's lines on the right, as "your" side.
    const side = turn.speaker === role ? 'you' : 'them';
    return h`
      <div class="dlg-turn dlg-turn--${side} ${isCurrent ? 'dlg-turn--current' : ''}">
        <p class="dlg-turn__ar">${esc(turn.ar)}</p>
        <p class="dlg-turn__en">${esc(turn.en)}</p>
      </div>`;
  }).join('');

  let controls = '';
  if (ds.phase === 'intro' || ds.phase === 'intro-done') {
    const roleToggle = h`
      <div class="dlg-role-toggle">
        <span class="dlg-role-toggle__label">${t('practiceAsLabel')}</span>
        <div class="dlg-role-toggle__btns">
          <button data-dlg-set-role="you" aria-pressed="${role === 'you'}">${esc(roleLabel(pack, 'you'))}</button>
          <button data-dlg-set-role="them" aria-pressed="${role === 'them'}">${esc(roleLabel(pack, 'them'))}</button>
        </div>
      </div>`;
    if (ds.phase === 'intro') {
      controls = roleToggle + h`
        <button class="btn btn--primary btn--block" data-dlg-play="${key}">
          ${icon('play', { size: 16 })} ${t('playConversation')}
        </button>`;
    } else {
      controls = roleToggle + h`
        <div class="dlg-choice">
          <button class="btn btn--outline btn--block" data-dlg-play="${key}">${icon('headphones', { size: 16 })} ${t('listenAgain')}</button>
          <button class="btn btn--gold btn--block" data-dlg-start-practice="${key}">${icon('mic', { size: 16 })} ${t('practice')}</button>
        </div>`;
    }
  } else if (ds.phase === 'practice') {
    const turn = dlg.turns[ds.turnIndex];
    if (turn && turn.speaker === role) {
      controls = h`
        <p class="dlg-prompt">${t('yourTurnPrompt')}</p>
        <button class="dlg-mic-btn ${ds.listening ? 'dlg-mic-btn--listening' : ''}" data-dlg-speak="${key}" ${ds.listening ? 'disabled' : ''} aria-label="${t('tapToSpeak')}">
          ${icon('mic', { size: 28 })}
        </button>
        <div class="dlg-feedback ${ds.feedback || ''}">${dlgFeedbackText(ds)}</div>
      `;
    } else {
      controls = h`<div class="dlg-feedback">${icon('headphones', { size: 15 })} ${t('listening')}</div>`;
    }
  }

  return header + h`
    <div class="lesson-wrap">
      <div class="dlg-transcript">${bubbles}</div>
      ${controls}
    </div>`;
}

/**
 * Plays a dialogue's turns back to back (the initial "listen to the
 * whole conversation" pass, and "Listen Again"), chaining via
 * playClip's onEnded so the next line only starts once the previous
 * one actually finishes — not a guessed delay. Always lands back on
 * 'intro-done' when finished, whether this was the first play or a
 * replay, so the Listen Again / Practice choice reappears either way.
 */
/** Brief pause between turns during the full listen-through — without
 *  it, lines run into each other with zero breathing room, which reads
 *  as rushed rather than like a real conversation. */
const DIALOGUE_TURN_GAP_MS = 700;

function playIntroFrom(key, index) {
  const [slug, dialogueId] = key.split(':');
  const pack = getPackBySlug(slug);
  const dlg = pack.lessons.find(l => l.id === dialogueId);
  const ds = dialogueState[key];
  if (!ds) return;

  if (index >= dlg.turns.length) {
    ds.phase = 'intro-done';
    render();
    return;
  }
  const turn = dlg.turns[index];
  playClip(turn.audio, {
    fallbackText: turn.ar,
    fallbackLang: 'ar-SA',
    onEnded: () => setTimeout(() => playIntroFrom(key, index + 1), DIALOGUE_TURN_GAP_MS),
  });
}

/**
 * Steps to the next turn (or finishes the dialogue). Turns matching the
 * role NOT being practiced auto-play and then advance again on their
 * own once the audio ends — no tap needed. Turns matching the
 * practiced role just render and wait for a mic tap (see
 * handleDialogueSpeak); this function doesn't loop for those.
 */
async function advanceDialogueTurn(key) {
  const [slug, dialogueId] = key.split(':');
  const pack = getPackBySlug(slug);
  const dlg = pack.lessons.find(l => l.id === dialogueId);
  const ds = dialogueState[key];
  if (!ds) return;

  ds.turnIndex += 1;
  ds.attempts = 0;
  ds.feedback = null;
  ds.listening = false;

  if (ds.turnIndex >= dlg.turns.length) {
    ds.phase = 'complete';
    await store.completeLesson(pack.id, dialogueId);
    // Mirror the phrasebook lesson flow: explicitly point currentLessonId
    // at whatever comes next, rather than leaving it on the dialogue that
    // just finished. getPackProgress's nextLesson fallback would recover
    // from this on its own now, but keeping currentLessonId itself
    // accurate is worth doing directly rather than only leaning on that
    // fallback.
    const idx = pack.lessons.findIndex(l => l.id === dialogueId);
    const next = pack.lessons[idx + 1];
    if (next) await store.setCurrentLesson(pack.id, next.id);
    render();
    return;
  }

  render();

  const turn = dlg.turns[ds.turnIndex];
  if (turn.speaker !== ds.role) {
    playClip(turn.audio, {
      fallbackText: turn.ar,
      fallbackLang: 'ar-SA',
      onEnded: () => advanceDialogueTurn(key),
    });
  }
  // A turn matching ds.role: nothing more to do here — screenDialogue
  // already rendered the mic button, and handleDialogueSpeak takes it
  // from here.
}

/**
 * Handles one mic tap on a turn matching the practiced role: listens,
 * scores against the app's normal one-mark-per-correct-answer rule
 * (same store.recordQuizResult used by regular quizzes — no separate
 * scoring system to keep in sync), gives one retry on a miss or on
 * silence, then auto-advances either way.
 */
function handleDialogueSpeak(key) {
  const [slug, dialogueId] = key.split(':');
  const pack = getPackBySlug(slug);
  const dlg = pack.lessons.find(l => l.id === dialogueId);
  const ds = dialogueState[key];
  if (!ds || ds.phase !== 'practice') return;
  const turn = dlg.turns[ds.turnIndex];
  if (!turn || turn.speaker !== ds.role) return;

  ds.listening = true;
  ds.feedback = null;
  render();

  practiceSpeaking(turn.ar, 'ar-SA', async result => {
    ds.listening = false;
    const ok = result.supported && result.ok;
    const quizId = `${dialogueId}-t${ds.turnIndex}`;

    if (ok) {
      ds.feedback = 'correct';
      ds.correctCount += 1;
      render();
      await store.recordQuizResult(pack.id, quizId, true);
      setTimeout(() => advanceDialogueTurn(key), 900);
    } else if (ds.attempts < 1) {
      // First miss (wrong answer or silence) — one retry, same turn,
      // user taps the mic again themselves (no auto-restart).
      ds.attempts += 1;
      ds.feedback = 'retry';
      render();
    } else {
      ds.feedback = 'reveal';
      render();
      await store.recordQuizResult(pack.id, quizId, false);
      setTimeout(() => advanceDialogueTurn(key), 1800);
    }
  });
}

/* ---------------- PROGRESS ---------------- */
const BADGE_ICON = { 'first-lesson': 'trophy', 'streak-3': 'flame' };
function screenProgress() {
  const s = store.getOverallStats();
  const allBadgeIds = ['first-lesson', 'streak-3'].concat(
    getPublishedPacks().map(p => 'pack-complete-' + p.id)
  );

  return h`
    <div class="screen-title">${t('myProgress')}</div>
    <div class="stat-grid">
      <div class="stat-card"><div class="val">${num(s.lessonsCompleted)}</div><div class="lbl">${t('lessonsCompleted')}</div></div>
      <div class="stat-card"><div class="val">${num(s.packsUnlocked)}</div><div class="lbl">${t('packsUnlocked')}</div></div>
      <div class="stat-card"><div class="val">${num((s.quizAverage ?? '—') + (s.quizAverage !== null ? '%' : ''))}</div><div class="lbl">${t('quizAverage')}</div></div>
      <div class="stat-card"><div class="val">${num(s.streak)}</div><div class="lbl">${t('streak')}</div></div>
    </div>
    <div class="stat-grid" style="grid-template-columns:1fr">
      <div class="stat-card"><div class="val">${num(s.xp)} <span class="xp-label">${t('xpPoints')}</span></div></div>
    </div>

    <div class="section-head"><h2>${t('badges')}</h2></div>
    <div class="badges-row">
      ${allBadgeIds.map(id => {
        const iconName = BADGE_ICON[id] || 'trophy';
        const earned = s.badges.includes(id);
        return h`<div class="stamp ${earned ? '' : 'locked'}">${icon(iconName, { size: 22 })}</div>`;
      }).join('')}
    </div>

    <div class="section-head"><h2>${t('packProgress')}</h2></div>
    ${getPublishedPacks().filter(p => store.isUnlocked(p.id)).map(p => packCard(p)).join('') || `<p style="padding:0 20px;opacity:.6;font-size:13px">${t('noUnlockedPacks')}</p>`}
  `;
}

/* ---------------- SETTINGS ---------------- */
function screenSettings() {
  const l = lang();
  return h`
    <div class="screen-title">${t('settings')}</div>
    <div class="settings-list">
      <div class="settings-row">
        <span>${icon('globe', { size: 16 })} ${t('interfaceLanguage')}</span>
        <button class="lang-toggle lang-toggle--inline" data-toggle-lang>
          <span class="${l === 'ar' ? 'en' : 'ar'}">${l === 'ar' ? 'English' : 'العربية'}</span>
          <span class="chev">${icon('chevron', { size: 12 })}</span>
        </button>
      </div>
      <div class="settings-row">
        <span>${icon('chat', { size: 16 })} ${t('explainLanguage')}</span>
        ${explainLangToggle()}
      </div>
      <div class="settings-row"><span>${icon('device', { size: 16 })} ${t('dataStorage')}<small>${t('dataStorageDesc')}</small></span></div>
      <div class="settings-row"><span>${icon('mic', { size: 16 })} ${t('speechRecognition')}<small>${recognitionSupported() ? t('supported') : t('notSupported')}</small></span><span>${icon(recognitionSupported() ? 'check' : 'x', { size: 16 })}</span></div>
      <div class="settings-row"><span>${icon('headphones', { size: 16 })} ${t('ttsSupported')}<small>${speechSupported() ? t('ttsSupportedDesc') : t('ttsNotSupportedDesc')}</small></span><span>${icon(speechSupported() ? 'check' : 'x', { size: 16 })}</span></div>
      <div class="settings-row"><span>${t('version')}</span><span class="en">v1.2.0</span></div>
    </div>
  `;
}

/* ---------------- UNLOCK MODAL ---------------- */
let modalOpen = null;
function renderModal() {
  if (!modalOpen) return '';
  const pack = getPackBySlug(modalOpen.slug);
  return h`
  <div class="modal-backdrop">
    <div class="spacer" data-modal-backdrop></div>
    <div class="modal-sheet">
      <h3>${t('unlockThisPack')}</h3>
      <p>${t('unlockPrompt', primaryTitle(pack))}</p>
      ${pack.price != null ? h`<p class="modal-price">${t('price')}: <strong>${formatPrice(pack)}</strong></p>` : ''}
      <input class="code-input" id="unlock-input" placeholder="${t('codePlaceholder')}" autocapitalize="characters" value="${esc(modalOpen.value || '')}" />
      <div class="modal-msg ${modalOpen.status || ''}">${modalOpen.msgKey ? t(modalOpen.msgKey) : ''}</div>
      <button class="btn btn--gold btn--block" id="unlock-submit" ${modalOpen.loading ? 'disabled' : ''}>${modalOpen.loading ? t('verifying') : t('unlockPack')}</button>
      <button class="modal-close" data-modal-backdrop>${t('cancel')}</button>
      <button class="whatsapp-cta" id="whatsapp-cta" type="button">
        ${icon('whatsapp', { size: 16 })}
        <span>${t('noCodeYet')} <strong>${t('contactDistributor')}</strong></span>
      </button>
    </div>
  </div>`;
}

/* ---------------- DISTRIBUTOR DRAWER ---------------- */
let drawerOpen = false;
function renderDistributorDrawer() {
  if (!drawerOpen) return '';
  return h`
  <div class="drawer-backdrop">
    <div class="spacer" data-drawer-backdrop></div>
    <div class="drawer-sheet">
      <h3>${t('chooseDistributor')}</h3>
      <p class="drawer-sub">${t('chooseDistributorSub')}</p>
      <ul class="distributor-list">
        ${DISTRIBUTORS.map(d => h`
          <li>
            <a class="distributor-row" href="${whatsappLink(d.phone)}" target="_blank" rel="noopener">
              <span class="distributor-row__icon">${icon('whatsapp', { size: 18 })}</span>
              <span class="distributor-row__text">
                <span class="distributor-row__name">${esc(d.name)}</span>
                <span class="distributor-row__phone">+${esc(d.phone)}</span>
              </span>
              <span class="distributor-row__go">${icon('chevron', { size: 16 })}</span>
            </a>
          </li>`).join('')}
      </ul>
      <button class="modal-close" data-drawer-backdrop>${t('cancel')}</button>
    </div>
  </div>`;
}

/* ---------------- render + events ---------------- */
function render() {
  applyDocumentDirection();
  let body = '';
  if (route.screen === 'home') body = screenHome();
  else if (route.screen === 'learn') body = screenLearn();
  else if (route.screen === 'progress') body = screenProgress();
  else if (route.screen === 'settings') body = screenSettings();
  else if (route.screen === 'pack') body = screenPack(route.slug);
  else if (route.screen === 'lesson') {
    const pack = getPackBySlug(route.slug);
    const item = pack && pack.lessons.find(l => l.id === route.lessonId);
    body = (item && item.turns) ? screenDialogue(route.slug, route.lessonId) : screenLesson(route.slug, route.lessonId);
  }
  else if (route.screen === 'quiz') body = screenQuiz(route.slug, route.lessonId);

  app.innerHTML = renderAppHeader() + body + renderNav() + renderModal() + renderDistributorDrawer();
  const inp = document.getElementById('unlock-input');
  if (inp) inp.focus({ preventScroll: true });
}

document.addEventListener('click', async e => {
  const langToggle = e.target.closest('[data-toggle-lang]');
  if (langToggle) {
    await store.setUiLang(lang() === 'ar' ? 'en' : 'ar');
    return render();
  }

  const nav = e.target.closest('[data-nav]');
  if (nav) return go(nav.dataset.nav);

  const back = e.target.closest('[data-back]');
  if (back) return go('learn');

  const openPack = e.target.closest('[data-open-pack]');
  if (openPack) return go('pack', { slug: openPack.dataset.openPack });

  const startLesson = e.target.closest('[data-start-lesson]');
  if (startLesson) {
    const [slug, lessonId] = startLesson.dataset.startLesson.split(':');
    await store.setCurrentLesson(getPackBySlug(slug).id, lessonId);
    return go('lesson', { slug, lessonId });
  }

  const listen = e.target.closest('[data-listen]');
  if (listen) {
    const audioUrl = listen.dataset.listenAudio;
    const langCode = listen.dataset.listenLang || 'en-US';
    if (audioUrl) playClip(audioUrl, { fallbackText: listen.dataset.listen, fallbackLang: langCode });
    else speak(listen.dataset.listen, { lang: langCode });
    return;
  }
  const listenSlow = e.target.closest('[data-listen-slow]');
  if (listenSlow) {
    const audioUrl = listenSlow.dataset.listenAudio;
    const langCode = listenSlow.dataset.listenLang || 'en-US';
    if (audioUrl) playClip(audioUrl, { slow: true, fallbackText: listenSlow.dataset.listenSlow, fallbackLang: langCode });
    else speak(listenSlow.dataset.listenSlow, { slow: true, lang: langCode });
    return;
  }

  const setPracticeLang = e.target.closest('[data-set-practice-lang]');
  if (setPracticeLang) {
    await store.setPracticeLang(setPracticeLang.dataset.setPracticeLang);
    return render();
  }

  const setExplainLang = e.target.closest('[data-set-explain-lang]');
  if (setExplainLang) {
    await store.setExplainLang(setExplainLang.dataset.setExplainLang);
    return render();
  }

  const dlgPlay = e.target.closest('[data-dlg-play]');
  if (dlgPlay) {
    playIntroFrom(dlgPlay.dataset.dlgPlay, 0);
    return;
  }

  const dlgSetRole = e.target.closest('[data-dlg-set-role]');
  if (dlgSetRole) {
    await store.setDialogueRole(dlgSetRole.dataset.dlgSetRole);
    return render();
  }

  const dlgStartPractice = e.target.closest('[data-dlg-start-practice]');
  if (dlgStartPractice) {
    const key = dlgStartPractice.dataset.dlgStartPractice;
    const ds = dialogueState[key];
    if (ds) {
      const [slug, dialogueId] = key.split(':');
      const pack = getPackBySlug(slug);
      const dlg = pack.lessons.find(l => l.id === dialogueId);
      // Lock in the role for this practice run — see screenDialogue for
      // why it's read live before this point but frozen from here on.
      ds.role = store.getDialogueRole();
      ds.youTurnCount = dlg.turns.filter(t2 => t2.speaker === ds.role).length;
      ds.phase = 'practice';
      ds.turnIndex = -1;
      advanceDialogueTurn(key);
    }
    return;
  }

  const dlgSpeak = e.target.closest('[data-dlg-speak]');
  if (dlgSpeak) {
    handleDialogueSpeak(dlgSpeak.dataset.dlgSpeak);
    return;
  }

  const practice = e.target.closest('[data-practice]');
  if (practice) {
    const fb = document.getElementById('speak-feedback');
    fb.textContent = t('listening');
    fb.className = 'speak-feedback';
    practiceSpeaking(practice.dataset.practice, practice.dataset.practiceLang || 'en-US', async result => {
      const packSlug = practice.dataset.pack, lessonId = practice.dataset.lesson;
      const pack = getPackBySlug(packSlug);
      if (!result.supported) {
        fb.textContent = t('listenAndRepeat');
        fb.className = 'speak-feedback';
        return;
      }
      await store.recordSpeakingAttempt(pack.id, lessonId, result.ok ? 'ok' : 'retry');
      fb.textContent = result.ok ? t('excellent') : t('tryAgain');
      fb.className = 'speak-feedback ' + (result.ok ? 'ok' : 'retry');
    });
    return;
  }

  const openQuiz = e.target.closest('[data-open-quiz]');
  if (openQuiz) { const [slug, lessonId] = openQuiz.dataset.openQuiz.split(':'); return go('quiz', { slug, lessonId }); }

  const quizOpt = e.target.closest('[data-quiz-opt]');
  if (quizOpt) {
    const [key, idxStr] = quizOpt.dataset.quizOpt.split(/:(?=[^:]+$)/);
    const [slug, quizId] = key.split(':');
    const pack = getPackBySlug(slug);
    const quiz = pack.quizzes.find(q => q.id === quizId);
    // Guard against scoring twice: the option buttons are disabled once
    // answered, but this stops any stray/duplicate click too. The
    // store-level guard in recordQuizResult is the real backstop, but
    // checking here also avoids a pointless render + persist call.
    if (quizState[key]?.answered) return;
    const idx = Number(idxStr);
    const correct = quiz.options[idx].correct;
    quizState[key] = { picked: idx, answered: true, correct };
    await store.recordQuizResult(pack.id, quiz.id, correct);
    return render();
  }

  const completeLesson = e.target.closest('[data-complete-lesson]');
  if (completeLesson) {
    const [slug, lessonId] = completeLesson.dataset.completeLesson.split(':');
    const pack = getPackBySlug(slug);
    await store.completeLesson(pack.id, lessonId);
    const idx = pack.lessons.findIndex(l => l.id === lessonId);
    const next = pack.lessons[idx + 1];
    if (next) {
      await store.setCurrentLesson(pack.id, next.id);
      toast(t('lessonComplete'));
      return go('lesson', { slug, lessonId: next.id });
    } else {
      toast(t('packComplete'));
      return go('pack', { slug });
    }
  }

  const practiceAgain = e.target.closest('[data-practice-again]');
  if (practiceAgain) {
    const slug = practiceAgain.dataset.practiceAgain;
    const pack = getPackBySlug(slug);
    await store.resetPackProgress(pack.id);
    // Persisted quiz results were just wiped for this pack — the
    // transient quizState must be too, or screenQuiz would keep
    // treating those quizzes as already-answered (stale in-memory
    // state left over from before the reset) and silently block the
    // learner from ever re-scoring them on this practice pass.
    for (const k of Object.keys(quizState)) {
      if (k.startsWith(slug + ':')) delete quizState[k];
    }
    // Same reasoning for dialogue packs — a stale in-memory dialogue
    // phase (e.g. still sitting on 'complete') would otherwise survive
    // the reset and show wrong progress on the very next visit.
    for (const k of Object.keys(dialogueState)) {
      if (k.startsWith(slug + ':')) delete dialogueState[k];
    }
    toast(t('practiceAgainStarted'));
    return go('lesson', { slug, lessonId: pack.lessons[0].id });
  }

  const unlockBtn = e.target.closest('[data-unlock]');
  if (unlockBtn) { modalOpen = { slug: unlockBtn.dataset.unlock, value: '', msgKey: '', status: '' }; drawerOpen = false; return render(); }

  const backdrop = e.target.closest('[data-modal-backdrop]');
  if (backdrop) { modalOpen = null; drawerOpen = false; return render(); }

  const whatsappCta = e.target.closest('#whatsapp-cta');
  if (whatsappCta) { drawerOpen = true; return render(); }

  const drawerBackdrop = e.target.closest('[data-drawer-backdrop]');
  if (drawerBackdrop) { drawerOpen = false; return render(); }

  const submit = e.target.closest('#unlock-submit');
  if (submit) {
    const val = document.getElementById('unlock-input').value;
    modalOpen = { ...modalOpen, value: val, loading: true, msgKey: '', status: '' };
    render();
    const pack = getPackBySlug(modalOpen.slug);
    const result = await validateCode(val, pack.id);
    if (result.ok) {
      await store.unlockPack(pack.id);
      modalOpen = null;
      drawerOpen = false;
      render();
      toast(t('unlockSuccess'));
      go('pack', { slug: pack.slug });
    } else {
      modalOpen = { ...modalOpen, loading: false, msgKey: result.reasonKey, status: 'err' };
      render();
    }
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'unlock-input') {
    document.getElementById('unlock-submit')?.click();
  }
  if (e.key === 'Escape' && drawerOpen) { drawerOpen = false; return render(); }
  if (e.key === 'Escape' && modalOpen) { modalOpen = null; render(); }
});

/* ---------------- boot ---------------- */
(async function boot() {
  await store.initStore();
  store.subscribe(() => { /* re-render is explicit per-action to avoid losing input focus */ });
  applyDocumentDirection();
  render();

  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch (err) { console.warn('SW registration failed', err); }
  }
})();
