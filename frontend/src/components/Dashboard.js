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
  InputAdornment,
  CardMedia,
  Fade,
  Zoom,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { 
  Search, 
  Chat, 
  Logout, 
  ArrowBackIos, 
  ArrowForwardIos,
  DirectionsCar,
  Shield,
  Psychology
} from '@mui/icons-material';
import axios from 'axios';

// 图片导入函数
const getImagePath = (path) => {
  try {
    return require(`../${path}`);
  } catch (error) {
    console.warn(`图片加载失败: ${path}`);
    return null;
  }
};

// 图片路径配置
const IMAGES = {
  landing: {
    f1: getImagePath('Landing/F1.png'),
    marvel: getImagePath('Landing/Marvel.png')
  },
  f1: {
    teams: {
      ferrari: getImagePath('F1/Ferrari/show.png'),
      mclaren: getImagePath('F1/Mclaren/show.png'),
      mercedes: getImagePath('F1/Mercedes/show.png'),
      redbull: getImagePath('F1/Red_Bll/show.png')
    },
    drivers: {
      charles_leclerc: getImagePath('F1/Ferrari/charles_Leclerc.png'),
      lewis_hamilton: getImagePath('F1/Ferrari/Lewis_Hamilton.png'),
      lando_norris: getImagePath('F1/Mclaren/Lando_Norris.png'),
      oscar_piastri: getImagePath('F1/Mclaren/Oscar_Piastri.png'),
      george_russell: getImagePath('F1/Mercedes/George_Russell.png'),
      kimi_antonelli: getImagePath('F1/Mercedes/Kimi_Antonelli.png'),
      max_verstappen: getImagePath('F1/Red_Bll/Max_Verstappen.png'),
      yuki_tsunoda: getImagePath('F1/Red_Bll/Yuki_Tsunoda.png')
    }
  }
};

const API_BASE_URL = 'http://localhost:8000';

// 定义分类数据
const CATEGORIES = {
  f1: {
    name: 'Formula 1',
    icon: <DirectionsCar />,
    image: IMAGES.landing.f1 || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=400&fit=crop',
    description: '与F1赛车手对话',
    color: '#E10600'
  },
  marvel: {
    name: 'Marvel Heroes',
    icon: <Shield />,
    image: IMAGES.landing.marvel || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=400&fit=crop',
    description: '与超级英雄对话',
    color: '#ED1D24'
  },
  classic: {
    name: '经典角色',
    icon: <Psychology />,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    description: '与历史人物和文学角色对话',
    color: '#1976d2'
  }
};

// F1车队数据
const F1_TEAMS = {
  ferrari: {
    name: 'Scuderia Ferrari',
    image: IMAGES.f1.teams.ferrari || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    color: '#DC143C',
    drivers: [
      { name: 'Charles Leclerc', image: IMAGES.f1.drivers.charles_leclerc || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop' },
      { name: 'Lewis Hamilton', image: IMAGES.f1.drivers.lewis_hamilton || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop' }
    ]
  },
  mclaren: {
    name: 'McLaren F1 Team',
    image: IMAGES.f1.teams.mclaren || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&sat=-100&hue=30',
    color: '#FF8000',
    drivers: [
      { name: 'Lando Norris', image: IMAGES.f1.drivers.lando_norris || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop' },
      { name: 'Oscar Piastri', image: IMAGES.f1.drivers.oscar_piastri || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop' }
    ]
  },
  mercedes: {
    name: 'Mercedes-AMG F1',
    image: IMAGES.f1.teams.mercedes || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&sat=-100&hue=180',
    color: '#00D2BE',
    drivers: [
      { name: 'George Russell', image: IMAGES.f1.drivers.george_russell || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop' },
      { name: 'Kimi Antonelli', image: IMAGES.f1.drivers.kimi_antonelli || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&sat=-50' }
    ]
  },
  redbull: {
    name: 'Red Bull Racing',
    image: IMAGES.f1.teams.redbull || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&sat=100&hue=240',
    color: '#0600EF',
    drivers: [
      { name: 'Max Verstappen', image: IMAGES.f1.drivers.max_verstappen || 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=400&fit=crop' },
      { name: 'Yuki Tsunoda', image: IMAGES.f1.drivers.yuki_tsunoda || 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=300&h=400&fit=crop' }
    ]
  }
};

function Dashboard({ onLogout, onCharacterSelect }) {
  const [characters, setCharacters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('categories'); // categories, teams, drivers
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchCharacters();
    // 自动轮播
    const interval = setInterval(() => {
      if (currentView === 'categories') {
        setCarouselIndex((prev) => (prev + 1) % Object.keys(CATEGORIES).length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentView]);

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

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'f1') {
      setCurrentView('teams');
    } else {
      setCurrentView('characters');
    }
  };

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    setCurrentView('drivers');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedTeam(null);
  };

  const handleBackToTeams = () => {
    setCurrentView('teams');
    setSelectedTeam(null);
  };

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Object.keys(CATEGORIES).length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Object.keys(CATEGORIES).length) % Object.keys(CATEGORIES).length);
  };

  // 渲染分类轮播界面
  const renderCategoriesView = () => {
    const categoryKeys = Object.keys(CATEGORIES);
    
    return (
      <Box>
        {/* 文件夹式轮播展示 */}
        <Box sx={{ position: 'relative', mb: 6, height: 450, overflow: 'hidden' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            position: 'relative'
          }}>
            {categoryKeys.map((key, index) => {
              const category = CATEGORIES[key];
              const offset = index - carouselIndex;
              const isActive = index === carouselIndex;
              
              return (
                  <Paper
                  key={key}
                  elevation={isActive ? 16 : 6}
                  sx={{
                    position: 'absolute',
                    width: isActive ? 450 : 300,
                    height: isActive ? 350 : 250,
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transform: `translateX(${offset * 150}px) translateY(${Math.abs(offset) * 20}px) scale(${isActive ? 1 : 0.75}) rotateY(${offset * 15}deg)`,
                    transformStyle: 'preserve-3d',
                    zIndex: isActive ? 20 : 10 - Math.abs(offset),
                    opacity: Math.abs(offset) > 1 ? 0.3 : (isActive ? 1 : 0.7),
                    background: `linear-gradient(135deg, ${category.color}15, ${category.color}30)`,
                    border: isActive ? `3px solid ${category.color}` : `1px solid ${category.color}40`,
                    boxShadow: isActive 
                      ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${category.color}40`
                      : `0 10px 20px rgba(0,0,0,0.2)`,
                    '&:hover': {
                      transform: `translateX(${offset * 150}px) translateY(${Math.abs(offset) * 20 - 10}px) scale(${isActive ? 1.05 : 0.8}) rotateY(${offset * 15}deg)`,
                      boxShadow: isActive 
                        ? `0 30px 60px rgba(0,0,0,0.4), 0 0 0 2px ${category.color}`
                        : `0 15px 30px rgba(0,0,0,0.3)`
                    }
                  }}
                  onClick={() => {
                    if (isActive) {
                      handleCategorySelect(key);
                    } else {
                      setCarouselIndex(index);
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height={isActive ? "350" : "250"}
                    image={category.image}
                    alt={category.name}
                    sx={{ 
                      objectFit: 'cover',
                      filter: isActive ? 'none' : 'brightness(0.6) saturate(0.8)',
                      transition: 'all 0.6s ease'
                    }}
                  />
                  {isActive && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: 'white',
                      p: 3
                    }}>
                      <Typography variant="h3" component="h2" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="h6">
                        {category.description}
                      </Typography>
                    </Box>
                  )}
                  {!isActive && (
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      p: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h5">
                        {category.name}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {/* 轮播控制按钮 */}
          <IconButton
            sx={{ 
              position: 'absolute', 
              left: 16, 
              top: '50%', 
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              zIndex: 20,
              '&:hover': { bgcolor: 'white' }
            }}
            onClick={prevSlide}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            sx={{ 
              position: 'absolute', 
              right: 16, 
              top: '50%', 
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.9)',
              zIndex: 20,
              '&:hover': { bgcolor: 'white' }
            }}
            onClick={nextSlide}
          >
            <ArrowForwardIos />
          </IconButton>

          {/* 轮播指示器 */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 20
          }}>
            {categoryKeys.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === carouselIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setCarouselIndex(index)}
              />
            ))}
          </Box>
        </Box>

        {/* 分类网格 */}
        <Grid container spacing={3}>
          {Object.entries(CATEGORIES).map(([id, category], index) => (
            <Grid item xs={12} md={4} key={id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                <Card 
                  sx={{ 
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: carouselIndex === index ? `3px solid ${category.color}` : 'none',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                  onClick={() => handleCategorySelect(id)}
                >
                  <CardContent sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ fontSize: 48, color: category.color, mb: 2 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // 渲染F1车队界面
  const renderTeamsView = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBackToCategories} sx={{ mr: 2 }}>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h4">Formula 1 Teams</Typography>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(F1_TEAMS).map(([teamId, team], index) => (
          <Grid item xs={12} sm={6} md={3} key={teamId}>
            <Fade in={true} style={{ transitionDelay: `${index * 200}ms` }}>
              <Card 
                sx={{ 
                  height: 300,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  }
                }}
                onClick={() => handleTeamSelect(teamId)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={team.image}
                  alt={team.name}
                />
                <CardContent>
                  <Typography variant="h6" align="center" sx={{ color: team.color }}>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" align="center" color="text.secondary">
                    {team.drivers.length} Drivers
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // 渲染车手界面
  const renderDriversView = () => {
    const team = F1_TEAMS[selectedTeam];
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={handleBackToTeams} sx={{ mr: 2 }}>
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h4" sx={{ color: team.color }}>
            {team.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {team.drivers.map((driver, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                <Card 
                  sx={{ 
                    height: 400,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    }
                  }}
                  onClick={() => onCharacterSelect({ 
                    id: driver.name.toLowerCase().replace(' ', '_'),
                    name: driver.name,
                    avatar: '🏎️',
                    description: `${team.name} F1 Driver`,
                    skills: ['Racing Strategy', 'Team Spirit']
                  })}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={driver.image}
                    alt={driver.name}
                  />
                  <CardContent>
                    <Typography variant="h5" align="center">
                      {driver.name}
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary">
                      {team.name}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Chat />}
                      sx={{ bgcolor: team.color, '&:hover': { bgcolor: team.color + 'DD' } }}
                    >
                      开始对话
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // 渲染经典角色界面
  const renderCharactersView = () => {
    const filteredCharacters = Object.entries(characters).filter(([id, character]) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={handleBackToCategories} sx={{ mr: 2 }}>
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h4">经典角色</Typography>
        </Box>

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

        <Grid container spacing={3}>
          {filteredCharacters.map(([id, character], index) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
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
                      {character.skills.map((skill, skillIndex) => (
                        <Chip 
                          key={skillIndex} 
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
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#1a1a1a' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎭 AI角色扮演平台
          </Typography>
          <Button color="inherit" onClick={onLogout} startIcon={<Logout />}>
            退出登录
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {loading ? (
          <Typography align="center" variant="h4">加载中...</Typography>
        ) : (
          <>
            {currentView === 'categories' && renderCategoriesView()}
            {currentView === 'teams' && renderTeamsView()}
            {currentView === 'drivers' && renderDriversView()}
            {currentView === 'characters' && renderCharactersView()}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
