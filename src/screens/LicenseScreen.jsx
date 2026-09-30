import React, { useState, useEffect } from 'react';
import { activateLicense, validateLicense, setCachedLicense } from '../license';

const { ipcRenderer } = window.require('electron');

export default function LicenseScreen({ onActivated }) {
    const [logoSrc, setLogoSrc] = useState('');
  
  useEffect(() => {
    const result = ipcRenderer.sendSync('get-app-icon');
    if (result) setLogoSrc(result);
  }, []);
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!email.trim() || !licenseKey.trim()) {
      setError('Please enter both your email and license key.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await activateLicense(licenseKey.trim().toUpperCase(), email.trim());
    if (result && result.success) {
      const validation = await validateLicense(licenseKey.trim().toUpperCase());
      if (validation && validation.valid) {
        setCachedLicense({ valid: true, license_key: licenseKey.trim().toUpperCase(), email: email.trim(), plan: result.plan, status: result.status });
        onActivated();
        return;
      }
    }
    setError(result ? (result.reason || 'Invalid license key. Please check and try again.') : 'Could not connect to license server. Please check your internet connection.');
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1E1E1E', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={logoSrc} style={{ width: '120px', height: '120px', borderRadius: '24px', marginBottom: '16px' }} />
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Professional followspot tracking</div>
        </div>
        <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', marginBottom: '6px' }}>Activate your license</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '24px' }}>Enter your email and license key to get started.</div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFFFFF', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>License key</label>
            <input value={licenseKey} onChange={e => setLicenseKey(e.target.value)} placeholder="SP-XXXX-XXXX-XXXX-XXXX"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFFFFF', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '1px' }}
              onKeyDown={e => e.key === 'Enter' && handleActivate()} />
          </div>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,69,58,0.12)', border: '1px solid rgba(255,69,58,0.35)', borderRadius: '8px', color: '#FF453A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
          )}
          <button onClick={handleActivate} disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Activating...' : 'Activate SpotPlot'}
          </button>
        </div>
      </div>
    </div>
  );
}