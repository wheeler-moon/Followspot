import React, { useState, useEffect, useRef } from 'react';
import { activateLicense, validateLicense, setCachedLicense } from '../license';
import WelcomeScreen, { shouldWelcome } from '../components/WelcomeScreen';

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
  // The first activation on this Mac turns into the welcome: the icon moves from where it is (welcomeFrom)
  const logoRef = useRef();
  const [welcomeFrom, setWelcomeFrom] = useState(null);

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
        // The name comes from the license (given when it was bought); change it later in Settings
        setCachedLicense({ valid: true, license_key: licenseKey.trim().toUpperCase(), ...(validation.name ? { name: validation.name } : {}), email: email.trim(), plan: result.plan, status: result.status });
        if (shouldWelcome() && logoRef.current) {
          const r = logoRef.current.getBoundingClientRect();
          setWelcomeFrom({ left: r.left, top: r.top, width: r.width, height: r.height });
          return;
        }
        onActivated();
        return;
      }
    }
    setError(result ? (result.reason || 'Invalid license key. Please check and try again.') : 'Could not connect to license server. Please check your internet connection.');
    setLoading(false);
  };

  // Everything but the icon fades away while the welcome begins
  const fadeAway = { transition: 'opacity 0.6s ease', opacity: welcomeFrom ? 0 : 1, pointerEvents: welcomeFrom ? 'none' : undefined };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1E1E1E', padding: '40px' }}>
      {welcomeFrom && <WelcomeScreen iconSrc={logoSrc} from={welcomeFrom} onDone={onActivated} />}
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img ref={logoRef} src={logoSrc} style={{ width: '120px', height: '120px', borderRadius: '24px', marginBottom: '16px', visibility: welcomeFrom ? 'hidden' : 'visible' }} />
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', ...fadeAway }}>Professional followspot tracking</div>
        </div>
        <div style={{ ...fadeAway, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', marginBottom: '6px' }}>Sign in to SpotPlot</div>
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
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}