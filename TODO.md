# SpotPlot To-Do

Current version: Beta 0.2.1

## Next release checklist
- [x] Before building: fix show import dropping per-cell data (see Bugs)
- [x] Before building: include character photos in `.spotplot` exports and restore them on import (see Bugs)
- [ ] After installing the new build: `.spotplot` files show the SpotPlot icon in Finder. **To test (needs a log out):** rebuild with `npm run make` (the JSON→data file-type fix), install, run `lsregister -f /Applications/SpotPlot.app` and `qlmanage -r cache && killall Finder`, then log out and back in (Apple menu → Log Out) if a file still shows a text preview.
- [x] After installing the new build: double-clicking a `.spotplot` file opens SpotPlot and imports the show
- [x] After installing the new build: File → Import Show (Cmd+I) still works
- [ ] After installing the new build: SpotPlot opens past the license screen, and the license admin page shows this Mac under Devices (1/2)
- [ ] After installing the new build: Print page shows the real PDF preview with page breaks (not blank), options update it, and Export PDF… saves

## Bugs
- [ ] `.spotplot` file icon not showing the SpotPlot logo in Finder — *fix in forge.config.js (Info.plist document type); verify after the next build*
- [x] **Fix before next release.** Show import drops per-cell data: highlights, spot notes, no-color, ignore, note-checked and custom character names are lost when importing a `.spotplot` file (import INSERT in `db-import-show` only copies some `spot_cues` columns)
- [x] Characters screen: dropping an image onto the photo box opens a file picker instead of using the dropped file
- [x] `.spotplot` exports only carry the show logo, not character photos (or custom action icons), so a shared show arrives without cast photos. Embed them in the export like the logo and save them into `userData/images` on import.
- [x] Dev only: `npm start` downloads a fresh Chrome for Testing ("Downloading Chromium...") whenever Chrome updates, because `main.js` asks for the latest stable instead of the version Puppeteer expects. ~4 GB of duplicate copies have piled up in `~/.cache/puppeteer`. Pin dev to one version (the one `forge.config.js` bundles), then delete the extra copies. Doesn't affect installed builds.

## App features
- [ ] Finder preview of `.spotplot` files shows that show's logo (the small file icon stays the SpotPlot logo). Needs a Quick Look **Preview** extension (not a Thumbnail extension, which would replace the icon): a small Swift `.appex` that reads the file's JSON, decodes the embedded logo from `images[show.logo_path]`, and shows it, falling back to the SpotPlot icon. Requires installing Xcode, building the appex as part of `npm run make`, and embedding it in `SpotPlot.app/Contents/PlugIns` before signing/notarizing (app extensions must be sandboxed). Test from a signed, installed build.
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
- [x] Device limits per license key (max 2 devices)
- [ ] Windows distribution

## Design
- [ ] Pre-launch design refresh: make it feel premium and original

## Future / roadmap
- [ ] SpotPlot Live Sync: cloud upload from desktop + iPad companion app for operators
