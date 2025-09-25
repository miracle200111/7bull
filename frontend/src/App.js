import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Login from './components/Login.jsx';
import F1Dashboard from './components/F1Dashboard.jsx';
import Chat from './components/Chat.jsx';
import RaceSimulation from './components/RaceSimulation.jsx';
import { theme } from './theme';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, chat, race
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [gameMode, setGameMode] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.access_token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    setCurrentView('dashboard');
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setCurrentView('chat');
  };

  const handleTeamSelect = (teamId) => {
    console.log('App: 选择车队', teamId);
    setSelectedTeam(teamId);
    // 如果没有选择模式，默认为比赛模拟
    if (!gameMode) {
      setGameMode('race_simulation');
    }
    // 需要同时选择比赛才能进入比赛模式
    if (selectedRace) {
      setCurrentView('race');
    }
  };

  const handleRaceSelect = (raceId) => {
    console.log('App: 选择比赛', raceId);
    setSelectedRace(raceId);
    // 如果已选择车队，直接进入比赛
    if (selectedTeam) {
      setCurrentView('race');
    }
  };

  const handleModeSelect = (mode) => {
    console.log('App: 选择模式', mode);
    setGameMode(mode);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCharacter(null);
    setSelectedTeam(null);
    setSelectedRace(null);
    setGameMode(null);
  };

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        {currentView === 'dashboard' && (
          <F1Dashboard 
            onLogout={handleLogout}
            onModeSelect={handleModeSelect}
            onTeamSelect={handleTeamSelect}
            onRaceSelect={handleRaceSelect}
          />
        )}
        {currentView === 'chat' && selectedCharacter && (
          <Chat 
            character={selectedCharacter}
            onBack={handleBackToDashboard}
            token={user.token}
          />
        )}
        {currentView === 'race' && selectedTeam && selectedRace && (
          <RaceSimulation
            selectedTeam={selectedTeam}
            selectedRace={selectedRace}
            onBack={handleBackToDashboard}
            onDriverChat={handleCharacterSelect}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
