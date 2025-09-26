import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Avatar,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Send,
  Flag,
  Speed,
  LocalGasStation,
  Engineering
} from '@mui/icons-material';
import { F1_TEAMS, F1_RACES_2024, RACE_PHASES } from '../data/f1Data';
import PathTrack from './PathTrack.jsx';
import StrategyPrep from './StrategyPrep.jsx';

const F1RaceSimulator = ({
  selectedTeam,
  selectedRace,
  onBack,
  onDriverChat
}) => {
  // 核心比赛状态
  const [racePhase, setRacePhase] = useState('strategy_prep'); // strategy_prep -> formation -> start -> race
  const [raceProgress, setRaceProgress] = useState(0);
  const [currentLap, setCurrentLap] = useState(0);
  const [isRaceActive, setIsRaceActive] = useState(false);
  
  // 策略和车辆数据
  const [gridOrder, setGridOrder] = useState([]);
  const [strategyByCarId, setStrategyByCarId] = useState({});
  const [liveRanking, setLiveRanking] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  
  // UI状态
  const [selectedDriverForChat, setSelectedDriverForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // 比赛事件
  const [raceEvents, setRaceEvents] = useState([]);
  const [raceFlag, setRaceFlag] = useState('green');
  const [eventAlert, setEventAlert] = useState(null);

  // 定时向后端请求LLM策略与无线电，驱动更真实叙事与动态策略
  useEffect(() => {
    if (!isRaceActive || racePhase === 'formation') return;
    const timer = setInterval(async () => {
      try {
        const payload = {
          context: {},
          currentLap,
          weather: weatherData,
          classification: liveRanking,
          phase: racePhase
        };
        const res = await fetch('http://localhost:8000/api/race/llm_strategy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          // 应用策略调整（如paceMultiplier）
          if (Array.isArray(data.strategyUpdates)) {
            setStrategyByCarId(prev => {
              const next = { ...prev };
              data.strategyUpdates.forEach(upd => {
                if (upd.carId && upd.paceMultiplier) {
                  const existed = next[upd.carId] || {};
                  next[upd.carId] = {
                    ...existed,
                    paceK: (existed.paceK || 1.0) * upd.paceMultiplier
                  };
                }
              });
              return next;
            });
          }
          // 车队无线电作为事件显示
          if (Array.isArray(data.teamRadio) && data.teamRadio.length > 0) {
            setEventAlert({
              id: Date.now(),
              lap: currentLap,
              type: 'radio',
              message: data.teamRadio[0].message || 'Team radio'
            });
          }
        }
      } catch (e) {
        // 忽略错误
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [isRaceActive, racePhase, currentLap, weatherData, liveRanking]);

  const team = F1_TEAMS[selectedTeam] || F1_TEAMS.red_bull;
  const race = F1_RACES_2024[selectedRace] || F1_RACES_2024.bahrain;

  // 策略准备完成
  const handleStrategyComplete = (prepData) => {
    setStrategyByCarId(prepData.strategies);
    setGridOrder(prepData.gridOrder);
    setWeatherData(prepData.weather);
    setRacePhase('formation');
    
    // 初始化排名（按发车顺序）
    const initialRanking = prepData.gridOrder.map((carId, index) => {
      const car = findCarById(carId);
      return {
        id: carId,
        name: car?.name || `Driver ${index + 1}`,
        teamName: car?.teamName || 'Unknown',
        teamColor: car?.teamColor || '#FF0000',
        position: index + 1,
        lap: 0,
        totalTime: 0,
        gapSeconds: 0,
        inPit: false,
        tyreWear: 0,
        currentTyre: prepData.strategies[carId]?.tyreSequence?.[0] || 'medium'
      };
    });
    setLiveRanking(initialRanking);
  };

  // 查找车辆信息
  const findCarById = (carId) => {
    for (const team of Object.values(F1_TEAMS)) {
      for (const driver of team.drivers || []) {
        const id = `${team.id}_${driver.id || driver.number}`;
        if (id === carId) {
          return {
            ...driver,
            teamName: team.name,
            teamColor: team.color
          };
        }
      }
    }
    return null;
  };

  // 开始比赛（严格三阶段：formation -> start(3s灯灭) -> race）
  const startRace = () => {
    if (racePhase !== 'formation') return;
    console.log('🚦 开始比赛流程: formation -> start -> race');
    setIsRaceActive(true);
    setRacePhase('start');
    // 模拟红灯3秒
    setTimeout(() => {
      console.log('🏁 红灯熄灭，比赛开始！');
      setRacePhase('race');
    }, 3000);
  };

  // 暂停/继续比赛
  const toggleRace = () => {
    setIsRaceActive(!isRaceActive);
  };

  // 重置比赛
  const resetRace = () => {
    setRacePhase('strategy_prep');
    setRaceProgress(0);
    setCurrentLap(0);
    setIsRaceActive(false);
    setLiveRanking([]);
    setChatMessages([]);
    setRaceEvents([]);
    setRaceFlag('green');
    setSelectedDriverForChat(null);
  };

  // 比赛进度更新（由PathTrack的圈数推进驱动：这里仅在结束时兜底）
  useEffect(() => {
    if (!isRaceActive || racePhase !== 'race') return;
    const timer = setInterval(() => {
      if (currentLap >= (race.laps || 57)) {
        setIsRaceActive(false);
        setRacePhase('finished');
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [isRaceActive, racePhase, currentLap, race.laps]);

  // LLM对话处理
  const handleLLMChat = async (message) => {
    if (!selectedDriverForChat || isAIThinking) return;
    
    console.log('💬 发送消息给车手:', selectedDriverForChat.name, message);
    setIsAIThinking(true);
    
    // 添加用户消息
    const userMsg = {
      id: Date.now(),
      sender: '车队指挥',
      message,
      timestamp: new Date(),
      type: 'user'
    };
    setChatMessages(prev => [...prev, userMsg]);
    
    try {
      const payload = {
        message,
        driverId: selectedDriverForChat.id || selectedDriverForChat.name?.toLowerCase().replace(' ', '_'),
        driverName: selectedDriverForChat.name,
        conversationHistory: chatMessages.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.message
        })),
        teamContext: {
          name: team.name,
          position: liveRanking.find(r => r.id === selectedDriverForChat.id)?.position || 10,
          currentLap,
          totalLaps: race.laps || 57,
          gap: liveRanking.find(r => r.id === selectedDriverForChat.id)?.gapSeconds || 0,
          tyreCondition: strategyByCarId[selectedDriverForChat.id]?.currentTyre || 'medium',
          tyreWear: liveRanking.find(r => r.id === selectedDriverForChat.id)?.tyreWear || 0
        },
        raceContext: {
          phase: racePhase,
          weather: weatherData,
          raceFlag
        }
      };
      
      console.log('📡 发送LLM请求:', payload);
      
      console.log('🌐 发送请求到:', 'http://localhost:8000/api/chat/driver_response');
      console.log('📦 请求payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('http://localhost:8000/api/chat/driver_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 LLM响应状态:', response.status);
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('🤖 AI回应:', result);
        
        const aiMsg = {
          id: Date.now() + 1,
          sender: selectedDriverForChat.name,
          message: result.response || '收到指令。',
          timestamp: new Date(),
          type: 'ai_response',
          mood: result.mood,
          impact: result.strategyImpact
        };
        
        setChatMessages(prev => [...prev, aiMsg]);
        
        // 策略影响
        if (result.strategyImpact?.paceMultiplier) {
          console.log('📊 应用策略影响:', result.strategyImpact);
          setStrategyByCarId(prev => ({
            ...prev,
            [selectedDriverForChat.id]: {
              ...prev[selectedDriverForChat.id],
              paceK: (prev[selectedDriverForChat.id]?.paceK || 1.0) * result.strategyImpact.paceMultiplier
            }
          }));
        }
      } else {
        const errorText = await response.text();
        console.log('❌ 错误响应内容:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ LLM对话失败:', error);
      
      // 添加错误消息
      const errorMsg = {
        id: Date.now() + 1,
        sender: selectedDriverForChat.name,
        message: `无线电故障: ${error.message}`,
        timestamp: new Date(),
        type: 'error'
      };
      setChatMessages(prev => [...prev, errorMsg]);
    }
    
    setIsAIThinking(false);
  };

  // 选择车手进行对话
  const selectDriverForChat = (driver) => {
    console.log('🎯 选择车手对话:', driver);
    // 确保driver有完整的ID信息
    const enhancedDriver = {
      ...driver,
      id: driver.id || `${team.id}_${driver.number || driver.name?.toLowerCase().replace(' ', '_')}`
    };
    setSelectedDriverForChat(enhancedDriver);
    setChatMessages([{
      id: Date.now(),
      sender: driver.name,
      message: `${team.name}车队，我是${driver.name}。无线电连接正常，当前P${driver.position || '?'}位置。`,
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 策略准备阶段 */}
      {racePhase === 'strategy_prep' && (
        <StrategyPrep
          teams={F1_TEAMS}
          selectedTeamKey={team.id}
          raceData={race}
          onStrategyComplete={handleStrategyComplete}
        />
      )}

      {/* 比赛界面 */}
      {racePhase !== 'strategy_prep' && (
        <>
          {/* 顶部标题栏 */}
          <Paper sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 70,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={onBack} sx={{ color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                  🏁 {race.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {race.location} • {team.name}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={`第 ${currentLap} / ${race.laps || 57} 圈`}
                sx={{ bgcolor: 'rgba(255,215,0,0.2)', color: '#FFD700' }}
              />
              <Chip
                label={racePhase}
                sx={{ bgcolor: 'rgba(76,175,80,0.2)', color: '#4CAF50' }}
              />
              {raceFlag !== 'green' && (
                <Chip
                  icon={<Flag />}
                  label={raceFlag === 'safety' ? '安全车' : '黄旗'}
                  sx={{
                    bgcolor: raceFlag === 'safety' ? 'rgba(244,67,54,0.3)' : 'rgba(255,193,7,0.3)',
                    color: raceFlag === 'safety' ? '#F44336' : '#FFC107'
                  }}
                />
              )}
            </Box>
          </Paper>

          {/* 左侧排位面板 */}
          <Paper sx={{
            position: 'absolute',
            top: 70,
            left: 0,
            width: 320,
            height: 'calc(100vh - 70px)',
            background: 'rgba(0,0,0,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            zIndex: 900,
            overflow: 'hidden'
          }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                🏆 实时排位
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(currentLap / (race.laps || 57)) * 100}
                sx={{
                  mt: 1,
                  height: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': { backgroundColor: team.color }
                }}
              />
            </Box>

            <Box sx={{ p: 1, height: 'calc(100% - 100px)', overflow: 'auto' }}>
              {liveRanking.map((driver, index) => {
                const isTop3 = driver.position <= 3;
                const isMyTeam = driver.id.includes(team.id);
                
                return (
                  <Box
                    key={driver.id}
                    onClick={() => selectDriverForChat(driver)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      background: isTop3 
                        ? 'rgba(255,215,0,0.1)' 
                        : isMyTeam 
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(255,255,255,0.05)',
                      border: isTop3 
                        ? '2px solid rgba(255,215,0,0.5)'
                        : isMyTeam
                          ? `2px solid ${driver.teamColor}`
                          : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    {/* 位置 */}
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
                      color: 'white'
                    }}>
                      {driver.position}
                    </Box>

                    {/* 车手信息 */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'white', 
                        fontWeight: isMyTeam ? 700 : 600 
                      }}>
                        #{driver.number || index + 1} {driver.name?.split(' ').pop() || `Driver ${index + 1}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: driver.teamColor }}>
                        {driver.teamName} • L{driver.lap}
                      </Typography>
                      
                      {/* 状态指示器 */}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {driver.inPit && (
                          <Chip
                            label="PIT"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,165,0,0.4)',
                              color: '#FFA500',
                              height: 16,
                              fontSize: '0.6rem'
                            }}
                          />
                        )}
                        <Box sx={{
                          width: 12,
                          height: 8,
                          borderRadius: 1,
                          bgcolor: driver.currentTyre === 'soft' ? '#FF0000' : 
                                   driver.currentTyre === 'medium' ? '#FFFF00' : '#FFFFFF',
                          border: driver.currentTyre === 'hard' ? '1px solid #666' : 'none'
                        }} />
                      </Box>
                    </Box>

                    {/* 时间差 */}
                    <Typography variant="caption" sx={{ 
                      color: driver.position === 1 ? '#FFD700' : 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      minWidth: 60,
                      textAlign: 'right'
                    }}>
                      {driver.position === 1 ? 'LEADER' : `+${driver.gapSeconds?.toFixed(2) || '0.00'}s`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* 主赛道区域 - 固定容器避免重新缩放 */}
          <Box sx={{
            position: 'absolute',
            top: 70,
            left: 320,
            width: 'calc(100vw - 320px)', // 固定宽度，不随对话框变化
            height: 'calc(100vh - 170px)',
            overflow: 'hidden',
            zIndex: selectedDriverForChat ? 1 : 2 // 对话框打开时降低z-index
          }}>
            <PathTrack
              offsetX={selectedDriverForChat ? -105 - 200 : -105} // 对话框打开时调整偏移
              offsetY={-50}
              scale={1}
              rotationDeg={0}
              teams={F1_TEAMS}
              selectedTeamKey={team.id}
              gridOrder={gridOrder}
              strategyByCarId={strategyByCarId}
              phase={racePhase}
              raceFlag={raceFlag}
              active={isRaceActive}
              currentLap={currentLap}
              onTelemetry={(telemetryData) => {
                // 同步圈数（以领先者为准）
                const leader = telemetryData[0];
                if (leader && typeof leader.lap === 'number') {
                  setCurrentLap(Math.max(currentLap, leader.lap));
                }
                setLiveRanking(telemetryData);
                // console.log('排名更新:', telemetryData.slice(0, 5));
              }}
            />
          </Box>

          {/* 右侧对话面板 */}
          {selectedDriverForChat && (
            <Paper sx={{
              position: 'absolute',
              top: 70,
              right: 0,
              width: 400,
              height: 'calc(100vh - 70px)',
              background: 'rgba(0,0,0,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 0,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* 对话头部 */}
              <Box sx={{
                p: 2,
                background: `linear-gradient(135deg, ${selectedDriverForChat.teamColor}, ${selectedDriverForChat.teamColor}CC)`,
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{
                    width: 45,
                    height: 45,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontWeight: 'bold'
                  }}>
                    #{selectedDriverForChat.number}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      {selectedDriverForChat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {selectedDriverForChat.teamName} • P{selectedDriverForChat.position || '?'}
                    </Typography>
                  </Box>
                </Box>
                
                <IconButton
                  onClick={() => setSelectedDriverForChat(null)}
                  sx={{ color: 'white' }}
                >
                  ✕
                </IconButton>
              </Box>

              {/* 对话区域 */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {chatMessages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                      mb: 2,
                      gap: 1
                    }}
                  >
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      bgcolor: msg.type === 'user' ? '#2196F3' : selectedDriverForChat.teamColor,
                      fontSize: '0.8rem'
                    }}>
                      {msg.type === 'user' ? '🎮' : `#${selectedDriverForChat.number}`}
                    </Avatar>
                    
                    <Box sx={{
                      maxWidth: '75%',
                      background: msg.type === 'user' 
                        ? 'rgba(33,150,243,0.2)' 
                        : 'rgba(76,175,80,0.2)',
                      border: msg.type === 'user'
                        ? '1px solid rgba(33,150,243,0.4)'
                        : '1px solid rgba(76,175,80,0.4)',
                      borderRadius: 2,
                      p: 1.5
                    }}>
                      <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                        {msg.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {msg.timestamp.toLocaleTimeString()}
                      </Typography>
                      {msg.mood && (
                        <Chip
                          label={msg.mood}
                          size="small"
                          sx={{ 
                            ml: 1, 
                            height: 16, 
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'white'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
                
                {isAIThinking && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{
                      width: 32,
                      height: 32,
                      bgcolor: selectedDriverForChat.teamColor
                    }}>
                      #{selectedDriverForChat.number}
                    </Avatar>
                    <Box sx={{
                      background: 'rgba(76,175,80,0.2)',
                      border: '1px solid rgba(76,175,80,0.4)',
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#4CAF50',
                        animation: 'pulse 1s infinite'
                      }} />
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        {selectedDriverForChat.name} 正在回应...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* 输入区域 */}
              <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="与车手实时对话... (支持任何内容，AI会真实反应)"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userInput.trim()) {
                      handleLLMChat(userInput.trim());
                      setUserInput('');
                    }
                  }}
                  disabled={isAIThinking}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            if (userInput.trim()) {
                              handleLLMChat(userInput.trim());
                              setUserInput('');
                            }
                          }}
                          disabled={isAIThinking || !userInput.trim()}
                          sx={{ color: 'white' }}
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: selectedDriverForChat.teamColor }
                    },
                    '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.5)' }
                  }}
                />
              </Box>
            </Paper>
          )}

          {/* 底部控制面板 - 固定宽度 */}
          <Paper sx={{
            position: 'absolute',
            bottom: 0,
            left: 320,
            width: 'calc(100vw - 320px)', // 固定宽度
            height: 100,
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            zIndex: selectedDriverForChat ? 1 : 800, // 对话框打开时降低z-index
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            px: 3
          }}>
            {/* 比赛控制 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {racePhase === 'formation' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={startRace}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    fontWeight: 700,
                    px: 3
                  }}
                >
                  🚦 开始比赛
                </Button>
              )}
              
              {racePhase !== 'formation' && (
                <Button
                  variant="contained"
                  startIcon={isRaceActive ? <Pause /> : <PlayArrow />}
                  onClick={toggleRace}
                  sx={{
                    background: isRaceActive 
                      ? 'linear-gradient(135deg, #F44336, #FF6B6B)'
                      : 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    fontWeight: 700
                  }}
                >
                  {isRaceActive ? '暂停' : '继续'}
                </Button>
              )}
              
              <Button
                variant="outlined"
                onClick={resetRace}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)'
                }}
              >
                重置
              </Button>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* 我的车队 */}
            <Box>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                我的车队
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {team.drivers.map((driver) => {
                  const driverRanking = liveRanking.find(r => r.id.includes(driver.id));
                  return (
                    <Box
                      key={driver.id}
                      onClick={() => selectDriverForChat({
                        ...driver,
                        teamColor: team.color,
                        teamName: team.name,
                        position: driverRanking?.position || '?'
                      })}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${team.color}`,
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        #{driver.number}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {driver.name.split(' ')[1]} • P{driverRanking?.position || '?'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* 快速指令 */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                快速指令
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['推进', '防守', '进站', '节油'].map((cmd) => (
                  <Button
                    key={cmd}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (selectedDriverForChat) {
                        handleLLMChat(`指令: ${cmd}`);
                      } else {
                        alert('请先选择一个车手进行对话');
                      }
                    }}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontSize: '0.75rem',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {cmd}
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* 事件提醒 */}
          <Snackbar
            open={!!eventAlert}
            autoHideDuration={6000}
            onClose={() => setEventAlert(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              severity={eventAlert?.type === 'safety_car' ? 'error' : 'warning'}
              onClose={() => setEventAlert(null)}
              sx={{
                bgcolor: eventAlert?.type === 'safety_car' ? 'rgba(244,67,54,0.9)' : 'rgba(255,193,7,0.9)',
                color: 'white'
              }}
            >
              第{eventAlert?.lap}圈: {eventAlert?.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default F1RaceSimulator;
