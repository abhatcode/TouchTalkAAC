
let currentText = '';
let currentCategory = 'home';
let currentView = 'home';
let isDarkMode = false;
let voiceSettings = { speed: 0.85, pitch: 1.0, voiceIndex: -1 };
let accessSettings = { holdMs: 0, debounceMs: 0, speakEachWord: true, gridSize: 'medium', animateScreens: true };
let searchOpen = false;
let history = [];
let learnedBigrams = {};
let toastTimer = null;
let activeModalOnSave = null;
let activationLockUntil = 0;

const CORE_WORDS = [

  { word: 'I', pos: 'pronoun' },      { word: 'want', pos: 'verb' },   { word: 'go', pos: 'verb' },     { word: 'more', pos: 'adverb' },  { word: 'good', pos: 'adj' },    { word: 'yes', pos: 'social' },

  { word: 'you', pos: 'pronoun' },    { word: 'like', pos: 'verb' },   { word: 'come', pos: 'verb' },   { word: 'done', pos: 'adverb' },  { word: 'bad', pos: 'adj' },     { word: 'no', pos: 'negation' },

  { word: 'it', pos: 'pronoun' },     { word: 'need', pos: 'verb' },   { word: 'stop', pos: 'negation' },{ word: 'again', pos: 'adverb' }, { word: 'big', pos: 'adj' },     { word: 'please', pos: 'social' },

  { word: 'we', pos: 'pronoun' },     { word: 'help', pos: 'verb' },   { word: 'get', pos: 'verb' },    { word: 'now', pos: 'adverb' },   { word: 'little', pos: 'adj' },  { word: 'thank you', pos: 'social' },

  { word: 'he', pos: 'pronoun' },     { word: 'eat', pos: 'verb' },    { word: 'put', pos: 'verb' },    { word: 'later', pos: 'adverb' }, { word: 'hot', pos: 'adj' },     { word: 'hi', pos: 'social' },

  { word: 'she', pos: 'pronoun' },    { word: 'drink', pos: 'verb' },  { word: 'open', pos: 'verb' },   { word: 'in', pos: 'prep' },      { word: 'cold', pos: 'adj' },    { word: 'bye', pos: 'social' },

  { word: 'they', pos: 'pronoun' },   { word: 'play', pos: 'verb' },   { word: 'look', pos: 'verb' },   { word: 'on', pos: 'prep' },      { word: 'fast', pos: 'adj' },    { word: 'what', pos: 'question' },

  { word: 'this', pos: 'pronoun' },   { word: 'make', pos: 'verb' },   { word: 'see', pos: 'verb' },    { word: 'out', pos: 'prep' },     { word: 'slow', pos: 'adj' },    { word: 'where', pos: 'question' },

  { word: 'that', pos: 'pronoun' },   { word: 'do', pos: 'verb' },     { word: 'give', pos: 'verb' },   { word: 'up', pos: 'prep' },      { word: 'hurt', pos: 'adj' },    { word: 'who', pos: 'question' },

  { word: 'my', pos: 'pronoun' },     { word: 'feel', pos: 'verb' },   { word: 'turn', pos: 'verb' },   { word: 'down', pos: 'prep' },    { word: 'not', pos: 'negation' },{ word: 'why', pos: 'question' },
];

// Modified Fitzgerald Key (Goossens', Crain & Elder): the colour tells you the
// kind of word. Social words and position words share pink in that key.
const FITZ_LEGEND = [
  { pos: 'pronoun', label: 'People' }, { pos: 'verb', label: 'Actions' }, { pos: 'noun', label: 'Things' },
  { pos: 'adj', label: 'Describing' }, { pos: 'social', label: 'Social and position' },
  { pos: 'adverb', label: 'When and how much' }, { pos: 'question', label: 'Questions' }, { pos: 'negation', label: 'No and stop' },
];
const FITZ_TYPES = ['pronoun', 'verb', 'noun', 'adj', 'social', 'adverb', 'question', 'negation'];
const FITZ_NAMES = { pronoun: 'People (yellow)', verb: 'Actions (green)', noun: 'Things (orange)', adj: 'Describing (blue)',
  social: 'Social and position (pink)', prep: 'Social and position (pink)', adverb: 'When and how much (brown)',
  question: 'Questions (purple)', negation: 'No and stop (red)' };

const STARTER_BIGRAMS = {
  'i': ['want', 'need', 'like', 'feel', 'am', 'can'],
  'you': ['are', 'can', 'want', 'like', 'go'],
  'we': ['can', 'go', 'want', 'need'],
  'want': ['more', 'to', 'water', 'food', 'that', 'help'],
  'need': ['help', 'to', 'water', 'bathroom', 'rest', 'medicine'],
  'like': ['this', 'that', 'it', 'more'],
  'to': ['go', 'eat', 'play', 'drink', 'sleep', 'rest'],
  'go': ['home', 'outside', 'to', 'now', 'out'],
  'feel': ['happy', 'sad', 'tired', 'sick', 'hurt', 'scared'],
  'am': ['happy', 'sad', 'tired', 'hungry', 'thirsty', 'done'],
  'more': ['please', 'water', 'food', 'time', 'help'],
  'can': ['I', 'you', 'we', 'help', 'go'],
  'help': ['me', 'please', 'now'],
  'my': ['mom', 'dad', 'head', 'tummy', 'turn'],
  'the': ['bathroom', 'doctor', 'park'],
  'this': ['is', 'one', 'hurts'],
  'that': ['is', 'one', 'hurts'],
  'it': ['is', 'hurts'],
  'is': ['good', 'bad', 'hot', 'cold', 'done'],
  'not': ['good', 'now', 'that', 'done'],
  'stop': ['it', 'now', 'please'],
  'thank': ['you'],
  'all': ['done'],
  'me': ['please', 'now', 'water'],
};
const SENTENCE_STARTERS = ['I', 'you', 'want', 'need', 'help', 'more'];

const categories = {
  feelings: [
    { word: 'happy', icon: 'smile', label: 'Happy' },
    { word: 'sad', icon: 'frown', label: 'Sad' },
    { word: 'tired', icon: 'battery-low', label: 'Tired' },
    { word: 'hurt', icon: 'bandage', label: 'Hurt' },
    { word: 'angry', icon: 'angry', label: 'Angry' },
    { word: 'scared', icon: 'shield-alert', label: 'Scared' },
    { word: 'excited', icon: 'party-popper', label: 'Excited' },
    { word: 'bored', icon: 'meh', label: 'Bored' },
  ],
  needs: [
    { word: 'water', icon: 'glass-water', label: 'Water' },
    { word: 'food', icon: 'utensils', label: 'Food' },
    { word: 'bathroom', icon: 'toilet', label: 'Bathroom' },
    { word: 'hungry', icon: 'utensils-crossed', label: 'Hungry' },
    { word: 'thirsty', icon: 'cup-soda', label: 'Thirsty' },
    { word: 'cold', icon: 'snowflake', label: 'Cold' },
    { word: 'hot', icon: 'thermometer-sun', label: 'Hot' },
    { word: 'medicine', icon: 'pill', label: 'Medicine' },
    { word: 'rest', icon: 'sofa', label: 'Rest' },
  ],
  words: [
    { word: 'yes', icon: 'check', label: 'Yes' },
    { word: 'no', icon: 'x', label: 'No' },
    { word: 'please', icon: 'hand-heart', label: 'Please' },
    { word: 'thank you', icon: 'heart', label: 'Thank You' },
    { word: 'I', icon: 'user', label: 'I' },
    { word: 'want', icon: 'pointer', label: 'Want' },
    { word: 'need', icon: 'circle-alert', label: 'Need' },
    { word: 'help', icon: 'life-buoy', label: 'Help' },
    { word: 'more', icon: 'plus', label: 'More' },
    { word: 'done', icon: 'circle-check', label: 'Done' },
  ],
  actions: [
    { word: 'go', icon: 'footprints', label: 'Go' },
    { word: 'stop', icon: 'octagon-x', label: 'Stop' },
    { word: 'sit', icon: 'armchair', label: 'Sit' },
    { word: 'stand', icon: 'person-standing', label: 'Stand' },
    { word: 'sleep', icon: 'bed', label: 'Sleep' },
    { word: 'eat', icon: 'utensils', label: 'Eat' },
    { word: 'drink', icon: 'cup-soda', label: 'Drink' },
    { word: 'play', icon: 'gamepad-2', label: 'Play' },
  ],
  people: [
    { word: 'mom', icon: 'user-round', label: 'Mom' },
    { word: 'dad', icon: 'user', label: 'Dad' },
    { word: 'sister', icon: 'user-round', label: 'Sister' },
    { word: 'brother', icon: 'user', label: 'Brother' },
    { word: 'friend', icon: 'handshake', label: 'Friend' },
    { word: 'teacher', icon: 'graduation-cap', label: 'Teacher' },
    { word: 'therapist', icon: 'hand-helping', label: 'Therapist' },
    { word: 'doctor', icon: 'stethoscope', label: 'Doctor' },
    { word: 'grandma', icon: 'user-round', label: 'Grandma' },
    { word: 'grandpa', icon: 'user', label: 'Grandpa' },
  ],
  quickPhrases: [
    { word: 'I want to go home', icon: 'house', label: 'Go Home' },
    { word: 'I need help please', icon: 'life-buoy', label: 'Need Help' },
    { word: 'I am feeling sick', icon: 'thermometer', label: 'Feeling Sick' },
    { word: 'Can we take a break', icon: 'pause', label: 'Take a Break' },
    { word: 'Thank you very much', icon: 'heart', label: 'Thank You' },
    { word: 'I want to eat', icon: 'utensils', label: 'Want to Eat' },
    { word: 'I need to use the bathroom', icon: 'toilet', label: 'Bathroom' },
    { word: 'I am happy', icon: 'smile', label: 'I am Happy' },
    { word: 'I am sad', icon: 'frown', label: 'I am Sad' },
    { word: 'I want water please', icon: 'glass-water', label: 'Want Water' },
    { word: 'I need to rest', icon: 'sofa', label: 'Need Rest' },
    { word: 'I do not understand', icon: 'circle-question-mark', label: "Don't Understand" },
  ],
};

const categoryMeta = {
  core:         { icon: 'layout-grid', label: 'Core',          colorClass: 'card-words',        catClass: '' },
  feelings:     { icon: 'smile', label: 'Feelings',      colorClass: 'card-feelings',     catClass: 'cat-feelings' },
  needs:        { icon: 'glass-water', label: 'Needs',          colorClass: 'card-needs',        catClass: 'cat-needs' },
  words:        { icon: 'message-square-text', label: 'Words',          colorClass: 'card-words',        catClass: 'cat-words' },
  actions:      { icon: 'footprints', label: 'Actions',        colorClass: 'card-actions',      catClass: 'cat-actions' },
  people:       { icon: 'users', label: 'People',    colorClass: 'card-people',       catClass: 'cat-people' },
  quickPhrases: { icon: 'bookmark', label: 'Quick Phrases',  colorClass: 'card-quickphrases', catClass: 'cat-quickphrases' },
};

const PROTECTED = ['feelings', 'needs', 'words', 'actions', 'people', 'quickPhrases'];

// Saved word banks from older versions store an emoji instead of an icon name.
// These lookups let built-in words show their icon no matter what was saved.
const DEFAULT_ICON_BY_WORD = {};
Object.values(categories).forEach(items => items.forEach(it => {
  DEFAULT_ICON_BY_WORD[it.word.toLowerCase()] = it.icon;
}));
// Word type for colour coding. A word's own type wins (so "stop" is red in any
// category), then the category's type. Built-in categories use CATEGORY_POS;
// custom ones store meta.pos.
const CATEGORY_POS = { feelings: 'adj', needs: 'noun', words: 'social', actions: 'verb', people: 'pronoun', quickPhrases: 'social' };
const WORD_POS = Object.assign(
  { water: 'noun', food: 'noun', bathroom: 'noun', medicine: 'noun', home: 'noun', break: 'noun',
    hungry: 'adj', thirsty: 'adj', tired: 'adj', happy: 'adj', sad: 'adj', sick: 'adj', me: 'pronoun', am: 'verb',
    is: 'verb', are: 'verb', can: 'verb', to: 'prep', the: 'social', a: 'social' },
  Object.fromEntries(CORE_WORDS.map(w => [w.word.toLowerCase(), w.pos]))
);
function catPos(key) {
  return (categoryMeta[key] && categoryMeta[key].pos) || CATEGORY_POS[key] || '';
}
function posOf(word, catKey, item) {
  if (item && item.pos) return item.pos;
  const w = (word || '').toLowerCase();
  if (w && WORD_POS[w]) return WORD_POS[w];
  return catKey ? catPos(catKey) : '';
}
function fitzClass(pos) { return pos ? ` fitz-${pos}` : ''; }
function fitzLegend() {
  const legend = document.createElement('div');
  legend.className = 'fitz-legend';
  legend.style.gridColumn = '1 / -1';
  legend.setAttribute('aria-hidden', 'true');
  FITZ_LEGEND.forEach(l => {
    const s = document.createElement('span');
    s.innerHTML = `<i class="fitz-${l.pos}"></i>${l.label}`;
    legend.appendChild(s);
  });
  return legend;
}
function fitzSelectHTML(id, firstLabel) {
  return `<select id="${id}"><option value="">${firstLabel}</option>` +
    FITZ_TYPES.map(t => `<option value="${t}">${FITZ_NAMES[t]}</option>`).join('') + `</select>`;
}

const DEFAULT_ICON_BY_CAT = Object.fromEntries(Object.entries(categoryMeta).map(([k, m]) => [k, m.icon]));

function artHtml(item, fallbackIcon) {
  if (item.isImage && item.emoji) return `<img src="${escapeHtml(item.emoji)}" alt="" class="symbol-image">`;
  const name = item.icon || (item.word && DEFAULT_ICON_BY_WORD[item.word.toLowerCase()]) || fallbackIcon;
  if (name && ICONS[name]) return iconSvg(name);
  if (item.emoji) return `<span class="symbol-glyph" aria-hidden="true">${escapeHtml(item.emoji)}</span>`;
  return '';
}
function catArtHtml(key) {
  const meta = categoryMeta[key] || {};
  return artHtml(meta, DEFAULT_ICON_BY_CAT[key] || 'folder');
}

window.addEventListener('load', () => {
  hydrateIcons();
  loadData();
  loadSettings();
  loadHistory();
  loadBigrams();
  applyDarkMode(isDarkMode, false);
  applyAccessSettings(false);
  renderHome();
  renderPredictions();
  initNav();
  initGridKeys();
  initSearch();
  initSettings();
  initModal();
  initVoices();
  initTypeView();
  initBackup();
  registerSW();
  updateInstallUI();
  playEntrance();
});

function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  updateInstallUI();
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  showToast('TouchTalk is installed', 'success');
  updateInstallUI();
});

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function updateInstallUI() {
  const btn = document.getElementById('installBtn');
  const hint = document.getElementById('installHint');
  if (!btn || !hint) return;
  if (isStandalone()) {
    btn.style.display = 'none';
    hint.textContent = 'TouchTalk is installed on this device.';
    return;
  }
  btn.style.display = '';
  if (isIOS()) {
    btn.textContent = 'How to install on iPhone or iPad';
    hint.textContent = 'In Safari, press Share, then Add to Home Screen.';
  } else if (deferredInstallPrompt) {
    btn.textContent = 'Install app';
    hint.textContent = 'Install TouchTalk on this device to use it full screen and without internet.';
  } else {
    btn.textContent = 'How to install';
    hint.textContent = 'Open your browser menu and choose Install app or Add to Home Screen.';
  }
}
async function installApp() {
  if (isIOS() && !deferredInstallPrompt) {
    openModal({
      title: 'Install on iPhone / iPad',
      body: `
        <ol class="modal-steps">
          <li>Open this page in <strong>Safari</strong>.</li>
          <li>Press <strong>Share</strong>. It is the square with an arrow pointing up.</li>
          <li>Scroll down and press <strong>Add to Home Screen</strong>.</li>
          <li>Press <strong>Add</strong>.</li>
        </ol>
        <p class="modal-note">TouchTalk will be on your home screen and will work without internet.</p>
      `,
    });
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') showToast('Installing…', 'success');
    deferredInstallPrompt = null;
    updateInstallUI();
    return;
  }
  openModal({
    title: 'Install TouchTalk',
    body: `
      <p>Install TouchTalk from your browser menu.</p>
      <ul class="modal-steps">
        <li><strong>Android, Chrome:</strong> open the menu (three dots), then Install app.</li>
        <li><strong>iPhone or iPad, Safari:</strong> Share, then Add to Home Screen.</li>
        <li><strong>Computer, Chrome or Edge:</strong> select the install icon in the address bar.</li>
      </ul>
    `,
  });
}

function saveData() {
  try {
    localStorage.setItem('tt_data', JSON.stringify({ categories, categoryMeta }));
  } catch (e) {

    showToast('Storage is full, so this change was not saved. Remove photos or recordings you no longer use.', 'error', 4000);
  }
}
function loadData() {
  try {
    const raw = localStorage.getItem('tt_data');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.categories) Object.assign(categories, d.categories);
    if (d.categoryMeta) Object.assign(categoryMeta, d.categoryMeta);

    categoryMeta.core = { icon: 'layout-grid', label: 'Core', colorClass: 'card-words', catClass: '' };
    delete categories.core;
  } catch (e) {}
}
function saveSettings() {
  try { localStorage.setItem('tt_settings', JSON.stringify({ isDarkMode, voiceSettings, accessSettings })); } catch (e) {}
}
function loadSettings() {
  try {
    const raw = localStorage.getItem('tt_settings');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.isDarkMode === 'boolean') isDarkMode = s.isDarkMode;
    if (s.voiceSettings) Object.assign(voiceSettings, s.voiceSettings);
    if (s.accessSettings) Object.assign(accessSettings, s.accessSettings);
    const speedEl = document.getElementById('voiceSpeed');
    const pitchEl = document.getElementById('voicePitch');
    if (speedEl) speedEl.value = voiceSettings.speed;
    if (pitchEl) pitchEl.value = voiceSettings.pitch;
    updateSliderLabels();
  } catch (e) {}
}
function saveHistory() {
  try { localStorage.setItem('tt_history', JSON.stringify(history)); } catch (e) {}
}
function loadHistory() {
  try {
    const raw = localStorage.getItem('tt_history');
    if (raw) history = JSON.parse(raw) || [];
  } catch (e) { history = []; }
}
function saveBigrams() {
  try { localStorage.setItem('tt_bigrams', JSON.stringify(learnedBigrams)); } catch (e) {}
}
function loadBigrams() {
  try {
    const raw = localStorage.getItem('tt_bigrams');
    if (raw) learnedBigrams = JSON.parse(raw) || {};
  } catch (e) { learnedBigrams = {}; }
}

function applyAccessSettings(save) {
  const sizes = { small: 110, medium: 130, large: 160, xl: 200 };
  document.documentElement.style.setProperty('--symbol-min', (sizes[accessSettings.gridSize] || 130) + 'px');
  document.documentElement.style.setProperty('--hold-dur', accessSettings.holdMs + 'ms');

  const sizeSel = document.getElementById('buttonSize');
  const holdSel = document.getElementById('holdDuration');
  const debSel = document.getElementById('debounceTime');
  const spkTog = document.getElementById('speakWordToggle');
  if (sizeSel) sizeSel.value = accessSettings.gridSize;
  if (holdSel) holdSel.value = String(accessSettings.holdMs);
  if (debSel) debSel.value = String(accessSettings.debounceMs);
  if (spkTog) spkTog.setAttribute('aria-checked', String(accessSettings.speakEachWord));
  const animTog = document.getElementById('screenAnimToggle');
  if (animTog) animTog.setAttribute('aria-checked', String(accessSettings.animateScreens));

  const grid = document.getElementById('symbolGrid');
  if (grid && grid.classList.contains('core-grid')) {
    grid.classList.toggle('cols-4', accessSettings.gridSize === 'large' || accessSettings.gridSize === 'xl');
  }
  if (save) saveSettings();
}

function toggleSpeakEachWord() {
  accessSettings.speakEachWord = !accessSettings.speakEachWord;
  applyAccessSettings(true);
}

function toggleScreenAnimation() {
  accessSettings.animateScreens = !accessSettings.animateScreens;
  applyAccessSettings(true);
}

function bindActivate(btn, fn) {
  let holdTimer = null;
  let didHoldActivate = false;
  let isDown = false;

  const trigger = () => {
    const now = Date.now();
    if (now < activationLockUntil) return;
    activationLockUntil = now + accessSettings.debounceMs;
    fn();
  };

  btn.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDown = true;
    didHoldActivate = false;

    if (accessSettings.holdMs > 0) {
      btn.classList.add('holding');
      holdTimer = setTimeout(() => {
        if (isDown) {
          didHoldActivate = true;
          btn.classList.remove('holding');
          trigger();
        }
      }, accessSettings.holdMs);
    }
  });

  const abandon = () => {
    isDown = false;
    if (holdTimer) clearTimeout(holdTimer);
    btn.classList.remove('holding');
  };

  btn.addEventListener('pointerup', () => {
    if (isDown) {
      isDown = false;
      if (holdTimer) clearTimeout(holdTimer);
      btn.classList.remove('holding');
    }
  });

  btn.addEventListener('pointercancel', abandon);
  btn.addEventListener('pointerleave', abandon);

  btn.addEventListener('contextmenu', e => {
    if (accessSettings.holdMs > 0) e.preventDefault();
  });

  btn.addEventListener('click', e => {
    if (didHoldActivate) return;
    if (accessSettings.holdMs > 0 && e.detail > 0) return;
    trigger();
  });
}

function initNav() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.getAttribute('data-view')));
  });
}
// Arrow keys move between cells, so keyboards and switch interfaces that send
// arrow keys can step through the board in reading order.
function initGridKeys() {
  const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 'col', ArrowUp: '-col' };
  document.getElementById('appMain')?.addEventListener('keydown', e => {
    if (!(e.key in steps)) return;
    const grid = e.target.closest('.symbol-grid, .core-grid, .search-results-grid');
    if (!grid) return;
    const cells = [...grid.querySelectorAll('button')];
    const i = cells.indexOf(e.target);
    if (i < 0) return;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const step = steps[e.key] === 'col' ? cols : steps[e.key] === '-col' ? -cols : steps[e.key];
    const next = cells[i + step];
    if (next) { e.preventDefault(); next.focus(); }
  });
}

// Screen change: the new screen is in place on the first frame and a paper
// veil over the content area fades away to show it. Going into or out of
// Settings also grows the sapling first; ordinary tab changes get only a short
// fade, so moving around the board never feels slow or repetitive.
// Exponential ease-out, transform and opacity only, never layout. A new tap
// mid-way restarts it cleanly.
const EASE_OUT_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IN_EXPO = 'cubic-bezier(0.7, 0, 0.84, 0)';
let veilAnims = [];
function playScreenChange(withSapling) {
  const veil = document.getElementById('screenVeil');
  const mark = document.getElementById('screenVeilMark');
  if (!veil || !mark || !veil.animate) return;
  veilAnims.forEach(a => a.cancel());

  const header = document.querySelector('.app-header');
  const nav = document.querySelector('.bottom-nav');
  veil.style.top = (header ? header.getBoundingClientRect().bottom : 0) + 'px';
  veil.style.bottom = (nav ? window.innerHeight - nav.getBoundingClientRect().top : 0) + 'px';
  veil.hidden = false;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!withSapling) {
    veilAnims = [veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 120 : 220, easing: EASE_OUT_EXPO, fill: 'both' })];
    const quick = veilAnims;
    quick[0].finished.then(() => { if (veilAnims === quick) { quick[0].cancel(); veil.hidden = true; } }).catch(() => {});
    return;
  }
  // The sapling holds at full strength for most of its time on screen while it
  // grows, then fades out on an accelerating curve. Reduced motion: no zoom.
  const markDur = reduce ? 700 : 1100;
  const veilDelay = reduce ? 560 : 820;
  const veilDur = reduce ? 200 : 340;
  const fade = [
    { opacity: 1, offset: 0 },
    { opacity: 1, offset: 0.65, easing: EASE_IN_EXPO },
    { opacity: 0, offset: 1 },
  ];

  veilAnims = [
    mark.animate(fade, { duration: markDur, fill: 'both' }),
    veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: veilDur, delay: veilDelay, easing: EASE_OUT_EXPO, fill: 'both' }),
  ];
  if (!reduce) {
    veilAnims.push(mark.animate(
      [{ transform: 'scale(0.88)' }, { transform: 'scale(1.18)' }],
      { duration: markDur, easing: EASE_OUT_EXPO, fill: 'both' }));
  }
  const mine = veilAnims;
  mine[1].finished.then(() => {
    if (veilAnims !== mine) return;
    mine.forEach(a => a.cancel());
    veil.hidden = true;
  }).catch(() => {});
}

// Opening the app: the page starts under the sapling veil (set in <head>).
// From the homepage the sapling arrives already grown, so it carries on;
// opened directly, it grows in from smaller. Then it fades and the veil
// fades to show the app.
function playEntrance() {
  const root = document.documentElement;
  if (!root.classList.contains('entering')) return;
  const veil = document.getElementById('screenVeil');
  const mark = document.getElementById('screenVeilMark');
  const done = () => { root.classList.remove('entering', 'from-home'); if (veil) { veil.hidden = true; veil.style.top = veil.style.bottom = ''; } };
  if (!veil || !mark || !veil.animate) { done(); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  veil.hidden = false;
  veil.style.top = '0px'; veil.style.bottom = '0px';
  const markDur = reduce ? 600 : 1000;
  mark.animate([
    { opacity: 1, offset: 0 },
    { opacity: 1, offset: 0.55, easing: EASE_IN_EXPO },
    { opacity: 0, offset: 1 },
  ], { duration: markDur, fill: 'both' });
  const fromHome = root.classList.contains('from-home');
  if (!reduce) mark.animate([{ transform: fromHome ? 'scale(1)' : 'scale(0.86)' }, { transform: 'scale(1.2)' }], { duration: markDur, easing: EASE_OUT_EXPO, fill: 'both' });
  const fade = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: markDur - 300, easing: EASE_OUT_EXPO, fill: 'both' });
  fade.finished.then(() => {
    done();
    veil.getAnimations().concat(mark.getAnimations()).forEach(a => a.cancel());
  }).catch(done);
}

function switchView(view) {
  if (view !== currentView && accessSettings.animateScreens) playScreenChange(view === 'settings' || currentView === 'settings');
  currentView = view;
  document.body.className = `view-${view}` + (isDarkMode ? ' dark' : '') + (searchOpen ? ' search-open' : '');
  ['home', 'type', 'wordbanks', 'history', 'settings'].forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.hidden = (v !== view);
  });
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const active = tab.getAttribute('data-view') === view;
    tab.classList.toggle('active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  if (view === 'history') renderHistory();
  if (view === 'type') setTimeout(() => renderTypePredictions(), 50);
  const main = document.getElementById('appMain');
  if (main) main.scrollTop = 0;
}

function getOutputEl() { return document.getElementById('output'); }
function getPlaceholderEl() { return document.getElementById('outputPlaceholder'); }

function setOutputText(text) {
  currentText = text.trim() ? text : '';
  const el = getOutputEl();
  const ph = getPlaceholderEl();
  if (!el) return;
  let span = el.querySelector('.output-text');
  if (currentText) {
    if (ph) ph.style.display = 'none';
    if (!span) {
      span = document.createElement('span');
      span.className = 'output-text';
      el.appendChild(span);
    }
    span.innerHTML = currentText.trim().split(/\s+/)
      .map(w => `<span class="output-word${fitzClass(posOf(w.replace(/[^\w']/g, '')))}">${escapeHtml(w)}</span>`).join('');
    el.scrollTop = el.scrollHeight;
  } else {
    if (ph) ph.style.display = '';
    if (span) span.remove();
  }
  renderPredictions();
}

function addWord(word, audio) {
  const isPhrase = word.includes(' ') && word.length > 12;
  const newText = isPhrase ? word : (currentText ? currentText + ' ' + word : word);
  setOutputText(newText);
  if (accessSettings.speakEachWord) {
    if (audio) playAudio(audio);
    else speakSingleWord(word);
  }
}

function backspaceWord() {
  if (!currentText) return;
  const words = currentText.trim().split(/\s+/);
  words.pop();
  setOutputText(words.join(' '));
}
function clearText() { setOutputText(''); }

function learnFromSentence(text) {
  const words = text.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0 && w.length < 20);
  for (let i = 0; i < words.length - 1; i++) {
    const a = words[i], b = words[i + 1];
    if (!learnedBigrams[a]) learnedBigrams[a] = {};
    learnedBigrams[a][b] = (learnedBigrams[a][b] || 0) + 1;

    const entries = Object.entries(learnedBigrams[a]);
    if (entries.length > 8) {
      entries.sort((x, y) => y[1] - x[1]);
      learnedBigrams[a] = Object.fromEntries(entries.slice(0, 8));
    }
  }

  const keys = Object.keys(learnedBigrams);
  if (keys.length > 300) delete learnedBigrams[keys[0]];
  saveBigrams();
}

function getPredictions(context, limit = 4) {
  const out = [];
  const push = w => { if (w && !out.some(x => x.toLowerCase() === w.toLowerCase())) out.push(w); };
  const trimmed = context.trim();
  if (!trimmed) {
    SENTENCE_STARTERS.forEach(push);
    return out.slice(0, limit);
  }
  const lastWord = trimmed.split(/\s+/).pop().toLowerCase();
  const learned = learnedBigrams[lastWord];
  if (learned) Object.entries(learned).sort((a, b) => b[1] - a[1]).forEach(([w]) => push(w));
  (STARTER_BIGRAMS[lastWord] || []).forEach(push);
  if (!out.length) ['and', 'more', 'please', 'now'].forEach(push);
  return out.slice(0, limit);
}

function renderPredictions() {
  const row = document.getElementById('predictRow');
  if (!row) return;
  const words = getPredictions(currentText, 5);
  row.innerHTML = '';
  words.forEach(w => {
    const chip = document.createElement('button');
    chip.className = 'predict-chip' + fitzClass(posOf(w));
    chip.textContent = w;
    chip.setAttribute('aria-label', `Add word ${w}`);
    bindActivate(chip, () => addWord(w));
    row.appendChild(chip);
  });
}

function getVoice() {
  const voices = speechSynthesis.getVoices();
  if (voiceSettings.voiceIndex >= 0 && voices[voiceSettings.voiceIndex]) return voices[voiceSettings.voiceIndex];
  return voices.find(v => v.name.includes('Samantha') || v.name.includes('Alex') || v.lang === 'en-US') || voices[0] || null;
}
function makeUtterance(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = voiceSettings.speed;
  u.pitch = voiceSettings.pitch;
  u.volume = 1.0;
  const v = getVoice();
  if (v) u.voice = v;
  return u;
}
function speakSingleWord(word) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const go = () => speechSynthesis.speak(makeUtterance(word));
  if (speechSynthesis.getVoices().length) go();
  else speechSynthesis.addEventListener('voiceschanged', go, { once: true });
}
function speakText() {
  const text = currentText.trim();
  if (!text) { showToast('The message is empty. Tap words to add them.'); return; }
  const btn = document.querySelector('.speak-btn');

  const custom = findCustomAudio(text);
  if (custom) {
    if (btn) btn.classList.add('speaking');
    playAudio(custom, () => { if (btn) btn.classList.remove('speaking'); });
    addToHistory(text);
    learnFromSentence(text);
    return;
  }

  if (!('speechSynthesis' in window)) { showToast('Speech not available', 'error'); return; }
  speechSynthesis.cancel();
  if (btn) btn.classList.add('speaking');
  const u = makeUtterance(text);
  u.onend = u.onerror = () => { if (btn) btn.classList.remove('speaking'); };
  speechSynthesis.speak(u);
  addToHistory(text);
  learnFromSentence(text);
}
function testVoice() { speakSingleWord('Hello. This is how I sound.'); }
function emergency() {
  const msg = 'Help. I need assistance now.';
  setOutputText(msg);
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const u = makeUtterance(msg);
    u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
  showToast('Help message spoken', 'error');
}

function initVoices() {
  const populate = () => {
    const sel = document.getElementById('voiceSelect');
    if (!sel) return;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) { sel.innerHTML = '<option value="-1">Default voice</option>'; return; }
    sel.innerHTML = voices.map((v, i) =>
      `<option value="${i}" ${i === voiceSettings.voiceIndex ? 'selected' : ''}>${escapeHtml(v.name)} (${v.lang})</option>`
    ).join('');
  };
  populate();
  if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', populate);
  document.getElementById('voiceSelect')?.addEventListener('change', e => {
    voiceSettings.voiceIndex = parseInt(e.target.value, 10);
    saveSettings();
  });
}

function initTypeView() {
  const area = document.getElementById('typeArea');
  area?.addEventListener('input', renderTypePredictions);
}

function buildVocab() {
  const vocab = new Set();
  CORE_WORDS.forEach(c => { if (!c.word.includes(' ')) vocab.add(c.word.toLowerCase()); });
  Object.values(categories).forEach(items => items.forEach(it => {
    if (!it.word.includes(' ')) vocab.add(it.word.toLowerCase());
  }));
  Object.keys(learnedBigrams).forEach(w => vocab.add(w));
  Object.values(learnedBigrams).forEach(m => Object.keys(m).forEach(w => vocab.add(w)));
  return vocab;
}

function renderTypePredictions() {
  const row = document.getElementById('typePredict');
  const area = document.getElementById('typeArea');
  if (!row || !area) return;
  const text = area.value;
  let words = [];
  const endsWithSpace = /\s$/.test(text) || text.trim() === '';
  if (!endsWithSpace) {

    const partial = text.trim().split(/\s+/).pop().toLowerCase();
    if (partial.length >= 2) {
      words = [...buildVocab()].filter(w => w.startsWith(partial) && w !== partial).slice(0, 5);
    }
    if (!words.length) words = getPredictions(text.trim().split(/\s+/).slice(0, -1).join(' '), 5);
  } else {
    words = getPredictions(text, 5);
  }
  row.innerHTML = '';
  words.forEach(w => {
    const chip = document.createElement('button');
    chip.className = 'predict-chip' + fitzClass(posOf(w));
    chip.textContent = w;
    chip.setAttribute('aria-label', `Insert word ${w}`);
    bindActivate(chip, () => {
      if (!endsWithSpace && text.trim()) {

        const parts = area.value.split(/\s+/);
        parts.pop();
        area.value = (parts.join(' ') + ' ' + w).trim() + ' ';
      } else {
        area.value = (area.value + ' ' + w).replace(/\s+/g, ' ').trimStart();
        if (!area.value.endsWith(' ')) area.value += ' ';
      }
      area.focus();
      renderTypePredictions();
    });
    row.appendChild(chip);
  });
}

function typeSpeak() {
  const area = document.getElementById('typeArea');
  const text = area?.value.trim();
  if (!text) { showToast('Type something first'); return; }
  if (!('speechSynthesis' in window)) { showToast('Speech not available', 'error'); return; }
  speechSynthesis.cancel();
  const btn = document.querySelector('.type-speak');
  if (btn) btn.classList.add('speaking');
  const u = makeUtterance(text);
  u.onend = u.onerror = () => { if (btn) btn.classList.remove('speaking'); };
  speechSynthesis.speak(u);
  addToHistory(text);
  learnFromSentence(text);
}
function typeClear() {
  const area = document.getElementById('typeArea');
  if (area) { area.value = ''; area.focus(); }
  renderTypePredictions();
}
function typeSaveAsPhrase() {
  const text = document.getElementById('typeArea')?.value.trim();
  if (!text) { showToast('Type something first'); return; }
  openAddPhraseModal();
  setTimeout(() => {
    const input = document.getElementById('phraseText');
    if (input) input.value = text;
    document.getElementById('phraseLabel')?.focus();
  }, 350);
}

function renderHome() {
  currentCategory = 'home';
  renderCategoryNav('home');
  const grid = document.getElementById('symbolGrid');
  if (!grid) return;
  grid.className = 'symbol-grid';
  grid.innerHTML = '';
  grid.appendChild(fitzLegend());

  Object.keys(categoryMeta).forEach(key => {
    const meta = categoryMeta[key];
    const count = key === 'core' ? CORE_WORDS.length : (categories[key] ? categories[key].length : 0);
    const btn = document.createElement('button');
    btn.className = `category-card ${meta.colorClass || 'card-custom'}${key === 'core' ? ' is-core' : fitzClass(catPos(key))}`;
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', `${meta.label}, ${count} ${count === 1 ? 'word' : 'words'}`);
    btn.onclick = () => {
      if (meta.audio) playAudio(meta.audio);
      showCategory(key);
    };
    btn.innerHTML = `<span class="card-art">${catArtHtml(key)}</span><span class="card-label">${escapeHtml(meta.label)}</span><span class="card-count">${count} ${count === 1 ? 'word' : 'words'}</span>`;
    grid.appendChild(btn);
  });
}

function showCategory(key) {
  currentCategory = key;
  renderCategoryNav(key);
  if (key === 'core') { renderCoreBoard(); return; }

  const items = categories[key];
  const meta = categoryMeta[key];
  if (!items || !meta) return;
  const grid = document.getElementById('symbolGrid');
  if (!grid) return;
  grid.className = `symbol-grid ${meta.catClass || 'cat-custom'}`;
  grid.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'symbol-btn' + fitzClass(posOf(item.word, key, item));
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', item.label);
    bindActivate(btn, () => addWord(item.word, item.audio));
    const art = artHtml(item);
    if (!art) btn.classList.add('text-only');
    btn.innerHTML = (art ? `<span class="symbol-art">${art}</span>` : '') + `<span class="symbol-label">${escapeHtml(item.label)}</span>`;
    grid.appendChild(btn);
  });
}

function renderCoreBoard() {
  const grid = document.getElementById('symbolGrid');
  if (!grid) return;
  const bigButtons = accessSettings.gridSize === 'large' || accessSettings.gridSize === 'xl';
  grid.className = 'core-grid' + (bigButtons ? ' cols-4' : '');
  grid.innerHTML = '';

  grid.appendChild(fitzLegend());

  CORE_WORDS.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `core-btn fitz-${item.pos}`;
    btn.textContent = item.word;
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', item.word);
    bindActivate(btn, () => addWord(item.word));
    grid.appendChild(btn);
  });
}

function renderCategoryNav(activeCat) {
  const catNav = document.getElementById('catNav');
  if (!catNav) return;
  const scroll = catNav.querySelector('.cat-nav-scroll');
  if (!scroll) return;
  scroll.innerHTML = '';

  const allTab = document.createElement('button');
  allTab.className = `cat-tab${activeCat === 'home' ? ' active' : ''}`;
  if (activeCat === 'home') allTab.setAttribute('aria-current', 'true');
  allTab.innerHTML = `${iconSvg('layout-grid')}<span>All</span>`;
  allTab.onclick = () => renderHome();
  scroll.appendChild(allTab);

  Object.keys(categoryMeta).forEach(key => {
    const meta = categoryMeta[key];
    const tab = document.createElement('button');
    tab.className = `cat-tab${key === activeCat ? ' active' : ''}`;
    tab.setAttribute('data-cat', key);
    if (key === activeCat) tab.setAttribute('aria-current', 'true');
    const tp = key === 'core' ? '' : catPos(key);
    tab.innerHTML = `${catArtHtml(key)}<span>${escapeHtml(meta.label)}</span>` + (tp ? `<i class="cat-swatch fitz-${tp}" aria-hidden="true"></i>` : key === 'core' ? `<i class="cat-swatch cat-swatch-core" aria-hidden="true"></i>` : '');
    tab.onclick = () => showCategory(key);
    scroll.appendChild(tab);
  });

  setTimeout(() => {
    const active = scroll.querySelector('.cat-tab.active');
    if (active) active.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }, 50);
}

function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const wrap = document.getElementById('searchBarWrap');
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  toggle?.addEventListener('click', () => {
    if (currentView !== 'home') switchView('home');
    searchOpen = !searchOpen;
    wrap?.classList.toggle('open', searchOpen);
    document.body.classList.toggle('search-open', searchOpen);
    wrap?.setAttribute('aria-hidden', String(!searchOpen));
    toggle.setAttribute('aria-expanded', String(searchOpen));
    if (searchOpen) setTimeout(() => input?.focus(), 200);
    else clearSearch();
  });

  input?.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn?.classList.toggle('visible', q.length > 0);
    q ? renderSearchResults(q) : clearSearchResults();
  });

  clearBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    clearBtn.classList.remove('visible');
    clearSearchResults();
    input?.focus();
  });
}
function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.getElementById('searchClearBtn')?.classList.remove('visible');
  clearSearchResults();
}
function clearSearchResults() {
  const area = document.getElementById('searchResultsArea');
  if (area) { area.style.display = 'none'; area.innerHTML = ''; }
  const talk = document.getElementById('talkContent');
  if (talk) talk.style.display = '';
}
function renderSearchResults(q) {
  const area = document.getElementById('searchResultsArea');
  const talk = document.getElementById('talkContent');
  if (talk) talk.style.display = 'none';
  if (!area) return;
  area.style.display = 'block';

  const lower = q.toLowerCase();
  const results = [];
  CORE_WORDS.forEach(item => {
    if (item.word.toLowerCase().includes(lower)) {
      results.push({ word: item.word, label: item.word, catLabel: 'Core', pos: item.pos });
    }
  });
  Object.keys(categories).forEach(catKey => {
    const meta = categoryMeta[catKey] || {};
    (categories[catKey] || []).forEach(item => {
      if (item.word.toLowerCase().includes(lower) || item.label.toLowerCase().includes(lower)) {
        results.push({ ...item, catLabel: meta.label || catKey, pos: posOf(item.word, catKey, item) });
      }
    });
  });

  if (!results.length) {
    area.innerHTML = `<div class="search-no-results">Nothing matches “${escapeHtml(q)}”. Try a shorter word, or add it from Edit.</div>`;
    return;
  }
  const header = document.createElement('div');
  header.className = 'search-results-header';
  header.textContent = `${results.length} ${results.length !== 1 ? 'matches' : 'match'}`;
  const gridEl = document.createElement('div');
  gridEl.className = 'search-results-grid';
  results.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'word-chip' + fitzClass(item.pos);
    chip.setAttribute('aria-label', `${item.label}, in ${item.catLabel}`);
    bindActivate(chip, () => addWord(item.word, item.audio));
    chip.innerHTML = `${artHtml(item)}<span class="word-chip-label">${escapeHtml(item.label)}</span><span class="word-chip-cat">${escapeHtml(item.catLabel)}</span>`;
    gridEl.appendChild(chip);
  });
  area.innerHTML = '';
  area.appendChild(header);
  area.appendChild(gridEl);
}

function addToHistory(text) {
  if (!text) return;
  history = history.filter(h => h !== text);
  history.unshift(text);
  if (history.length > 50) history.length = 50;
  saveHistory();
}
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (!history.length) {
    list.innerHTML = `<p class="history-empty">Nothing spoken yet. When you press Speak, the message is listed here.</p>`;
    return;
  }
  list.innerHTML = '';
  history.forEach(text => {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
      <span class="history-text">${escapeHtml(text)}</span>
      <button class="history-add" aria-label="Put in message window">${iconSvg('plus')}<span>Use</span></button>
      <button class="history-speak" aria-label="Speak again">${iconSvg('volume-2')}<span>Speak</span></button>`;
    row.querySelector('.history-speak').onclick = () => {
      const custom = findCustomAudio(text);
      custom ? playAudio(custom) : speakSingleWord(text);
    };
    row.querySelector('.history-add').onclick = () => { setOutputText(text); switchView('home'); showToast('Message ready. Press Speak to say it.'); };
    list.appendChild(row);
  });
  const clearBtn = document.createElement('button');
  clearBtn.className = 'history-clear-btn';
  clearBtn.textContent = 'Clear history';
  clearBtn.onclick = () => {
    if (confirm('Remove every message from History?')) {
      history = []; saveHistory(); renderHistory(); showToast('History cleared');
    }
  };
  list.appendChild(clearBtn);
}

function initSettings() {
  document.getElementById('voiceSpeed')?.addEventListener('input', e => {
    voiceSettings.speed = parseFloat(e.target.value); updateSliderLabels(); saveSettings();
  });
  document.getElementById('voicePitch')?.addEventListener('input', e => {
    voiceSettings.pitch = parseFloat(e.target.value); updateSliderLabels(); saveSettings();
  });
  document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);

  document.getElementById('buttonSize')?.addEventListener('change', e => {
    accessSettings.gridSize = e.target.value;
    applyAccessSettings(true);
    if (currentCategory === 'core') renderCoreBoard();
    showToast('Button size updated');
  });
  document.getElementById('holdDuration')?.addEventListener('change', e => {
    accessSettings.holdMs = parseInt(e.target.value, 10);
    applyAccessSettings(true);
    showToast(accessSettings.holdMs ? `Hold to select: ${accessSettings.holdMs / 1000} s` : 'Hold to select is off');
  });
  document.getElementById('debounceTime')?.addEventListener('change', e => {
    accessSettings.debounceMs = parseInt(e.target.value, 10);
    applyAccessSettings(true);
  });
}
function updateSliderLabels() {
  const sv = document.getElementById('speedVal');
  const pv = document.getElementById('pitchVal');
  if (sv) sv.textContent = `${voiceSettings.speed.toFixed(2)}×`;
  if (pv) pv.textContent = `${voiceSettings.pitch.toFixed(2)}×`;
}

function initBackup() {
  document.getElementById('importFile')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || typeof data !== 'object' || (!data.categories && !data.settings)) {
          showToast('This file is not a TouchTalk backup.', 'error');
          return;
        }
        if (!confirm('Open this backup? It replaces the words, phrases, and settings on this device.')) return;
        if (data.categories) { Object.keys(categories).forEach(k => delete categories[k]); Object.assign(categories, data.categories); delete categories.core; }
        if (data.categoryMeta) {
          Object.keys(categoryMeta).forEach(k => delete categoryMeta[k]);
          Object.assign(categoryMeta, data.categoryMeta);
          categoryMeta.core = { icon: 'layout-grid', label: 'Core', colorClass: 'card-words', catClass: '' };
        }
        if (data.settings) {
          if (typeof data.settings.isDarkMode === 'boolean') isDarkMode = data.settings.isDarkMode;
          if (data.settings.voiceSettings) Object.assign(voiceSettings, data.settings.voiceSettings);
          if (data.settings.accessSettings) Object.assign(accessSettings, data.settings.accessSettings);
        }
        if (Array.isArray(data.history)) history = data.history.slice(0, 50);
        if (data.bigrams && typeof data.bigrams === 'object') learnedBigrams = data.bigrams;
        saveData(); saveSettings(); saveHistory(); saveBigrams();
        applyDarkMode(isDarkMode, false);
        applyAccessSettings(false);
        renderHome();
        renderPredictions();
        showToast('Backup opened', 'success');
      } catch (err) {
        showToast('This file could not be read. Choose a .json backup file.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });
}

function exportBackup() {
  const data = {
    app: 'TouchTalk',
    version: 2,
    exported: new Date().toISOString(),
    categories,
    categoryMeta,
    settings: { isDarkMode, voiceSettings, accessSettings },
    history,
    bigrams: learnedBigrams,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `touchtalk-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  showToast('Backup saved to your downloads', 'success');
}

function toggleDarkMode() { applyDarkMode(!isDarkMode, true); }
function applyDarkMode(on, save) {
  isDarkMode = on;
  document.documentElement.classList.toggle('dark', on);
  document.body.classList.toggle('dark', on);
  document.getElementById('darkToggle')?.setAttribute('aria-checked', String(on));
  const moon = document.querySelector('.icon-moon');
  const sun = document.querySelector('.icon-sun');
  if (moon) moon.style.display = on ? 'none' : '';
  if (sun) sun.style.display = on ? '' : 'none';
  const tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', on ? '#0E1711' : '#F2F5F1');
  if (save) saveSettings();
}

function showToast(msg, type = '', duration = 2200) {
  let el = document.getElementById('appToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'appToast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  clearTimeout(toastTimer);
  void el.offsetWidth;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

function initModal() {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('modalOverlay')?.classList.contains('open')) closeModal();
  });
}
function openModal(opts) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const footerEl = document.getElementById('modalFooter');
  if (!overlay) return;

  titleEl.textContent = opts.title || '';
  bodyEl.innerHTML = opts.body || '';
  bodyEl.scrollTop = 0;

  footerEl.innerHTML = '';
  const cancel = document.createElement('button');
  cancel.className = 'btn-cancel';
  cancel.type = 'button';
  cancel.textContent = opts.cancelLabel || 'Cancel';
  cancel.onclick = closeModal;
  footerEl.appendChild(cancel);
  if (opts.onSave) {
    const save = document.createElement('button');
    save.className = 'btn-save';
    save.type = 'button';
    save.innerHTML = `<span class="spinner" aria-hidden="true"></span><span class="save-text">${opts.saveLabel || 'Save'}</span>`;
    activeModalOnSave = opts.onSave;
    save.onclick = () => runModalSave(save);
    footerEl.appendChild(save);
  } else {
    activeModalOnSave = null;
  }

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  if (opts.onRender) opts.onRender();

  setTimeout(() => {
    const firstInput = bodyEl.querySelector('input, select, button');
    (firstInput || document.getElementById('modalClose'))?.focus();
  }, 320);
}
async function runModalSave(saveBtn) {
  if (!activeModalOnSave) return;
  saveBtn.classList.add('loading');
  saveBtn.disabled = true;
  try {
    const result = await activeModalOnSave();
    if (result === false) {
      saveBtn.classList.remove('loading');
      saveBtn.disabled = false;
    } else {
      closeModal();
    }
  } catch (e) {
    showToast('Something went wrong', 'error');
    saveBtn.classList.remove('loading');
    saveBtn.disabled = false;
  }
}
function closeModal() {
  stopActiveRecording();
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  activeModalOnSave = null;
}

let activeRecorder = null;
let activeRecStream = null;
let recAutoStop = null;
let customAudioEl = null;

function playAudio(src, onEnd) {
  try {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (customAudioEl) { customAudioEl.pause(); customAudioEl = null; }
    customAudioEl = new Audio(src);
    if (onEnd) customAudioEl.onended = customAudioEl.onerror = onEnd;
    customAudioEl.play().catch(() => { if (onEnd) onEnd(); });
  } catch (e) { if (onEnd) onEnd(); }
}

function findCustomAudio(text) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  for (const items of Object.values(categories)) {
    for (const it of items) {
      if (it.audio && it.word.trim().toLowerCase() === t) return it.audio;
    }
  }
  return null;
}

function voiceRecorderHTML(p) {
  return `
    <div class="form-field">
      <span class="field-label">Your own voice <span class="field-note">(optional)</span></span>
      <p class="rec-hint">Record a person saying this. The recording plays instead of the computer voice, which helps with names and words it says wrong.</p>
      <div class="voice-rec-row">
        <button type="button" class="rec-btn" id="${p}RecBtn"></button>
        <button type="button" class="rec-side-btn" id="${p}PlayBtn" hidden>${iconSvg('play')}<span>Play</span></button>
        <button type="button" class="rec-side-btn rec-del" id="${p}DelBtn" hidden>${iconSvg('trash-2')}<span>Remove</span></button>
      </div>
      <span class="rec-status" id="${p}RecStatus" role="status" aria-live="polite"></span>
    </div>`;
}

function wireVoiceRecorder(p, setAudio, getAudio) {
  const recBtn = document.getElementById(p + 'RecBtn');
  const playBtn = document.getElementById(p + 'PlayBtn');
  const delBtn = document.getElementById(p + 'DelBtn');
  const status = document.getElementById(p + 'RecStatus');
  if (!recBtn) return;

  const showSaved = has => {
    playBtn.hidden = !has;
    delBtn.hidden = !has;
    recBtn.innerHTML = `${iconSvg('mic')}<span>${has ? 'Record again' : 'Record'}</span>`;
    if (status) {
      status.classList.remove('is-recording');
      status.textContent = has ? 'Recording saved. Press Play to hear it.' : '';
    }
  };
  showSaved(!!getAudio());

  recBtn.addEventListener('click', async () => {

    if (activeRecorder && activeRecorder.state === 'recording') { activeRecorder.stop(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      showToast('This browser cannot record sound. Try Chrome or Safari.', 'error');
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      showToast('The microphone is blocked. Allow it in your browser settings, then try again.', 'error', 4000);
      return;
    }
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      clearTimeout(recAutoStop);
      stream.getTracks().forEach(t => t.stop());
      activeRecorder = null; activeRecStream = null;
      recBtn.classList.remove('recording');
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      if (!blob.size) { showSaved(!!getAudio()); return; }
      const reader = new FileReader();
      reader.onload = ev => { setAudio(ev.target.result); showSaved(true); };
      reader.readAsDataURL(blob);
    };
    activeRecorder = rec; activeRecStream = stream;
    rec.start();
    recBtn.classList.add('recording');
    recBtn.innerHTML = `${iconSvg('square')}<span>Stop</span>`;
    if (status) {
      status.classList.add('is-recording');
      status.textContent = 'Recording. Press Stop when you are done (10 seconds at most).';
    }
    recAutoStop = setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, 10000);
  });

  playBtn.addEventListener('click', () => {
    const a = getAudio();
    if (a) playAudio(a);
  });
  delBtn.addEventListener('click', () => {
    setAudio(null);
    showSaved(false);
  });
}

function stopActiveRecording() {
  try {
    clearTimeout(recAutoStop);
    if (activeRecorder && activeRecorder.state === 'recording') activeRecorder.stop();
    else if (activeRecStream) activeRecStream.getTracks().forEach(t => t.stop());
  } catch (e) {}
  activeRecorder = null; activeRecStream = null;
}

function iconLabel(name) {
  return name.replace(/-\d+$/, '').replace(/-/g, ' ');
}

// Picture field shared by the add dialogs: a photo upload, or one icon from PICKER_ICONS.
function pictureFieldHTML(p, defaultIcon) {
  const options = PICKER_ICONS.map(n => `
    <label class="icon-option">
      <input type="radio" name="${p}Icon" value="${n}" aria-label="${iconLabel(n)}"${n === defaultIcon ? ' checked' : ''}>
      <span>${iconSvg(n)}</span>
    </label>`).join('');
  return `
    <div class="form-field">
      <span class="field-label" id="${p}PicLabel">Picture <span class="field-note">(optional)</span></span>
      <button type="button" class="image-upload-box" id="${p}ImgBox">${iconSvg('image-plus')}<span class="upload-hint">Use a photo from this device</span></button>
      <input type="file" id="${p}ImgFile" accept="image/*" hidden>
      <div class="or-divider">or pick an icon</div>
      <div class="icon-picker" role="radiogroup" aria-labelledby="${p}PicLabel">${options}</div>
    </div>`;
}

function wirePicture(p, setImage) {
  const box = document.getElementById(p + 'ImgBox');
  const file = document.getElementById(p + 'ImgFile');
  const resetBox = () => {
    if (box) box.innerHTML = `${iconSvg('image-plus')}<span class="upload-hint">Use a photo from this device</span>`;
  };
  box?.addEventListener('click', () => file?.click());
  file?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImage(ev.target.result);
      if (box) box.innerHTML = `<img src="${ev.target.result}" alt=""><span class="upload-hint">Photo chosen. Press to change it.</span>`;
      document.querySelectorAll(`input[name="${p}Icon"]`).forEach(r => { r.checked = false; });
    };
    reader.readAsDataURL(f);
  });
  document.querySelectorAll(`input[name="${p}Icon"]`).forEach(r => r.addEventListener('change', () => {
    setImage(null);
    if (file) file.value = '';
    resetBox();
  }));
}

function pickedIcon(p) {
  return document.querySelector(`input[name="${p}Icon"]:checked`)?.value || null;
}

let pendingCategoryImage = null;
let pendingCategoryAudio = null;
function openAddCategoryModal() {
  pendingCategoryImage = null;
  pendingCategoryAudio = null;
  openModal({
    title: 'Add a category',
    saveLabel: 'Add category',
    body: `
      <div class="form-field">
        <label for="newCatName">Name</label>
        <input type="text" id="newCatName" placeholder="For example: Animals, School, Food">
      </div>
      <div class="form-field">
        <label for="newCatPos">Colour <span class="field-note">(the kind of words in it)</span></label>
        ${fitzSelectHTML('newCatPos', 'No colour')}
      </div>
      ${pictureFieldHTML('cat', 'folder')}
      ${voiceRecorderHTML('cat')}
    `,
    onRender: () => {
      document.getElementById('newCatName')?.focus();
      wirePicture('cat', img => { pendingCategoryImage = img; });
      wireVoiceRecorder('cat', a => { pendingCategoryAudio = a; }, () => pendingCategoryAudio);
    },
    onSave: () => {
      const nameRaw = document.getElementById('newCatName')?.value.trim() || '';
      const name = nameRaw.toLowerCase().replace(/\s+/g, '_');
      if (!nameRaw) { showToast('Type a name for the category.', 'error'); return false; }
      if (categories[name] || name === 'core') { showToast('A category with this name already exists.', 'error'); return false; }
      stopActiveRecording();
      const label = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
      const meta = { label, colorClass: 'card-custom', catClass: 'cat-custom', isImage: !!pendingCategoryImage };
      const catPosVal = document.getElementById('newCatPos')?.value;
      if (catPosVal) meta.pos = catPosVal;
      if (pendingCategoryImage) meta.emoji = pendingCategoryImage;
      else meta.icon = pickedIcon('cat') || 'folder';
      if (pendingCategoryAudio) meta.audio = pendingCategoryAudio;
      categories[name] = [];
      categoryMeta[name] = meta;
      saveData();
      pendingCategoryImage = null;
      pendingCategoryAudio = null;
      showToast(`${label} added`, 'success');
      if (currentView === 'home') renderHome();
    },
  });
}

let pendingSymbolImage = null;
let pendingSymbolAudio = null;
function openAddSymbolModal() {
  pendingSymbolImage = null;
  pendingSymbolAudio = null;
  const opts = Object.keys(categories).map(k => `<option value="${k}">${escapeHtml(categoryMeta[k]?.label || k)}</option>`).join('');
  openModal({
    title: 'Add a word',
    saveLabel: 'Add word',
    body: `
      <div class="form-field">
        <label for="symCat">Category</label>
        <select id="symCat">${opts}</select>
      </div>
      <div class="form-cols">
        <div class="form-field">
          <label for="symWord">What it says</label>
          <input type="text" id="symWord" placeholder="For example: outside">
        </div>
        <div class="form-field">
          <label for="symLabel">Button text <span class="field-note">(optional)</span></label>
          <input type="text" id="symLabel" placeholder="Leave empty to use the word">
        </div>
      </div>
      <div class="form-field">
        <label for="symPos">Colour <span class="field-note">(the kind of word)</span></label>
        ${fitzSelectHTML('symPos', 'Same as the category')}
      </div>
      ${pictureFieldHTML('sym')}
      ${voiceRecorderHTML('sym')}
    `,
    onRender: () => {
      document.getElementById('symWord')?.focus();
      wirePicture('sym', img => { pendingSymbolImage = img; });
      wireVoiceRecorder('sym', a => { pendingSymbolAudio = a; }, () => pendingSymbolAudio);
    },
    onSave: () => {
      const cat = document.getElementById('symCat')?.value;
      const word = document.getElementById('symWord')?.value.trim();
      const rawLabel = document.getElementById('symLabel')?.value.trim();
      const label = rawLabel || (word ? word.charAt(0).toUpperCase() + word.slice(1) : '');
      if (!word) { showToast('Type the word this button should say.', 'error'); return false; }
      stopActiveRecording();
      const item = { word, label, isImage: !!pendingSymbolImage };
      const symPosVal = document.getElementById('symPos')?.value;
      if (symPosVal) item.pos = symPosVal;
      if (pendingSymbolImage) item.emoji = pendingSymbolImage;
      else if (pickedIcon('sym')) item.icon = pickedIcon('sym');
      if (pendingSymbolAudio) item.audio = pendingSymbolAudio;
      categories[cat].push(item);
      saveData();
      pendingSymbolImage = null;
      pendingSymbolAudio = null;
      showToast(`${label} added to ${categoryMeta[cat]?.label || cat}`, 'success');
      if (currentView === 'home') renderHome();
    },
  });
}

let pendingPhraseImage = null;
let pendingPhraseAudio = null;
function openAddPhraseModal() {
  pendingPhraseImage = null;
  pendingPhraseAudio = null;
  openModal({
    title: 'Add a phrase',
    saveLabel: 'Add phrase',
    body: `
      <div class="form-field">
        <label for="phraseText">What it says</label>
        <input type="text" id="phraseText" placeholder="For example: I want to go outside, please">
      </div>
      <div class="form-field">
        <label for="phraseLabel">Button text</label>
        <input type="text" id="phraseLabel" placeholder="For example: Go outside">
      </div>
      ${pictureFieldHTML('phrase')}
      ${voiceRecorderHTML('phrase')}
    `,
    onRender: () => {
      document.getElementById('phraseText')?.focus();
      wirePicture('phrase', img => { pendingPhraseImage = img; });
      wireVoiceRecorder('phrase', a => { pendingPhraseAudio = a; }, () => pendingPhraseAudio);
    },
    onSave: () => {
      const phrase = document.getElementById('phraseText')?.value.trim();
      const label = document.getElementById('phraseLabel')?.value.trim();
      if (!phrase) { showToast('Type the phrase this button should say.', 'error'); return false; }
      if (!label) { showToast('Type a short button text.', 'error'); return false; }
      stopActiveRecording();
      const item = { word: phrase, label, isImage: !!pendingPhraseImage };
      if (pendingPhraseImage) item.emoji = pendingPhraseImage;
      else if (pickedIcon('phrase')) item.icon = pickedIcon('phrase');
      if (pendingPhraseAudio) item.audio = pendingPhraseAudio;
      categories.quickPhrases.push(item);
      saveData();
      pendingPhraseImage = null;
      pendingPhraseAudio = null;
      showToast(`${label} added to Quick Phrases`, 'success');
      if (currentView === 'home') renderHome();
    },
  });
}

function openDeleteCategoryModal() {
  openModal({ title: 'Remove a category', cancelLabel: 'Done', body: buildDeleteCategoryBody() });
}
function buildDeleteCategoryBody() {
  let rows = '';
  Object.keys(categories).forEach(key => {
    const meta = categoryMeta[key] || {};
    const locked = PROTECTED.includes(key);
    const count = categories[key].length;
    const label = meta.label || key;
    rows += `
      <div class="delete-row">
        <span class="delete-row-info">${catArtHtml(key)}<span>${escapeHtml(label)}<span class="delete-row-count">${count} ${count === 1 ? 'word' : 'words'}</span></span></span>
        ${locked
          ? `<button class="delete-row-btn" disabled>${iconSvg('lock')}Built in</button>`
          : `<button class="delete-row-btn" onclick="confirmDeleteCategory('${key}')" aria-label="Remove ${escapeHtml(label)}">Remove</button>`}
      </div>`;
  });
  return `<p class="modal-note">Built-in categories cannot be removed. You can still remove single words from them.</p><div class="delete-list">${rows}</div>`;
}
function confirmDeleteCategory(key) {
  const label = categoryMeta[key]?.label || key;
  const count = categories[key]?.length || 0;
  if (!confirm(`Remove ${label} and the ${count} ${count !== 1 ? 'words' : 'word'} in it? This cannot be undone.`)) return;
  delete categories[key];
  delete categoryMeta[key];
  saveData();
  showToast(`${label} removed`, 'success');
  document.getElementById('modalBody').innerHTML = buildDeleteCategoryBody();
  if (currentView === 'home') renderHome();
}

function openDeleteSymbolModal() {
  const opts = Object.keys(categories).map(k => `<option value="${k}">${escapeHtml(categoryMeta[k]?.label || k)}</option>`).join('');
  openModal({
    title: 'Remove words',
    cancelLabel: 'Done',
    body: `
      <div class="form-field">
        <label for="delSymCat">Category</label>
        <select id="delSymCat">${opts}</select>
      </div>
      <div id="deleteSymbolList" class="delete-list"></div>
    `,
    onRender: () => {
      const sel = document.getElementById('delSymCat');
      sel?.addEventListener('change', renderDeleteSymbolList);
      renderDeleteSymbolList();
    },
  });
}
function renderDeleteSymbolList() {
  const key = document.getElementById('delSymCat')?.value;
  const list = document.getElementById('deleteSymbolList');
  if (!list || !key) return;
  const items = categories[key] || [];
  if (!items.length) {
    list.innerHTML = '<p class="modal-note">This category has no words yet.</p>';
    return;
  }
  list.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'delete-row';
    row.innerHTML = `<span class="delete-row-info">${artHtml(item)}<span>${escapeHtml(item.label)}</span></span>`;
    const btn = document.createElement('button');
    btn.className = 'delete-row-btn';
    btn.textContent = 'Remove';
    btn.setAttribute('aria-label', `Remove ${item.label}`);
    btn.onclick = () => confirmDeleteSymbol(key, i);
    row.appendChild(btn);
    list.appendChild(row);
  });
}
function confirmDeleteSymbol(key, idx) {
  const item = categories[key]?.[idx];
  if (!item) return;
  if (!confirm(`Remove ${item.label}? This cannot be undone.`)) return;
  categories[key].splice(idx, 1);
  saveData();
  showToast(`${item.label} removed`, 'success');
  renderDeleteSymbolList();
  if (currentView === 'home') renderHome();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
