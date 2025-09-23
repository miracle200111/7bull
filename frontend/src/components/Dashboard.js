import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Divider,
  Container,
  Stack,
  Skeleton,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  Search, 
  Chat, 
  Logout, 
  ArrowBackIos, 
  ArrowForwardIos,
  DirectionsCar,
  Shield,
  Psychology,
  PlayArrow,
  Pause,
  Home,
  NavigateNext
} from '@mui/icons-material';
import axios from 'axios';
import { CONTAINER_SIZES, ANIMATIONS } from '../theme';

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

  // 主轮播界面 - 用户友好设计
  const renderCategoriesView = () => {
    const categoryKeys = Object.keys(CATEGORIES);
    
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

        {/* 主轮播区域 */}
        <Box sx={{ 
          position: 'relative',
          height: isMobile ? 300 : 400,
          mb: { xs: 3, md: 4 },
          overflow: 'hidden',
          borderRadius: 3
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
          {/* 轮播容器 */}
          <Box sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {categoryKeys.map((key, index) => {
              const category = CATEGORIES[key];
              const offset = index - carouselIndex;
              const isActive = index === carouselIndex;
              
              // 统一容器尺寸
              const cardWidth = isMobile ? 280 : (isActive ? 450 : 320);
              const cardHeight = isMobile ? 200 : (isActive ? 350 : 250);
              
              return (
                <Card
                  key={key}
                  sx={{
                    position: 'absolute',
                    width: cardWidth,
                    height: cardHeight,
                    cursor: 'pointer',
                    transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
                    transform: isMobile 
                      ? `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.8})`
                      : `
                          translateX(${offset * 150}px) 
                          translateY(${Math.abs(offset) * 20}px)
                          scale(${isActive ? 1 : 0.75})
                          rotateY(${offset * 15}deg)
                        `,
                    zIndex: isActive ? 20 : 10 - Math.abs(offset),
                    opacity: Math.abs(offset) > 1 ? 0.3 : (isActive ? 1 : 0.6),
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: isActive 
                      ? `2px solid ${category.color}` 
                      : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isActive 
                      ? `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${category.color}40`
                      : '0 10px 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: isMobile 
                        ? `translateX(${offset * 100}%) scale(${isActive ? 1.05 : 0.85})`
                        : `
                            translateX(${offset * 150}px) 
                            translateY(${Math.abs(offset) * 20 - 10}px)
                            scale(${isActive ? 1.05 : 0.8})
                            rotateY(${offset * 15}deg)
                          `,
                      boxShadow: `0 25px 50px rgba(0,0,0,0.4), 0 0 40px ${category.color}50`
                    }
                  }}
                  onClick={() => {
                    if (isActive) {
                      handleCategorySelect(key);
                    } else {
                      setCarouselIndex(index);
                      stopAutoPlay();
                      setTimeout(startAutoPlay, 3000);
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="100%"
                    image={category.image}
                    alt={category.name}
                    onError={() => handleImageError(category.image)}
                    sx={{ 
                      objectFit: 'cover',
                      filter: isActive 
                        ? 'brightness(1.1) contrast(1.1)' 
                        : 'brightness(0.7) blur(1px)',
                      transition: ANIMATIONS.duration.medium + ' ease'
                    }}
                  />
                  
                  {/* 内容覆盖层 */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: isActive ? 3 : 2,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    color: 'white'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: isActive ? 2 : 1 }}>
                      <Box sx={{ 
                        fontSize: isActive ? 40 : 28, 
                        color: category.color,
                        filter: `drop-shadow(0 0 8px ${category.color})`
                      }}>
                        {category.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant={isActive ? "h4" : "h6"}
                          sx={{
                            fontWeight: 700,
                            background: `linear-gradient(45deg, white, ${category.color})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {category.name}
                        </Typography>
                        {isActive && (
                          <Typography 
                            variant="body1"
                            sx={{ opacity: 0.9, mt: 0.5 }}
                          >
                            {category.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {isActive && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Chat />}
                        sx={{
                          bgcolor: category.color,
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: 2,
                          boxShadow: `0 8px 20px ${category.color}40`,
                          '&:hover': {
                            bgcolor: category.color,
                            boxShadow: `0 12px 30px ${category.color}60`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        立即体验
                      </Button>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>

          {/* 简洁的导航控制 */}
          {!isMobile && (
            <>
              <IconButton
                onClick={prevSlide}
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 30,
                  width: 50,
                  height: 50,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-50%) scale(1.1)'
                  }
                }}
              >
                <ArrowBackIos />
              </IconButton>
              
              <IconButton
                onClick={nextSlide}
                sx={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 30,
                  width: 50,
                  height: 50,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-50%) scale(1.1)'
                  }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
            </>
          )}

          {/* 底部指示器 */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 30
          }}>
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(15px)',
                borderRadius: 20,
                px: 2,
                py: 1,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {categoryKeys.map((key, index) => {
                  const category = CATEGORIES[key];
                  const isActiveDot = index === carouselIndex;
                  return (
                    <Box
                      key={index}
                      onClick={() => {
                        setCarouselIndex(index);
                        stopAutoPlay();
                        setTimeout(startAutoPlay, 3000);
                      }}
                      sx={{
                        width: isActiveDot ? 32 : 12,
                        height: 12,
                        borderRadius: 6,
                        bgcolor: isActiveDot ? category.color : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: ANIMATIONS.duration.short + ' ' + ANIMATIONS.easing.smooth,
                        '&:hover': {
                          bgcolor: isActiveDot ? category.color : 'rgba(255,255,255,0.6)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  );
                })}
                
                {/* 自动播放控制 */}
                <Divider orientation="vertical" sx={{ height: 20, mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsAutoPlaying(!isAutoPlaying);
                    if (!isAutoPlaying) {
                      startAutoPlay();
                    } else {
                      stopAutoPlay();
                    }
                  }}
                  sx={{
                    color: isAutoPlaying ? '#4caf50' : 'rgba(255,255,255,0.6)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {isAutoPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                </IconButton>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* 快捷访问网格 */}
        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              mb: 3,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600
            }}
          >
            快捷访问
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {Object.entries(CATEGORIES).map(([id, category], index) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card
                    sx={{ 
                      height: CONTAINER_SIZES.cardLarge.height,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        background: 'rgba(255,255,255,0.15)',
                        border: `2px solid ${category.color}80`,
                        boxShadow: `0 15px 30px rgba(0,0,0,0.3), 0 0 30px ${category.color}30`
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
                      textAlign: 'center',
                      p: 3
                    }}>
                      <Box sx={{ 
                        fontSize: 48, 
                        color: category.color,
                        mb: 2,
                        filter: `drop-shadow(0 0 10px ${category.color}60)`
                      }}>
                        {category.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          color: 'white',
                          fontWeight: 600
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.5
                        }}
                      >
                        {category.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  };

  // F1车队界面 - 优化用户体验
  const renderTeamsView = () => (
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
      <Grid container spacing={3} sx={{ flex: 1 }}>
        {Object.entries(F1_TEAMS).map(([teamId, team], index) => (
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
    </Box>
  );

  // 车手界面 - 优化设计
  const renderDriversView = () => {
    const team = F1_TEAMS[selectedTeam];
    
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
        <Grid container spacing={3} sx={{ flex: 1 }} justifyContent="center">
          {team.drivers.map((driver, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Zoom in={true} style={{ transitionDelay: `${index * 150}ms` }}>
                <Card 
                  sx={{ 
                    height: CONTAINER_SIZES.driverCard.height,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      background: 'rgba(255,255,255,0.15)',
                      border: `2px solid ${team.color}`,
                      boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 40px ${team.color}40`
                    }
                  }}
                  onClick={() => onCharacterSelect({ 
                    id: driver.name.toLowerCase().replace(' ', '_'),
                    name: driver.name,
                    avatar: '🏎️',
                    description: `${team.name} F1车手`,
                    skills: ['赛车策略', '团队合作']
                  })}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={driver.image}
                    alt={driver.name}
                    onError={() => handleImageError(driver.image)}
                    sx={{ 
                      objectFit: 'cover',
                      transition: ANIMATIONS.duration.short + ' ease'
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 0.5
                      }}
                    >
                      {driver.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: team.color,
                        fontWeight: 500
                      }}
                    >
                      {team.name}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Chat />}
                      sx={{ 
                        bgcolor: team.color,
                        fontWeight: 600,
                        py: 1,
                        boxShadow: `0 6px 15px ${team.color}40`,
                        '&:hover': { 
                          bgcolor: team.color,
                          boxShadow: `0 8px 20px ${team.color}60`,
                          transform: 'translateY(-2px)'
                        }
                      }}
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

  // 经典角色界面 - 优化设计
  const renderCharactersView = () => {
    const filteredCharacters = Object.entries(characters).filter(([id, character]) =>
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* 角色网格 */}
        <Grid container spacing={3} sx={{ flex: 1 }} justifyContent="center">
          {filteredCharacters.map(([id, character], index) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    height: CONTAINER_SIZES.cardLarge.height + 50,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      background: 'rgba(255,255,255,0.15)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                    }
                  }}
                  onClick={() => onCharacterSelect({ id, ...character })}
                >
                  <CardContent sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3
                  }}>
                    <Avatar 
                      sx={{ 
                        width: CONTAINER_SIZES.avatar.width, 
                        height: CONTAINER_SIZES.avatar.height, 
                        fontSize: '2rem', 
                        mb: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {character.avatar}
                    </Avatar>
                    
                    <Typography 
                      variant="h6" 
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {character.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2,
                        lineHeight: 1.5
                      }}
                    >
                      {character.description}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      justifyContent: 'center',
                      mt: 'auto'
                    }}>
                      {character.skills.map((skill, skillIndex) => (
                        <Chip 
                          key={skillIndex} 
                          label={skill} 
                          size="small" 
                          sx={{
                            bgcolor: 'rgba(102, 126, 234, 0.2)',
                            color: '#667eea',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            '&:hover': {
                              bgcolor: 'rgba(102, 126, 234, 0.3)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Chat />}
                      sx={{
                        bgcolor: '#667eea',
                        fontWeight: 600,
                        py: 1.5,
                        boxShadow: '0 6px 15px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          bgcolor: '#667eea',
                          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.6)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      开始对话
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {filteredCharacters.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            mt: 4,
            color: 'rgba(255,255,255,0.6)'
          }}>
            <Typography variant="h6">
              没有找到匹配的角色
            </Typography>
          </Box>
        )}
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
          
          {/* 搜索框 */}
          {currentView === 'characters' && (
            <TextField
              size="small"
              placeholder="搜索角色..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                mr: 2,
                width: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)'
                  }
                },
                '& input': { color: 'white' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          
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
