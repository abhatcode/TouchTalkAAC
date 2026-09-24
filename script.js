
let currentText = '';
let currentCategory = 'home';
let currentView = 'home';
let isDarkMode = false;
let voiceSettings = { speed: 0.85, pitch: 1.0, voiceIndex: -1 };
let accessSettings = { holdMs: 0, debounceMs: 0, speakEachWord: true, gridSize: 'medium' };
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

const FITZ_LEGEND = [
  { pos: 'pronoun', label: 'People' }, { pos: 'verb', label: 'Actions' }, { pos: 'adj', label: 'Describing' },
  { pos: 'prep', label: 'Position' }, { pos: 'adverb', label: 'When/How much' }, { pos: 'question', label: 'Questions' },
  { pos: 'negation', label: 'No/Stop' }, { pos: 'social', label: 'Social' },
];

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
    { word: 'happy', emoji: '😊', label: 'Happy' },
    { word: 'sad', emoji: '😢', label: 'Sad' },
    { word: 'tired', emoji: '😴', label: 'Tired' },
    { word: 'hurt', emoji: '🤕', label: 'Hurt' },
    { word: 'angry', emoji: '😠', label: 'Angry' },
    { word: 'scared', emoji: '😨', label: 'Scared' },
    { word: 'excited', emoji: '🤩', label: 'Excited' },
    { word: 'bored', emoji: '😑', label: 'Bored' },
  ],
  needs: [
    { word: 'water', emoji: '💧', label: 'Water' },
    { word: 'food', emoji: '🍕', label: 'Food' },
    { word: 'bathroom', emoji: '🚻', label: 'Bathroom' },
    { word: 'hungry', emoji: '🍽️', label: 'Hungry' },
    { word: 'thirsty', emoji: '🥤', label: 'Thirsty' },
    { word: 'cold', emoji: '🥶', label: 'Cold' },
    { word: 'hot', emoji: '🥵', label: 'Hot' },
    { word: 'medicine', emoji: '💊', label: 'Medicine' },
    { word: 'rest', emoji: '🛋️', label: 'Rest' },
  ],
  words: [
    { word: 'yes', emoji: '✅', label: 'Yes' },
    { word: 'no', emoji: '❌', label: 'No' },
    { word: 'please', emoji: '🙏', label: 'Please' },
    { word: 'thank you', emoji: '🙌', label: 'Thank You' },
    { word: 'I', emoji: '👤', label: 'I' },
    { word: 'want', emoji: '👉', label: 'Want' },
    { word: 'need', emoji: '❗', label: 'Need' },
    { word: 'help', emoji: '🆘', label: 'Help' },
    { word: 'more', emoji: '➕', label: 'More' },
    { word: 'done', emoji: '✔️', label: 'Done' },
  ],
  actions: [
    { word: 'go', emoji: '🚶', label: 'Go' },
    { word: 'stop', emoji: '🛑', label: 'Stop' },
    { word: 'sit', emoji: '🪑', label: 'Sit' },
    { word: 'stand', emoji: '🧍', label: 'Stand' },
    { word: 'sleep', emoji: '😴', label: 'Sleep' },
    { word: 'eat', emoji: '🍴', label: 'Eat' },
    { word: 'drink', emoji: '🥤', label: 'Drink' },
    { word: 'play', emoji: '🎮', label: 'Play' },
  ],
  people: [
    { word: 'mom', emoji: '👩', label: 'Mom' },
    { word: 'dad', emoji: '👨', label: 'Dad' },
    { word: 'sister', emoji: '👧', label: 'Sister' },
    { word: 'brother', emoji: '👦', label: 'Brother' },
    { word: 'friend', emoji: '🤝', label: 'Friend' },
    { word: 'teacher', emoji: '👩‍🏫', label: 'Teacher' },
    { word: 'therapist', emoji: '👨‍⚕️', label: 'Therapist' },
    { word: 'doctor', emoji: '👩‍⚕️', label: 'Doctor' },
    { word: 'grandma', emoji: '👵', label: 'Grandma' },
    { word: 'grandpa', emoji: '👴', label: 'Grandpa' },
  ],
  quickPhrases: [
    { word: 'I want to go home', emoji: '🏠', label: 'Go Home' },
    { word: 'I need help please', emoji: '🆘', label: 'Need Help' },
    { word: 'I am feeling sick', emoji: '🤒', label: 'Feeling Sick' },
    { word: 'Can we take a break', emoji: '⏸️', label: 'Take a Break' },
    { word: 'Thank you very much', emoji: '🙏', label: 'Thank You' },
    { word: 'I want to eat', emoji: '🍽️', label: 'Want to Eat' },
    { word: 'I need to use the bathroom', emoji: '🚻', label: 'Bathroom' },
    { word: 'I am happy', emoji: '😊', label: 'I am Happy' },
    { word: 'I am sad', emoji: '😢', label: 'I am Sad' },
    { word: 'I want water please', emoji: '💧', label: 'Want Water' },
    { word: 'I need to rest', emoji: '🛋️', label: 'Need Rest' },
    { word: 'I do not understand', emoji: '❓', label: "Don't Understand" },
  ],
};

const categoryMeta = {
  core:         { emoji: '🔑', label: 'Core',          colorClass: 'card-words',        catClass: '' },
  feelings:     { emoji: '😊', label: 'Feelings',      colorClass: 'card-feelings',     catClass: 'cat-feelings' },
  needs:        { emoji: '💧', label: 'Needs',          colorClass: 'card-needs',        catClass: 'cat-needs' },
  words:        { emoji: '💬', label: 'Words',          colorClass: 'card-words',        catClass: 'cat-words' },
  actions:      { emoji: '🚶', label: 'Actions',        colorClass: 'card-actions',      catClass: 'cat-actions' },
  people:       { emoji: '👨‍👩‍👧', label: 'People',    colorClass: 'card-people',       catClass: 'cat-people' },
  quickPhrases: { emoji: '⭐', label: 'Quick Phrases',  colorClass: 'card-quickphrases', catClass: 'cat-quickphrases' },
};

const PROTECTED = ['feelings', 'needs', 'words', 'actions', 'people', 'quickPhrases'];

window.addEventListener('load', () => {
  loadData();
  loadSettings();
  loadHistory();
  loadBigrams();
  applyDarkMode(isDarkMode, false);
  applyAccessSettings(false);
  renderHome();
  renderPredictions();
  initNav();
  initSearch();
  initSettings();
  initModal();
  initVoices();
  initTypeView();
  initBackup();
  registerSW();
  updateInstallUI();
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
  showToast('✅ TouchTalk installed', 'success');
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
    hint.textContent = '✅ TouchTalk is installed on this device.';
    return;
  }
  btn.style.display = '';
  if (isIOS()) {
    btn.textContent = '📲 How to Install on iPhone/iPad';
    hint.textContent = 'On iOS, tap the Share button in Safari, then “Add to Home Screen”.';
  } else if (deferredInstallPrompt) {
    btn.textContent = '📲 Install App';
    hint.textContent = 'Install TouchTalk to use it full-screen and offline, like a normal app.';
  } else {
    btn.textContent = '📲 How to Install';
    hint.textContent = 'Open your browser menu and choose “Install app” or “Add to Home Screen”.';
  }
}
async function installApp() {
  if (isIOS() && !deferredInstallPrompt) {
    openModal({
      title: 'Install on iPhone / iPad',
      body: `
        <ol style="padding-left:22px; line-height:2; font-size:17px; color:var(--text-1)">
          <li>Make sure you're using <strong>Safari</strong>.</li>
          <li>Tap the <strong>Share</strong> button <span aria-hidden="true">(the square with an up arrow)</span> at the bottom of the screen.</li>
          <li>Scroll down and tap <strong>“Add to Home Screen”</strong>.</li>
          <li>Tap <strong>Add</strong> in the top-right corner.</li>
        </ol>
        <p style="margin-top:14px; color:var(--text-2); font-size:15px">TouchTalk will appear on your home screen and work fully offline.</p>
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
      <p style="font-size:17px; line-height:1.6; color:var(--text-1)">Use your browser's menu to install this app:</p>
      <ul style="padding-left:22px; line-height:2; font-size:16px; color:var(--text-1); margin-top:10px">
        <li><strong>Android (Chrome):</strong> tap ⋮ → “Install app” / “Add to Home screen”.</li>
        <li><strong>iPhone/iPad (Safari):</strong> Share → “Add to Home Screen”.</li>
        <li><strong>Desktop (Chrome/Edge):</strong> click the install icon in the address bar.</li>
      </ul>
    `,
  });
}

function saveData() {
  try {
    localStorage.setItem('tt_data', JSON.stringify({ categories, categoryMeta }));
  } catch (e) {

    showToast('⚠️ Storage is full — this change may not be saved. Delete unused photos or recordings.', 'error', 4000);
  }
}
function loadData() {
  try {
    const raw = localStorage.getItem('tt_data');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.categories) Object.assign(categories, d.categories);
    if (d.categoryMeta) Object.assign(categoryMeta, d.categoryMeta);

    categoryMeta.core = { emoji: '🔑', label: 'Core', colorClass: 'card-words', catClass: '' };
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
function switchView(view) {
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
    span.textContent = currentText.trim();
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
    chip.className = 'predict-chip';
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
  if (!text) { showToast('Nothing to speak yet'); return; }
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
function testVoice() { speakSingleWord('Hello! I am ready to help you communicate.'); }
function emergency() {
  const msg = 'Help. I need assistance now.';
  setOutputText(msg);
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const u = makeUtterance(msg);
    u.rate = 0.9; u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
  showToast('🆘 Emergency alert spoken', 'error');
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
    chip.className = 'predict-chip';
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

function animateGrid() {
  const grid = document.getElementById('symbolGrid');
  if (!grid) return;
  grid.classList.remove('animating');
  void grid.offsetWidth;
  grid.classList.add('animating');
}

function renderHome() {
  currentCategory = 'home';
  const catNav = document.getElementById('catNav');
  const grid = document.getElementById('symbolGrid');
  if (catNav) catNav.style.display = 'none';
  if (!grid) return;
  grid.className = 'symbol-grid';
  grid.innerHTML = '';

  Object.keys(categoryMeta).forEach(key => {
    const meta = categoryMeta[key];
    const count = key === 'core' ? CORE_WORDS.length : (categories[key] ? categories[key].length : 0);
    const btn = document.createElement('button');
    btn.className = `category-card ${meta.colorClass || 'card-custom'}`;
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', `${meta.label}, ${count} words`);
    btn.onclick = () => {
      if (meta.audio) playAudio(meta.audio);
      showCategory(key);
    };
    if (meta.isImage) {
      btn.innerHTML = `<img src="${meta.emoji}" alt="" class="symbol-image" style="border-radius:10px"><span class="card-label">${escapeHtml(meta.label)}</span><span class="card-count">${count} words</span>`;
    } else {
      btn.innerHTML = `<span class="card-emoji" aria-hidden="true">${meta.emoji}</span><span class="card-label">${escapeHtml(meta.label)}</span><span class="card-count">${count} words</span>`;
    }
    grid.appendChild(btn);
  });
  animateGrid();
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
    btn.className = 'symbol-btn';
    btn.setAttribute('role', 'gridcell');
    btn.setAttribute('aria-label', item.label);
    bindActivate(btn, () => addWord(item.word, item.audio));
    if (item.isImage) {
      btn.innerHTML = `<img src="${item.emoji}" alt="" class="symbol-image"><span class="symbol-label">${escapeHtml(item.label)}</span>`;
    } else {
      btn.innerHTML = `<span class="symbol-emoji" aria-hidden="true">${item.emoji}</span><span class="symbol-label">${escapeHtml(item.label)}</span>`;
    }
    grid.appendChild(btn);
  });
  animateGrid();
}

function renderCoreBoard() {
  const grid = document.getElementById('symbolGrid');
  if (!grid) return;
  const bigButtons = accessSettings.gridSize === 'large' || accessSettings.gridSize === 'xl';
  grid.className = 'core-grid' + (bigButtons ? ' cols-4' : '');
  grid.innerHTML = '';

  const legend = document.createElement('div');
  legend.className = 'fitz-legend';
  legend.style.gridColumn = '1 / -1';
  legend.setAttribute('aria-hidden', 'true');
  FITZ_LEGEND.forEach(l => {
    const s = document.createElement('span');
    s.innerHTML = `<i class="fitz-${l.pos}"></i>${l.label}`;
    legend.appendChild(s);
  });
  grid.appendChild(legend);

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
  catNav.style.display = 'block';
  const scroll = catNav.querySelector('.cat-nav-scroll');
  if (!scroll) return;
  scroll.innerHTML = '';

  const homeTab = document.createElement('button');
  homeTab.className = 'cat-tab';
  homeTab.setAttribute('aria-label', 'All categories');
  homeTab.innerHTML = `<span class="cat-emoji" aria-hidden="true">🏠</span><span>Home</span>`;
  homeTab.onclick = () => renderHome();
  scroll.appendChild(homeTab);

  Object.keys(categoryMeta).forEach(key => {
    const meta = categoryMeta[key];
    const tab = document.createElement('button');
    tab.className = `cat-tab${key === activeCat ? ' active' : ''}`;
    tab.setAttribute('data-cat', key);
    tab.setAttribute('aria-label', meta.label);
    if (key === activeCat) tab.setAttribute('aria-current', 'true');
    const emojiHtml = meta.isImage
      ? `<img src="${meta.emoji}" alt="" style="width:22px;height:22px;border-radius:5px;object-fit:cover">`
      : `<span class="cat-emoji" aria-hidden="true">${meta.emoji}</span>`;
    tab.innerHTML = `${emojiHtml}<span>${escapeHtml(meta.label)}</span>`;
    tab.onclick = () => showCategory(key);
    scroll.appendChild(tab);
  });

  setTimeout(() => {
    const active = scroll.querySelector('.cat-tab.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
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
    toggle.classList.toggle('active', searchOpen);
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
      results.push({ word: item.word, label: item.word, emoji: '🔑', catLabel: 'Core' });
    }
  });
  Object.keys(categories).forEach(catKey => {
    const meta = categoryMeta[catKey] || {};
    (categories[catKey] || []).forEach(item => {
      if (item.word.toLowerCase().includes(lower) || item.label.toLowerCase().includes(lower)) {
        results.push({ ...item, catLabel: meta.label || catKey });
      }
    });
  });

  if (!results.length) {
    area.innerHTML = `<div class="search-no-results">No results for “<strong>${escapeHtml(q)}</strong>”</div>`;
    return;
  }
  const header = document.createElement('div');
  header.className = 'search-results-header';
  header.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
  const gridEl = document.createElement('div');
  gridEl.className = 'search-results-grid';
  results.forEach(item => {
    const chip = document.createElement('button');
    chip.className = 'word-chip';
    chip.setAttribute('aria-label', `${item.label}, in ${item.catLabel}`);
    bindActivate(chip, () => addWord(item.word, item.audio));
    const emojiHtml = item.isImage
      ? `<img src="${item.emoji}" alt="" class="symbol-image" style="width:44px;height:44px">`
      : `<span class="word-chip-emoji" aria-hidden="true">${item.emoji}</span>`;
    chip.innerHTML = `${emojiHtml}<span class="word-chip-label">${escapeHtml(item.label)}</span><span class="word-chip-cat">${escapeHtml(item.catLabel)}</span>`;
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
    list.innerHTML = `<div class="history-empty">🕘 No history yet.<br>Sentences you speak will appear here.</div>`;
    return;
  }
  list.innerHTML = '';
  history.forEach(text => {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
      <span class="history-text">${escapeHtml(text)}</span>
      <button class="history-add" aria-label="Add to sentence" title="Add to sentence">＋</button>
      <button class="history-speak" aria-label="Speak again" title="Speak again">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        </svg>
      </button>`;
    row.querySelector('.history-speak').onclick = () => {
      const custom = findCustomAudio(text);
      custom ? playAudio(custom) : speakSingleWord(text);
    };
    row.querySelector('.history-add').onclick = () => { setOutputText(text); switchView('home'); showToast('Added to sentence'); };
    list.appendChild(row);
  });
  const clearBtn = document.createElement('button');
  clearBtn.className = 'history-clear-btn';
  clearBtn.textContent = '🗑️ Clear History';
  clearBtn.onclick = () => {
    if (confirm('Clear all spoken history?')) {
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
    showToast(accessSettings.holdMs ? `Hold to activate: ${accessSettings.holdMs / 1000}s` : 'Hold to activate: off');
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
          showToast('Not a valid TouchTalk backup file', 'error');
          return;
        }
        if (!confirm('Import this backup? It will replace your current words, phrases and settings.')) return;
        if (data.categories) { Object.keys(categories).forEach(k => delete categories[k]); Object.assign(categories, data.categories); delete categories.core; }
        if (data.categoryMeta) {
          Object.keys(categoryMeta).forEach(k => delete categoryMeta[k]);
          Object.assign(categoryMeta, data.categoryMeta);
          categoryMeta.core = { emoji: '🔑', label: 'Core', colorClass: 'card-words', catClass: '' };
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
        showToast('✅ Backup imported', 'success');
      } catch (err) {
        showToast('Could not read that file', 'error');
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
  showToast('💾 Backup downloaded', 'success');
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
  if (tc) tc.setAttribute('content', on ? '#1A1A1A' : '#2563EB');
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
      <label>Voice Recording (optional)</label>
      <p class="rec-hint">Record your own voice for this word — it will play instead of the computer voice. Great for names or words the computer says wrong.</p>
      <div class="voice-rec-row">
        <button type="button" class="rec-btn" id="${p}RecBtn">🎙️ Record</button>
        <button type="button" class="rec-side-btn" id="${p}PlayBtn" style="display:none" aria-label="Play recording">▶️</button>
        <button type="button" class="rec-side-btn rec-del" id="${p}DelBtn" style="display:none" aria-label="Delete recording">✕</button>
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
    playBtn.style.display = has ? '' : 'none';
    delBtn.style.display = has ? '' : 'none';
    recBtn.textContent = has ? '🎙️ Re-record' : '🎙️ Record';
    if (status) status.textContent = has ? '✅ Recording saved — tap ▶️ to check it' : '';
  };
  showSaved(!!getAudio());

  recBtn.addEventListener('click', async () => {

    if (activeRecorder && activeRecorder.state === 'recording') { activeRecorder.stop(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      showToast('Recording is not supported in this browser', 'error');
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      showToast('Microphone access was denied', 'error');
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
    recBtn.textContent = '⏹ Stop';
    if (status) status.textContent = '🔴 Recording… tap Stop when done (10s max)';
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

function wireUpload(boxId, fileId, onLoad) {
  const box = document.getElementById(boxId);
  const file = document.getElementById(fileId);
  box?.addEventListener('click', () => file?.click());
  file?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      onLoad(ev.target.result);
      if (box) box.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(f);
  });
}

let pendingCategoryImage = null;
let pendingCategoryAudio = null;
function openAddCategoryModal() {
  pendingCategoryImage = null;
  pendingCategoryAudio = null;
  openModal({
    title: 'Add New Category',
    saveLabel: 'Save Category',
    body: `
      <div class="form-cols">
        <div class="form-field">
          <label for="newCatName">Category Name</label>
          <input type="text" id="newCatName" placeholder="e.g. Animals, Colors, School">
        </div>
        <div class="form-field">
          <label for="catImgFile">Emoji or Image</label>
          <div class="image-upload-box" id="catImgBox">
            <span style="font-size:30px" aria-hidden="true">📷</span>
            <span class="upload-hint">Tap to upload an image</span>
            <input type="file" id="catImgFile" accept="image/*" style="display:none" aria-label="Upload category image">
          </div>
          <div class="or-divider">or</div>
          <input type="text" id="newCatEmoji" placeholder="Type an emoji, e.g. 🐶" aria-label="Category emoji">
        </div>
      </div>
      ${voiceRecorderHTML('cat')}
    `,
    onRender: () => {
      document.getElementById('newCatName')?.focus();
      wireUpload('catImgBox', 'catImgFile', img => { pendingCategoryImage = img; });
      wireVoiceRecorder('cat', a => { pendingCategoryAudio = a; }, () => pendingCategoryAudio);
    },
    onSave: () => {
      const nameRaw = document.getElementById('newCatName')?.value.trim() || '';
      const name = nameRaw.toLowerCase().replace(/\s+/g, '_');
      const emoji = pendingCategoryImage || document.getElementById('newCatEmoji')?.value.trim();
      if (!nameRaw) { showToast('Please enter a category name', 'error'); return false; }
      if (!emoji) { showToast('Please add an emoji or image', 'error'); return false; }
      if (categories[name] || name === 'core') { showToast('That category already exists', 'error'); return false; }
      stopActiveRecording();
      const label = nameRaw.charAt(0).toUpperCase() + nameRaw.slice(1);
      categories[name] = [];
      categoryMeta[name] = { emoji, label, colorClass: 'card-custom', catClass: 'cat-custom', isImage: !!pendingCategoryImage };
      if (pendingCategoryAudio) categoryMeta[name].audio = pendingCategoryAudio;
      saveData();
      pendingCategoryImage = null;
      pendingCategoryAudio = null;
      showToast(`“${label}” created`, 'success');
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
    title: 'Add New Symbol',
    saveLabel: 'Save Symbol',
    body: `
      <div class="form-field">
        <label for="symCat">Category</label>
        <select id="symCat">${opts}</select>
      </div>
      <div class="form-cols">
        <div class="form-field">
          <label for="symWord">Word or Phrase</label>
          <input type="text" id="symWord" placeholder="e.g. happy, go outside">
        </div>
        <div class="form-field">
          <label for="symLabel">Button Label</label>
          <input type="text" id="symLabel" placeholder="Short name shown on the button">
        </div>
      </div>
      <div class="form-field">
        <label for="symImgFile">Emoji or Image</label>
        <div class="image-upload-box" id="symImgBox">
          <span style="font-size:30px" aria-hidden="true">📷</span>
          <span class="upload-hint">Tap to upload an image</span>
          <input type="file" id="symImgFile" accept="image/*" style="display:none" aria-label="Upload symbol image">
        </div>
        <div class="or-divider">or</div>
        <input type="text" id="symEmoji" placeholder="Type an emoji, e.g. 😊" aria-label="Symbol emoji">
      </div>
      ${voiceRecorderHTML('sym')}
    `,
    onRender: () => {
      document.getElementById('symWord')?.focus();
      wireUpload('symImgBox', 'symImgFile', img => { pendingSymbolImage = img; });
      wireVoiceRecorder('sym', a => { pendingSymbolAudio = a; }, () => pendingSymbolAudio);
    },
    onSave: () => {
      const cat = document.getElementById('symCat')?.value;
      const word = document.getElementById('symWord')?.value.trim();
      const rawLabel = document.getElementById('symLabel')?.value.trim();
      const emoji = pendingSymbolImage || document.getElementById('symEmoji')?.value.trim();
      const label = rawLabel || (word ? word.charAt(0).toUpperCase() + word.slice(1) : '');
      if (!word) { showToast('Please enter a word or phrase', 'error'); return false; }
      if (!emoji) { showToast('Please add an emoji or image', 'error'); return false; }
      stopActiveRecording();
      const item = { word, emoji, label, isImage: !!pendingSymbolImage };
      if (pendingSymbolAudio) item.audio = pendingSymbolAudio;
      categories[cat].push(item);
      saveData();
      pendingSymbolImage = null;
      pendingSymbolAudio = null;
      showToast(`“${label}” added to ${categoryMeta[cat]?.label || cat}`, 'success');
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
    title: 'Add Quick Phrase',
    saveLabel: 'Save Phrase',
    body: `
      <div class="form-field">
        <label for="phraseText">Full Phrase (what gets spoken)</label>
        <input type="text" id="phraseText" placeholder="e.g. I want to go outside please">
      </div>
      <div class="form-cols">
        <div class="form-field">
          <label for="phraseLabel">Button Label (short name)</label>
          <input type="text" id="phraseLabel" placeholder="e.g. Go Outside">
        </div>
        <div class="form-field">
          <label for="phraseImgFile">Emoji or Image</label>
          <div class="image-upload-box" id="phraseImgBox">
            <span style="font-size:30px" aria-hidden="true">📷</span>
            <span class="upload-hint">Tap to upload an image</span>
            <input type="file" id="phraseImgFile" accept="image/*" style="display:none" aria-label="Upload phrase image">
          </div>
          <div class="or-divider">or</div>
          <input type="text" id="phraseEmoji" placeholder="Type an emoji, e.g. 🏡" aria-label="Phrase emoji">
        </div>
      </div>
      ${voiceRecorderHTML('phrase')}
    `,
    onRender: () => {
      document.getElementById('phraseText')?.focus();
      wireUpload('phraseImgBox', 'phraseImgFile', img => { pendingPhraseImage = img; });
      wireVoiceRecorder('phrase', a => { pendingPhraseAudio = a; }, () => pendingPhraseAudio);
    },
    onSave: () => {
      const phrase = document.getElementById('phraseText')?.value.trim();
      const label = document.getElementById('phraseLabel')?.value.trim();
      const emoji = pendingPhraseImage || document.getElementById('phraseEmoji')?.value.trim();
      if (!phrase) { showToast('Please enter a phrase', 'error'); return false; }
      if (!label) { showToast('Please enter a button label', 'error'); return false; }
      if (!emoji) { showToast('Please add an emoji or image', 'error'); return false; }
      stopActiveRecording();
      const item = { word: phrase, emoji, label, isImage: !!pendingPhraseImage };
      if (pendingPhraseAudio) item.audio = pendingPhraseAudio;
      categories.quickPhrases.push(item);
      saveData();
      pendingPhraseImage = null;
      pendingPhraseAudio = null;
      showToast(`“${label}” added to Quick Phrases`, 'success');
      if (currentView === 'home') renderHome();
    },
  });
}

function openDeleteCategoryModal() {
  openModal({ title: 'Delete Category', body: buildDeleteCategoryBody() });
}
function buildDeleteCategoryBody() {
  let rows = '';
  Object.keys(categories).forEach(key => {
    const meta = categoryMeta[key] || {};
    const locked = PROTECTED.includes(key);
    const count = categories[key].length;
    const label = meta.label || key;
    const disp = meta.isImage
      ? `<img src="${meta.emoji}" alt="" style="width:34px;height:34px;border-radius:7px;object-fit:cover">`
      : `<span style="font-size:26px" aria-hidden="true">${meta.emoji}</span>`;
    rows += `
      <div class="delete-row">
        <span class="delete-row-info">${disp}<span>${escapeHtml(label)} <span class="delete-row-count">${count} words</span></span></span>
        ${locked
          ? `<button class="delete-row-btn" disabled>🔒 Protected</button>`
          : `<button class="delete-row-btn" onclick="confirmDeleteCategory('${key}')" aria-label="Delete ${escapeHtml(label)}">Delete</button>`}
      </div>`;
  });
  return `<div class="delete-list">${rows}</div>`;
}
function confirmDeleteCategory(key) {
  const label = categoryMeta[key]?.label || key;
  const count = categories[key]?.length || 0;
  if (!confirm(`Delete “${label}” and all ${count} symbol${count !== 1 ? 's' : ''} inside it?`)) return;
  delete categories[key];
  delete categoryMeta[key];
  saveData();
  showToast(`“${label}” deleted`, 'success');
  document.getElementById('modalBody').innerHTML = buildDeleteCategoryBody();
  if (currentView === 'home') renderHome();
}

function openDeleteSymbolModal() {
  const opts = Object.keys(categories).map(k => `<option value="${k}">${escapeHtml(categoryMeta[k]?.label || k)}</option>`).join('');
  openModal({
    title: 'Delete Symbol',
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
    list.innerHTML = '<p style="color:var(--text-2);text-align:center;padding:20px">No symbols in this category</p>';
    return;
  }
  list.innerHTML = '';
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'delete-row';
    const disp = item.isImage
      ? `<img src="${item.emoji}" alt="" style="width:34px;height:34px;border-radius:7px;object-fit:cover">`
      : `<span style="font-size:26px" aria-hidden="true">${item.emoji}</span>`;
    row.innerHTML = `<span class="delete-row-info">${disp}<span>${escapeHtml(item.label)}</span></span>`;
    const btn = document.createElement('button');
    btn.className = 'delete-row-btn';
    btn.textContent = 'Delete';
    btn.setAttribute('aria-label', `Delete ${item.label}`);
    btn.onclick = () => confirmDeleteSymbol(key, i);
    row.appendChild(btn);
    list.appendChild(row);
  });
}
function confirmDeleteSymbol(key, idx) {
  const item = categories[key]?.[idx];
  if (!item) return;
  if (!confirm(`Delete “${item.label}”?`)) return;
  categories[key].splice(idx, 1);
  saveData();
  showToast(`“${item.label}” deleted`, 'success');
  renderDeleteSymbolList();
  if (currentView === 'home') renderHome();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
