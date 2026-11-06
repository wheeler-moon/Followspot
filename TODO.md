# SpotPlot To-Do

The one to-do list for every SpotPlot project (see `docs/README.md` for the family map).

**How this list works**
- Open items only, grouped by product. When something is done, delete it here and add a line to `CHANGELOG.md` (Unreleased) if users will notice it.
- New requests and beta bug reports go into the right product's section straight away, even if they're for "someday".
- Anything that touches more than one product (e.g. new show data the iPad must understand) says so, so neither side is forgotten.

**Launch target: January 1, 2027** (Standard and Student plans on sale, and SpotPlot for iPad on the App Store). Everything here is sorted with that date in mind.

## Launch timeline

**The full, dated launch checklist is `docs/launch-checklist.md`**: every task for every product, who does it, ticked off as it's done. The table below is the summary.

| By | What |
|---|---|
| **Nov 8** | Start the slow outside stuff: ~~file the LLC~~ (done Nov 3), EIN, business bank, book the lawyer, ask an accountant about sales tax. Request the company's D-U-N-S number (Apple needs it for an organization developer account) |
| **Nov 22** | Last day for 1.0 features (Mac and iPad); anything unfinished moves to 1.1 |
| 🛑 **Nov 23** | **Feature freeze**: bug fixes and polish only |
| **Dec 6** | Selling side works in Stripe test mode (license server, webhooks, website Buy), app code made private, beta testers' launch plan decided |
| **Dec 7** | **Release candidate** (1.0) to beta testers; iPad on TestFlight for them |
| **Dec 11** | iPad App Store listing ready (screenshots, description, privacy answers) |
| 🛑 **Dec 12** | **iPad submitted for App Store review**, set to release manually (review slows over the holidays; leaves time for a rejection and resubmit) |
| **Dec 13** | Lawyer's notes back and folded into Terms / Privacy / license agreement |
| **Dec 14** | Website wording, screenshots and promo video done; full site goes public (Pages: `teaser` → `main`) |
| **Dec 20** | Triple-check done: real shows end to end, every PDF, export/import, iPad sync, FileMaker import, fresh install, update from old beta, buy → sign in → welcome |
| 🛑 **Dec 21** | **Code freeze**: 1.0.0 built, signed, uploaded as a draft. Only showstoppers reopen it |
| **Dec 29** | Stripe to live mode; buy one real license to prove it |
| 🚀 **Jan 1** | Publish Mac 1.0.0, release the approved iPad app, turn on the Buy buttons |

- [ ] **No visible AI traces at launch** (by Dec 20). Nothing public may show the project was built with AI: app repo private (above); website repo private or replaced by a fresh one with no history and no `CLAUDE.md` (the public one has it plus co-author lines on its commits); new `spotplot-releases` repo starts clean; check the shipped app's code is minified with no comments or notes; website wording reads like a person wrote it

Current desktop version: **0.3.1** (released 2026-10-14). Changes since then: `CHANGELOG.md` → Unreleased.

## Desktop app (`followspot`)

### Next (0.5.1)
- [ ] **Later today (Nov 5):**
  - Custom Actions: rethink how the menu looks. Deleting an action asks what to put in the cues that use it (pick an existing action), so no cue is left with no action
  - Custom Actions: an action with no image shows an empty spot, not the purple circle
  - A show opened for the first time after import: the cue list starts at the very top
  - Notes sidebar: find a cue by its number even when the LQ has extra text ("14*", "In 14"): typing 14 finds it (and 14* or "In 14" still work)
  - Spot Notes screen: double-click a note to edit it; no Edit button
  - Show Settings → Spot Settings: Swap spots moves into the page's header (still on the right), so the spot cards start at the top
  - Show Settings: rename "Cue Settings" to "Cue Visibility"?
  - **Cue list in a narrow window (big one):** with every frame button on each cue, the iris chips get squeezed until they can't be clicked (see 2026-11-05 screenshot: iris strip shows only ‹ ›). Needs a layout that stays sleek and easy to pick from at half-screen
  - iPad Sync tab: show each paired iPad's name (the device name, e.g. "Dana's iPad") instead of just "iPad", so it's clear which are connected. Mind App Store privacy answers (device name is sent only to the Mac on the local network)
  - **Iris size pictures (Wheeler's idea):** in Show Settings → Iris Sizes, each size gets a small stick figure (in the iris purple). Clicking opens a simple window with a white circle outline you drag and resize over the figure to show how big that size is and where it lands. Wheeler will help set the defaults. Then it can be shown in print headers and switched on/off on the iPad
- [ ] **Reminder, after the paperwork pass:** how to show operators what each iris size means, on prints and on the iPad (Wheeler has an idea)
- [ ] Beta feedback: add items here as testers report them
- [ ] ⌘C / ⌘V for a cue box without right-clicking (needs a way to select a box first)
- [ ] Cue Defaults, second pass: first version is in (Show Settings → Cue Defaults, `src/cueDefaults.js`). Wheeler wants to think it through more and make sure it fully works and is structured right: when defaults should apply (on picking an action vs. when a cue is made), how they interact with tracking, inserted cues, copy/paste and actions' own settings, whether defaults should be per spot, and whether more details (character, When) belong there. Remove the "In progress" label in the panel once it is settled.

- [ ] Print headers: go over the header on every PDF (spot sheet, caller sheet, Color Load, Spot Notes, Characters, Action Key, Scene List, cover page) so they match. The Color Load header looks misaligned. Wheeler has opinions on the redesign; waiting on his notes
- [ ] Narrow windows: rethink how the app looks when the window is tight (e.g. half a Mac screen). Past a certain width it gets cramped and hard to use
- [ ] "Track down" button: carry a spot's details from one cue down the cue list until its next change. Wheeler will explain in more detail before we build it

### Before launch (not features)
- [ ] **Policy for after release:** when an update changes something in people's existing shows (an action icon, how something prints), decide whether they can keep the old way in shows they already wrote, or choose when they update. Think it through before the first post-launch change
- [ ] **Apple signing certificate expires Feb 1, 2027** (Developer ID Application, team 299TQ9H5QB). Make a new one in December so 1.0 and its first updates are signed with it. If the developer account moves to the LLC, convert the existing account rather than opening a new one: auto-update needs the same Team ID
- [ ] Make the app's code private (steps below, under Later) before launch, with a release

### Later
- [ ] Faster cue list for very big shows, only if one ever feels slow: redraw just the cue that changed, then draw only the cues on screen (measure first on a copy of the show)
- [ ] Gel catalog upkeep: refresh `src/gels.json` from the makers' sites now and then (and bump `GEL_CATALOG_VERSION` in `main.js`). Discontinued gels people still use can be added back on request
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

- [ ] **Reminder, after the paperwork pass:** how the changes are shown when an iPad is asked to update its cue list (Wheeler has a thought)
- [ ] Phase 1 finish: check landscape (When and Notes get separate columns) and text size in a dark booth on the real iPad
- [ ] Keep the iPad's copies in step: `Resources/gels.json` (from `src/gels.json`) and `Resources/action-icons.json` (from the ActionIcon SVGs in `src/screens/CueListScreen.jsx`) whenever those change
- [ ] After launch (Phase 2): suggestions sent to the Mac (When/Notes editing), offline queue, desktop review list, approval switch
- [ ] After launch (Phase 2): send cue flags (Missed / Clarify / Idea) to the Mac so the LD sees them in the cue list; today they stay on the iPad and can be shared as text
- [ ] **App Store listing prep** (ready by Dec 11, submit Dec 12 set to release manually on Jan 1):
  - Developer account: D-U-N-S number and switch the Apple developer account to The Wheeler Moon Group LLC (if the company should be listed as the developer); App Store Connect agreements, tax and banking forms
  - App record in App Store Connect: name "SpotPlot for iPad", subtitle, category (Productivity or Business), price Free, age rating
  - Description, keywords, promotional text, support URL (spotplotapp.com/support.html), marketing URL
  - iPad screenshots (13-inch required) from a demo show, never a real one; optional preview video
  - Privacy: Privacy Policy URL https://spotplotapp.com/privacy.html, App Privacy answer "Data Not Collected" (true today: shows stay on the iPad, sync is local only; revisit if Phase 2 sends anything off the device)
  - Export compliance (encryption) answer, review notes for Apple (how to try it without a Mac: open a sample .spotplot file) and a demo file they can use
  - TestFlight: external testing group for beta testers (needs Apple's beta review the first time)
- [ ] After launch (Phase 2): follow the Eos console (Now / Next bar, live highlight), then grandMA
- [ ] Phase 5: polish, TestFlight beta, App Store

## Website (`spotplot-website`, spotplotapp.com)
- [ ] **Teaser until launch:** the public sees only the `teaser` branch (logo, tagline, 1.1.2027). Go live mid-December by switching GitHub → Settings → Pages → Branch from `teaser` to `main` (see the website's CLAUDE.md)
- [ ] Buy buttons: switch the "Coming soon" buttons to Stripe checkout links at launch (see the site's README)
- [ ] Check the Support page's billing answers match how Stripe is set up
- [ ] Add the promo video when it's finished
- [ ] **Wording pass (Wheeler):** comb through every page (home, manual, support) and fix the wording. Send edits in any form (marked-up screenshots, pasted text, "change X to Y") and they get applied across all pages
- [ ] Polish pass (more later)

## License server (`spotplot-server`)

Plan: `docs/admin-dashboard-plan.md`.

- [ ] Stripe: create and renew licenses automatically from webhooks (Standard and Student, monthly and yearly). Checkout must collect the buyer's **name** and the webhook saves it on the license (`name`), so the app knows it at sign-in
- [ ] Student plan: .edu email verification
- [ ] **License email** (before launch): the server sends each buyer their key, sign-in email and download link when Stripe says they've paid (an email service such as Postmark or Resend, from spotplotapp.com with SPF/DKIM so it isn't spam)
- [ ] Confirm the Render plan doesn't sleep when idle and has a persistent disk; keep a copy of the license backups off Render
- [ ] Stripe → dashboard: webhooks set `expires_at` to each subscription's period end (and `payment_failed` for the 24-hour grace), link `stripe_customer_id`, and log to the license history (by: stripe). The dashboard's revenue and payments-failing cards fill in from these
- [ ] Stripe → licenses: webhooks fill each license's `billing_interval`, `renews_at`, `ends_at` and `payment_failed` (the server already sends them to Settings → Account), and set `STRIPE_PORTAL_URL` on Render so Settings → Manage… opens the customer portal
- [ ] Stripe emails: turn on receipts, failed-payment and expiring-card emails, yearly renewal reminders, and the customer portal (cancel / update card)
- [ ] **Before launch: lawyer review.** Have a lawyer go over the drafts Claude wrote on 2026-10-19: `privacy.html` and `terms.html` on the website, and the license agreement (`LICENSE.txt` / `LICENSE.rtf`). Make sure they match the final Stripe setup, refunds (Wheeler's choice: no refunds), student checks and the business details below
- [ ] The Wheeler Moon Group LLC (NY, approved 2026-11-03; name now in the Terms, Privacy Policy and license agreement). Still to do: EIN, business bank account, add a mailing address to both policies' Contact sections, NY publication notice within 120 days (by about March 3, 2027), D-U-N-S number if Apple should list the company, and use the name in Stripe and the App Store
- [ ] Sales tax and international sales: decide whether to sell outside the US at launch. Stripe Tax handles US sales tax (still register in states as thresholds are hit); for worldwide VAT, consider a merchant of record (Paddle or Lemon Squeezy) instead. Ask an accountant
- [ ] Stripe checkout: an unticked "I agree to the Terms; renews automatically until canceled" checkbox, the renewal terms right by the Pay button, confirmation email with how to cancel, and yearly renewal reminder emails (the Terms promise these)
- [ ] Q1 2027: Production licenses (show, spots, close date). Q2 2027: Education licenses (school, seats)

## Business and pricing
- [ ] Support email address that gets checked (e.g. support@spotplotapp.com), used on the website, in the app and on the App Store
- [ ] Decide what beta testers get at launch (discount code, free month…) and whether the Student plan launches Jan 1
- [ ] Stripe integration. Plans: Standard $15/month or $144/year; Student $8/month or $72/year (.edu). Launch with Standard and Student in January; Production tier Q1 after launch; Education tier Q2
- [ ] Production plan: revisit the device count (spots × 2 + 2), since iPads are free and don't need licenses
- [ ] Windows distribution
- [ ] **Student license term:** a Student license lasts 4 years or until the student's graduation date, whichever comes sooner (the website's Support page already says so). Needs: an end date on student licenses in the license server, collecting the graduation date at signup (with .edu verification), and a reminder email before it ends with an offer to move to Standard
- [ ] Keep the 2-Mac limit unadvertised: the website and marketing never mention how many Macs a license covers (Wheeler, 2026-10-16). The app still enforces it; the "License in use on 2 Macs" screen is the only place it shows

## Marketing
- [ ] Promo video (`~/Dropbox (Personal)/1. Professional Projects/1. Active/SpotPlot/spotplot-video`): **parked until about mid-November**, while the product gets finished. A rough first cut exists (silent, 16:9); expect to rework it once the app and iPad app are closer to launch (see its README)

## Future
- [ ] Sync over the internet, for iPads away from the Mac's network (updates still approved by the op, as on the local network)
- [ ] Console Connection tab in Show Settings (Eos console features on the desktop; was called EOS Control)
