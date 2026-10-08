# TouchTalk — Testing Checklist

Test in **both portrait and landscape** on each device. Rotate mid-task to confirm nothing jumps or resets.

## Devices

| Device | Viewport (pt) | What to verify |
|---|---|---|
| iPhone 12 | 390 × 844 | Full-screen modals, bottom nav reachable with thumb, safe-area insets clear the notch/home indicator |
| iPhone 12 (landscape) | 844 × 390 | Action bar collapses to one row, modal is centered (not edge-to-edge), nav labels stay |
| iPad (portrait) | 768 × 1024 | Modal is centered ~80% width, 2-column forms, content max-width centered |
| iPad (landscape) | 1024 × 768 | Centered modal capped at 720px, 2-column forms, grid uses more columns |
| Android phone (Pixel) | 412 × 915 | TalkBack reads buttons, Chrome "Install app" works, full-screen modals |
| Android tablet | 800 × 1280 | Same as iPad; check Chrome address-bar resize doesn't clip bottom nav |

## Navigation (priority #1)
- [ ] Bottom nav is visible on every view and never scrolls away
- [ ] Home is the leftmost tab with a house icon + label
- [ ] All four tabs (Home, Word Banks, History, Settings) switch views
- [ ] Active tab shows blue color **and** a top underline
- [ ] Each tab is ≥ 56dp tall and ≥ 48dp wide

## Modals (priority #2)
- [ ] "Add Category" is **full-screen** on phone (not a half card)
- [ ] On tablet/landscape it's a centered dialog, not stretched to edges
- [ ] Header shows title + X close; X is ≥ 48dp
- [ ] Body scrolls if content is taller than the screen
- [ ] Footer Cancel (gray) + Save (green) stay pinned at the bottom
- [ ] Save shows a spinner, then a success toast
- [ ] Empty fields show a red error toast and keep the modal open
- [ ] Tapping the dark overlay (tablet) or pressing Esc closes it
- [ ] Same checks for Add Symbol, Add Phrase, Delete Category, Delete Symbol

## Orientation (priority #3)
- [ ] Rotating while a modal is open keeps typed text (no reset)
- [ ] Rotating the talk view keeps the built sentence
- [ ] Landscape action bar = output on left, controls on right
- [ ] No horizontal scrollbar appears in either orientation

## Readability (priority #4)
- [ ] All body text ≥ 16px; headings 22–28px
- [ ] No input triggers iOS auto-zoom on focus (inputs are 17px)
- [ ] Pinch-zoom still allowed (maximum-scale=5) for low-vision users

## Touch targets (priority #5)
- [ ] Every button is ≥ 48 × 48dp (symbols, nav, modal buttons, sliders thumb)

## Accessibility
- [ ] VoiceOver/TalkBack announces each symbol's label and category
- [ ] Output box announces new words (aria-live)
- [ ] Every form input has a visible, associated `<label>`
- [ ] Keyboard Tab reaches every control; focus ring is visible
- [ ] Switch access can step through nav → symbols → action bar
- [ ] Dark mode meets contrast (white text on #1a1a1a)
- [ ] OS "Increase Contrast" thickens borders (prefers-contrast)
- [ ] OS "Reduce Motion" removes animations (prefers-reduced-motion)
- [ ] No flashing/strobing anywhere

## Core function (regression)
- [ ] Tapping a symbol speaks it and adds it to the sentence
- [ ] Quick phrases replace the sentence and speak the whole thing
- [ ] Speak reads the full sentence; spoken sentences appear in History
- [ ] Emergency speaks immediately and shows a toast
- [ ] Search finds words across all categories and adds on tap
- [ ] Custom categories/symbols/phrases persist after reload (localStorage)
- [ ] Works fully offline after first load (service worker)
