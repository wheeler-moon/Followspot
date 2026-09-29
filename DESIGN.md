# SpotPlot Design Guide

Values come from Apple's **macOS 27 UI Kit** (Sketch, v12, 2026-06-23) and are adapted for SpotPlot. The kit itself is not in this repo. Apple's license doesn't allow redistributing it, and the repo is public, so never commit kit files.

The existing screens don't follow this guide yet. Bringing them in line is the "pre-launch design refresh" item in `TODO.md`. New or reworked UI should follow it now.

## Principles

- **Dark only.** SpotPlot is used at tech tables and in dark booths. There is no light mode.
- **Show content beats chrome.** Cue content (LQ numbers, actions, characters) is read quickly, at a distance, during tech. Make it bigger and higher-contrast than buttons, labels and headers.
- **One accent color.** SpotPlot purple marks what's interactive or selected. Other colors only carry meaning (delete, warning, highlight).
- **Native Mac feel.** Use the system font, macOS control heights and corner radii, and capsule-shaped switches.
- **Gel colors are data, not UI.** Gel swatches show the real gel color. Never tint, restyle or theme them.

## Color

### Surfaces and layering
Apple layers dark UI by putting translucent white fills on top of the window background, not by using a separate hex code for each grey.

| Token | Value | Use |
|---|---|---|
| Window background | `#1E1E1E` (Apple) / `#0F0F0F` (SpotPlot today) | Page background. The refresh should pick one; see note below. |
| Fill 1 | `rgba(255,255,255,0.10)` | Switch-off track, strongest raised surface |
| Fill 2 | `rgba(255,255,255,0.08)` | Bordered buttons (Apple uses 7%), cards |
| Fill 3 | `rgba(255,255,255,0.05)` | Table cells, hover |
| Fill 4 | `rgba(255,255,255,0.03)` | Subtle row striping |
| Fill 5 | `rgba(255,255,255,0.02)` | Barely-there grouping |
| Separator | `rgba(255,255,255,0.10)` | Dividers, cell borders |
| Popover / menu | `#1A1A1A`, shadow `0 18px 48px rgba(0,0,0,0.45)` | Floating panels |

On the window background: Apple's is `#1E1E1E`, while SpotPlot uses the darker `#0F0F0F`. The darker one is easier on the eyes in a dark booth. Either works as long as one value is used everywhere.

### Text
| Token | Value | Use |
|---|---|---|
| Label 1 (primary) | `#FFFFFF` | Main text, cue content |
| Label 2 (secondary) | `rgba(255,255,255,0.55)` | Supporting text, field labels |
| Label 3 (tertiary) | `rgba(255,255,255,0.25)` | Placeholders, disabled text |
| Label 4 (quaternary) | `rgba(255,255,255,0.10)` | Faint markers, like "—" in empty cells |

### Accent: SpotPlot purple
| Token | Value | Use |
|---|---|---|
| Accent | `#534AB7` | Filled controls: default buttons, switch-on track, selection, focus ring |
| Accent text | `#8A82E0` | Purple **text or icons** on dark backgrounds. `#534AB7` text is too low-contrast on dark. |
| Accent hover | `#1A1A2E` | Tinted hover background (already used in the cue list) |

Apple's closest system color is Indigo (dark mode) `#6D7CFF`.

### Meaning colors (Apple dark-mode system colors)
Only use these when the color carries meaning.

| Color | Value | SpotPlot meaning |
|---|---|---|
| Red | `#FF4245` | Delete / destructive actions, the red cue highlight |
| Orange | `#FF9230` | Warnings |
| Yellow | `#FFD600` | The yellow cue highlight |
| Green | `#30D158` | Success, confirmations |
| Blue | `#0091FF` | Apple's default accent. Don't use it; SpotPlot uses purple. |

For highlight **backgrounds**, use the color at 15% opacity (for example `rgba(255,66,69,0.15)`) so the text stays readable.

## Typography

The font is SF Pro through `font-family: -apple-system, BlinkMacSystemFont, sans-serif` (already set in `src/index.css`). "Emphasized" means weight 600 (semibold), or 700 where the table says Bold.

| Style | Size / line height | Weight (default → emphasized) | SpotPlot use |
|---|---|---|---|
| Large Title | 26 / 32 | 400 → 700 | Home screen show titles |
| Title 1 | 22 / 26 | 400 → 700 | Screen titles |
| Title 2 | 17 / 22 | 400 → 700 | Section headers, **cue list LQ numbers** |
| Title 3 | 15 / 20 | 400 → 600 | Dialog titles, **cue list action and character** |
| Headline | 13 / 16 | 700 → 800 | Table column headers |
| Body | 13 / 16 | 400 → 600 | Default UI text, form fields, buttons |
| Callout | 12 / 15 | 400 → 600 | Notes, "When" text in dense cells |
| Subheadline | 11 / 14 | 400 → 600 | Field labels, metadata |
| Footnote / Caption | 10 / 13 | 400 → 600 | Smallest allowed text |

- **Minimum text size is 10px.** The app currently has some 8px and 9px text; raise it during the refresh.
- Buttons and text-field values use **Medium (500) at 13px**.
- **Cue list exception:** the content people read during tech gets Title 2 or Title 3 sizes (15–17px, semibold), so it reads well at a glance. Headers and chrome around it stay at Body 13.

## Controls

### Sizes
macOS controls come in five heights. Use **Regular (24px)** by default, **Large (28px)** for primary actions in dialogs and **Small (20px)** in dense cue cells.

| Size | Height | Corner radius (buttons, pop-ups, segmented) | Text-field radius | Switch (w × h) |
|---|---|---|---|---|
| Mini | 16 | 6 | 6 | 36 × 16 |
| Small | 20 | 6 | 6 | 44 × 20 |
| Regular | 24 | 6 | 6 | 54 × 24 |
| Large | 28 | capsule (fully round) | 7 | 64 × 28 |
| Extra Large | 36 | capsule | 9 | 80 × 36 |

### Buttons
- **Bordered (standard):** fill `rgba(255,255,255,0.07)`, no border, label white Medium 13.
- **Default (primary):** accent fill `#534AB7`, label white. Use one per dialog, for the main action.
- **Destructive:** use a red label (`#FF4245`) on a bordered button, or a red fill if it's the dialog's main action.
- **Borderless:** text only. It gets a bezel (Fill 3) on hover.
- **Pressed:** add about 5% more white fill. **Disabled:** 50% opacity.

### Switches (on/off settings)
Use a switch for any setting that is simply on or off, like the w/LQ toggle.
- Off track: `rgba(255,255,255,0.10)`. On track: accent `#534AB7`.
- Knob: a **pill**, not a circle. It's `rgba(255,255,255,0.85)` with a soft shadow, 32 × 20 inside a 54 × 24 track (2px inset).
- Put the label next to the switch. Clicking the label toggles it too.

### Text fields
- Background: the window background. Border: `1px rgba(255,255,255,0.04)`. Radius: 6 (Regular).
- Focus: an accent ring, 3.5px at 50% opacity, plus a 1px solid accent border.
- Value text: white, Medium 13. Placeholder: Label 3.
- Disabled: 50% opacity.

### Segmented controls
Use one to pick between 2–5 options, like highlight: None / Yellow / Red. Regular height is 24px with radius 6, and the selected segment is filled with the accent.

### Pop-up buttons (dropdowns)
Height 24px, radius 6, bordered-button fill, with a chevron on the right.

## Surfaces

| Surface | Radius | Notes |
|---|---|---|
| Window | 16 | Set by macOS |
| Popover | 20 | `#1A1A1A`, large soft shadow |
| Alert / confirm dialog | ~16 | 260px wide, 16px margins. Title Bold 13, description Regular 13, two 28px buttons side by side |
| Cards / panels inside screens | 10–12 | Fill 2 on the window background |
| Table cells | 0–6 | Separator borders, Fill 3 hover |

## Spacing
Use a **4px grid**: 4, 8, 12, 16, 20, 24. Dialog and panel margins are 16px, which is what the kit's alerts use. Put 8px between related controls and 16–24px between groups.

## Implementation notes
- Styles are currently inline objects in each screen, with hard-coded hex values; for example `#2a2a2a` appears about 120 times. As part of the refresh, move these values into one shared file (for example `src/theme.js`) and import them. Then a future color change is one edit, not a hunt through every screen.
- The kit's cursor SVGs don't need to be used. macOS supplies cursors, so use CSS `cursor` values.
