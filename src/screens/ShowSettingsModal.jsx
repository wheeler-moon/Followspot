import React, { useState } from 'react';
import ShowInfoPanel from './settings/ShowInfoPanel';
import SpotSettingsPanel from './settings/SpotSettingsPanel';
import SpotOrderPanel from './settings/SpotOrderPanel';
import IrisSizesPanel from './settings/IrisSizesPanel';
import CustomActionsPanel from './settings/CustomActionsPanel';
const { ipcRenderer } = window.require('electron');

const SECTIONS = [
  { id: 'show-info', label: 'Show Info' },
  { id: 'spot-settings', label: 'Spot Settings' },
  { id: 'spot-order', label: 'Spot Order' },
  { id: 'iris-sizes', label: 'Iris Sizes' },
  { id: 'custom-actions', label: 'Custom Actions' },
];

export default function ShowSettingsModal({ show, onClose, onShowUpdate }) {
  const [activeSection, setActiveSection] = useState('show-info');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', width: '820px', height: '580px', display: 'flex', overflow: 'hidden', resize: 'both', minWidth: '600px', minHeight: '400px' }}
        onClick={e => e.stopPropagation()}>

        {/* Sidebar */}
        <div style={{ width: '190px', background: '#111', borderRight: '1px solid #2a2a2a', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 18px', marginBottom: '16px' }}>
            {show.title}
          </div>
          {SECTIONS.map(s => (
            <div key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: activeSection === s.id ? '600' : '400', color: activeSection === s.id ? '#f0f0f0' : '#666', background: activeSection === s.id ? 'rgba(83,74,183,0.15)' : 'transparent', borderLeft: `3px solid ${activeSection === s.id ? '#534AB7' : 'transparent'}`, transition: 'all 0.1s' }}
              onMouseEnter={e => { if (activeSection !== s.id) { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
              onMouseLeave={e => { if (activeSection !== s.id) { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'transparent'; }}}>
              {s.label}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f0f0f0' }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </div>
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#555', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeSection === 'show-info' && <ShowInfoPanel show={show} onShowUpdate={onShowUpdate} onClose={onClose} />}
            {activeSection === 'spot-settings' && <SpotSettingsPanel show={show} />}
            {activeSection === 'spot-order' && <SpotOrderPanel show={show} />}
            {activeSection === 'iris-sizes' && <IrisSizesPanel show={show} />}
            {activeSection === 'custom-actions' && <CustomActionsPanel show={show} />}
          </div>
        </div>
      </div>
    </div>
  );
}