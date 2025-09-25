import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  Container
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Login({ onLogin }) {
  const [tabValue, setTabValue] = useState(0);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, loginData);
      onLogin(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/register`, registerData);
      // 注册成功后自动登录
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        username: registerData.username,
        password: registerData.password
      });
      onLogin(loginResponse.data);
    } catch (error) {
      setError(error.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1e3a8a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)
        `,
        animation: 'backgroundFloat 8s ease-in-out infinite',
        '@keyframes backgroundFloat': {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(180deg)' }
        }
      }} />
      
      <Container maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%', 
            maxWidth: 450,
            mx: 'auto',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="登录" />
              <Tab label="注册" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography 
              variant="h3" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              AI角色扮演
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                mb: 4,
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 400
              }}
            >
              与历史人物、F1车手和超级英雄对话
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="用户名"
                margin="normal"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="密码"
                type="password"
                margin="normal"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h4" align="center" gutterBottom>
              创建账户
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              加入AI角色扮演世界
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="用户名"
                margin="normal"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="邮箱"
                type="email"
                margin="normal"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="密码"
                type="password"
                margin="normal"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
