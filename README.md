# GUGU seller dashboard

The web dashboard for GUGU sellers (`merchant` claim) and GUGU staff (`admin` claim). It is a Next.js static export served from Firebase Hosting. All data goes through the Firebase web SDK. Firestore/Storage rules and callable Functions enforce security, as described in `gugu_2.0/router/platform_contract.md`. The route guards in this app only control what each role sees.

## Requirements

- Node 20.9 or newer, npm
- For local work against emulators: the `gugu_2.0` repo and firebase-tools

## Setup

```sh
npm ci
cp .env.example .env.local   # fill in the Firebase web app config
npm run dev                  # http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Web app config from the Firebase console (project `gugu2-36268` once the web app is registered) |
| `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` | Defaults to `us-central1` |
| `NEXT_PUBLIC_USE_EMULATORS` | `true` to use the local Emulator Suite |
| `NEXT_PUBLIC_EMULATOR_*_PORT` | Optional port overrides (auth 9099, firestore 8080, storage 9199, functions 5001) |
| `NEXT_PUBLIC_SELL_ON_GUGU_URL` | Link on the "no access" screen to the storefront's Sell on GUGU page |

These values are compiled into the static build, so rebuild after changing them.

## Against the emulators

```sh
# in gugu_2.0
firebase emulators:start --project demo-gugu
node functions/scripts/seed-emulator.js

# here, with NEXT_PUBLIC_USE_EMULATORS=true and NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-gugu
npm run dev
```

Seeded accounts (password `password123`): `admin@gugu.test`, `merchant@gugu.test` (store `techhub_gh`), `customer@gugu.test` (sees the no-access screen), and `applicant@gugu.test` (has a pending seller application).

## Build and deploy

```sh
npm run lint
npm run build        # writes the static site to out/
```

Deployment is done from `gugu_2.0`. Copy `out/` to `gugu_2.0/hosting/dashboard` and deploy the `dashboard` hosting target, following `gugu_2.0/router/deploy_runbook.md`. The export has no trailing slashes, which matches that target's `cleanUrls` setting.

Firestore indexes the dashboard's queries need are listed in `docs/firestore.indexes.dashboard.json`. Merge them into `gugu_2.0/firestore.indexes.json`.

## Structure

- `src/app`: routes. Each `page.tsx` sets the page title and renders a feature component.
- `src/features/auth`: sign-in, password reset, the role gate, and the no-access screen
- `src/features/merchant`: overview, products, product form, orders, and store profile
- `src/features/admin`: queues, seller applications, product approvals, orders, categories, banners, and users
- `src/features/orders`: order rows, order detail, and the fulfilment strip (shared by both areas)
- `src/components/ui`: buttons, fields, panels, badges, dialogs, filters, image picker, and loading/empty/error states
- `src/lib`: Firebase init, auth context, data access, callable wrappers, formatting (`formatMoney` is the only currency formatter), and uploads
