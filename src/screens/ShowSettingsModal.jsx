import React, { useState } from 'react';
import useEscape from '../useEscape';
import ShowInfoPanel from './settings/ShowInfoPanel';
import SpotSettingsPanel from './settings/SpotSettingsPanel';
import SpotOrderPanel from './settings/SpotOrderPanel';
import IrisSizesPanel from './settings/IrisSizesPanel';
import CustomActionsPanel from './settings/CustomActionsPanel';
import EosControlPanel from './settings/EosControlPanel';
import IpadSyncPanel from './settings/IpadSyncPanel';
import CueSettingsPanel from './settings/CueSettingsPanel';
import CueDefaultsPanel from './settings/CueDefaultsPanel';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
const { ipcRenderer } = window.require('electron');

const SECTIONS = [
  { id: 'show-info', label: 'Show Info' },
  { id: 'spot-settings', label: 'Spot Settings' },
  { id: 'spot-order', label: 'Spot Order' },
  { id: 'cue-settings', label: 'Cue Settings' },
  { id: 'cue-defaults', label: 'Cue Defaults' },
  { id: 'iris-sizes', label: 'Iris Sizes' },
  { id: 'custom-actions', label: 'Custom Actions' },
  { id: 'eos-control', label: 'Console Connection' },
  { id: 'ipad-sync', label: 'iPad Sync' },
];

export default function ShowSettingsModal({ show, onClose, onShowUpdate, initialSection = 'show-info', focusSpotId = null }) {
  const [activeSection, setActiveSection] = useState(initialSection);
  useEscape(onClose);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', width: '820px', height: '580px', display: 'flex', overflow: 'hidden', resize: 'both', minWidth: '600px', minHeight: '400px' }}
        onClick={e => e.stopPropagation()}>

        {/* Sidebar */}
        <div data-tour="settings-sections" style={{ width: '200px', background: '#242424', borderRight: '1px solid rgba(0,0,0,0.35)', padding: '20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.40)', padding: '0 20px', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {show.title}
          </div>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ margin: '0 10px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: activeSection === s.id ? '600' : '400', color: activeSection === s.id ? '#FFFFFF' : 'rgba(255,255,255,0.72)', background: activeSection === s.id ? 'rgba(255,255,255,0.12)' : 'transparent' }}
              onMouseEnter={e => { if (activeSection !== s.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
              onMouseLeave={e => { if (activeSection !== s.id) { e.currentTarget.style.background = 'transparent'; }}}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* A panel can put its own buttons here (Spot Settings: Swap spots) */}
              <div id="settings-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} />
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeSection === 'show-info' && <ShowInfoPanel show={show} onShowUpdate={onShowUpdate} onClose={onClose} />}
            {activeSection === 'spot-settings' && <SpotSettingsPanel show={show} focusSpotId={focusSpotId} />}
            {activeSection === 'spot-order' && <SpotOrderPanel show={show} />}
            {activeSection === 'cue-settings' && <CueSettingsPanel show={show} />}
            {activeSection === 'cue-defaults' && <CueDefaultsPanel show={show} />}
            {activeSection === 'iris-sizes' && <IrisSizesPanel show={show} />}
            {activeSection === 'custom-actions' && <CustomActionsPanel show={show} />}
            {activeSection === 'eos-control' && <EosControlPanel />}
            {activeSection === 'ipad-sync' && <IpadSyncPanel show={show} />}
          </div>
        </div>
        {/* Inside the window, so clicking a tip doesn't close Show Settings; each section's tips show the first time it opens */}
        <Tips steps={TIPS.showSettings} watch={activeSection} />
      </div>
    </div>
  );
}