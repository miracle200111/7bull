import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Stack,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Logout,
  DirectionsCar,
  EmojiEvents,
  Chat,
  PlayArrow,
  Group,
  Timeline
} from '@mui/icons-material';
import { F1_TEAMS, F1_RACES_2024, GAME_MODES } from '../data/f1Data';

const F1Dashboard = ({ onLogout, onModeSelect, onTeamSelect, onRaceSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedMode, setSelectedMode] = useState(null);

  const handleModeSelect = (modeId) => {
    console.log('选择模式:', modeId);
    setSelectedMode(modeId);
    if (onModeSelect) {
      onModeSelect(modeId);
    }
  };

  const handleTeamClick = (teamId) => {
    console.log('选择车队:', teamId);
    if (onTeamSelect) {
      onTeamSelect(teamId);
    }
  };

  const handleRaceClick = (raceId) => {
    console.log('选择比赛:', raceId);
    if (onRaceSelect) {
      onRaceSelect(raceId);
    }
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      background: `
        linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #8B0000 75%, #DC143C 100%)
      `,
      position: 'relative'
    }}>
      {/* F1主题导航栏 */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'rgba(220, 20, 60, 0.95)', // F1红色主题
          backdropFilter: 'blur(20px)',
          borderBottom: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <DirectionsCar sx={{ fontSize: 32, color: 'white' }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              F1 AI Racing Experience
            </Typography>
          </Box>
          
          <Button 
            color="inherit" 
            onClick={onLogout}
            startIcon={<Logout />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)'
              }
            }}
          >
            {isMobile ? '' : '退出'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* 主内容区域 */}
      <Box sx={{ 
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 }
      }}>
        {/* 欢迎区域 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #FF4500, #DC143C, #FFD700)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '0 0 30px rgba(255,69,0,0.5)'
            }}
          >
            Formula 1 AI Experience
          </Typography>
          <Typography 
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            选择游戏模式，体验真实的F1赛车世界对话
          </Typography>
        </Box>

        {/* 游戏模式选择 */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 4,
              color: 'white',
              fontWeight: 700
            }}
          >
            选择游戏模式
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {Object.entries(GAME_MODES).map(([modeId, mode], index) => (
              <Grid item xs={12} md={4} key={modeId}>
                <Card
                  sx={{
                    height: 320,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: selectedMode === modeId 
                      ? '2px solid #DC143C' 
                      : '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      background: 'rgba(255,255,255,0.15)',
                      border: '2px solid #FF4500',
                      boxShadow: '0 20px 40px rgba(220, 20, 60, 0.3)'
                    }
                  }}
                  onClick={() => handleModeSelect(modeId)}
                >
                  <CardContent sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 4
                  }}>
                    <Box sx={{ 
                      fontSize: 64, 
                      mb: 3,
                      filter: 'drop-shadow(0 0 15px rgba(255,69,0,0.6))'
                    }}>
                      {mode.icon}
                    </Box>
                    
                    <Typography 
                      variant="h5" 
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 2
                      }}
                    >
                      {mode.name}
                    </Typography>
                    
                    <Typography 
                      variant="body1" 
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      {mode.description}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      {mode.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            m: 0.5,
                            bgcolor: 'rgba(220, 20, 60, 0.2)',
                            color: '#FF6B6B',
                            border: '1px solid rgba(220, 20, 60, 0.3)',
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      sx={{
                        bgcolor: '#DC143C',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 20px rgba(220, 20, 60, 0.4)',
                        '&:hover': {
                          bgcolor: '#B91C3C',
                          boxShadow: '0 12px 30px rgba(220, 20, 60, 0.6)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModeSelect(modeId);
                      }}
                    >
                      选择模式
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* F1车队展示 */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 4,
              color: 'white',
              fontWeight: 700
            }}
          >
            选择你的车队
          </Typography>
          
          <Grid container spacing={3}>
            {Object.entries(F1_TEAMS).map(([teamId, team], index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={teamId}>
                <Card
                  sx={{
                    height: 280,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255,255,255,0.12)',
                      border: `2px solid ${team.color}`,
                      boxShadow: `0 15px 30px rgba(0,0,0,0.3), 0 0 20px ${team.color}40`
                    }
                  }}
                  onClick={() => handleTeamClick(teamId)}
                >
                  <CardContent sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3
                  }}>
                    {/* 车队标识 */}
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${team.color}, ${team.secondaryColor})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      boxShadow: `0 8px 25px ${team.color}40`
                    }}>
                      <DirectionsCar sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      sx={{
                        color: team.color,
                        fontWeight: 700,
                        mb: 1,
                        filter: `drop-shadow(0 0 8px ${team.color}60)`
                      }}
                    >
                      {team.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2
                      }}
                    >
                      {team.country} • {team.teamPrincipal}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {team.drivers.map((driver, idx) => (
                          <Chip
                            key={idx}
                            label={`#${driver.number}`}
                            size="small"
                            sx={{
                              bgcolor: `${team.color}20`,
                              color: team.color,
                              border: `1px solid ${team.color}40`,
                              fontWeight: 600
                            }}
                          />
                        ))}
                      </Stack>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.6)',
                          display: 'block',
                          mt: 1
                        }}
                      >
                        {team.drivers.length} 位车手
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 2024赛季大奖赛 */}
        <Box>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 4,
              color: 'white',
              fontWeight: 700
            }}
          >
            2024赛季大奖赛
          </Typography>
          
          <Grid container spacing={3}>
            {Object.entries(F1_RACES_2024).map(([raceId, race], index) => (
              <Grid item xs={12} sm={6} md={4} key={raceId}>
                <Card
                  sx={{
                    height: 240,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      background: 'rgba(255,255,255,0.12)',
                      boxShadow: '0 12px 25px rgba(0,0,0,0.3)'
                    }
                  }}
                  onClick={() => handleRaceClick(raceId)}
                >
                  <CardContent sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEvents sx={{ color: '#FFD700', fontSize: 28, mr: 1 }} />
                      <Typography 
                        variant="h6" 
                        sx={{
                          color: 'white',
                          fontWeight: 700
                        }}
                      >
                        {race.name}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        mb: 2
                      }}
                    >
                      📍 {race.location}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2
                      }}
                    >
                      🏁 {race.circuit}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={`${race.laps} 圈`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,215,0,0.2)',
                            color: '#FFD700',
                            border: '1px solid rgba(255,215,0,0.3)'
                          }}
                        />
                        <Chip
                          label={race.difficulty}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(220,20,60,0.2)',
                            color: '#FF6B6B',
                            border: '1px solid rgba(220,20,60,0.3)'
                          }}
                        />
                      </Stack>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.5)'
                          }
                        }}
                      >
                        参加比赛
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default F1Dashboard;
