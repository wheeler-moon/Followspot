# SpotPlot To-Do

The one to-do list for every SpotPlot project (see `docs/README.md` for the family map).

**How this list works**
- Open items only, grouped by product. When something is done, delete it here and add a line to `CHANGELOG.md` (Unreleased) if users will notice it.
- New requests and beta bug reports go into the right product's section straight away, even if they're for "someday".
- Anything that touches more than one product (e.g. new show data the iPad must understand) says so, so neither side is forgotten.

**Launch target: January 1, 2027** (Standard and Student plans on sale). Everything here is sorted with that date in mind.

Current desktop version: **0.3.1** (released 2026-10-14). Changes since then: `CHANGELOG.md` → Unreleased.

## Desktop app (`followspot`)

### Next (0.4.1)
- [ ] Faster cue list loading: big shows take a couple of seconds to open
- [ ] Beta feedback: add items here as testers report them
- [ ] ⌘C / ⌘V for a cue box without right-clicking (needs a way to select a box first)
- [ ] Cue Defaults, second pass: first version is in (Show Settings → Cue Defaults, `src/cueDefaults.js`). Wheeler wants to think it through more and make sure it fully works and is structured right: when defaults should apply (on picking an action vs. when a cue is made), how they interact with tracking, inserted cues, copy/paste and actions' own settings, whether defaults should be per spot, and whether more details (character, When) belong there

- [ ] Print headers: go over the header on every PDF (spot sheet, caller sheet, Color Load, Spot Notes, Characters, Action Key, Scene List, cover page) so they match. The Color Load header looks misaligned. Wheeler has opinions on the redesign; waiting on his notes
- [ ] Narrow windows: rethink how the app looks when the window is tight (e.g. half a Mac screen). Past a certain width it gets cramped and hard to use
- [ ] Tracking: check what a cue picks up from the cue above when it's made Tracked from another action
- [ ] "Track down" button: carry a spot's details from one cue down the cue list until its next change. Wheeler will explain in more detail before we build it
- [ ] Add a cue at the top of a scene (right under the scene header)
- [ ] Show logos: check how logos scale everywhere in the app; always show the whole logo, never cropped
- [ ] Print cover page without a logo: an alternate layout when no show logo is uploaded, so there's no big empty space where the logo would go

### Later
- [ ] Gel catalog upkeep: refresh `src/gels.json` from the makers' sites now and then (and bump `GEL_CATALOG_VERSION` in `main.js`). Discontinued gels people still use can be added back on request
- [ ] Settings popup: more robust app-wide toggles
- [ ] Shrink the app (~290 MB → ~100 MB) by rendering PDFs with Electron's built-in Chromium (`webContents.printToPDF` in a hidden window) instead of bundling Chrome for Testing. Smaller downloads and updates, faster notarization, fewer files to sign. **Caution:** an earlier attempt had PDF problems, which is why Chrome was bundled; compare every sheet type against the current output before switching, and keep the bundled Chrome as a fallback until verified.
- [ ] Windows version
- [ ] **Make the app's code private** (do it alongside a release). Two repos: `Followspot` goes private (source code); a new public `spotplot-releases` holds only the DMG and zip for each release, with no code. Steps:
  1. Create `spotplot-releases` (public).
  2. Point auto-update at it (`update.electronjs.org/wheeler-moon/spotplot-releases/...` in `main.js`) and the website's Download button at its `releases/latest/download/SpotPlot.dmg`.
  3. Publish that version's release in **both** repos, so installed copies (which still check `Followspot`) update to the version that checks the new repo.
  4. Once most users are on it, make `Followspot` private and update the release steps in `CLAUDE.md`.

  Beta testers on very old versions may need one manual download. Making it private doesn't erase what was public before; no secrets were ever in it

- [ ] **Think about app security and license verification** (talked through 2026-10-31). Ways SpotPlot can be used without a license, biggest first: the source code is public (anyone technical can build a copy without the license check; see "Make the app's code private" above); blocking the license server keeps a copy running offline forever, and the app can't tell a real saved license from a forged one; a key can be shared across 2 Macs (or passed around via the 30-day free-up). Already protected: changing the installed app's files stops it launching. Ideas to weigh: licenses signed by the server so forged ones are rejected even offline, and an expiry (e.g. must reach the server once every 30 days) so a canceled subscription stops after a month offline. Decide what's worth doing before launch

## iPad app (`spotplot-ipad`)

Plan: `docs/ipad-app-plan.md`. Contract with the desktop: `docs/sync-protocol.md`.

- [ ] Phase 1 finish: check landscape (When and Notes get separate columns) and text size in a dark booth on the real iPad
- [ ] Keep the iPad's copies in step: `Resources/gels.json` (from `src/gels.json`) and `Resources/action-icons.json` (from the ActionIcon SVGs in `src/screens/CueListScreen.jsx`) whenever those change
- [ ] Phase 2: suggestions (When/Notes editing), offline queue, desktop review list, approval switch
- [ ] Phase 2: send cue flags (Missed / Clarify / Idea) to the Mac so the LD sees them in the cue list; today they stay on the iPad and can be shared as text
- [ ] App Store listing: Privacy Policy URL https://spotplotapp.com/privacy.html, App Privacy answer "Data Not Collected" (true today: shows stay on the iPad, sync is local only). Revisit if Phase 2 sends anything off the device
- [ ] Phase 3: live sync while connected
- [ ] Phase 4: follow the Eos console (Now / Next bar, live highlight), then grandMA
- [ ] Phase 5: polish, TestFlight beta, App Store

## Website (`spotplot-website`, spotplotapp.com)
- [ ] Buy buttons: switch the "Coming soon" buttons to Stripe checkout links at launch (see the site's README)
- [ ] Check the Support page's billing answers match how Stripe is set up
- [ ] Add the promo video when it's finished
- [ ] **Wording pass (Wheeler):** comb through every page (home, manual, support) and fix the wording. Send edits in any form (marked-up screenshots, pasted text, "change X to Y") and they get applied across all pages
- [ ] Polish pass (more later)

## License server (`spotplot-server`)

Plan: `docs/admin-dashboard-plan.md`.

- [ ] Move license storage from one JSON file to SQLite (before Stripe)
- [ ] Expiry dates on licenses (renews/expires on), returned to the app by `/validate`, with a 24-hour grace period after a failed payment
- [ ] Stripe: create and renew licenses automatically from webhooks (Standard and Student, monthly and yearly)
- [ ] Student plan: .edu email verification
- [ ] Admin dashboard: home (expiring soon, payments failing, by plan, revenue), search and filters, license page (extend/set expiry, change plan or device limit, revoke/reinstate, resend email, notes), history of every change, CSV export
- [ ] Stripe → licenses: webhooks fill each license's `billing_interval`, `renews_at`, `ends_at` and `payment_failed` (the server already sends them to Settings → Account), and set `STRIPE_PORTAL_URL` on Render so Settings → Manage… opens the customer portal
- [ ] Stripe emails: turn on receipts, failed-payment and expiring-card emails, yearly renewal reminders, and the customer portal (cancel / update card)
- [ ] **Before launch: lawyer review.** Have a lawyer go over the drafts Claude wrote on 2026-10-19: `privacy.html` and `terms.html` on the website, and the license agreement (`LICENSE.txt` / `LICENSE.rtf`). Make sure they match the final Stripe setup, refunds (Wheeler's choice: no refunds), student checks and the business details below
- [ ] Register The Wheeler Moon Group (planned: New York LLC). Then use its exact legal name in the Terms, Privacy Policy, license agreement, Stripe and the App Store, and add a mailing address to both policies' Contact sections
- [ ] Sales tax and international sales: decide whether to sell outside the US at launch. Stripe Tax handles US sales tax (still register in states as thresholds are hit); for worldwide VAT, consider a merchant of record (Paddle or Lemon Squeezy) instead. Ask an accountant
- [ ] Stripe checkout: an unticked "I agree to the Terms; renews automatically until canceled" checkbox, the renewal terms right by the Pay button, confirmation email with how to cancel, and yearly renewal reminder emails (the Terms promise these)
- [ ] Q1 2027: Production licenses (show, spots, close date). Q2 2027: Education licenses (school, seats)

## Business and pricing
- [ ] Stripe integration. Plans: Standard $15/month or $144/year; Student $8/month or $72/year (.edu). Launch with Standard and Student in January; Production tier Q1 after launch; Education tier Q2
- [ ] Production plan: revisit the device count (spots × 2 + 2), since iPads are free and don't need licenses
- [ ] Windows distribution
- [ ] **Student license term:** a Student license lasts 4 years or until the student's graduation date, whichever comes sooner (the website's Support page already says so). Needs: an end date on student licenses in the license server, collecting the graduation date at signup (with .edu verification), and a reminder email before it ends with an offer to move to Standard
- [ ] Keep the 2-Mac limit unadvertised: the website and marketing never mention how many Macs a license covers (Wheeler, 2026-10-16). The app still enforces it; the "License in use on 2 Macs" screen is the only place it shows

## Marketing
- [ ] Promo video (`~/Dropbox (Personal)/1. Professional Projects/1. Active/SpotPlot/spotplot-video`): **parked until about mid-November**, while the product gets finished. A rough first cut exists (silent, 16:9); expect to rework it once the app and iPad app are closer to launch (see its README)

## Future
- [ ] SpotPlot Live Sync over the cloud (beyond the local-network iPad app)
- [ ] EOS Control tab in Show Settings (console features on the desktop)
