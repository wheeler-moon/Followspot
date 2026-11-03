# License server and admin dashboard: plan

For `~/Developer/SpotPlot/spotplot-server` (repo `wheeler-moon/spotplot-server`, private; pushing `main` deploys to Render). Started 2026-10-13. **Built 2026-11-03 (everything but Stripe):** see "What's built" at the end.

## Where it is today

- Licenses live in one JSON file (`licenses.json` on Render's disk): key, email, plan, status, notes, created, last validated, devices (max 2 Macs, stale after 30 days), and empty Stripe fields.
- Admin page (`/admin`): list licenses, create one, change status/notes, free a device, delete.
- **No expiry dates.** A license is active until its status is changed by hand.

## Fix before paying customers

1. **Admin password fallback:** `server.js` falls back to a password written in the code when `ADMIN_PASSWORD` isn't set. Remove the fallback; refuse to start without it.
2. **License keys:** generated with `Math.random()`. Use `crypto.randomBytes` (or `crypto.randomInt`) so keys can't be guessed.
3. **Storage:** every check-in rewrites the whole JSON file. With Stripe webhooks arriving alongside app check-ins, two writes can collide and lose a change. Move to SQLite (better-sqlite3) on the same disk, with a one-time import of the JSON file.

## Principle

Stripe is the source of truth for money; the license server is the source of truth for access. Stripe webhooks (checkout completed, invoice paid, payment failed, subscription updated/canceled) update licenses automatically. Admin edits are overrides and are always logged.

## Data

**Customer:** id, name, email, Stripe customer id, notes, created.

**License:**
- key, customer, plan (`standard`, `student`, `production`, `education`, `comped`, `beta`), billing (`monthly`, `yearly`, `one-time`, `free`)
- status: `active`, `past_due` (in grace), `canceled` (works to period end), `expired`, `revoked`
- dates: starts_at, expires_at (Stripe's current period end, or the admin's override), grace_ends_at
- device limit (default 2), devices (id, app version, first/last seen)
- Stripe subscription id
- Production only: show name, spot count, closes_on (max 12 months)
- Education only: institution, domain, seats included / extra / used
- history: every change with time, source (Stripe, admin, app) and a plain description

## Admin dashboard

**Home:** active licenses by plan, new this month, expiring in the next 30 days, payments failing, estimated monthly revenue, recent activity.

**Licenses list:** search (email, name, key), filters (plan, status, expiring soon, Stripe vs manual), sort by expiry, CSV export.

**License page:** everything above, plus actions:
- Extend or set the expiry (with a note); for Stripe subscriptions this is an override that the app honors, shown clearly as such
- Change plan, change device limit, free a device
- Revoke or reinstate (no permanent delete; revoked licenses stay in history)
- Resend the license email; open the customer in Stripe; notes

**Security:** password from the environment only, a proper login session instead of sending the password with every request, history of admin actions.

## In the desktop app

- `/validate` returns expires_at, status and grace info.
- **Home → Settings → Account** holds the user's license info (Wheeler, 2026-10-13): email, key, plan, status, **Renews on / Expires on** (beta and comped show their end date), **Macs in use** (e.g. 1 of 2), and **Manage subscription** (opens Stripe's customer portal to update a card or cancel).
- A gentle notice 7 days before an expiry that won't renew.
- After a failed payment: 24 hours of full access with a clear "update your card" notice and link; after that, the existing expired screen until payment succeeds.
- Offline: keep trusting the cached license as today, but no further than its expiry plus grace.

## Timing (launch January 1, 2027)

- **Before launch:** the three fixes, expiry dates, Stripe for Standard and Student, dashboard home, list, license page with edits and history, app notices.
- **Q1 2027:** Production licenses.
- **Q2 2027:** Education licenses.

## Decisions (Wheeler, 2026-10-13)

- **Beta testers don't pay.** Their licenses are `beta`/`comped`; Wheeler sets each end date by hand in the dashboard.
- **Failed payment: 24-hour grace period, then expired until paid.** The app keeps working for 24 hours after a renewal payment fails (with an "update your card" notice), then the license expires; it works again as soon as payment succeeds. The grace length is a server setting (24 hours) so it can be changed without an app update.
- **Emails:** Stripe sends receipts, failed-payment emails (with a link to update the card), expiring-card notices and renewal reminders, plus the customer portal for updating cards and canceling. SpotPlot only sends its own emails for things Stripe doesn't know about (e.g. a comped beta license nearing its end date).

## Before launch: legal and tax (check with a lawyer / accountant)

Not legal advice; research the current rules when setting up Stripe and have them checked.

- US automatic-renewal laws (state laws such as California's, plus federal ROSCA): show price, renewal frequency and how to cancel clearly at checkout with active agreement; send a confirmation email with those terms; make online cancellation easy (Stripe customer portal); for yearly plans, send a renewal reminder ahead of time (several states require roughly 15–45 days).
- Sales tax on software subscriptions in some states (Stripe Tax can calculate and collect).
- Customers outside the US: EU/UK consumer rules (e.g. withdrawal rights for digital purchases) and VAT.
- Terms of service and privacy policy pages on the website, matching the above.

## What's built (2026-11-03)

- **Storage stays one JSON file**, not SQLite: every read-change-write is synchronous in one Node process, so changes can't collide and be lost. Writes are atomic (temp file + rename) with a dated backup each day (`backups/`, last 30 days). Revisit if the server ever runs more than one process.
- **End dates:** `expires_at`, chosen as a last day and stored as the end of that day in New York time (a license ending Dec 31 works until midnight Dec 31, NYC). Status is worked out from it on every check (`effectiveStatus`): active, expired or revoked. A failed payment adds 24 hours (`PAYMENT_GRACE_HOURS`) once Stripe sets `payment_failed`.
- **Beta:** on first start, every existing license without a Stripe subscription got Dec 31, 2026 (`meta.beta_end_set`). New beta licenses default to it in the dashboard.
- **Sign-in:** the password goes only to `/admin/login`, which returns a 12-hour session token (memory only; a deploy signs you out). 8 wrong tries from one address lock it out for 15 minutes.
- **Dashboard:** Overview (active by plan, new this month, ending in 30 days, payments failing, estimated monthly revenue, Macs in use now, free licenses with no end date, ending soon, recent activity). Licenses (search, plan and status filters, sort, CSV export, select several to set or remove an end date). License page (key with Copy and Email Key…, name, email, plan, Mac limit, notes, end date with +30 / +90 / +1 year / end of beta, Macs with Remove, Stripe link, history, Turn License Off / Back On). No delete: turned-off licenses stay, hidden by the default filter.
- **History:** every change (admin, app sign-ins and sign-outs, name changes, system) on `license.history`.
- **App:** shows the end date in Settings, a notice in the last week, ends offline at the end date, and a clear screen for an ended or turned-off license.
- **Not yet (Stripe):** webhooks to set end dates from subscriptions, payment_failed, customer links, revenue.
