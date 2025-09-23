import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, Chat, Logout } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function Dashboard({ onLogout, onCharacterSelect }) {
  const [characters, setCharacters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/characters`);
      setCharacters(response.data);
    } catch (error) {
      console.error('获取角色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharacters = Object.entries(characters).filter(([id, character]) =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI角色扮演平台
          </Typography>
          <Button color="inherit" onClick={onLogout} startIcon={<Logout />}>
            退出登录
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          选择你的AI伙伴
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          与历史人物、文学角色和虚拟人物进行深度对话
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="搜索角色..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Typography align="center">加载中...</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredCharacters.map(([id, character]) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, fontSize: '2rem', mr: 2 }}>
                        {character.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {character.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {character.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {character.skills.map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Chat />}
                      onClick={() => onCharacterSelect({ id, ...character })}
                    >
                      开始对话
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {filteredCharacters.length === 0 && !loading && (
          <Typography align="center" color="text.secondary">
            没有找到匹配的角色
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
