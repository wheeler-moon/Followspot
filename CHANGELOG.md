# SpotPlot Changelog

Every change a user would notice, written in plain words, added **when the change is made** (under Unreleased). At release time, Unreleased becomes the release notes and gets a version number. Older releases: https://github.com/wheeler-moon/Followspot/releases

Sections: Cue list · Printing · Spots & shows · iPad · Fixes · Other. Website and license-server changes are noted under Other when they affect users.

## Unreleased

- Deleting a custom action that cues use asks what those cues should use instead: another action, a new one, or don't delete
- Show Settings → Custom Actions: your own actions sit right after Off (a blue dot marks them), and + at the end adds one. The icon library has blue and purple circles too
- Custom actions with no icon show nothing in the icon's place (on the cue list, in Show Settings and on prints), instead of a dot
- Show Settings → iPad Sync: each iPad shows the name its operator gave it (e.g. "Dana – Spot 2") instead of just "iPad"
- Home: each show has a **⋯** button (or right-click it) to **Duplicate**, export or delete it. A duplicate is a full copy named "… copy"
- Cue list: ⌘G (Edit → Go to Cue…) jumps to a cue. Type the LQ and press Return; it finds "14*" or "In 14" from 14, or the nearest cue
- Notes sidebar: typing 14 finds a cue whose LQ is "14*" or "In 14"
- Cue list: double-click a cue and start typing the note right away. Return saves it and closes the box (Shift-Return for a new line)
- Characters screen: double-click a character to edit it (no more Edit button). The Add character box is smaller
- Spot Notes screen: easier to read. Each spot is one panel of notes grouped by scene (green and gold, like the cue list), each note under its LQ with the action symbol and character. A green ✓ gives a note, the trash can deletes it, click the LQ to go to the cue, and double-click a note to edit it
- Show Settings → Iris Sizes: each size has a little stick figure. Click it and drag the circle to show how much of a person that size lights. Turn on **Iris pictures** in Print → Page Setup to put them in the spot sheet and caller sheet headers
- A show you've just imported opens its cue list at the very top
- Show Settings: **Cue Settings** is now called **Cue Visibility**
- Spot Settings: **Swap spots** is now at the top right, next to the title, so the spots start at the top of the page
- Swap spots: the dialog fits long operator names and sits in the middle of the window, and spot notes you've already given (the Given tray) swap with their cues too. A new **Also swap operator, location, fixture and gels** box (off to start) moves everything
- A removed color frame keeps its place everywhere as an empty slot (Frame 4 removed leaves a gap between 3 and 5): in Spot Settings (with **+ Add back**), the cue list, the dashboard, every printed sheet and the iPad
- Clicking a spot on the show dashboard opens Show Settings right at that spot
- Spot Settings: ⌘Z undoes changes to a spot's operator, location, fixture, gels, frames (cues get their frames back too), permanent color, Copy colors, adding a spot and swapping spots (⇧⌘Z redoes)
- Show dashboard: each spot shows its color load as little colored boxes, lined up F1 under F1 down the list (PERM last). Click a spot to edit it in Show Settings
- A new cue after an Iris/Fade Out starts Off for that spot, like after a Fade Out
- Characters screen: ⌘Z undoes adding, changing, deleting, reordering and the Print checkbox (⇧⌘Z redoes). Undoing a delete puts the character back in every cue that had them
- Scenes screen: ⌘Z undoes adding, changing, deleting and reordering scenes (⇧⌘Z redoes). Undoing a delete puts its cues back in the scene. The up/down arrows are gone from Scenes and Characters; drag to reorder
- A scene no longer needs a label: give it a label, a song, or both. A scene with only a song shows the song in its header, on prints and on the iPad
- Cue list top bar stays on one line in a narrow window: Add Scene and Add Character are icon buttons, a long show name shortens with …, and the scene menu shrinks
- Cue list: when a show lets iPads connect, the top bar shows a green dot for each connected iPad ("2 iPads") and a **Send to iPads** button. iPads only get your changes when you send them, so you can make lots of changes and send them in one go. Only changes an operator would see count (giving a Spot Note or other Mac-only settings don't)
- **Page Setup** (Print → Page Setup…, or ⌘P): paper size (Letter or Legal), orientation, a page range or T· range, the sheet's options and which cue details print, with a preview you scroll through. Each kind of sheet keeps its own paper, orientation and range. Every sheet fits the paper you pick: Legal fits more cues on a spot sheet, gives the caller sheet more room and a spot sheet's cover a bigger logo. Spot sheets print portrait, the caller sheet landscape
- Print remembers what you picked for each show: the sheet, label and every setting
- Print preview opens showing a whole page
- Caller sheet with 4 or more spots: short iris names (H&S, FB), smaller action words that stay on one line, and each spot's color load on one row at the top, lined up even when a spot has no location. Names never split mid-word. Action symbols are the same size throughout a sheet
- Caller sheet: an ignored spot keeps its size, goes grey and faint, with IGNORE centered over it
- Caller sheet: each cue lines up across its spots. The action word, character and intensity share one line; iris, color and time sit at the same height; and if any spot has a When or a Note, every active spot shows both, in line. Tracked spots keep their short layout
- Shorter tips and settings descriptions, quicker to read
- A new or inserted cue now brings each spot's iris size from the cue above, along with its character and color
- Cue list: a spot's iris size shows bright blue in the cue where it changes and muted while it stays the same, like color frames
- Changing a cue to **Tracked** now starts it clean (no time, intensity, When, w/LQ or notes) and carries on from that spot's cue above: the same character, iris size and color frames. It keeps following: change the iris or color in the cue above and the Tracked cues below change too. A new **character** follows the person all the way to their fade out: through Tracked cues and cues like Increase or Iris In, into the Fade Out / Bump Out, and stopping at Off, a new Pick Up, Swap To or Slide To, or a cue on someone else
- Clearer action symbols: Bump Up and Bump Out are bold arrows hitting a bar (the light snaps straight to full or out), Ballyhoo is two overlapping circles, Iris In and Iris/Fade Out's arrows point inward (Iris Out's point out), new symbols for Swap To and Stay With, and a new purple for the iris actions. Prints and the Action Key match

## 0.5.0 (2026-11-04)

New: **undo for everything in the cue list**, **more than one character in a cue**, a **Notes sidebar**, **Cue Defaults**, **notes on Off cues** and **spreadsheet export**.

Cue list
- **⌘Z undoes everything** in the cue list, and ⇧⌘Z redoes
- **Notes sidebar**: jot notes during a run, then click one to jump to its cue
- **More than one character** in a cue: click the **+** beside the character
- **Notes on Off cues**: click **+ Note** in an Off box. They print too
- **Copy and paste a whole cue**: right-click a cue's LQ number
- Add a cue at the top of a scene: hover under the scene's header and click **+ insert cue here**
- Double-click a scene header to rename it
- Act breaks always show, on screen and in print
- Menus stay with their cue while you scroll and are never cut off
- A new character name you type stays custom unless you choose to add it
- The cue list reopens right where you left it

Printing
- **Page numbers** can print under each cue's T· number (Show Settings → Cue Settings)
- Show logos are never cropped
- Cover pages without a logo look cleaner

Shows and spots
- **Home screen**: the show you changed last is first, with a grid or list view
- **Cue Defaults** (in progress): a default time, intensity, iris and color for new actions (Show Settings → Cue Defaults)
- **Custom actions**: edit, rename or delete them, with a new icon library
- **Spot Notes**: easier to read, with **Go to Cue** and a **Given** tray for notes you've given
- **Export as a spreadsheet** for Excel, Numbers or Google Sheets
- "Actor" is now "Performer", and EOS Control is now **Console Connection**

Your account
- **Sign In** and **Sign Out** replace Activate and Deactivate
- A welcome when you first sign in
- Your name shows on the Home screen; click it for Settings
- Settings → Account shows when a beta or free license ends

Other
- Escape closes any menu or dialog
- A notice shows when an update is downloading, with **Install & Restart**
- A cleaner top bar, like Apple's own apps
- Tips the first time you open Show Settings
- A color typed by hand no longer reopens the gel list

## SpotPlot for iPad (not released yet)

Saved for the iPad app's first release (kept out of the Mac's What's New).

- Custom actions with no icon show nothing in the icon's place, instead of a gray dot
- Name this iPad (when adding a show, or the iPad button on the Shows list) so the Mac's list of iPads says who's who
- Spot view: put the columns in any order. Drag a column's title sideways (a blue line shows where it will land), or open Details (⋯), where each column has its switch and a ≡ handle to drag. Kept on this iPad for that show; **Reset Column Order** puts it back
- A color frame removed on the Mac keeps its place as an empty slot
- Details → **Iris Pictures** shows each iris size's stick figure and circle (set on the Mac) above the cue list
- Scene headers are centered in their row
- Caller is picked from the role menu like any spot. While you're the caller, the button next to the show's name chooses which spots show and their order
- Switching roles: the Switch button is blue
- Updates list one line per cue that reads like the cue itself ("Spot 2 — Bump Up Sandy @Full, 1/2 Body, F1+2, w/ LQ 13"), with what changed in bold. Tracked cues that just follow a change made above them aren't listed
- Ignored cues go grey and faint, with a big IGNORE centered over the cue (spot and caller views)
- Action symbols match SpotPlot for Mac's new ones (Bump Up / Bump Out as arrows hitting a bar, Ballyhoo, Iris In / Out, Swap To, Stay With, iris purple)
- Shows list: each show has its logo (whole, never cropped), when it was last edited on the Mac and last opened on this iPad, and the show you opened most recently is at the top
- Caller view: a little space between @ and the intensity
- The cue details menu (•••) stays open while you switch things on and off; tap anywhere outside it to close it
- Flags: tap a flag in the Flags list to close it and scroll the cue list to that cue. Cues with a flag (or your own note) stay visible even when Hide Off or Hide Tracked would hide them
- My note: the keyboard's Done key closes the note (and saves it) instead of starting a new line
- Caller view: each cue is its own card with a small gap between, so cues read as separate rows instead of a grid; the LQ column is slim (a very long cue number shrinks to fit instead of widening every row); and the caller can drag spots into any order in Caller… (tap to show or hide a spot)
- **My notes**: tap a cue and type in **My note** to add your own note, like pencil on a printed sheet. It shows on a small line under the cue (in both the spot and caller views), stays on this iPad only and is kept when the show updates from the Mac. Cues with a note stay visible even when Hide Off or Hide Tracked would hide them
- Notes on Off cues show in the Off row (and under Off in the caller view), and Hide Off Cues keeps the Off cues that have a note
- Act breaks (like "Act One") always show as their orange header in the spot and caller lists, even with no cues of their own, in their place between scenes (as on the Mac)
- A cue with more than one character shows them all ("Bob, Matt & Sue"), wrapping onto more lines instead of cutting off
- Jump to Scene (the list button in the top bar) scrolls straight to any scene, like the Mac's Jump to
- Action Words and Action Symbols are separate switches in the ⋯ menu, for operators who want only symbols or only words
- A color that's the same as the cue before shows in grey; changes stay highlighted in yellow
- A cue where a spot carries on never shows the word "Tracked"; it reads like any untouched cue (and Hide Tracked hides it)
- Hide Off and Hide Tracked switches (tracked cues hidden by default), a T· Numbers switch, a color load button like the Mac's, intensity stacked over iris, bigger action symbols, and color frames that never wrap ("F1+2" on one line)
- The Caller view now looks like the printed caller sheet, with each spot's color load lined up over its column. A strong line separates cues and a short faint one separates spots, so each cue reads as one row, and every spot's When box in a cue starts at the same height
- Highlighted cues stand out more (a tinted row with a solid bar on its left edge), and rows alternate shades so they're easier to tell apart
- Tap a cue to flag it **Missed**, **Clarify** or **Idea**. The Flags button lists them all in cue order, filters by kind, shares them as text, and clears them after the show

## 0.4.0 (2026-10-22)

New: **Import from FileMaker.** Bring followspot shows over from a FileMaker database (the FileMaker followspot paperwork many designers use), without needing FileMaker: Home → Import ▾ → FileMaker Show…, or File → Import from FileMaker…. Choose the show's FS_Track.fmp12 (SceneList.fmp12 next to it comes too). The show's details, team, spots and gels, characters, scenes and every cue come across; actions or iris sizes in the file that aren't exactly SpotPlot's are matched by you, or kept as custom ones.

Cue list
- The actions Fade Up and Fade Down are now called **Increase** and **Decrease**, everywhere: the cue list, prints, the action key and the FileMaker import. Shows you already have (and older .spotplot files) switch over automatically
- A spot's lit color frames show bright blue in the cue where its color changes and muted when they're the same as its cue before, so color changes stand out. On spot sheets and the caller sheet, a color that's the same as the spot's cue before now prints grey; changes stay highlighted in yellow
- Right-click a spot's box in a cue for a real Mac menu: **Copy Cue** and **Paste Cue** (or Paste Cue Without Character) to copy what a spot does into another spot or cue, a **Highlight** submenu (whole cue, When line, Notes line), **Ignore Cue**, **Add Spot Note…**, **Insert Cue Above / Below**, **Delete** the cue, and **Clear Cue**, which empties the box so you can start that cue from scratch (a spot that's Off stays Off). ⌘Z undoes paste, highlight, ignore and clear
- Click the little color button next to a spot's name at the top of the cue list to keep that spot's whole color load in view (frames and permanent color). It stays open until you close it, even after leaving the cue list
- Double-clicking a word in When or Notes selects that word, like any text box. Double-click anywhere else in a spot's box to open its options
- Renumber T· can be undone: press ⌘Z right after to put every cue's old T· number back
- Each cue can note its script page: click the small "pg" next to T· and type it (like 13 or 13a)

Printing
- On spot sheets and the caller sheet, a cue where a spot has no action (it carries on, like a cue you inserted and didn't change for that spot) prints all in grey, without an action, so the eye goes to the cues that need it
- New: **Action key**, one page showing every action symbol and its name, including your show's custom actions. "Only this show's actions" leaves out the ones no cue uses
- New: **Scene list**, every scene in order with its song, number of cues, LQ and T· range and script pages, with act breaks marked
- Two or more color frames now print as **F1+2** (not F1+F2) on spot sheets and the caller sheet
- New **Cover page** switch for the caller sheet and spot sheets: a bordered first page with the label, the show name and a large logo, the theatre and producer, each spot's number, operator, position and fixture with its color load (just that spot's on a spot sheet; on the caller sheet every spot's frames line up in the same columns), a key to the action symbols the show uses, and the lighting team along the bottom

Spots & shows
- Spots can have fewer than six color frames. Hover a frame in Spot Settings or New Show and click the small red × to remove it; "+ Add frame" brings it back. Frames keep their numbers (remove Frame 5 and the spot has F1–F4 and F6), and the cue list, prints and color load only show the frames a spot has. If cues use the frame you're removing, you can switch them to another frame or take it out of them
- Deleting a spot no longer renumbers the others: delete Spot 2 and the show keeps Spots 1 and 3. The delete box offers "Renumber spots" if you'd rather close the gap, and + Add Spot fills the lowest free number

iPad Sync (for SpotPlot for iPad, coming soon)
- iPad Sync is now per show: each show has its own "Let iPads connect to this show" switch and its own code, in that show's Show Settings → iPad Sync. An iPad that enters a show's code gets that show only, never the other shows on the Mac. Turning a show's switch off hides it from iPads. iPads paired before this change need to enter the show's code once
- If SpotPlot crashed while iPad Sync was on, iPads could see the Mac twice; that's cleared the next time iPad Sync starts
- The show dashboard's iPad Sync button shows one green dot for each iPad connected to the show (3 iPads, 3 dots); with more than 6 it shows the number

Other
- Settings (home screen) is reorganized like a Mac's System Settings. **Account** shows your email, plan, status (renewal date or any payment problem, once subscriptions start) and your license key, hidden except the last part, with a Copy button. **Deactivate…** takes this Mac off your license so you can move SpotPlot to another Mac. **Updates** has a switch for automatic checks, a Check Now button and when it last checked; SpotPlot also re-checks every few hours while open. **Help & Feedback** and **About** round it out; **What's New** opens by itself the first time SpotPlot starts after an update, showing what changed in that version (it's built into the app, so no internet needed), and any time from Settings → About
- Settings opens even when there are no shows yet
- Settings → About links to the new Terms of Service and Privacy Policy on spotplotapp.com.
- Exported .spotplot files now carry the printed spot sheets and caller sheet, so SpotPlot for iPad (coming soon) has the paperwork for a show opened from a file. Files are a little bigger; other Macs open them as before
- Help → Send Feedback… starts an email to support with your SpotPlot version, macOS version and Mac type filled in. Help → Contact Support does the same

Fixes
- Dragging a cue cell and then letting go without moving it no longer leaves the cell highlighted

## 0.3.1 (2026-10-14)

Cue list
- Custom fade times (like 2.5s) now show in the cue list, not just on prints
- The iris size buttons show a ‹ arrow on the left once you've scrolled, as well as the › arrow on the right, so you can tell there are more sizes either way

Printing
- Caller sheet: each spot's color load sits centered over its own column, and the permanent color shows as a PERM frame
- Color load: a frame with more than one gel is split into stacked bands, one per gel, in each gel's color
- Spot sheets: the gel load at the top shows gel numbers only (names stay on the Color Load), and the PERM box's border is no longer cut off

Spots & shows
- A color frame can hold more than one gel (e.g. R02+R132): "+ Add gel" in New Show and Show Settings → Spot Settings
- Copy colors from… also copies the fixture type
- Complete gel catalog: 1,136 gels straight from the makers' current lists: Rosco (Roscolux, Cinegel and CalColor, e.g. R4615), Rosco E-Colour+, Lee (including the 300–700s and Zircon) and GAM GamColor. Names are corrected, and a few numbers that aren't on any maker's list were removed
- Gel swatches and the Color Load use each gel's real color from the maker
- Any gel can be typed, even one not in the list: it's kept exactly as typed, prints like any other gel, and shows as clear/white. Typing an exact number (like r4615) fills in its name
- Gel search puts an exact number match first
- Show Settings → Iris Sizes: rename any size (including the built-in ones), drag ⠿ to reorder, and Reset a renamed built-in size. Renaming updates every cue that uses it
- The show dashboard lists spots in number order, whatever order is set in Spot Order

iPad
- Show Settings → iPad Sync: "Let iPads connect to this Mac", a pairing code, and a list of paired iPads with who's online. The dashboard's iPad Sync dot turns green while iPads are connected (the iPad app itself is coming)

Other
- Help → SpotPlot Website and Settings now open spotplotapp.com

## 0.3.0 (2026-10-10)

New: tips that walk you through each screen the first time you open it. Help → Show Tips Again brings them back any time.

Cue list
- "Renumber T·" button cleans up spot cue numbers to 1, 2, 3… without changing your cue order
- New "Dump & Restore" action
- Scene headers stay pinned at the top while you scroll (act breaks in orange)
- More room between spots
- Shows "Loading cues…" while a show opens, instead of an empty list

Printing
- Redesigned caller sheet: iris, color and time in one labeled strip; When and Notes in their own box
- Color changes are highlighted in yellow, including each spot's first color
- T· numbers printed small under each LQ (switch on the Print page)
- "Page 1 of 31" at the bottom of every page
- Cues never split across two pages
- Refreshed Spot Notes sheet

Spots & shows
- Permanent color: mark a gel that always stays in the fixture (shows on the Color Load sheet)
- Cue Settings: choose which cue details appear on the cue list and on prints
- Updated fixture list
- New show dashboard and a refreshed design throughout
- iPad Sync tab (iPad app coming soon)

Installer
- Proper license agreement window

## 0.2.1 (2026-09-30)

Printing
- New print page: pick what to print and see a live preview of the actual PDF, with exact page breaks
- New Characters sheet: cast photos, actors and costume notes on one page (choose who prints)

Cue list
- Action and character on one larger, easier-to-read row
- "w/ LQ" is now a switch that follows the cue number automatically
- Bold, italic and underline in When and Notes (Cmd+B / Cmd+I / Cmd+U)
- Highlight just the When or Notes line, not only the whole cue
- Iris sizes scroll sideways instead of crowding the row
- New custom character names can be added to the show's character list

Spots & shows
- Swap all cue data between any two spots
- Copy gel colors from one spot to another
- Show exports now include everything: highlights, notes, formatting, photos and logos
- Double-click a .spotplot file to import it; show files now have the SpotPlot icon

Fixes
- Show logos now save when creating a new show
- Photos and logos are kept safely even if the original file is moved
- Dropping a photo onto a character works
- Spot columns stay equal widths

Licensing
- Each license can be used on up to 2 Macs
