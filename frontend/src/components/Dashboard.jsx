import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
  Button,
  Card,
  CardContent,
  CardMedia,
  Fade,
  Zoom,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import { 
  Search, 
  Logout, 
  ArrowBackIos,
  DirectionsCar,
  Shield,
  Psychology,
  NavigateNext
} from '@mui/icons-material';
import axios from 'axios';
import { CONTAINER_SIZES, ANIMATIONS } from '../theme';
import CharacterCard from './CharacterCard.jsx';
import CarouselPlayer from './CarouselPlayer.jsx';
import CategoryCarousel from './CategoryCarousel.jsx';

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
    f1: getImagePath(' Landing/F1.png'),
    marvel: getImagePath(' Landing/Marvel.png')
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
    image: IMAGES.landing.f1 || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&auto=format&q=80',
    description: '与F1赛车手对话',
    color: '#E10600'
  },
  marvel: {
    name: 'Marvel Heroes',
    icon: <Shield />,
    image: IMAGES.landing.marvel || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=600&fit=crop&auto=format&q=80',
    description: '与超级英雄对话',
    color: '#ED1D24'
  },
  classic: {
    name: '经典角色',
    icon: <Psychology />,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&auto=format&q=80',
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [characters, setCharacters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  // 优化的自动轮播逻辑
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (currentView === 'categories' && isAutoPlaying) {
        setCarouselIndex((prev) => (prev + 1) % Object.keys(CATEGORIES).length);
      }
    }, 5000);
  }, [currentView, isAutoPlaying]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
    startAutoPlay();
    
    return () => {
      stopAutoPlay();
    };
  }, [startAutoPlay, stopAutoPlay]);

  // 图片加载错误处理
  const handleImageError = useCallback((imagePath) => {
    setImageLoadErrors(prev => new Set([...prev, imagePath]));
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

  // 主轮播界面 - 简化组件化设计
  const renderCategoriesView = () => {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 欢迎区域 */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, md: 4 },
          py: { xs: 2, md: 3 }
        }}>
          <Typography 
            variant={isMobile ? "h4" : "h2"}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            选择你的AI伙伴
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            与历史人物、F1车手和超级英雄进行深度对话
          </Typography>
        </Box>

        {/* 轮播区域 */}
        <Box sx={{ 
          position: 'relative',
          height: isMobile ? 350 : 450,
          mb: { xs: 12, md: 14 }, // 增加更多底部间距
          overflow: 'visible'
        }}
        onMouseEnter={() => {
          setIsAutoPlaying(false);
          stopAutoPlay();
        }}
        onMouseLeave={() => {
          setIsAutoPlaying(true);
          startAutoPlay();
        }}
        >
          <CategoryCarousel
            categories={CATEGORIES}
            currentIndex={carouselIndex}
            onSelectCategory={handleCategorySelect}
            onChangeIndex={(index) => {
              setCarouselIndex(index);
              stopAutoPlay();
              setTimeout(startAutoPlay, 3000);
            }}
            onPrevious={prevSlide}
            onNext={nextSlide}
            isMobile={isMobile}
          />
          
          <CarouselPlayer
            categories={CATEGORIES}
            currentIndex={carouselIndex}
            isAutoPlaying={isAutoPlaying}
            onPrevious={prevSlide}
            onNext={nextSlide}
            onToggleAutoPlay={() => {
              const newAutoPlay = !isAutoPlaying;
              setIsAutoPlaying(newAutoPlay);
              if (newAutoPlay) {
                startAutoPlay();
              } else {
                stopAutoPlay();
              }
            }}
            onSelectCategory={(index) => {
              setCarouselIndex(index);
              stopAutoPlay();
              setTimeout(startAutoPlay, 3000);
            }}
          />
        </Box>

        {/* 快捷访问网格 */}
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              mb: 4,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600
            }}
          >
            快捷访问
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {Object.entries(CATEGORIES).map(([id, category], index) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <CharacterCard
                  character={{
                    id,
                    name: category.name,
                    description: category.description,
                    avatar: category.icon,
                    skills: []
                  }}
                  onSelect={() => handleCategorySelect(id)}
                  animationDelay={index * 100}
                  variant="compact"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  };

  // F1车队界面 - 优化用户体验和搜索
  const renderTeamsView = () => {
    const filteredTeams = Object.entries(F1_TEAMS).filter(([teamId, team]) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.drivers.some(driver => driver.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 页面标题和导航 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <IconButton 
            onClick={handleBackToCategories} 
            sx={{ 
              mr: 2,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <Typography 
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #E10600, #FF4500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Formula 1 Teams
          </Typography>
        </Box>

        {/* 车队网格 */}
        <Box sx={{ flex: 1, overflow: 'auto', pb: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {filteredTeams.map(([teamId, team], index) => (
              <Grid item xs={12} sm={6} md={3} key={teamId}>
                <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card 
                    sx={{ 
                      height: CONTAINER_SIZES.teamCard.height + 100,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        background: 'rgba(255,255,255,0.15)',
                        border: `2px solid ${team.color}`,
                        boxShadow: `0 15px 30px rgba(0,0,0,0.3), 0 0 30px ${team.color}40`
                      }
                    }}
                    onClick={() => handleTeamSelect(teamId)}
                  >
                    <CardMedia
                      component="img"
                      height={CONTAINER_SIZES.teamCard.height}
                      image={team.image}
                      alt={team.name}
                      onError={() => handleImageError(team.image)}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
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
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {team.drivers.length} 位车手
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
          
          {/* 无搜索结果提示 */}
          {filteredTeams.length === 0 && searchTerm && (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8,
              color: 'rgba(255,255,255,0.6)'
            }}>
              <Search sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                没有找到匹配的车队
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                尝试搜索其他车队名称或车手
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // 车手界面 - 优化设计和搜索
  const renderDriversView = () => {
    const team = F1_TEAMS[selectedTeam];
    const filteredDrivers = team.drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 页面标题和导航 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <IconButton 
            onClick={handleBackToTeams} 
            sx={{ 
              mr: 2,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <Typography 
            variant="h4" 
            sx={{ 
              color: team.color,
              fontWeight: 700,
              filter: `drop-shadow(0 0 10px ${team.color}60)`
            }}
          >
            {team.name}
          </Typography>
        </Box>

        {/* 车手网格 */}
        <Box sx={{ flex: 1, overflow: 'auto', pb: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {filteredDrivers.map((driver, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <CharacterCard
                  character={{
                    id: driver.name.toLowerCase().replace(' ', '_'),
                    name: driver.name,
                    avatar: '🏎️',
                    description: `${team.name} F1车手`,
                    skills: ['赛车策略', '团队合作']
                  }}
                  onSelect={(char) => onCharacterSelect(char)}
                  animationDelay={index * 100}
                />
              </Grid>
            ))}
          </Grid>
          
          {/* 无搜索结果提示 */}
          {filteredDrivers.length === 0 && searchTerm && (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8,
              color: 'rgba(255,255,255,0.6)'
            }}>
              <Search sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                没有找到匹配的车手
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                尝试搜索其他车手名称
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // 经典角色界面 - 简化统一展示
  const renderCharactersView = () => {
    const filteredCharacters = Object.entries(characters).filter(([id, character]) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 页面标题 */}
        <Box sx={{ 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography 
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            经典角色
          </Typography>
        </Box>

        {/* 角色网格 - 统一展示，无分类 */}
        <Box sx={{ flex: 1, overflow: 'auto', pb: 4 }}>
          <Grid container spacing={3} justifyContent="center">
            {filteredCharacters.map(([id, character], index) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <CharacterCard
                  character={{ id, ...character }}
                  onSelect={(char) => onCharacterSelect(char)}
                  animationDelay={index * 100}
                />
              </Grid>
            ))}
          </Grid>

          {/* 无搜索结果提示 */}
          {filteredCharacters.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8,
              color: 'rgba(255,255,255,0.6)'
            }}>
              <Search sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">
                没有找到匹配的角色
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                尝试搜索其他关键词
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      background: `
        linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1e3a8a 100%)
      `,
      position: 'relative'
    }}>
      {/* 顶部导航栏 */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          {/* 面包屑导航 */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                mr: 2
              }}
            >
              AI角色扮演
            </Typography>
            
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,255,255,0.5)' }} />}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <Link 
                component="button" 
                onClick={() => setCurrentView('categories')}
                sx={{ 
                  color: currentView === 'categories' ? '#667eea' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  '&:hover': { color: '#667eea' }
                }}
              >
                主页
              </Link>
              {selectedCategory && (
                <Link 
                  component="button"
                  sx={{ 
                    color: currentView === 'teams' ? '#667eea' : 'rgba(255,255,255,0.7)',
                    textDecoration: 'none'
                  }}
                >
                  {CATEGORIES[selectedCategory]?.name}
                </Link>
              )}
              {selectedTeam && (
                <Typography sx={{ color: '#667eea' }}>
                  {F1_TEAMS[selectedTeam]?.name}
                </Typography>
              )}
            </Breadcrumbs>
          </Box>
          
          {/* 全局搜索框 */}
          <TextField
            size="small"
            placeholder={
              currentView === 'categories' ? "搜索分类..." :
              currentView === 'teams' ? "搜索车队..." :
              currentView === 'drivers' ? "搜索车手..." :
              "搜索角色..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              mr: 2,
              width: { xs: 200, md: 280 },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 25,
                height: 40,
                '& fieldset': { border: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)'
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '2px solid #667eea',
                  boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)'
                }
              },
              '& input': { 
                color: 'white',
                fontSize: '0.9rem',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.6)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            color="inherit" 
            onClick={onLogout} 
            startIcon={<Logout />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
                boxShadow: '0 0 20px rgba(255,255,255,0.2)'
              }
            }}
          >
            {isMobile ? '' : '退出登录'}
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
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <Typography 
              variant="h4"
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 3
              }}
            >
              加载中...
            </Typography>
            <Stack direction="row" spacing={1}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#667eea',
                    animation: `loadingDot 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes loadingDot': {
                      '0%, 80%, 100%': { transform: 'scale(0)' },
                      '40%': { transform: 'scale(1)' }
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
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
