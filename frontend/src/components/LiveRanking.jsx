import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  EmojiEvents,
  Speed,
  LocalGasStation,
  Warning
} from '@mui/icons-material';

const LiveRanking = ({ 
  classification = [], 
  selectedTeamKey,
  currentLap = 0,
  totalLaps = 57,
  raceEvents = [],
  onDriverSelect 
}) => {
  const [rankingHistory, setRankingHistory] = useState([]);
  const [positionChanges, setPositionChanges] = useState({});

  // 追踪位置变化
  useEffect(() => {
    if (classification.length === 0) return;
    
    setRankingHistory(prev => {
      const newHistory = [...prev.slice(-10), classification];
      
      // 计算位置变化
      if (newHistory.length >= 2) {
        const current = newHistory[newHistory.length - 1];
        const previous = newHistory[newHistory.length - 2];
        const changes = {};
        
        current.forEach(driver => {
          const prevDriver = previous.find(p => p.id === driver.id);
          if (prevDriver) {
            const change = prevDriver.position - driver.position;
            if (change !== 0) {
              changes[driver.id] = change;
            }
          }
        });
        
        setPositionChanges(changes);
        
        // 清除旧的位置变化
        setTimeout(() => {
          setPositionChanges(prev => {
            const updated = { ...prev };
            Object.keys(changes).forEach(id => delete updated[id]);
            return updated;
          });
        }, 3000);
      }
      
      return newHistory;
    });
  }, [classification]);

  const getPositionChangeIcon = (driverId) => {
    const change = positionChanges[driverId];
    if (!change) return null;
    
    if (change > 0) {
      return (
        <Chip
          label={`+${change}`}
          size="small"
          sx={{
            bgcolor: 'rgba(76,175,80,0.3)',
            color: '#4CAF50',
            height: 20,
            fontSize: '0.7rem',
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        />
      );
    } else {
      return (
        <Chip
          label={change}
          size="small"
          sx={{
            bgcolor: 'rgba(244,67,54,0.3)',
            color: '#F44336',
            height: 20,
            fontSize: '0.7rem',
            animation: 'fadeIn 0.5s ease-in-out'
          }}
        />
      );
    }
  };

  const getDriverStatus = (driver) => {
    const recentEvents = raceEvents.slice(-5);
    const driverEvent = recentEvents.find(e => 
      e.affectedDrivers && e.affectedDrivers.includes(driver.id)
    );
    
    if (driverEvent) {
      return {
        status: driverEvent.type,
        color: driverEvent.type === 'incident' ? '#F44336' : '#FF9800'
      };
    }
    
    // 基于轮胎磨损和燃油状态
    if (driver.tyreWear > 0.8) {
      return { status: '轮胎衰减', color: '#FF9800' };
    }
    
    if (driver.fuelLevel < 0.2) {
      return { status: '燃油紧张', color: '#F44336' };
    }
    
    return { status: '正常', color: '#4CAF50' };
  };

  return (
    <Paper sx={{
      position: 'absolute',
      top: 80,
      left: 20,
      width: 320,
      height: 'calc(100vh - 140px)',
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 2,
      zIndex: 900,
      overflow: 'hidden'
    }}>
      {/* 标题栏 */}
      <Box sx={{
        p: 2,
        background: 'linear-gradient(135deg, rgba(220,20,60,0.3), rgba(255,165,0,0.3))',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
          🏆 实时排位
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            第 {currentLap} / {totalLaps} 圈
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFD700' }}>
            {classification.length} 辆车
          </Typography>
        </Box>
        
        {/* 比赛进度条 */}
        <LinearProgress
          variant="determinate"
          value={(currentLap / totalLaps) * 100}
          sx={{
            mt: 1,
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#DC143C'
            }
          }}
        />
      </Box>

      {/* 排位列表 */}
      <Box sx={{ p: 1, height: 'calc(100% - 120px)', overflow: 'auto' }}>
        {classification.map((driver, index) => {
          const isTop3 = driver.position <= 3;
          const isSelectedTeam = driver.id.includes(selectedTeamKey);
          const status = getDriverStatus(driver);
          const positionChange = getPositionChangeIcon(driver.id);
          
          return (
            <Box
              key={driver.id}
              onClick={() => onDriverSelect && onDriverSelect(driver)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                mb: 1,
                borderRadius: 2,
                background: isTop3 
                  ? 'rgba(255,215,0,0.1)' 
                  : isSelectedTeam 
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                border: isTop3 
                  ? '2px solid rgba(255,215,0,0.5)'
                  : isSelectedTeam
                    ? `2px solid ${driver.teamColor}`
                    : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(5px)'
                }
              }}
            >
              {/* 位置徽章 */}
              <Box sx={{
                minWidth: 35,
                height: 35,
                borderRadius: '50%',
                background: isTop3 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                  : `linear-gradient(135deg, ${driver.teamColor}, ${driver.teamColor}CC)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: 'white',
                boxShadow: isTop3 
                  ? '0 4px 15px rgba(255,215,0,0.5)'
                  : `0 4px 15px ${driver.teamColor}50`,
                position: 'relative'
              }}>
                {driver.position}
                {isTop3 && (
                  <EmojiEvents sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    fontSize: 16,
                    color: '#FFD700'
                  }} />
                )}
              </Box>

              {/* 车手信息 */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    fontWeight: isSelectedTeam ? 700 : 600,
                    fontSize: '0.9rem'
                  }}>
                    #{driver.number || index + 1} {driver.name?.split(' ').pop() || `Driver ${index + 1}`}
                  </Typography>
                  {positionChange}
                </Box>
                
                <Typography variant="caption" sx={{ 
                  color: driver.teamColor,
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}>
                  {driver.teamName}
                </Typography>
                
                {/* 状态指示器 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: status.color
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.7rem'
                  }}>
                    {status.status} • L{driver.lap || 0}
                  </Typography>
                </Box>
              </Box>

              {/* 时间差和状态 */}
              <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ 
                    color: driver.position === 1 ? '#FFD700' : 'rgba(255,255,255,0.9)',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    {driver.position === 1 ? 'LEADER' : `+${driver.gapSeconds?.toFixed(2) || '0.00'}s`}
                  </Typography>
                  {driver.inPit && (
                    <Chip
                      label="PIT"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,165,0,0.4)',
                        color: '#FFA500',
                        height: 16,
                        fontSize: '0.6rem',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
                
                {/* 轮胎状态 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Box sx={{
                    width: 12,
                    height: 6,
                    borderRadius: 1,
                    bgcolor: driver.currentTyre === 'soft' ? '#FF0000' : 
                             driver.currentTyre === 'medium' ? '#FFFF00' : '#FFFFFF',
                    border: driver.currentTyre === 'hard' ? '1px solid #666' : 'none'
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem'
                  }}>
                    {Math.round((1 - (driver.tyreWear || 0)) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* 最近事件 */}
        {raceEvents.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              mb: 1,
              fontWeight: 600
            }}>
              📢 比赛事件
            </Typography>
            {raceEvents.slice(-3).map((event) => (
              <Box
                key={event.id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  background: event.type === 'safety_car' 
                    ? 'rgba(244,67,54,0.1)' 
                    : 'rgba(255,193,7,0.1)',
                  border: event.type === 'safety_car'
                    ? '1px solid rgba(244,67,54,0.3)'
                    : '1px solid rgba(255,193,7,0.3)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ 
                    fontSize: 16, 
                    color: event.type === 'safety_car' ? '#F44336' : '#FFC107' 
                  }} />
                  <Typography variant="caption" sx={{ 
                    color: 'white',
                    fontSize: '0.75rem'
                  }}>
                    L{event.lap}: {event.message}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LiveRanking;
