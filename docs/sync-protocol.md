# Desktop ↔ iPad sync protocol

The contract between SpotPlot on the Mac (`src/ipadSync.js`) and SpotPlot for iPad. **Both apps must follow this document.** Change it in the same commit as the code, and bump the version on any change the other side would notice.

**Protocol version: 2** (desktop sends it in `/api/hello` and in its Bonjour record as `protocol=2`). Version 2 (2026-10-17) made pairing per show: version 1 iPads and Macs refuse each other with an "update" message.

## Rules for changing it

- **Adding** a field or endpoint that older apps can ignore: no version bump; note it below.
- **Changing or removing** anything, or changing what a field means: bump the version. Each app checks the other's version and shows "Update SpotPlot on your Mac / iPad" instead of misbehaving.
- **Show data** is a `.spotplot` export, so any change to show data (new columns, new JSON on `shows`, new tables) is also a change here. Add it to the "Show data" notes.

## Finding and pairing

- The Mac advertises Bonjour service `_spotplot._tcp` (name "SpotPlot on <Computer Name>", TXT `protocol=2`) while any show has Show Settings → iPad Sync → "Let iPads connect to this show" on.
- **Pairing is per show.** Each show has its own switch and 6-digit code (kept on the Mac in `userData/ipad-sync.json` under `shows[showId]`, never in a show file). Entering a show's code gives the iPad a token for **that show only**. To add another show, the iPad enters that show's code. "New code" changes the code for new pairings; iPads already paired stay paired.
- A show with its switch off is invisible: its code is refused and its paired iPads get `403` until it's switched on again.
- Port 47800 by default; any free port if that's taken (Bonjour carries the real one). The iPad Sync tab shows the address for typing in by hand.
- Plain HTTP on the local network, JSON bodies.

## Endpoints

| Request | Auth | Body / query | Response |
|---|---|---|---|
| `GET /api/hello` | none | | `{ app: "SpotPlot", protocol, version, name }` |
| `POST /api/pair` | none | `{ code, deviceId, deviceName }` | `200 { token, name, showId, title }` (the show the code belongs to); `403` no show with that code has iPad Sync on; `429` after 5 wrong codes in a minute |
| `POST /api/presence` | token | `{ role, spots }` (role `spot` or `caller`; `spots` = spot numbers) | `{ ok: true }`. Send every ~5 s; the Mac shows an iPad as online (on that show) if seen in the last 15 s |
| `GET /api/shows` | token | | `{ shows: [{ id, title, theatre, num_spots, version }] }`: only the token's show |
| `GET /api/shows/:id` | token | | the `.spotplot` export JSON plus `sync_version`; `404` for any show but the token's |
| `GET /api/shows/:id/pdf` | token | `kind=spot&spotId=…` or `kind=caller` | `application/pdf` (token's show only) |

Auth: `Authorization: Bearer <token>` from pairing (one token per show). `401` means the iPad was forgotten for that show (or never paired with it) and must enter the show's code again. `403` means iPad Sync is off for that show. `404` on a list request means the show was deleted on the Mac.

## Show data notes

- `version` / `sync_version`: a fingerprint of what iPads show (not images): only the columns an operator sees (`VERSION_COLUMNS` in `src/ipadSync.js`), so the show's modified time, the LD's Spot Notes and checkmarks, Cue Defaults and similar Mac-only settings don't count. Same value means the iPad's copy is current. If an update changes nothing in an iPad's own cues, the iPad takes it quietly without asking.
- **What iPads get is the last SENT copy**, not the live show: the Mac freezes the show and its PDFs when the LD clicks **Send to iPads** (cue list top bar), in `userData/ipad-sync-sent/<showId>/`, and serves that until the next send. A show never sent is sent the first time an iPad asks. Same endpoints and fields as before, so no protocol bump.
- Images are inside the export as base64 (`images[path]`).
- **Sheets (`.spotplot` files only):** an exported file also carries the printed sheets as base64 PDFs: `sheets.spot[spotId]` (each spot sheet) and `sheets.caller`, so SpotPlot for iPad has the paperwork for a show opened from a file. Not sent by `/api/shows/:id` (iPads fetch PDFs from `/pdf`). Desktop import ignores it.
- Spot numbers can have gaps (a show can have Spots 1 and 3): use each spot's `spot_number`, never its position in the list.
- A spot's frames are its `color_slots` rows with `is_permanent = 0`. A spot can have fewer than six, and numbers can have gaps (e.g. 1, 2, 3, 4, 6): show only the frames that exist, by `slot_number`. `spot_cues.active_frames` ("F1,F3") only names frames that exist.
- Color frames can hold several gels: `gel_number` "R02+R132", `gel_name` "Bastard Amber + Quarter Hamburg Frost".
- A gel can be anything typed (not only catalog numbers): `gel_number` holds the typed text and `gel_name` may be empty. In a multi-gel frame, a typed gel's name stands in as its own text, so names stay paired with numbers.
- Gel colors: use the same catalog as the desktop, `src/gels.json` ([maker, number, name, color]); the iPad app should bundle a copy. A gel not in the catalog has no color: draw it clear/white.
- `shows.iris_sizes` is a JSON array `{ label, value, builtin?, key?, pic? }` in display order (see `src/irisSizes.js`). `spot_cues.frame_size` holds the size's `value`. `pic` (optional) is that size's circle on the stick figure, `{ x, y, r }` in a 120 × 170 drawing (figure at x 60, head top y 14, feet y 150); a built-in size without one uses the defaults in `DEFAULT_IRIS_PICS` (the iPad keeps a copy in `ShowModel.defaultIrisPics`; change both together). The iPad shows them above the cue list when the operator turns on Details → Iris Pictures; an older iPad ignores `pic`.
- `cues.all_spots_note` (text or null): a spot note for every spot on that cue (Spot Notes → All Spots), Mac only for now; the iPad can ignore it.
- `givenNotes` (array in the .spotplot file, table `given_notes`): spot notes that have been given (checked off), `{ id, show_id, cue_id, spot_id, note, given_at }`; `spot_id` is null for an All Spots note. A given note is no longer on its cue. `spot_cues.note_checked` and `cues.all_spots_note_checked` are no longer used (always 0); a file that still has checked notes has them moved to `givenNotes` on import. The iPad can ignore all of this.
- `shows.cue_defaults` (JSON string or null): Show Settings → Cue Defaults, `{ intensity, fade_time, frame_size, active_frames, no_color }`, used by the Mac while editing (`src/cueDefaults.js`). The iPad ignores it.
- `spot_cues.extra_characters` (JSON string, may be null): a spot cue's second and third characters, after the first one (`character_id`, or `custom_character` for a typed name). A list in order where a number is a character id from this show and text is a typed name, e.g. `[12, "Ensemble"]`. Show them all with the first, as "Bob & Matt" or "Bob, Matt & Sue" (`src/characterNames.js`). An older iPad build shows only the first character.
- `shows.new_character_choice` (`'custom'`, `'add'` or null): this show's remembered answer to "Add to Characters?" on the Mac. The iPad ignores it.
- `cues.page` (text or null): the script page the cue is on, typed by the user ("13", "13a"). Shown on the cue list only for now.
- `shows.cue_fields` is JSON `{ field: { list, print } }` (see `src/cueFields.js`). A missing field means shown, except `page` (the script page), whose `print` is off unless set. The iPad treats `page` the same way.
- `spot_cues.action` is an action name (the cue list's `ACTIONS` in `src/screens/CueListScreen.jsx`, or a custom action from `shows.custom_actions`), `''` for a spot that carries on, or `'Off'`. **Renamed:** Fade Up → `Increase` and Fade Down → `Decrease` (Mac databases and imported files are updated automatically). The iPad maps the old names too, for shows it saved before; an older iPad build shows the new names as plain text without a symbol until it's updated. `'Tracked'` may appear in older data and means the same as `''`. An `'Off'` spot cue can still have `notes`: a note for the operator while the spot is off, shown in the Off row (Hide Off Cues keeps Off cues that have one).
- `shows.action_names` (JSON string, may be null): renames SpotPlot's built-in actions for this show only, `{ "Pick Up": "Pickup" }` (built-in name → name to show). Cues keep the built-in name in `spot_cues.action`, so symbols and colors don't change; show the mapped name wherever an action's name appears. Ignore empty values or values equal to the key. Custom actions aren't in this map: renaming one rewrites `spot_cues.action` for that show's cues.
- `shows.custom_actions[i].builtinIcon` (optional string): the built-in action whose symbol this custom action uses (e.g. `"Ballyhoo"`), or one of three plain circles that aren't actions: `"Green Circle"`, `"Red Circle"`, `"Yellow Circle"` (in the iPad's `action-icons.json`). It wins over an uploaded image in `.icon`. Older iPad builds ignore it and show the custom action as words only.
- When and Notes (`spot_cues.description`, `spot_cues.notes`) contain simple HTML (`<b>`, `<i>`, `<u>`; see `src/richText.js`).

## Coming in later phases

Suggestions (iPad edits to When/Notes), the approval switch, and live updates. Add each endpoint here when it's built.
