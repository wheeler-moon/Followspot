# SpotPlot To-Do

Current version: Beta 0.2.0

## Bugs
- [ ] `.spotplot` file icon not showing the SpotPlot logo in Finder — *fix in forge.config.js (Info.plist document type); verify after the next build*
- [ ] **Fix before next release.** Show import drops per-cell data: highlights, spot notes, no-color, ignore, note-checked and custom character names are lost when importing a `.spotplot` file (import INSERT in `db-import-show` only copies some `spot_cues` columns)
- [x] Characters screen: dropping an image onto the photo box opens a file picker instead of using the dropped file

## App features
- [x] Bold/italic/underline in when/notes fields (Cmd+B, Cmd+I, Cmd+U)
- [ ] Onboarding walkthrough for new users (tooltip-style popups on first launch)
- [ ] Update default fixture types list in Spot Settings
- [x] Cue list: make "w/ LQ" a toggle that stays linked to the cue's LQ number, so renumbering the cue updates it automatically (no re-pressing the button)
- [x] Cue list: don't show the hover "insert cue" button on the last cue, since the permanent add button at the bottom covers it
- [x] Cue list: iris sizes and gel frames get crowded with custom iris sizes and as spots are added; make that area less cramped
- [x] Show Settings: swap all cue data between two spots for the entire cue list with one button (e.g. Spot 1 ⇄ Spot 2)
- [x] Cue popup (double-click): more flexible highlighting, e.g. highlight just the notes instead of the whole cue cell
- [x] Cue list cells: put action and character on the same row (same behavior as now), and make both much bigger and easier to read
- [x] Spot Settings: option to copy Spot 1's colors (gel frames) to the other spots, so identical color loads don't have to be typed for each spot

## Print / paperwork
- [x] Print page redesign with live preview (replaces "PDF preview before export"): instead of one long list of print options, start with "Select what you want to print" (e.g. Spot 1, Caller sheet, Color load, Spot notes). The selected sheet shows as a live preview of the actual PDF, with its options beside it (hide Off, hide Tracked, cue range, label…); changing an option re-renders the preview immediately. Export saves exactly what the preview shows.
- [ ] Caller sheet design v2: easier to read, more compact
- [ ] Spot sheet page breaks: cues shouldn't split across pages
- [ ] Action symbols cheat sheet PDF

## Structural
- [ ] Settings popup: more robust system-wide toggles

## Business
- [ ] Stripe integration: monthly/yearly, standard/student ($15/$170 and $10/$115)
- [ ] Device limits per license key (max 2 devices)
- [ ] Windows distribution

## Design
- [ ] Pre-launch design refresh: make it feel premium and original

## Future / roadmap
- [ ] SpotPlot Live Sync: cloud upload from desktop + iPad companion app for operators
