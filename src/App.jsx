import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import NewShowScreen from './screens/NewShowScreen';
import ShowDashboard from './screens/ShowDashboard';
import CueListScreen from './screens/CueListScreen';
import PrintScreen from './screens/PrintScreen';
import ScenesScreen from './screens/ScenesScreen';
import CharactersScreen from './screens/CharactersScreen';
import SpotSettingsScreen from './screens/SpotSettingsScreen';
import LicenseScreen from './screens/LicenseScreen';
import ExpiredScreen from './screens/ExpiredScreen';
import { getCachedLicense, isCacheValid, validateLicense, setCachedLicense } from './license';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentShow, setCurrentShow] = useState(null);
  const [licenseStatus, setLicenseStatus] = useState('checking');

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    const cached = getCachedLicense();
    
    if (isCacheValid(cached)) {
      setLicenseStatus('valid');
      validateInBackground(cached.license_key);
      return;
    }

    if (cached && cached.license_key) {
      const result = await validateLicense(cached.license_key);
      if (result && result.valid) {
        setCachedLicense({ ...cached, valid: true, cached_at: new Date().toISOString() });
        setLicenseStatus('valid');
        return;
      } else if (result && !result.valid) {
        setLicenseStatus('expired');
        return;
      } else {
        if (cached.valid) {
          setLicenseStatus('valid');
          return;
        }
      }
    }

    setLicenseStatus('unlicensed');
  };

  const validateInBackground = async (licenseKey) => {
    const result = await validateLicense(licenseKey);
    if (result && !result.valid) {
      setLicenseStatus('expired');
    } else if (result && result.valid) {
      const cached = getCachedLicense();
      setCachedLicense({ ...cached, valid: true, cached_at: new Date().toISOString() });
    }
  };

  const navigate = (dest, data) => {
    setCurrentShow(data || null);
    setScreen(dest);
  };

  if (licenseStatus === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f0f', color: '#555', fontSize: '14px' }}>
        Loading SpotPlot...
      </div>
    );
  }

  if (licenseStatus === 'unlicensed') {
    return <LicenseScreen onActivated={() => setLicenseStatus('valid')} />;
  }

  if (licenseStatus === 'expired') {
    return <ExpiredScreen onRetry={checkLicense} />;
  }

  return (
    <div style={{ height: '100vh', background: '#0f0f0f', color: '#f0f0f0', display: 'flex', flexDirection: 'column' }}>
      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'new-show' && <NewShowScreen navigate={navigate} />}
      {screen === 'show' && <ShowDashboard show={currentShow} navigate={navigate} />}
      {screen === 'cue-list' && <CueListScreen show={currentShow} navigate={navigate} />}
      {screen === 'print' && <PrintScreen show={currentShow} navigate={navigate} />}
      {screen === 'scenes' && <ScenesScreen show={currentShow} navigate={navigate} />}
      {screen === 'characters' && <CharactersScreen show={currentShow} navigate={navigate} />}
      {screen === 'spot-settings' && <SpotSettingsScreen show={currentShow} navigate={navigate} />}
    </div>
  );
}