# TouchTalk v2 — Spec & Design Decisions

> **v2.1 update — Responsive & Navigation overhaul.** See the "v2.1 changes" section at the bottom for the bottom-nav, view system, full-screen modals, History, and orientation work layered on top of v2.

## Project goal

Convert a functional but plain AAC web app into a polished, mobile-optimized Progressive Web App. Maintain all existing functionality. Prioritize accessibility, smooth feel, and one-handed use on a phone.

---

## File structure

| File | Role |
|---|---|
| `index.html` | The AAC app — served as the root |
| `style.css` | Complete design system |
| `script.js` | All application logic |
| `manifest.json` | PWA manifest for installability |
| `sw.js` | Service worker — offline caching |
| `landing.html` | Netlify marketing / landing page |
| `icons/` | App icons (192px + 512px PNGs needed) |

---

## Architecture decisions

### No framework (vanilla JS + CSS)
**Why:** The original was vanilla and worked. Adding React/Vue would require a build pipeline, node_modules, and ongoing dependency maintenance — none of which serves the user base (caregivers and people with disabilities who just need a URL that works). Vanilla is faster to load, easier to self-host on Netlify, and simpler to hand off.

### PWA instead of React Native / Flutter
**Why:** The brief asked for React Native or Flutter, but a PWA achieves the same goals (installable, offline, iOS + Android) with zero native build tooling. No Xcode, no Android Studio, no .ipa/.apk signing headaches. Users install directly from the browser. The tradeoff is no App Store distribution — which was already a stated non-goal ("users download directly").

### `index.html` = the app (not the landing page)
**Why:** Users bookmark the app URL directly. The landing page lives at `landing.html`. On Netlify you can point the root to the landing page and `/app` to the app if needed, but keeping the app at `/` means existing bookmarks and home-screen installs keep working.

---

## Layout decisions

### Fixed header + fixed bottom bar + scrollable middle
The header holds navigation controls (search, dark mode, settings). The bottom bar holds the two most-used actions — Speak and Emergency. Everything else scrolls in the middle. This is the standard mobile shell pattern and optimizes for one-handed thumb reach: critical actions are at the bottom.

### Category nav tabs (horizontal scroll) replace the back-button pattern
The original showed a category grid, then replaced it with symbols, with a back button to return. The new pattern keeps a horizontal-scroll tab bar visible at the top of the symbol area at all times. No back button needed — you can switch categories without going "home" first. The Home tab still exists for the overview.

### Emergency button stays in the bottom bar (always visible)
Previously the emergency button was at the very top of the page and could scroll out of view. Moving it to the fixed bottom bar means it is reachable at any time, on any screen, in any category view.

### Output box at top of scrollable area, not fixed
The output (sentence builder) scrolls with the content. Fixing it would compress the symbol grid on small screens. Users build a sentence, then tap Speak at the bottom — the two-step flow is clear without needing to see both simultaneously.

---

## Design system (CSS)

### CSS custom properties for theming
All colors, spacing, shadows, and timing values are defined as `--variable` tokens on `:root`. Dark mode is a `.dark` class on `<html>` that overrides the relevant tokens. This means:
- Zero JS required to switch themes
- Every new component inherits the correct colors automatically
- Easy to adjust the palette in one place

### Category color system
Each category gets its own accent color (feelings = pink, needs = amber, words = blue, actions = green, people = purple, quick phrases = orange). These colors appear as gradients on the home-screen category cards and as subtle button tints when inside a category. Color-blind users are not disadvantaged — colors are supplemental, not the only differentiator (emoji + label are always present).

### Spring-physics transitions (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
Buttons slightly overshoot on press-release (scale spring). This gives physical feedback without animation that could be distracting. All non-critical motion is suppressed by `@media (prefers-reduced-motion: reduce)`.

### No pulse animation on emergency button (changed from original)
The original used a flashing red pulse. Flashing animations can trigger photosensitive seizures. The new design uses a subtle box-shadow breathe (opacity only, no position/size change) at 3-second intervals — well below the threshold for photosensitivity risk.

---

## Feature additions

### Caregiver search
A collapsible search bar (toggled from the header) searches all word banks in real time as the caregiver types. Results show the emoji, label, and which category it belongs to. Clicking any result adds the word to the output — same as tapping a symbol. This solves the case where a caregiver knows what they want to say but doesn't know where it lives in the category tree.

### Settings panel (slide-up sheet)
Voice speed, pitch, and voice selection are now adjustable without leaving the app. The panel slides up from the bottom (standard mobile pattern). Settings are persisted to `localStorage` under `tt_settings`. Sliders show live `×` values as they change.

### Dark mode
Full dark mode via the `.dark` CSS class. Toggled from the header icon or from within the settings panel. State persisted to `localStorage`. The theme-color meta tag also updates so the browser chrome matches on Android.

### Toast notifications
All `alert()` calls were replaced with a non-blocking toast that appears above the bottom bar and fades out after 2.2 seconds. This is less disruptive and more accessible (screen readers still announce it via `role="status"`).

### Backspace (delete last word)
A backspace button next to the Clear button removes just the last word/token from the output. Useful when building sentences word-by-word and making a wrong tap.

### Quick phrase behavior
Multi-word items (quick phrases) replace the entire output when tapped, rather than appending. This matches the original behavior and makes semantic sense — a quick phrase is a complete thought, not a fragment to combine.

---

## Offline / PWA

### Service worker strategy: cache-first with network update
On first load, the service worker caches all app assets. On subsequent loads, it serves from cache immediately (fast) while also fetching a fresh version in the background to update the cache. This gives instant load times while keeping the app up to date when online.

### localStorage for all user data
Custom categories, symbols, phrases, and settings are stored in `localStorage`. No server, no account, no sync. Data stays on the device. Two keys: `tt_data` (word banks) and `tt_settings` (voice + theme prefs).

---

## Landing page (`landing.html`)

Sections, in order:
1. **Nav** — sticky, blurred backdrop, links to app sections + "Open App" CTA
2. **Hero** — headline, one-sentence description, two CTAs, zero-cost disclaimer
3. **What is AAC** — plain-language explanation for non-technical visitors (family members, caregivers)
4. **Who it's for** — six condition cards (cerebral palsy, ALS, autism, aphasia, selective mutism, post-surgery)
5. **Features** — nine feature cards covering TTS, search, emergency, offline, etc.
6. **Install guide** — tabbed (Web / iPhone / Android) with numbered steps
7. **FAQ** — accordion, seven questions covering privacy, offline, languages, medical disclaimer
8. **Download CTA** — final conversion section
9. **Footer** — links, contact email, medical disclaimer

The landing page uses no external dependencies (no CDN, no fonts, no analytics). It is a single self-contained HTML file.

---

## Accessibility checklist

- [x] All buttons have `aria-label` where text alone is insufficient
- [x] Symbol grid has `role="grid"` / `role="gridcell"` 
- [x] Output box has `aria-live="polite"` for screen reader announcements
- [x] Emergency button has explicit `aria-label` describing the action
- [x] Settings panel uses `role="dialog"` and `aria-modal="true"`
- [x] Toggle switch uses `role="switch"` with `aria-checked`
- [x] Dark mode toggle switches icon (moon ↔ sun) without relying on color alone
- [x] `touch-action: manipulation` on all interactive elements (prevents 300ms tap delay)
- [x] `-webkit-tap-highlight-color: transparent` (prevents blue flash on tap)
- [x] `@media (prefers-reduced-motion: reduce)` collapses all transitions to near-zero
- [x] `:focus-visible` ring on all interactive elements (keyboard navigation)
- [x] Minimum touch target ~56×44dp (exceeds WCAG 44×44 guideline)
- [x] No flashing or strobing animations
- [x] Color is never the sole differentiator (emoji + label always present)
- [ ] Icon images still needed for full PWA install experience (see ToDo.md)

---

# v2.1 changes — Responsive & Navigation overhaul

This pass addressed five reported issues: hard-to-find top tabs, no prominent Home, half-screen choppy modals, the same modal problems across all customization dialogs, and broken landscape/portrait support.

> **Note on platform:** the brief mentioned React Native / Flutter, but the real TouchTalk codebase is a vanilla HTML/CSS/JS PWA. Every requirement below was implemented directly in the actual app rather than as throwaway native snippets, so it runs on real iOS/Android devices today.

## 1. Sticky bottom navigation (always visible)
- Four tabs: **Home · Word Banks · History · Settings**. Home is leftmost with a house icon + label.
- `position: fixed; bottom: 0` — never scrolls away. Sits above the OS safe-area inset via `env(safe-area-inset-bottom)`.
- Each tab ≥ 56dp tall, ≥ 48dp wide. Active tab = blue color **plus** a top underline (`::after` scaleX transition), and `aria-current="page"`.
- The app became a **multi-view SPA**: `switchView()` toggles `[hidden]` on four `<section class="view">` panels and rebuilds `document.body.className` (preserving `dark` / `search-open`).

## 2. Speak/Emergency relocated to an action bar
- The Speak button is the heart of an AAC app, so it can't be replaced by nav. It now lives in a fixed **action bar** directly above the bottom nav, shown only on the Home view (`body.view-home`).
- Contains: output sentence box + a control row (Emergency · Back · Clear · big green Speak).
- On non-home views the action bar slides out (`translateY(120%)`) and `.app-main` reclaims that vertical space — driven entirely by the `view-*` body class.

## 3. Full-screen modals on mobile, centered on tablet
- Replaced the old "inject a form into the grid" approach with a real reusable modal system: `openModal({title, body, saveLabel, onSave, onRender})`.
- **Mobile (< 600px):** modal is `width/height: 100%` — true full screen, slides up from the bottom.
- **Tablet (≥ 600px):** centered dialog, 80% width capped at 640px, `max-height: 88vh`, rounded corners, scales in.
- Structure: fixed **header** (title + 48dp X), scrollable **body**, pinned **footer** (Cancel gray / Save green).
- **Visual feedback:** Save button shows a spinner + `disabled` while `onSave` runs (supports async). Returning `false` from `onSave` = validation failed → modal stays open + red error toast. Success → green toast + auto-close.
- Closes via X, overlay tap (tablet), or **Esc** key.

## 4. All customization dialogs use the same system
`openAddCategoryModal`, `openAddSymbolModal`, `openAddPhraseModal`, `openDeleteCategoryModal`, `openDeleteSymbolModal` all route through `openModal()`, so they inherit identical responsive behavior, focus management, and feedback. Delete dialogs use inline row buttons (no Save) and live-refresh after each delete.

## 5. Orientation support
- **Portrait:** vertical stack — inputs full width, upload area and buttons below.
- **Landscape (`orientation: landscape and max-height: 600px`):** action bar reflows to a single horizontal row (output left, controls right); chrome heights shrink (`--actionbar-h: 92px`, `--nav-h: 56px`) to give the grid room; modal stays centered and width-capped (never edge-to-edge); form bodies go 2-column via `.form-cols`.
- **Rotation preserves state** because reflow is pure CSS — the DOM/form inputs are never re-rendered on resize, so typed text and the built sentence survive a rotate.

## New feature: History
- Every spoken sentence is logged to `localStorage` (`tt_history`, deduped, capped at 50).
- History view lists past sentences; each row has **Speak again** and **Add to sentence**. A Clear History button at the bottom.
- Gives the History nav tab real, genuinely useful AAC content (repeating common utterances).

## Responsive breakpoints (CSS)
- **< 600px** mobile: full-screen modals, single column.
- **600–767px** tablet: centered modals (80%/640px).
- **768px**: content `max-width: 880px` centered; 2-column forms.
- **1024px**: modal up to 720px; more grid columns.
- Plus 360px and 480px tweaks for the symbol grid.

## Accessibility hardening (v2.1)
- Viewport changed to `maximum-scale=5` — pinch-zoom is **allowed** (was locked) for low-vision users.
- Base palette switched to high-contrast: `#FFFFFF` bg / `#0F172A` text (light), `#1A1A1A` / `#FFFFFF` (dark).
- Every form input has an explicit `<label for="…">`; inputs are 17px (≥16px prevents iOS focus-zoom).
- `aria-current`, `role="dialog"`/`aria-modal`, `role="switch"`, `aria-live` on output + search + history.
- Added `@media (prefers-contrast: more)` — thickens borders and forces pure black/white edges when the OS asks.
- Category tabs rebuilt: 48dp tall, 2.5px border, 16px bold text, high contrast (fixes "barely visible tabs").

## Files touched
`index.html` (rebuilt structure), `style.css` (rebuilt design system), `script.js` (view router + modal system + history), `sw.js` (cache bumped to v2-1 + landing cached). Added `TESTING.md`.

---

# v2.2 changes — Research-driven AAC feature set

Features were selected by surveying the leading commercial AAC apps (Proloquo2Go, LAMP Words for Life, TD Snap, TouchChat, Speech Assistant AAC, Predictable) and keeping everything that can run 100% offline.

## Core word board (LAMP motor-planning principle)
- New "Core" category, first on Home and in the tab bar: 60 high-frequency words in **fixed positions that never change** — users build muscle memory the way typists learn a keyboard. The board is code-defined (not user-editable) so positions stay stable.
- **Fitzgerald Key color coding** (the cross-app AAC standard): yellow = pronouns, green = verbs, orange = nouns, blue = adjectives, pink = prepositions, purple = questions, red = no/stop, brown = adverbs, grey = social. A compact legend renders above the board. Dark mode keeps the same hues at reduced luminance.
- Core buttons are text-first (no emoji), matching real core boards; renders without stagger animation for stability.

## Word prediction (learns from the user, fully offline)
- Suggestion chips above the sentence box: sentence starters when empty, next-word predictions otherwise.
- Two layers: a built-in starter bigram set (~25 common AAC transitions like "I → want/need/like") plus **learned bigrams** recorded every time a sentence is spoken (localStorage `tt_bigrams`, capped at 300 words × 8 followers). Learned suggestions outrank starters.

## Type view (text-based AAC, Proloquo4Text style)
- New bottom-nav tab: big textarea, Speak / Clear / Save-as-Quick-Phrase, and prediction chips that do **word completion** while mid-word (from the full vocabulary + learned words) and next-word prediction after a space.

## Access settings (tremor & motor-impairment support)
- **Hold to activate** (off/0.3/0.6/1s): a button only fires if held for the set time — brushing past it does nothing. A fill bar animates along the button bottom during the hold (`--hold-dur`). Implemented with pointer events; keyboard activation (e.detail === 0) always bypasses the hold.
- **Debounce** (off/0.3/0.7/1.5s): after any activation, further activations are ignored for the window — prevents tremor double-taps.
- **Button size** (Small/Medium/Large/XL): sets `--symbol-min` (110–200px); the core board drops from 6 to 4 columns on Large/XL.
- **Speak each word** toggle: per-word speech on tap can be disabled (some users find it distracting; sentence still speaks on Speak).
- These apply to communication buttons only (symbols, core words, prediction/search chips) — navigation stays instant so the app never feels broken.

## Backup / restore
- Settings → Backup: **Export** downloads a JSON of categories, settings, history and learned predictions; **Import** restores it (with confirm). Solves localStorage being device-bound — families can move a personalized vocabulary to a new device or keep a safety copy.

## Known bug fixed during build
`pointerleave` fires after `pointerup` on touch devices, which would have zeroed the hold timer before `click` ran — hold-to-activate would have blocked every touch tap. Fixed by capturing held duration at `pointerup` and only invalidating on drag-off (leave while still pressed).

## Not implemented (documented for future)
- Full switch scanning (auto-advancing highlight) — all controls are keyboard/switch focusable today, but timed scanning is a larger feature.
- Symbol library (SymbolStix/PCS are licensed; emoji + user photos are the free equivalent).
- Morphology/word forms (verb conjugation grids).

---

# v2.3 changes — Custom voice recordings

**Feature:** When creating a symbol, quick phrase, or category, the user (or a caregiver) can record a short voice note. That recording plays instead of text-to-speech whenever the button is tapped — for names, words in other languages, or anything TTS mispronounces. Real AAC apps call this "recorded speech" (GoTalk, Proloquo2Go).

**How it works:**
- MediaRecorder API → webm/opus (Chrome/Android) or mp4/AAC (Safari/iOS), 10-second cap, stored as a base64 data URL on the item (`item.audio` / `categoryMeta[key].audio`) in localStorage. Fully offline; included automatically in backup export/import.
- Playback priority: tap a symbol/search chip → recording if present, else TTS. Category card tap → plays its recording, then opens. Speak button and History → if the whole sentence exactly matches a saved item with a recording (e.g. a quick phrase), the human voice plays instead of TTS.
- Recorder UI in all three creation modals: Record/Stop toggle (red breathe animation — shadow only, no flashing), Play preview, Delete. Mic-permission denial and unsupported browsers produce a clear toast instead of failing silently.
- Recording stops automatically if the modal is closed mid-recording; `pointer` stream tracks are always released.
- `saveData()` now surfaces a visible warning on QuotaExceededError (localStorage ~5MB) instead of failing silently, since audio + photos are the realistic way to hit it.

**Known limitation:** a recording made on Android (webm) may not play on iOS Safari if the backup is moved across platforms — same-device use is unaffected. Editing audio on *existing* buttons requires re-creating the button (recording is part of the creation flow only, per scope).
