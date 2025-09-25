import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Avatar,
  Chip,
  Box,
  Fade
} from '@mui/material';
import { Chat } from '@mui/icons-material';
import { CONTAINER_SIZES, ANIMATIONS } from '../theme';

const CharacterCard = ({ 
  character, 
  onSelect, 
  animationDelay = 0,
  variant = 'default' // default, compact, featured
}) => {
  const cardHeight = variant === 'compact' ? 280 : CONTAINER_SIZES.cardLarge.height + 50;
  
  return (
    <Fade in={true} style={{ transitionDelay: `${animationDelay}ms` }}>
      <Card 
        sx={{ 
          height: cardHeight,
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          transition: ANIMATIONS.duration.medium + ' ' + ANIMATIONS.easing.smooth,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-12px)',
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(102, 126, 234, 0.6)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(102, 126, 234, 0.3)'
          },
          // 透明效果
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            transition: 'left 0.6s ease',
            zIndex: 1
          },
          '&:hover::before': {
            left: '100%'
          }
        }}
        onClick={() => onSelect(character)}
      >
        <CardContent sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          p: 3,
          pb: 1, // 减少底部padding，为按钮留空间
          position: 'relative',
          zIndex: 2
        }}>
          <Avatar 
            sx={{ 
              width: variant === 'compact' ? 50 : CONTAINER_SIZES.avatar.width, 
              height: variant === 'compact' ? 50 : CONTAINER_SIZES.avatar.height, 
              fontSize: variant === 'compact' ? '1.5rem' : '2rem', 
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {character.avatar}
          </Avatar>
          
          <Typography 
            variant={variant === 'compact' ? "body1" : "h6"}
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1,
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
            }}
          >
            {character.name}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 2,
              lineHeight: 1.5,
              fontSize: variant === 'compact' ? '0.8rem' : '0.875rem'
            }}
          >
            {character.description}
          </Typography>
          
          {variant !== 'compact' && (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              justifyContent: 'center',
              mt: 'auto',
              mb: 1
            }}>
              {character.skills.map((skill, skillIndex) => (
                <Chip 
                  key={skillIndex} 
                  label={skill} 
                  size="small" 
                  sx={{
                    bgcolor: 'rgba(102, 126, 234, 0.25)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(102, 126, 234, 0.4)',
                    fontSize: '0.7rem',
                    height: 24,
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.4)',
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
        
        {/* 固定底部按钮区域 */}
        <Box sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          p: 2,
          zIndex: 3
        }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Chat />}
            sx={{
              bgcolor: 'rgba(102, 126, 234, 0.9)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              border: '1px solid rgba(102, 126, 234, 0.3)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 1)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            开始对话
          </Button>
        </Box>
      </Card>
    </Fade>
  );
};

export default CharacterCard;
