import React from 'react';

// The action symbols, drawn the same everywhere in the app (cue list, Custom Actions, Spot Notes).
// The printed sheets draw their own copies in pdfGenerator.js, and the iPad in ActionIcon.swift.
export default function ActionIcon({ action, size = 20 }) {
  const s = size;
  switch (action) {
    case 'Pick Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#30D158"/><polygon points="16,14 22,26 10,26" fill="#6BD58A" opacity="0.5"/></svg>;
    case 'Increase': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#30D158"/></svg>;
    case 'Decrease': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#FF453A"/><polygon points="16,18 22,6 10,6" fill="#FF6961" opacity="0.5"/></svg>;
    case 'Fade In Place': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#FF453A" strokeWidth="2"/><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Bump Up': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="5" y="4" width="22" height="5" rx="1.5" fill="#30D158"/><polygon points="16,11 25,22 19.5,22 19.5,28 12.5,28 12.5,22 7,22" fill="#30D158"/></svg>;
    case 'Bump Out': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="5" y="23" width="22" height="5" rx="1.5" fill="#FF453A"/><polygon points="16,21 25,10 19.5,10 19.5,4 12.5,4 12.5,10 7,10" fill="#FF453A"/></svg>;
    case 'Swap To': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="8" cy="23" r="3.5" fill="#64D2FF" opacity="0.4"/><circle cx="24" cy="23" r="3.5" fill="#64D2FF"/><path d="M9 17 Q16 4 22.5 14.5" fill="none" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><polygon points="19.5,14.5 25,17.5 24.5,11.5" fill="#64D2FF"/></svg>;
    case 'Slide To': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#64D2FF" strokeWidth="2.5" strokeLinecap="round"/><polygon points="22,10 30,16 22,22" fill="#64D2FF"/><polygon points="10,10 2,16 10,22" fill="#64D2FF"/></svg>;
    case 'Stay With': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="#64D2FF" strokeWidth="2.25"/><circle cx="16" cy="16" r="3" fill="#64D2FF"/><line x1="16" y1="3" x2="16" y2="6.5" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="16" y1="25.5" x2="16" y2="29" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="3" y1="16" x2="6.5" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="25.5" y1="16" x2="29" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/></svg>;
    case 'Iris In': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="11" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12.5 14.5,16 10,19.5" fill="#A066D3"/><line x1="24" y1="16" x2="21" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="22,12.5 17.5,16 22,19.5" fill="#A066D3"/></svg>;
    case 'Iris Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12 6,16 10,20" fill="#A066D3"/><polygon points="22,12 26,16 22,20" fill="#A066D3"/></svg>;
    case 'Iris/Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,4 22,14 10,14" fill="#30D158"/></svg>;
    case 'Iris/Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Iris/Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="9" y1="16" x2="11.5" y2="16" stroke="#FF453A" strokeWidth="2" strokeLinecap="round"/><polygon points="10.5,12.5 14.5,16 10.5,19.5" fill="#FF453A"/><line x1="23" y1="16" x2="20.5" y2="16" stroke="#FF453A" strokeWidth="2" strokeLinecap="round"/><polygon points="21.5,12.5 17.5,16 21.5,19.5" fill="#FF453A"/></svg>;
    case 'Up & Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#30D158"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Dump & Restore': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="10,4 22,4 16,14" fill="#FF453A"/><polygon points="16,18 22,28 10,28" fill="#30D158"/></svg>;
    case 'Bump Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="12" y="11" width="3" height="10" fill="#6BD58A"/><rect x="16" y="11" width="3" height="10" fill="#FF6961"/></svg>;
    case 'Roll Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#FF6961"/><rect x="12.5" y="8" width="3.5" height="16" fill="#FFB340"/><rect x="16" y="8" width="3.5" height="16" fill="#6BD58A"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#64D2FF"/></svg>;
    case 'Ballyhoo': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="10.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/><circle cx="21.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/></svg>;
    // Plain colored circles: extra icons for custom actions (Show Settings → Custom Actions)
    case 'Green Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#30D158"/></svg>;
    case 'Red Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FF453A"/></svg>;
    case 'Yellow Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FFD60A"/></svg>;
    case 'Blue Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#64D2FF"/></svg>;
    case 'Purple Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#A066D3"/></svg>;
    case 'Off': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/></svg>;
    case 'Tracked': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><polygon points="20,10 26,16 20,22" fill="#555"/></svg>;
    // A custom action with no image: an empty space the icon's size, so names still line up
    default: return <svg width={s} height={s} viewBox="0 0 32 32" aria-hidden="true" />;
  }
}

// A cue's action icon, including custom actions (their chosen symbol or their own image)
export function CueActionIcon({ action, customActions, size = 20 }) {
  const custom = (customActions || []).find(a => a.name === action);
  if (custom?.builtinIcon) return <ActionIcon action={custom.builtinIcon} size={size} />;
  if (custom?.icon) {
    try {
      const fs = window.require('fs');
      const d = fs.readFileSync(custom.icon);
      const ext = custom.icon.split('.').pop().toLowerCase();
      return <img src={`data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${d.toString('base64')}`} style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }} />;
    } catch (e) {}
  }
  return <ActionIcon action={action} size={size} />;
}
