import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

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
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="lg">
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
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
