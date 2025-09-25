import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import {
  Chat,
  ArrowBackIos,
  ArrowForwardIos
} from '@mui/icons-material';
import { ANIMATIONS } from '../theme';

const CategoryCarousel = ({ 
  categories, 
  currentIndex, 
  onSelectCategory,
  onChangeIndex,
  onPrevious,
  onNext,
  isMobile 
}) => {
  const categoryKeys = Object.keys(categories);

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {categoryKeys.map((key, index) => {
        const category = categories[key];
        const offset = index - currentIndex;
        const isActive = index === currentIndex;
        
        // 统一容器尺寸，避免遮挡
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
              transition: ANIMATIONS.duration.long + ' ' + ANIMATIONS.easing.smooth,
              transform: isMobile 
                ? `translateX(${offset * 100}%) scale(${isActive ? 1 : 0.8})`
                : `
                    translateX(${offset * 160}px) 
                    translateY(${Math.abs(offset) * 25}px)
                    scale(${isActive ? 1 : 0.75})
                    rotateY(${offset * 20}deg)
                  `,
              zIndex: isActive ? 20 : 10 - Math.abs(offset),
              opacity: Math.abs(offset) > 1 ? 0.2 : (isActive ? 1 : 0.5),
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(25px)',
              border: isActive 
                ? `2px solid ${category.color}` 
                : '1px solid rgba(255,255,255,0.25)',
              boxShadow: isActive 
                ? `0 25px 50px rgba(0,0,0,0.4), 0 0 40px ${category.color}30`
                : '0 15px 30px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              '&:hover': {
                transform: isMobile 
                  ? `translateX(${offset * 100}%) scale(${isActive ? 1.05 : 0.85})`
                  : `
                      translateX(${offset * 160}px) 
                      translateY(${Math.abs(offset) * 25 - 10}px)
                      scale(${isActive ? 1.05 : 0.8})
                      rotateY(${offset * 20}deg)
                    `,
                boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 50px ${category.color}40`
              }
            }}
            onClick={() => {
              if (isActive) {
                onSelectCategory(key);
              } else {
                onChangeIndex(index);
              }
            }}
          >
            <CardMedia
              component="img"
              height="100%"
              image={category.image}
              alt={category.name}
              sx={{ 
                objectFit: 'cover',
                filter: isActive 
                  ? 'brightness(1.2) contrast(1.1) saturate(1.2)' 
                  : 'brightness(0.7) saturate(0.8)',
                transition: ANIMATIONS.duration.long + ' ease'
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
                  filter: `drop-shadow(0 0 10px ${category.color}80)`
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

      {/* 导航控制按钮 */}
      {!isMobile && (
        <>
          <IconButton
            onClick={onPrevious}
            sx={{
              position: 'absolute',
              left: -80,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: 50,
              height: 50,
              bgcolor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
              }
            }}
          >
            <ArrowBackIos />
          </IconButton>
          
          <IconButton
            onClick={onNext}
            sx={{
              position: 'absolute',
              right: -80,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: 50,
              height: 50,
              bgcolor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-50%) scale(1.1)',
                boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
              }
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default CategoryCarousel;
