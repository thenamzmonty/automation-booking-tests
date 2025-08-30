# AutomationInTesting – Playwright TS Booking Flow

End-to-end test for the booking flow on **https://automationintesting.online** using **Playwright + TypeScript**.

## What the test covers

- Clicks **Book Now** on the hero
- Opens a room **Book now** link for **dynamic dates** (tomorrow → day after tomorrow)
- Verifies **/reservation** page, **room header**, and **calendar** visible
- Validates **Price Summary** (`£<nightly> x 1 nights` and total = nightly × nights)
- Triggers and asserts **form validation** messages
- Fills the form and submits
- Confirms **“Booking Confirmed”** and that the **dates** match the computed range

---

## Repository structure

```
.
├─ tests/
│  └─ booking.spec.ts            # Playwright test (TypeScript)
├─ package.json                   # Scripts + dev deps
├─ tsconfig.json                  # TS config for tests
└─ playwright.config.ts           # Playwright runner config
```

---

## Prerequisites

- **Node.js 18+** (or 20+)
- Internet access to the target site

> This project was authored in Replit, which may not provide a shell. The steps below are for running locally or in any CI/terminal environment.

---

## Install

```bash
# in the project root
npm install
# install browsers Playwright uses (Chromium/WebKit/Firefox)
npx playwright install --with-deps
```

> If you want only Chromium: `npx playwright install chromium`

---

## Run

```bash
# headless run (default):
npm test

# headed (debug):
npm run test:headed

# open the last HTML report:
npm run show-report
```

---

## Config notes

- **Dynamic dates**: the spec always books **tomorrow → +1 night**, so it doesn’t depend on hard-coded dates.
- **Less brittle URL check**: we assert `contains("/reservation")` rather than specific query params.
- **Selectors**: the test uses exact selectors taken from the site at the time of writing.
- **Base URL**: set in `playwright.config.ts` as `https://automationintesting.online`.

---

## Troubleshooting

- `Cannot find module '@playwright/test'`  
  → Run `npm install` to install dev dependencies.

- `Error: browser not found` or similar  
  → Run `npx playwright install --with-deps` (or `npx playwright install chromium`).

- Site content changed (selectors differ)  
  → Update the selectors in `tests/booking.spec.ts` (search for the relevant locators).

- Corporate proxy/CERT issues  
  → Set `NODE_OPTIONS=--use-openssl-ca` or configure `HTTPS_PROXY` env var as needed.

---

## Scripts (from `package.json`)

```json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "show-report": "playwright show-report"
  }
}
```

---

## Playwright/TS versions

- `@playwright/test` ^1.46.0
- `typescript` ^5.5.4

(Any recent Playwright 1.4x/1.5x and TS 5.x should work.)

---

## Notes on Replit

If running inside Replit and you **don’t** have a terminal:
- You can still submit this repo as-is.
- The above commands will run on any local machine / CI with Node + shell access.
