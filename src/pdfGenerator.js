const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function actionIconSVG(action, size = 28) {
  const s = size;
  const icons = {
    'Pick Up': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#3B6D11"/><polygon points="16,14 22,26 10,26" fill="#639922" opacity="0.5"/></svg>`,
    'Fade Up': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#3B6D11"/></svg>`,
    'Fade Down': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>`,
    'Fade Out': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#A32D2D"/><polygon points="16,18 22,6 10,6" fill="#E24B4A" opacity="0.5"/></svg>`,
    'Fade In Place': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A32D2D" stroke-width="2"/><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>`,
    'Bump Up': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="3" rx="1.5" fill="#3B6D11"/><rect x="10" y="15" width="12" height="3" rx="1.5" fill="#3B6D11" opacity="0.6"/><rect x="12" y="20" width="8" height="3" rx="1.5" fill="#3B6D11" opacity="0.3"/></svg>`,
    'Bump Out': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="8" y="19" width="16" height="3" rx="1.5" fill="#A32D2D"/><rect x="10" y="14" width="12" height="3" rx="1.5" fill="#A32D2D" opacity="0.6"/><rect x="12" y="9" width="8" height="3" rx="1.5" fill="#A32D2D" opacity="0.3"/></svg>`,
    'Swap To': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><path d="M10 10 C10 6 22 6 22 10 L22 16 C22 20 16 24 16 24 C16 24 10 20 10 16 Z" fill="none" stroke="#185FA5" stroke-width="2"/><path d="M20 20 L26 24 L22 26 L20 20Z" fill="#185FA5"/></svg>`,
    'Slide To': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#185FA5" stroke-width="2.5" stroke-linecap="round"/><polygon points="22,10 30,16 22,22" fill="#185FA5"/><polygon points="10,10 2,16 10,22" fill="#185FA5"/></svg>`,
    'Stay With': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="#E6F1FB" stroke="#185FA5" stroke-width="1.5"/><circle cx="12" cy="16" r="3" fill="#185FA5"/><circle cx="20" cy="16" r="3" fill="#185FA5"/></svg>`,
    'Iris In': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" stroke-width="2" stroke-linecap="round"/><polygon points="10,12 6,16 10,20" fill="#534AB7"/><polygon points="22,12 26,16 22,20" fill="#534AB7"/></svg>`,
    'Iris Out': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" stroke-width="2" stroke-linecap="round"/><polygon points="6,12 10,16 6,20" fill="#534AB7"/><polygon points="26,12 22,16 26,20" fill="#534AB7"/></svg>`,
    'Iris/Fade Up': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><polygon points="16,4 22,14 10,14" fill="#3B6D11"/></svg>`,
    'Iris/Fade Down': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>`,
    'Iris/Fade Out': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="9" y1="16" x2="23" y2="16" stroke="#A32D2D" stroke-width="2"/><polygon points="11,12 7,16 11,20" fill="#A32D2D"/><polygon points="21,12 25,16 21,20" fill="#A32D2D"/></svg>`,
    'Up & Out': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#3B6D11"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>`,
    'Bump Color': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" stroke-width="1.5"/><rect x="12" y="11" width="3" height="10" fill="#639922"/><rect x="16" y="11" width="3" height="10" fill="#E24B4A"/></svg>`,
    'Roll Color': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" stroke-width="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#E24B4A"/><rect x="12.5" y="8" width="3.5" height="16" fill="#EF9F27"/><rect x="16" y="8" width="3.5" height="16" fill="#639922"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#185FA5"/></svg>`,
    'Ballyhoo': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><path d="M8 16 C8 10 12 6 16 6 C20 6 24 10 24 16 C24 22 20 26 16 26 C12 26 8 22 8 16 Z" fill="none" stroke="#D85A30" stroke-width="2.5"/><path d="M16 6 C16 6 20 16 16 26" fill="none" stroke="#D85A30" stroke-width="2"/><path d="M16 6 C16 6 12 16 16 26" fill="none" stroke="#D85A30" stroke-width="2"/></svg>`,
    'Off': `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#999" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#999" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  };
  return icons[action] || `<svg width="${s}" height="${s}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#ccc"/></svg>`;
}

function buildSpotSheetHTML({ show, spot, colorSlots, cues, spotCues, characters, scenes, label, numSpots, hideOff, hideTracked, rangeStart, rangeEnd }) {
  const isLandscape = numSpots > 2;
  let logoHTML = '<div class="header-logo-placeholder">LOGO</div>';
  if (show.logo_path) {
    try {
      const logoData = fs.readFileSync(show.logo_path);
      const ext = show.logo_path.split('.').pop().toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
      const base64 = logoData.toString('base64');
      logoHTML = `<img src="data:${mimeType};base64,${base64}" style="width:64px;height:64px;object-fit:contain;border-radius:8px;flex-shrink:0;align-self:center;" />`;
    } catch(e) {
      console.error('Could not load logo:', e);
    }
  }
  const sceneMap = {};
  scenes.forEach(s => { sceneMap[s.id] = s; });
  const charMap = {};
  characters.forEach(c => { charMap[c.id] = c; });

  let sortedCues = [...cues].sort((a, b) => a.sort_order - b.sort_order);

  if (rangeStart !== null && rangeStart !== undefined) {
    sortedCues = sortedCues.filter(c => c.track_number >= rangeStart);
  }
  if (rangeEnd !== null && rangeEnd !== undefined) {
    sortedCues = sortedCues.filter(c => c.track_number <= rangeEnd);
  }
  if (hideOff) {
    sortedCues = sortedCues.filter(c => {
      const sc = spotCues.find(sc => sc.cue_id === c.id && sc.spot_id === spot.id);
      return sc && sc.action !== 'Off' && sc.action !== '';
    });
  }

  if (hideTracked) {
    sortedCues = sortedCues.filter(c => {
      const sc = spotCues.find(sc => sc.cue_id === c.id && sc.spot_id === spot.id);
      return sc && sc.action && sc.action !== '';
    });
  }

  const gelFramesHTML = colorSlots.filter(s => !s.is_permanent).map(slot => `
    <div class="gel-slot">
      <span class="gel-num">${slot.gel_number || '—'}</span>
      <span class="gel-name">${slot.gel_name || 'Empty'}</span>
      <span class="gel-label">F${slot.slot_number}</span>
    </div>
  `).join('');

  const permSlot = colorSlots.find(s => s.is_permanent);
  const permHTML = permSlot && permSlot.gel_number ? `
    <div class="gel-slot perm">
      <span class="gel-num">${permSlot.gel_number}</span>
      <span class="gel-name">${permSlot.gel_name || ''}</span>
      <span class="gel-label">PERM</span>
    </div>
  ` : '';

  let rowsHTML = '';
  let currentSceneId = 'NONE';

  for (const cue of sortedCues) {
    const sc = spotCues.find(sc => sc.cue_id === cue.id && sc.spot_id === spot.id);
    if (!sc) continue;

    if (cue.scene_id !== currentSceneId) {
      currentSceneId = cue.scene_id;
      const scene = sceneMap[cue.scene_id];
      if (scene) {
        rowsHTML += `
          <tr class="scene-row">
            <td colspan="9">${scene.label}${scene.song ? ' · ' + scene.song : ''}</td>
          </tr>
        `;
      }
    }

    const char = charMap[sc.character_id];
    const activeFrames = sc.active_frames ? sc.active_frames.split(',').filter(Boolean).join(' + ') : '';
    const isOff = sc.action === 'Off';

    rowsHTML += `
      <tr class="${isOff ? 'off-row' : ''}">
        <td class="lq-cell">${cue.lq_number || '—'}</td>
        <td class="action-cell">
          ${sc.action ? `
            <div class="action-inner">
              ${actionIconSVG(sc.action, 34)}
              <span class="action-name">${sc.action}</span>
            </div>
          ` : '<span class="empty">—</span>'}
        </td>
        <td class="char-cell">${char ? char.name : (isOff ? '' : '—')}</td>
       <td class="int-cell">${sc.intensity || '—'}</td>
        <td class="iris-cell">${sc.frame_size || '—'}</td>
        <td class="frames-cell">${activeFrames || '—'}</td>
        <td class="time-cell">${sc.fade_time ? sc.fade_time + 's' : '—'}</td>
        <td class="when-cell">${sc.description || ''}</td>
        <td class="notes-cell">${sc.notes || ''}</td>
      </tr>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
  
  @page {
    size: ${isLandscape ? '11in 8.5in' : '8.5in 11in'};
    margin: 0.45in 0.4in 0.4in 0.4in;
  }

  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12pt;
    color: #1a1a1a;
    background: white;
  }

  .header {
    display: flex;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 2.5px solid #1a1a1a;
  }

  .header-logo-placeholder {
    width: 64px;
    height: 64px;
    background: #f0f0f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8pt;
    color: #999;
    flex-shrink: 0;
    align-self: center;
  }

  .header-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .show-title {
    font-size: 22pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .header-team {
    font-size: 8.5pt;
    color: #555;
    line-height: 1.5;
  }

  .spot-card {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #f5f5f5;
    border: 1.5px solid #ddd;
    border-radius: 8px;
    padding: 6px 12px;
    margin-top: 2px;
  }

  .spot-number {
    font-size: 16pt;
    font-weight: 800;
    color: #1a1a1a;
    padding-right: 10px;
    border-right: 1.5px solid #ccc;
  }

  .spot-details {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .spot-operator {
    font-size: 11pt;
    font-weight: 700;
    color: #1a1a1a;
  }

  .spot-meta {
    font-size: 8pt;
    color: #666;
  }

  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .print-label {
    font-size: 14pt;
    font-weight: 800;
    color: #1a1a1a;
  }

  .print-date {
    font-size: 8.5pt;
    color: #888;
  }

  .gel-frames {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .gel-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 3px 7px;
    min-width: 46px;
  }

  .gel-slot.perm {
    background: #fffbe6;
    border-color: #f0c040;
  }

  .gel-label {
    font-size: 7pt;
    color: #888;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .gel-num {
    font-size: 9.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }

  .gel-name {
    font-size: 7pt;
    color: #555;
    text-align: center;
    white-space: nowrap;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12pt;
  }

  thead th {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #555;
    padding: 5px 7px;
    border-bottom: 1.5px solid #1a1a1a;
    text-align: left;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 0.75px solid #e0e0e0;
  }

  tbody tr:nth-child(even) {
    background: #fafafa;
  }

  tbody td {
    padding: 8px 7px;
    vertical-align: middle;
    line-height: 1.3;
  }

  .scene-row td {
    background: #1a1a1a;
    color: white;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 10px;
  }

  .off-row td {
    background: #f2f2f2;
    color: #bbb;
  }

  .off-row .action-inner {
    opacity: 0.35;
  }

  .lq-cell {
    font-size: 16pt;
    font-weight: 800;
    color: #1a1a1a;
    width: 56px;
    white-space: nowrap;
  }

  .action-cell {
    width: 130px;
  }

  .action-inner {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .action-name {
    font-size: 11pt;
    font-weight: 700;
    color: #1a1a1a;
  }

  .char-cell {
    font-size: 13pt;
    font-weight: 800;
    color: #1a1a1a;
    width: 120px;
  }

  .iris-cell {
    font-size: 10pt;
    color: #333;
    width: 90px;
  }

  .int-cell {
    font-size: 11pt;
    font-weight: 700;
    width: 52px;
    color: #1a1a1a;
  }

  .frames-cell {
    font-size: 10pt;
    color: #333;
    width: 72px;
  }

  .time-cell {
    font-size: 11pt;
    font-weight: 700;
    width: 44px;
    color: #1a1a1a;
  }

  .when-cell {
    font-size: 10pt;
    color: #333;
    width: 110px;
  }

  .notes-cell {
    font-size: 10pt;
    color: #555;
    font-style: italic;
  }

  .empty { color: #ccc; }
</style>
</head>
<body>
<div class="header">
${logoHTML}
<div class="header-main">
      <div class="show-title">${show.title}</div>
      <div class="header-team">
        ${[
          show.designer ? `LD: ${show.designer}` : '',
          show.associate_ld ? `Assoc: ${show.associate_ld}` : '',
          show.assistant_ld ? `Asst: ${show.assistant_ld}` : '',
        ].filter(Boolean).join(' &nbsp;·&nbsp; ')}
      </div>
      <div class="spot-card">
        <div class="spot-number">SPOT ${spot.spot_number}</div>
        <div class="spot-details">
          <div class="spot-operator">${spot.operator_name || 'Operator TBD'}</div>
          <div class="spot-meta">${[spot.location, spot.fixture_type].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div>
        <div class="print-label">${label || 'Spot Sheet'}</div>
        <div class="print-date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div class="gel-frames">
        ${gelFramesHTML}
        ${permHTML}
      </div>
    </div>
  </div>

  <table>
    <thead>
<tr>
        <th>LQ</th>
        <th>Action</th>
        <th>Character</th>
        <th>Int</th>
        <th>Iris</th>
        <th>Color</th>
        <th>Time</th>
        <th>When</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
</body>
</html>`;
}

async function generateSpotSheetPDF({ show, spot, colorSlots, cues, spotCues, characters, scenes, label, numSpots, outputPath, hideOff, hideTracked, rangeStart, rangeEnd }) {
  const html = buildSpotSheetHTML({ show, spot, colorSlots, cues, spotCues, characters, scenes, label, numSpots, hideOff, hideTracked, rangeStart, rangeEnd });
  const isLandscape = numSpots > 2;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    width: isLandscape ? '11in' : '8.5in',
    height: isLandscape ? '8.5in' : '11in',
    printBackground: true,
    margin: { top: '0.5in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
  });
  await browser.close();
  return outputPath;
}
function buildCallerSheetHTML({ show, spots, colorSlotsBySpot, cues, spotCuesBySpot, characters, scenes, label }) {
  const isLandscape = spots.length > 2;
  const sceneMap = {};
  scenes.forEach(s => { sceneMap[s.id] = s; });
  const charMap = {};
  characters.forEach(c => { charMap[c.id] = c; });

  const sortedCues = [...cues].sort((a, b) => a.sort_order - b.sort_order);

  const spotsHeaderHTML = spots.map(spot => {
    const slots = (colorSlotsBySpot[spot.id] || []).filter(s => !s.is_permanent);
    const gelHTML = slots.map(slot => `
      <div class="gel-slot">
        <span class="gel-label">F${slot.slot_number}</span>
        <span class="gel-num">${slot.gel_number || '—'}</span>
        <span class="gel-name">${slot.gel_name || 'Empty'}</span>
      </div>
    `).join('');
    return `
      <div class="spot-header-card">
        <div class="spot-header-top">
          <span class="spot-number">SPOT ${spot.spot_number}</span>
          <span class="spot-operator">${spot.operator_name || 'TBD'}</span>
        </div>
        <div class="spot-meta">${[spot.location, spot.fixture_type].filter(Boolean).join(' · ')}</div>
        <div class="gel-frames">${gelHTML}</div>
      </div>
    `;
  }).join('');

  const colSpan = spots.length;

  let rowsHTML = '';
  let currentSceneId = 'NONE';

  for (const cue of sortedCues) {
    if (cue.scene_id !== currentSceneId) {
      currentSceneId = cue.scene_id;
      const scene = sceneMap[cue.scene_id];
      if (scene) {
        rowsHTML += `
          <tr class="scene-row">
            <td colspan="${colSpan + 1}">${scene.label}${scene.song ? ' · ' + scene.song : ''}</td>
          </tr>
        `;
      }
    }

    let spotCellsHTML = '';
    for (const spot of spots) {
      const spotCues = spotCuesBySpot[spot.id] || [];
      const sc = spotCues.find(sc => sc.cue_id === cue.id);
      const isOff = !sc || sc.action === 'Off' || sc.action === '';
      const char = sc ? charMap[sc.character_id] : null;
      const activeFrames = sc && sc.active_frames ? sc.active_frames.split(',').filter(Boolean).join('+') : '';

      if (isOff) {
        spotCellsHTML += `
          <td class="spot-cell off-cell">
            <div class="action-inner off-action">
              ${actionIconSVG('Off', 20)}
              <span class="action-name off-text">Off</span>
            </div>
          </td>
        `;
      } else {
        spotCellsHTML += `
          <td class="spot-cell">
            <div class="cell-top">
              <div class="action-char">
                <div class="action-inner">
                  ${actionIconSVG(sc.action, 22)}
                  <span class="action-name">${sc.action || '—'}</span>
                </div>
                <div class="char-name">${char ? char.name : '—'}</div>
              </div>
              <div class="intensity-badge">${sc.intensity || ''}</div>
            </div>
            <div class="cue-details">
              ${sc.frame_size ? `<span class="detail-badge iris">${sc.frame_size}</span>` : ''}
              ${activeFrames ? `<span class="detail-badge color">${activeFrames}</span>` : ''}
              ${sc.fade_time ? `<span class="detail-badge time">${sc.fade_time}s</span>` : ''}
            </div>
            ${sc.description ? `<div class="when-text">${sc.description}</div>` : ''}
            ${sc.notes ? `<div class="notes-text">${sc.notes}</div>` : ''}
          </td>
        `;
      }
    }

    rowsHTML += `
      <tr class="cue-row">
        <td class="lq-cell">${cue.lq_number || '—'}</td>
        ${spotCellsHTML}
      </tr>
    `;
  }

  const spotColHeaders = spots.map(spot => `
    <th class="spot-col-header" style="width:calc((100% - 48px) / ${spots.length})">SPOT ${spot.spot_number} · ${spot.operator_name || 'TBD'}</th>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: ${isLandscape ? '11in 8.5in' : '8.5in 11in'};
    margin: 0.4in 0.35in 0.35in 0.35in;
  }

  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    font-size: 10pt;
    color: #1a1a1a;
    background: white;
  }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 2.5px solid #1a1a1a;
  }

  .header-logo-placeholder {
    width: 56px;
    height: 56px;
    background: #f0f0f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7pt;
    color: #999;
    flex-shrink: 0;
  }

  .header-main { flex: 1; }

  .show-title {
    font-size: 20pt;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 3px;
  }

  .header-team {
    font-size: 8pt;
    color: #555;
    margin-bottom: 8px;
  }

  .spots-header-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .spot-header-card {
    flex: 1;
    background: #f5f5f5;
    border: 1.5px solid #ddd;
    border-radius: 8px;
    padding: 6px 10px;
    min-width: 120px;
  }

  .spot-header-top {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 2px;
  }

  .spot-number {
    font-size: 11pt;
    font-weight: 800;
    color: #1a1a1a;
  }

  .spot-operator {
    font-size: 10pt;
    font-weight: 600;
    color: #333;
  }

  .spot-meta {
    font-size: 7.5pt;
    color: #777;
    margin-bottom: 4px;
  }

  .gel-frames {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }

  .gel-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border: 0.75px solid #ddd;
    border-radius: 3px;
    padding: 2px 4px;
    min-width: 32px;
  }

  .gel-label {
    font-size: 6pt;
    color: #aaa;
    font-weight: 700;
    text-transform: uppercase;
  }

  .gel-num {
    font-size: 7.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }

  .gel-name {
    font-size: 6pt;
    color: #777;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    max-width: 44px;
    text-overflow: ellipsis;
  }

  .header-right {
    text-align: right;
    flex-shrink: 0;
  }

  .print-label {
    font-size: 13pt;
    font-weight: 800;
    color: #1a1a1a;
  }

  .print-date {
    font-size: 8pt;
    color: #888;
    margin-top: 2px;
  }

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    table-layout: fixed;
  }

  .cell-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 3px;
  }

  .action-char { flex: 1; }

  .intensity-badge {
    font-size: 13pt;
    font-weight: 800;
    color: #1a1a1a;
    white-space: nowrap;
    padding-left: 4px;
  }

  .notes-text {
    font-size: 8pt;
    color: #888;
    font-style: italic;
  }

  thead th {
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #555;
    padding: 4px 6px;
    border-bottom: 1.5px solid #1a1a1a;
    text-align: left;
  }

  .spot-col-header {
    color: #1a1a1a;
    font-size: 8pt;
    font-weight: 800;
    border-left: 2px solid #ddd;
    padding-left: 8px;
  }

  tbody tr {
    border-bottom: 0.75px solid #e0e0e0;
  }

  tbody tr:nth-child(even) { background: #fafafa; }

  .lq-cell {
    font-size: 15pt;
    font-weight: 800;
    color: #1a1a1a;
    width: 48px;
    padding: 6px;
    vertical-align: top;
  }

  .spot-cell {
    padding: 6px 8px;
    vertical-align: top;
    border-left: 2px solid #eee;
  }

  .off-cell {
    background: #f5f5f5;
    vertical-align: middle;
  }

  .action-inner {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 2px;
  }

  .off-action { opacity: 0.35; }

  .action-name {
    font-size: 10pt;
    font-weight: 700;
    color: #1a1a1a;
  }

  .off-text { color: #999; }

  .char-name {
    font-size: 12pt;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 3px;
  }

  .cue-details {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-bottom: 2px;
  }

  .detail-badge {
    font-size: 8pt;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    background: #f0f0f0;
    color: #333;
  }

  .detail-badge.iris { background: #e8f0fb; color: #1a4a8a; }
  .detail-badge.color { background: #f0e8fb; color: #4a1a8a; }
  .detail-badge.time { background: #f0fbe8; color: #1a4a1a; }

  .when-text {
    font-size: 8pt;
    color: #666;
    font-style: italic;
  }

  .scene-row td {
    background: #1a1a1a;
    color: white;
    font-size: 8.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 8px;
  }
  .lq-col { width: 48px; }
  .spot-col { width: calc((100% - 48px) / VAR_SPOT_COUNT); }
</style>
</head>
<body>
  <div class="header">
    <div class="header-logo-placeholder">LOGO</div>
    <div class="header-main">
      <div class="show-title">${show.title}</div>
      <div class="header-team">
        ${[
          show.designer ? `LD: ${show.designer}` : '',
          show.associate_ld ? `Assoc: ${show.associate_ld}` : '',
          show.assistant_ld ? `Asst: ${show.assistant_ld}` : '',
        ].filter(Boolean).join(' &nbsp;·&nbsp; ')}
      </div>
      <div class="spots-header-row">
        ${spotsHeaderHTML}
      </div>
    </div>
    <div class="header-right">
      <div class="print-label">${label || 'Caller Sheet'}</div>
      <div class="print-date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:48px">LQ</th>
        ${spotColHeaders}
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
</body>
</html>`;
}

async function generateCallerSheetPDF({ show, spots, colorSlotsBySpot, cues, spotCuesBySpot, characters, scenes, label, outputPath }) {
  const isLandscape = spots.length > 2;
  const html = buildCallerSheetHTML({ show, spots, colorSlotsBySpot, cues, spotCuesBySpot, characters, scenes, label });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    width: isLandscape ? '11in' : '8.5in',
    height: isLandscape ? '8.5in' : '11in',
    printBackground: true,
    margin: { top: '0.4in', right: '0.35in', bottom: '0.35in', left: '0.35in' },
  });
  await browser.close();
  return outputPath;
}
function buildColorLoadHTML({ show, spots, colorSlotsBySpot, label }) {
  const isLandscape = spots.length > 2;

  const GEL_COLORS = {
    'R01': '#F5DFA0', 'R02': '#F0C060', 'R03': '#F5E090', 'R04': '#EDB84A',
    'R05': '#F0A030', 'R06': '#F5EAA0', 'R07': '#FAEEC0', 'R08': '#F5D878',
    'R09': '#F0C050', 'R10': '#F5E060', 'R16': '#F5C84A', 'R17': '#F5A030',
    'R18': '#F08020', 'R19': '#E06010', 'R20': '#E09030', 'R21': '#E8A020',
    'R22': '#D07010', 'R23': '#E07010', 'R24': '#D03020', 'R25': '#E05020',
    'R26': '#D04030', 'R27': '#C02020', 'R28': '#C01010', 'R33': '#F5D0C0',
    'R34': '#F0C0A0', 'R35': '#F0C8B8', 'R36': '#F0A8A0', 'R37': '#F0C0C8',
    'R38': '#F0A0B0', 'R39': '#E890A0', 'R40': '#E870A0', 'R45': '#D05070',
    'R46': '#C03070', 'R51': '#C0A0D0', 'R52': '#D0C0E0', 'R53': '#E0D0F0',
    'R54': '#C8A8E0', 'R55': '#B890D0', 'R56': '#A870C0', 'R57': '#9060B0',
    'R58': '#7050A0', 'R59': '#503080', 'R60': '#C0D0F0', 'R61': '#B0C8E8',
    'R62': '#90B0E0', 'R63': '#A0C0E8', 'R64': '#80A8D8', 'R65': '#6090C8',
    'R66': '#5080C0', 'R67': '#7098C0', 'R68': '#4878B0', 'R69': '#3060A0',
    'R70': '#408090', 'R71': '#307080', 'R72': '#206070', 'R73': '#305070',
    'R74': '#203060', 'R75': '#182850', 'R79': '#2040A0', 'R80': '#1030C0',
    'R83': '#2040B0', 'R85': '#102080', 'R88': '#90C070', 'R89': '#708050',
    'R91': '#208030', 'R92': '#308080', 'R93': '#206050', 'R94': '#206030',
    'R96': '#90C020', 'R97': '#C0C0B8', 'R98': '#A0A098', 'R99': '#704030',
    'R100': '#F0F0F0', 'R101': '#F8F8F8',
    'L001': '#FAEEC0', 'L002': '#F5D890', 'L003': '#F5E090', 'L004': '#EDB84A',
    'L035': '#F0C8B8', 'L036': '#F0A8A0', 'L045': '#D05070', 'L046': '#C03070',
    'L051': '#C0A0D0', 'L063': '#A0C0E8', 'L065': '#6090C8', 'L079': '#3060A0',
    'L080': '#1030C0', 'L088': '#90C070', 'L091': '#208030', 'L092': '#308080',
    'L094': '#206030', 'L100': '#F0F0F0', 'L101': '#F8F8F8',
    'L109': '#C09060', 'L119': '#102080', 'L120': '#102060', 'L129': '#E8E8E8',
    'L131': '#204060', 'L134': '#E8A020', 'L147': '#F0B878', 'L148': '#E870A0',
    'L149': '#D03020', 'L150': '#B0D0F0', 'L156': '#704030', 'L157': '#E890A0',
    'L158': '#D06010', 'L160': '#7088B0', 'L161': '#6080A8', 'L162': '#F0C060',
    'L164': '#D04020', 'L165': '#5888B8', 'L170': '#7050A0', 'L172': '#3070A0',
    'L176': '#E8A840', 'L179': '#E07820', 'L180': '#8060A0', 'L181': '#101850',
    'L182': '#D04030', 'L183': '#3060A8', 'L193': '#E0A878', 'L194': '#F090B0',
    'L195': '#2050A0', 'L196': '#2048A0', 'L199': '#1828A0', 'L200': '#6090D0',
    'L201': '#4070C0', 'L202': '#6090C8', 'L204': '#E09030', 'L205': '#E8B060',
  };

  const getGelColor = (gelNum) => {
    if (!gelNum) return '#e0e0e0';
    const key = gelNum.toUpperCase().replace(/\s/g, '');
    return GEL_COLORS[key] || '#d0d0d0';
  };

  const isDark = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
  };

  const spotsHTML = spots.map(spot => {
    const slots = colorSlotsBySpot[spot.id] || [];
    const regularSlots = slots.filter(s => !s.is_permanent);
    const permSlot = slots.find(s => s.is_permanent);

    const framesHTML = regularSlots.map(slot => {
      const bgColor = getGelColor(slot.gel_number);
      const textColor = isDark(bgColor) ? '#ffffff' : '#1a1a1a';
      const subColor = isDark(bgColor) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
      return `
        <div class="frame-card" style="background:${bgColor};">
          <div class="frame-label" style="color:${subColor};">Frame ${slot.slot_number}</div>
          <div class="frame-gel-num" style="color:${textColor};">${slot.gel_number || '—'}</div>
          <div class="frame-gel-name" style="color:${subColor};">${slot.gel_name || 'Empty'}</div>
          <div class="frame-check" style="border-color:${isDark(bgColor) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}"></div>
        </div>
      `;
    }).join('');

    const permHTML = permSlot && permSlot.gel_number ? (() => {
      const bgColor = getGelColor(permSlot.gel_number);
      const textColor = isDark(bgColor) ? '#ffffff' : '#1a1a1a';
      const subColor = isDark(bgColor) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
      return `
        <div class="perm-card" style="background:${bgColor};">
          <div class="frame-label" style="color:${subColor};">Permanent</div>
          <div class="frame-gel-num" style="color:${textColor};">${permSlot.gel_number}</div>
          <div class="frame-gel-name" style="color:${subColor};">${permSlot.gel_name || ''}</div>
          <div class="frame-check" style="border-color:${isDark(bgColor) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}"></div>
        </div>
      `;
    })() : '';

    return `
      <div class="spot-card">
        <div class="spot-header">
          <div class="spot-left">
            <span class="spot-number">SPOT ${spot.spot_number}</span>
            <span class="spot-operator">${spot.operator_name || 'TBD'}</span>
          </div>
          <div class="spot-right">
            <div class="spot-detail">${spot.location || ''}</div>
            <div class="spot-detail">${spot.fixture_type || ''}</div>
          </div>
        </div>
        <div class="frames-grid">
          ${framesHTML}
          ${permHTML}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: ${isLandscape ? '11in 8.5in' : '8.5in 11in'}; margin: 0.45in 0.4in 0.4in 0.4in; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: white; }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2.5px solid #1a1a1a;
  }
  .header-logo-placeholder {
    width: 60px; height: 60px; background: #f0f0f0;
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 8pt; color: #999; flex-shrink: 0;
  }
  .header-main { flex: 1; }
  .show-title { font-size: 22pt; font-weight: 800; letter-spacing: -0.5px; line-height: 1; margin-bottom: 4px; }
  .header-team { font-size: 8.5pt; color: #555; margin-bottom: 2px; }
  .header-right { text-align: right; flex-shrink: 0; }
  .print-label { font-size: 14pt; font-weight: 800; color: #1a1a1a; }
  .print-sub { font-size: 8.5pt; color: #888; margin-top: 2px; }

  .spots-grid {
    display: grid;
    grid-template-columns: ${spots.length === 1 ? '1fr' : spots.length === 2 ? '1fr 1fr' : 'repeat(2, 1fr)'};
    gap: 16px;
  }

  .spot-card { border: 1.5px solid #ddd; border-radius: 10px; overflow: hidden; }

  .spot-header {
    display: flex; align-items: center; justify-content: space-between;
    background: #1a1a1a; color: white; padding: 10px 14px;
  }
  .spot-left { display: flex; align-items: baseline; gap: 8px; }
  .spot-number { font-size: 14pt; font-weight: 800; color: white; }
  .spot-operator { font-size: 11pt; font-weight: 600; color: #ccc; }
  .spot-right { text-align: right; }
  .spot-detail { font-size: 8pt; color: #aaa; line-height: 1.4; }

  .frames-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }

  .frame-card, .perm-card {
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-right: 1px solid rgba(0,0,0,0.08);
    border-bottom: 1px solid rgba(0,0,0,0.08);
    min-height: 90px;
    justify-content: space-between;
  }

  .perm-card {
    border: 2px solid rgba(0,0,0,0.15);
    position: relative;
  }

  .frame-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .frame-gel-num { font-size: 14pt; font-weight: 800; line-height: 1; }
  .frame-gel-name { font-size: 8pt; line-height: 1.3; }
  .frame-check {
    width: 16px; height: 16px;
    border: 1.5px solid;
    border-radius: 3px;
    margin-top: 4px;
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-logo-placeholder">LOGO</div>
    <div class="header-main">
      <div class="show-title">${show.title}</div>
      <div class="header-team">${[show.designer ? 'LD: ' + show.designer : '', show.associate_ld ? 'Assoc: ' + show.associate_ld : '', show.assistant_ld ? 'Asst: ' + show.assistant_ld : ''].filter(Boolean).join(' · ')}</div>
    </div>
    <div class="header-right">
      <div class="print-label">${label || 'Color Load'}</div>
      <div class="print-sub">All Spots Color Load</div>
      <div class="print-sub">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
  </div>
  <div class="spots-grid">
    ${spotsHTML}
  </div>
</body>
</html>`;
}

async function generateColorLoadPDF({ show, spots, colorSlotsBySpot, label, outputPath }) {
  const html = buildColorLoadHTML({ show, spots, colorSlotsBySpot, label });
  const isLandscape = spots.length > 2;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    width: isLandscape ? '11in' : '8.5in',
    height: isLandscape ? '8.5in' : '11in',
    printBackground: true,
    margin: { top: '0.5in', right: '0.4in', bottom: '0.4in', left: '0.4in' },
  });
  await browser.close();
  return outputPath;
}

module.exports = { generateSpotSheetPDF, generateCallerSheetPDF, generateColorLoadPDF };