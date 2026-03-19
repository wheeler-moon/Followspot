import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import NewShowScreen from './screens/NewShowScreen';
import ShowDashboard from './screens/ShowDashboard';
import CueListScreen from './screens/CueListScreen';
import PrintScreen from './screens/PrintScreen';
import ScenesScreen from './screens/ScenesScreen';
import CharactersScreen from './screens/CharactersScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentShow, setCurrentShow] = useState(null);

  const navigate = (dest, data) => {
    setCurrentShow(data || null);
    setScreen(dest);
  };

  return (
    <div style={{ height: '100vh', background: '#0f0f0f', color: '#f0f0f0', display: 'flex', flexDirection: 'column' }}>
      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'new-show' && <NewShowScreen navigate={navigate} />}
      {screen === 'show' && <ShowDashboard show={currentShow} navigate={navigate} />}
      {screen === 'cue-list' && <CueListScreen show={currentShow} navigate={navigate} />}
      {screen === 'print' && <PrintScreen show={currentShow} navigate={navigate} />}
      {screen === 'scenes' && <ScenesScreen show={currentShow} navigate={navigate} />}
      {screen === 'characters' && <CharactersScreen show={currentShow} navigate={navigate} />}
    </div>
  );
}