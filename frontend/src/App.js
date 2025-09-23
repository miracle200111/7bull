import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import { theme } from './theme';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCharacter, setSelectedCharacter] = useState(null);

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

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCharacter(null);
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
          <Dashboard 
            onLogout={handleLogout}
            onCharacterSelect={handleCharacterSelect}
          />
        )}
        {currentView === 'chat' && selectedCharacter && (
          <Chat 
            character={selectedCharacter}
            onBack={handleBackToDashboard}
            token={user.token}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
