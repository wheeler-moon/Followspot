import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import NewShowScreen from './screens/NewShowScreen';

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
    </div>
  );
}