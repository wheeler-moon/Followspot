# Launch checklist: January 1, 2027

Every task between now and launch, in date order, for all of SpotPlot (Mac app, iPad app, website, license server, business). Tick items off here as they're done. `TODO.md` holds the details of each item; this is the one place to see that nothing is forgotten.

**Who:** **W** = Wheeler (accounts, money, legal, decisions, things only the owner can do) · **B** = build work (code, docs, testing) · **W+B** = together.

**Rules until launch:** feature freeze Nov 23 (fixes and polish only), code freeze Dec 21 (showstoppers only). Test on demo copies, never real shows.

---

## By Sunday, Nov 8: start everything that takes other people's time

- [x] W: The Wheeler Moon Group LLC filed and approved (Nov 3)
- [ ] W: EIN (irs.gov, free, ~10 minutes)
- [ ] W: Business bank account (needs the EIN)
- [ ] W: Book the lawyer: Terms, Privacy Policy, license agreement, refunds (no refunds), auto-renewal rules; also ask about a **"SpotPlot" trademark search**
- [ ] W: Ask an accountant: sales tax, selling outside the US (Stripe Tax vs. Paddle/Lemon Squeezy)
- [ ] W: Request the D-U-N-S number for the LLC (free; can take ~2 weeks)
- [x] W: **Reserve the app name**: "SpotPlot" app record created in App Store Connect (Nov 4); first build (1.0, build 1) uploaded to TestFlight
- [ ] W: Business mailing address for the Terms and Privacy Policy (a PO box or virtual address is fine)
- [ ] W: Decide: does the **Student plan** launch Jan 1? (needs .edu verification and a graduation date at checkout) or Standard only at first?
- [ ] W: Decide what beta testers get at launch (e.g. a discount code, or a free first month)

## Nov 9 – Nov 22: finish 1.0 features

- [x] W+B: Action icons refined from beta feedback (Mac, iPad copy, printed Action Key)
- [ ] W+B: "Track down" button (Wheeler explains it first)
- [ ] B: Tracking: what a cue picks up from the cue above when made Tracked
- [ ] W+B: Print headers pass (needs Wheeler's notes; Color Load header misaligned)
- [ ] B: Narrow windows (half a Mac screen)
- [ ] B: ⌘C / ⌘V for a cue box
- [ ] W+B: Cue Defaults second pass
- [ ] W+B: iPad: dark-booth check on the real iPad (landscape, text size)
- [ ] W: Pick what's in 1.0; everything else moves to a "1.1" list on Nov 22
- [ ] B: Decide app security for launch (signed licenses so forged ones fail offline?); end dates already apply offline

## 🛑 Nov 23: feature freeze

## Nov 23 – Dec 6: build the selling side (Stripe test mode)

- [ ] W: Stripe account in the LLC's name (EIN, bank account); products and prices: Standard $15/mo or $144/yr, Student $8/mo or $72/yr
- [ ] W: Stripe settings: receipts, failed-payment and expiring-card emails, yearly renewal reminders, customer portal (cancel / update card), Stripe Tax per the accountant
- [ ] B: Stripe checkout: collects the buyer's **name**; unticked "I agree to the Terms; renews automatically until canceled" box; renewal terms by the Pay button
- [ ] B: Webhooks → license server: create the license on purchase, set end dates from the subscription, `payment_failed` (24-hour grace), cancellations, `stripe_customer_id`, history
- [ ] W+B: **The license email**: how a buyer gets their key. Stripe doesn't send it, so the server sends it (an email service such as Postmark or Resend, sent from spotplotapp.com with SPF/DKIM set up so it doesn't land in spam). Includes the key, the email to sign in with and the download link
- [ ] B: Student .edu verification and graduation date (if Student launches Jan 1)
- [ ] B: `STRIPE_PORTAL_URL` on Render so Settings → Manage… opens the customer portal
- [ ] W+B: Full test purchase in test mode: buy → email arrives → download → sign in → welcome → Settings shows the plan and renewal date; then cancel in the portal, and a failed payment (Stripe test cards)
- [ ] W: Confirm the Render plan doesn't sleep when idle (a sleeping server makes the first sign-in wait ~50s) and that the disk is persistent; download a copy of the license backups somewhere off Render
- [ ] W+B: Make the app's code private: new public `spotplot-releases` repo, auto-update and the website's Download button pointed at it, then `Followspot` private (steps in TODO.md)
- [ ] W: Email address for support (e.g. support@spotplotapp.com) that you'll actually check; use it on the website, in the app and in the App Store listing

## Dec 7: release candidate

- [ ] B: Mac 1.0.0 release candidate built, signed, notarized, sent to beta testers
- [ ] W+B: iPad build on TestFlight (external group for testers; Apple's beta review the first time)
- [ ] W: Email beta testers: what to test, how to report, and that beta licenses end Dec 31

## Dec 7 – Dec 20: triple-check

- [ ] W+B: Real shows end to end on the RC (copies of real shows, never the originals): build a show, every PDF, export → import, CSV export, FileMaker import
- [ ] W+B: iPad: pair, download, accept an update, flags, My notes, caller view, PDFs, open a `.spotplot` file
- [ ] W+B: Fresh install on a Mac that has never had SpotPlot (download from the website, open, sign in, welcome)
- [ ] W+B: Update from the current beta (0.4.x) to 1.0 through auto-update; What's New shows once
- [ ] W+B: License cases: wrong key, wrong email, third Mac, signed out, offline, ended license, turned-off license
- [ ] B: Shipped app's code is minified with no comments or notes (no visible AI traces)
- [ ] B: Website: manual and support match 1.0; screenshots current; no wording that reads as AI-written; Terms/Privacy final
- [ ] W: Website wording pass sent (any form)
- [ ] B: Website repo private or replaced with a fresh one without history or `CLAUDE.md`
- [ ] W: Promo video done (Dec 14)
- [ ] W+B: spotplotapp.com: HTTPS enforced, `www` works, domain set to auto-renew
- [ ] W: **Apple signing certificate**: your Developer ID certificate expires **Feb 1, 2027**. Make a new one in December so 1.0 and January's updates are signed with it. If the developer account moves to the LLC, **convert the existing account** (Apple support) rather than opening a new one: auto-update only works if the **Team ID stays the same** (299TQ9H5QB)

## Dec 11 – Dec 12: iPad to Apple

- [ ] W+B: App Store listing ready (Dec 11): name, subtitle, category, free, age rating, description, keywords, support and marketing URLs, 13-inch iPad screenshots from a demo show, privacy policy URL, "Data Not Collected", encryption answer, review notes and a demo `.spotplot` file for Apple
- [ ] W: 🛑 **Submit the iPad app for review (Dec 12)**, set to **release manually**
- [ ] W: If Apple rejects it: fix and resubmit the same week

## Dec 13 – Dec 14: legal and website

- [ ] W+B: Lawyer's notes folded into Terms, Privacy Policy and the license agreement (`LICENSE.txt` / `.rtf`, which is shown when installing)
- [ ] W+B: Mailing address added to both policies
- [ ] W: Full website goes public: GitHub → Settings → Pages → Branch `teaser` → `main` (Buy buttons still "Coming soon")

## 🛑 Dec 21: code freeze

- [ ] B: Mac 1.0.0 final: version in `package.json`, Unreleased in `CHANGELOG.md` becomes `## 1.0.0 (2027-01-01)` (this is What's New), `npm run make`
- [ ] W: GitHub release **saved as a draft** (DMG + `make/zip/darwin/arm64/SpotPlot-darwin.zip`), not published
- [ ] W: Final 1.0 tested once more from the draft's own files

## Dec 22 – Dec 30: holiday buffer

- [ ] W: iPad app shows "Pending Developer Release" (approved and waiting)
- [ ] W: Dec 29: Stripe to **live mode** (live keys and webhook secret on Render); buy one real license yourself and check it end to end
- [ ] W: Your own licenses set to **No End Date** in the dashboard (done Nov 3; check again)
- [ ] W+B: Launch announcement written: beta testers' email, social posts, forums and groups, press list
- [ ] W: Everything for launch day written down (below) and ready to copy and paste

## 🚀 Jan 1: launch day

- [ ] W: Publish the Mac 1.0.0 GitHub release (the draft)
- [ ] W: Release the iPad app in App Store Connect
- [ ] W+B: Website: Buy buttons switched to the live Stripe checkout links; Download button works; push
- [ ] W: Buy a license on the live site one more time (a real card, then refund or keep it)
- [ ] W: Send the announcement
- [ ] W: Watch: the admin dashboard (new licenses), Stripe (payments), support email, App Store

## First two weeks after launch

- [ ] W+B: Answer support quickly; a 1.0.1 fix release is ready to go if something comes up (signing certificate renewed by then)
- [ ] W: Daily look at the dashboard: failed payments, people stuck at the Mac limit, ended beta licenses asking for help
- [ ] W: NY LLC publication notice (due by about **March 3, 2027**)
- [ ] B: Move launch leftovers into TODO.md; plan Q1 (Production licenses) and the iPad's Phase 2
