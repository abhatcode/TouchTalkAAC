# Making TouchTalk Downloadable on Phones & Tablets

TouchTalk is a **PWA (Progressive Web App)**. "Downloadable" means users install it straight
from the browser — no App Store, no Play Store, no account. It gets its own home-screen icon,
opens full-screen, and works offline.

There is **one requirement**: the app must be served over **HTTPS**. Opening `index.html`
from the desktop (a `file://` path) will *not* allow install or offline mode. So step 1 is to
put it on a free host. Netlify is the easiest.

---

## Step 1 — Put it online (Netlify, free, ~2 minutes)

### Option A — Drag & drop (no tools, no account setup pain)
1. Go to **https://app.netlify.com/drop**
2. Drag the entire **`TouchTalk` folder** onto the page.
3. Netlify gives you a live HTTPS URL like `https://touchtalk-abc123.netlify.app`.
4. That's it — the app is now installable. Share that URL.

> To use your own name, in Netlify: **Site settings → Change site name** → e.g.
> `touchtalk-aac` → `https://touchtalk-aac.netlify.app`.

### Option B — Connect a Git repo (auto-deploys on every change)
1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project → pick the repo.**
3. Leave build command empty, publish directory `.` (already set in `netlify.toml`).
4. Every `git push` now redeploys automatically.

---

## Step 2 — How users install it

Send users the URL, then they do this once:

### iPhone / iPad  (must use **Safari**)
1. Open the URL in Safari.
2. Tap **Share** (□↑) at the bottom.
3. Tap **Add to Home Screen** → **Add**.

*(The app also has a built-in guide: **Settings → Install → How to Install on iPhone/iPad**.)*

> iOS does not allow one-tap install or sideloaded `.ipa` files without a paid Apple Developer
> account. "Add to Home Screen" is the correct, free path for iPhone/iPad — the installed app
> is full-screen and offline, indistinguishable from a store app for this use case.

### Android  (Chrome)
1. Open the URL in Chrome.
2. A prompt may appear automatically — or tap **⋮ → Install app / Add to Home screen**.
3. Or open the app and use **Settings → Install → Install App** (our button triggers Chrome's
   native install dialog directly).

### Desktop (Chrome / Edge)
Click the **install icon** in the address bar, or **Settings → Install**.

---

## Step 3 (optional) — A real downloadable Android `.apk`

If you specifically want an **`.apk` file** users can download and side-load (instead of
"Add to Home Screen"), use **PWABuilder** — it wraps the live PWA into a signed Android package:

1. Deploy first (Step 1) so you have an HTTPS URL.
2. Go to **https://www.pwabuilder.com** and paste your URL.
3. It scores the PWA and lets you **Package for stores → Android**.
4. Download the generated **`.apk`** (for direct side-loading) or **`.aab`** (for Play Store).
5. Host the `.apk` on your landing page's "Download for Android" button.
   - Users must enable **"Install unknown apps"** on their device to side-load it.

> **iOS `.ipa`:** there is no free equivalent. Distributing a side-loadable iOS app requires a
> $99/yr Apple Developer account and code signing. For a free project, keep iOS on
> "Add to Home Screen."

---

## Quick local test before deploying

Install/offline features need `https://` **or** `http://localhost`. To preview locally:

```bash
# from the TouchTalk folder — pick one:
npx serve .            # Node
python -m http.server  # Python 3
```

Then open `http://localhost:3000` (or `:8000`). On `localhost`, the service worker and the
install button work just like production. To test on your **phone**, deploy to Netlify — phones
can't reach your PC's `localhost`.

---

## What's already wired up for you

| Piece | File | Status |
|---|---|---|
| Web app manifest (name, colors, icons, standalone) | `manifest.json` | ✅ |
| Icons 192/512 + Apple touch icon | `icons/` | ✅ generated |
| Offline service worker | `sw.js` | ✅ |
| In-app Install button + iOS guidance | `index.html` / `script.js` | ✅ |
| Correct caching headers for updates | `netlify.toml` | ✅ |

You are ready to deploy. The only remaining action is **Step 1**.
