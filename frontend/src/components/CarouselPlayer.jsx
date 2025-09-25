import React from 'react';
import {
  Box,
  Paper,
  Stack,
  IconButton,
  Typography,
  Divider
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { ANIMATIONS } from '../theme';

const CarouselPlayer = ({ 
  categories, 
  currentIndex, 
  isAutoPlaying, 
  onPrevious, 
  onNext, 
  onToggleAutoPlay,
  onSelectCategory 
}) => {
  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: -90, // 进一步调整位置，避免遮挡
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 100 // 提高z-index确保显示在最上层
    }}>
      <Paper
        elevation={0}
        sx={{
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(25px)',
          borderRadius: 30,
          px: 4,
          py: 2,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          // 添加透明效果
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: 30,
            zIndex: -1
          }
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          {/* 导航控制 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={onPrevious}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  boxShadow: '0 5px 15px rgba(255,255,255,0.2)'
                }
              }}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
            
            <IconButton
              onClick={onNext}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  boxShadow: '0 5px 15px rgba(255,255,255,0.2)'
                }
              }}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </Box>

          {/* 分类指示器 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Object.entries(categories).map(([key, category], index) => {
              const isActive = index === currentIndex;
              return (
                <Box
                  key={index}
                  onClick={() => onSelectCategory(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: isActive ? `1px solid ${category.color}60` : 'none',
                    transition: ANIMATIONS.duration.short + ' ' + ANIMATIONS.easing.smooth,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <Box sx={{ 
                    fontSize: 18, 
                    color: isActive ? category.color : 'rgba(255,255,255,0.7)',
                    filter: isActive ? `drop-shadow(0 0 8px ${category.color})` : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {category.icon}
                  </Box>
                  {isActive && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {category.name}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* 播放控制 */}
          <Divider 
            orientation="vertical" 
            sx={{ 
              height: 35, 
              bgcolor: 'rgba(255,255,255,0.3)' 
            }} 
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={onToggleAutoPlay}
              sx={{
                width: 40,
                height: 40,
                bgcolor: isAutoPlaying ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: isAutoPlaying 
                  ? '1px solid rgba(76, 175, 80, 0.4)' 
                  : '1px solid rgba(255,255,255,0.2)',
                color: isAutoPlaying ? '#4caf50' : 'rgba(255,255,255,0.8)',
                '&:hover': {
                  bgcolor: isAutoPlaying ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)',
                  boxShadow: isAutoPlaying 
                    ? '0 5px 15px rgba(76, 175, 80, 0.3)'
                    : '0 5px 15px rgba(255,255,255,0.2)'
                }
              }}
            >
              {isAutoPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
            </IconButton>
            
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                fontWeight: 500,
                minWidth: 65
              }}
            >
              {isAutoPlaying ? '自动播放' : '已暂停'}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CarouselPlayer;
