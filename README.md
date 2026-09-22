# Six Words, One Feeling

A TikTok-style feed of six-word stories, each built around a word from the
feeling wheel. React 18 + TypeScript + Vite, Firebase (Auth, Firestore,
Functions, Hosting, App Check).

Full build spec context lives in the project history; this README covers
what's needed to run, test, and deploy what's here.

## Repo layout

```
/shared            wheel.ts (feeling wheel + word forms), sixWords.ts (the six-word rule)
                    imported by both /web and /functions so client and server validate identically
/web                Vite + React + TS app
/functions          Cloud Functions (2nd gen, TS), region europe-west1
/scripts            seed.ts + seedData.ts (207 prototype stories, imported as @sixwords)
/test               Firestore security rules tests
firestore.rules, firestore.indexes.json, firebase.json, .firebaserc
```

## Local development

Prerequisites: Node 20+, a JDK (for the Firestore/Auth emulators — `brew install openjdk`
on macOS, then add it to `PATH`).

```bash
npm install                 # root deps (vitest, firebase-tools, tsx, firebase-admin)
npm --prefix web install
npm --prefix functions install
npm --prefix shared install
```

Start the emulators (Firestore, Auth, Functions, Hosting) with persistence across restarts:

```bash
npm run emulators           # imports/exports .emulator-data (gitignored)
```

Seed the 207 prototype stories + interpretations-as-comments. **Run this
against firestore+auth only** (not the full suite) — see the comment at the
top of `scripts/seed.ts` for why (it writes like/comment counts directly and
would otherwise collide with the Functions rate limiter):

```bash
npm run emulators:seed
```

Then, in another terminal, run the web app against the emulators:

```bash
cd web && npm run dev       # picks up web/.env.development (VITE_USE_EMULATORS=true)
```

Open http://localhost:5173. Sign-in in emulator mode: the Google popup and
email-link flows both work against the Auth emulator (email links print to
the emulator's logs/UI at http://127.0.0.1:4000/auth instead of sending real
email).

## Testing

```bash
npm test                              # shared/*.test.ts — the six-word rule against all 207 seed stories
npm run emulators:exec:test           # firestore.rules tests against a real emulator
npm --prefix functions test           # pure-logic unit tests (rate limiting window math)
```

There's no separate Cloud Functions test suite beyond that — the triggers
themselves (validation, duplicate detection, rate limiting, counters, cascade
delete) were exercised end-to-end against the real emulator stack (rules +
functions + a real client SDK) during the initial build, via a scratch
integration script that isn't part of this repo. Worth writing a proper one
under `test/` if this grows.

## Deploying (you'll need to do this yourself)

This environment has no `firebase login` session, so none of this was run —
only built and verified against the emulators.

### 1. One-time Firebase project setup

```bash
firebase login
firebase use lillefar-com
```

**Hosting site**: the project `lillefar-com` likely already hosts the main
lillefar.com site on its *default* Hosting site. This app is wired to deploy
to a **separate, named** Hosting site (`firebase.json`'s `hosting.target`)
so it can't accidentally overwrite that. Create the site and map it:

```bash
firebase hosting:sites:create sixwords-lillefar   # pick any globally-unique id; update .firebaserc if taken
firebase target:apply hosting sixwords sixwords-lillefar
```

Then in the Firebase Console → Hosting → the `sixwords-lillefar` site → Add
custom domain → `sixwords.lillefar.com`, and add the DNS records it gives
you at your DNS provider.

**Blaze plan**: required for Cloud Functions — enable it in the console if
not already on it.

### 2. App Check (reCAPTCHA Enterprise)

1. Google Cloud Console → APIs & Services → enable the reCAPTCHA Enterprise API for `lillefar-com`.
2. Create a reCAPTCHA Enterprise key (type: Website, and check "Use checkbox challenge" off for a score-based key) scoped to your Hosting domain(s) (`sixwords.lillefar.com`, and `sixwords-lillefar.web.app` for testing).
3. Firebase Console → App Check → register the web app with that site key.
4. Set `VITE_RECAPTCHA_SITE_KEY` in `web/.env.production` (see `.env.example`) before building for deploy.
5. Firebase Console → App Check → Firestore → **Enforce**. (Deliberately not
   done via `enforceAppCheck` in function code — see the comment in
   `functions/src/index.ts`: `storyPage`/`ogImage` must stay reachable
   without a token for link-preview crawlers, and the Firestore triggers
   aren't client-invoked, so Firestore's own enforcement toggle is the right
   place for this.)

### 3. Web app Firebase config

Copy `web/.env.example` to `web/.env.production` and fill in the real config
values from Firebase Console → Project settings → your web app (create one
if it doesn't exist yet: Console → Add app → Web).

### 4. Deploy

```bash
npm run build --prefix shared        # not strictly needed standalone; functions' build does this too
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting:sixwords
```

(`hosting.predeploy` and `functions.predeploy` both run
`scripts/prepareDeploy.mjs`, which builds `web/` and copies its `index.html`
into `functions/assets/story-template.html` for the `storyPage` function —
see that script's comment for why it's wired to both targets.)

### 5. Seed production (optional, once)

```bash
npm run seed:prod           # asks for a typed "yes" confirmation before writing
```

## Continuous deployment (GitHub Actions)

`.github/workflows/deploy.yml` runs the test suite, then deploys Firestore
rules/indexes, Functions, and Hosting on every push to `main`. It needs the
one-time manual setup above done first (Hosting site + target, Blaze plan,
App Check), plus these repo secrets (Settings → Secrets and variables →
Actions):

| Secret | Where to get it |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | A GCP service account JSON key (see below) — paste the whole file content |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase Console → Project settings → your web app's config |
| `VITE_RECAPTCHA_SITE_KEY` | From App Check setup above (can be left empty until that's done) |

Create the deploy service account (needs `gcloud` locally, logged into the
same Google account as the Firebase project):

```bash
gcloud config set project lillefar-com
gcloud iam service-accounts create sixwords-deployer \
  --display-name "Six Words GitHub Actions deployer"
gcloud projects add-iam-policy-binding lillefar-com \
  --member "serviceAccount:sixwords-deployer@lillefar-com.iam.gserviceaccount.com" \
  --role "roles/firebase.admin"
gcloud projects add-iam-policy-binding lillefar-com \
  --member "serviceAccount:sixwords-deployer@lillefar-com.iam.gserviceaccount.com" \
  --role "roles/iam.serviceAccountUser"
gcloud iam service-accounts keys create sixwords-deployer-key.json \
  --iam-account "sixwords-deployer@lillefar-com.iam.gserviceaccount.com"
```

Paste the contents of `sixwords-deployer-key.json` into the
`FIREBASE_SERVICE_ACCOUNT` secret, then **delete the local key file** —
it's a long-lived credential. (A Workload Identity Federation setup avoids
that long-lived key entirely and is worth switching to later; it needs more
one-time GCP configuration than fits here.)

## Known limitations / follow-ups

- **Bundle size**: the main JS chunk is ~180KB gzipped, mostly the Firebase
  SDK. Route-based code-splitting is in place for `/new`, `/u/:handle`, and
  `/signin`; further wins would mean lazy-loading `firebase/functions`
  (unused directly by the client today) or trimming to modular imports more
  aggressively. Worth checking against the Lighthouse ≥90 mobile target
  before considering this done.
- **Moderation**: the report button writes to a `reports` collection with no
  client read access. There's no admin UI to review/act on reports in this
  build (scoped out) — for now, reviewing means reading `reports` via the
  Firebase Console or Admin SDK, and hiding a story means flipping its
  `status` to `"hidden"` there directly.
- **Duplicate detection** (`onStoryCreate`) is best-effort, not
  transactionally atomic — two identical stories posted in the same instant
  by different users could both land as "published" before either duplicate
  check runs. Acceptable for this app's scale; call it out if that changes.
- **Sign-in providers**: Google + email link only, per the confirmed scope
  (no Apple sign-in).
- **Word-form matching**: `shared/wheel.ts` has a curated `forms[]` list per
  wheel word (e.g. "jealousy" counts for "Jealous") rather than exact-match
  only. If a form is missing for some word, add it there — both the composer
  and `onStoryCreate` read from the same list.
