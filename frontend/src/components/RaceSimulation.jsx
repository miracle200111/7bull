import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  Divider,
  Fab,
  Collapse,
  TextField,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Settings,
  ExpandMore,
  ExpandLess,
  Send,
  Mic,
  Warning,
  Flag
} from '@mui/icons-material';
import { F1_TEAMS, F1_RACES_2024, RACE_PHASES } from '../data/f1Data';
import BahrainTrack from './BahrainTrack.jsx';
import PathTrack from './PathTrack.jsx';
import StrategyPrep from './StrategyPrep.jsx';
import LiveRanking from './LiveRanking.jsx';
import RealTimeChat from './RealTimeChat.jsx';

const RaceSimulation = ({
  selectedTeam,
  selectedRace,
  onBack,
  onDriverChat
}) => {
  const [currentPhase, setCurrentPhase] = useState('pre_race');
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [teamCommunications, setTeamCommunications] = useState([]);
  const [otherTeamChatter, setOtherTeamChatter] = useState([]);
  const [showControls, setShowControls] = useState(false);
  const [showCommunications, setShowCommunications] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  // 赛道阶段/发车顺序/策略/遥测
  const [trackPhase, setTrackPhase] = useState('start');
  const [gridOrder, setGridOrder] = useState([]);
  const [strategyByCarId, setStrategyByCarId] = useState({});
  const [liveClassification, setLiveClassification] = useState([]);
  const [showStrategyPrep, setShowStrategyPrep] = useState(true);
  const [raceEvents, setRaceEvents] = useState([]);
  const [raceFlag, setRaceFlag] = useState('green');
  const [weatherData, setWeatherData] = useState({});
  const [userInput, setUserInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [eventAlert, setEventAlert] = useState(null);
  const [realTimeRanking, setRealTimeRanking] = useState([]);
  const [selectedDriverForChat, setSelectedDriverForChat] = useState(null);
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);

  const team = F1_TEAMS[selectedTeam] || F1_TEAMS.red_bull; // 默认值
  const race = F1_RACES_2024[selectedRace] || F1_RACES_2024.monaco; // 默认值
  const phase = RACE_PHASES[currentPhase] || RACE_PHASES.pre_race; // 默认值

  // 调试信息
  useEffect(() => {
    console.log('RaceSimulation props:', { selectedTeam, selectedRace });
    console.log('Team data:', team);
    console.log('Race data:', race);
  }, [selectedTeam, selectedRace, team, race]);

  // 生成发车顺序
  useEffect(() => {
    const list = [];
    Object.values(F1_TEAMS).forEach((t) => {
      const teamId = t.id || t.name;
      (t.drivers || []).forEach((d, idx) => {
        const did = `${teamId}_${d.id || d.number || idx}`;
        list.push(did);
      });
    });
    setGridOrder(list);
  }, []);

  // 默认策略：二停
  useEffect(() => {
    const defaults = {};
    Object.values(F1_TEAMS).forEach((t) => {
      const teamId = t.id || t.name;
      (t.drivers || []).forEach((d, idx) => {
        const did = `${teamId}_${d.id || d.number || idx}`;
        defaults[did] = { plannedPitLaps: [15, 38], pitSeconds: 2.5, paceK: 1.0 };
      });
    });
    setStrategyByCarId(defaults);
  }, []);

  useEffect(() => {
    // 模拟比赛进程
    let interval;
    if (isRaceActive) {
      interval = setInterval(() => {
        setRaceProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            setIsRaceActive(false);
            setCurrentPhase('final_phase');
            return 100;
          }
          
          // 根据进度更新比赛阶段
          if (newProgress < 20) setCurrentPhase('race_start');
          else if (newProgress < 70) setCurrentPhase('mid_race');
          else setCurrentPhase('final_phase');
          
          return newProgress;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRaceActive]);

  // 模拟其他车队的对话 - 优化版本
  useEffect(() => {
    if (!isRaceActive) return;
    
    const interval = setInterval(() => {
      try {
        const otherTeams = Object.values(F1_TEAMS).filter(t => t.id !== selectedTeam);
        if (otherTeams.length === 0) return;
        
        const randomTeam = otherTeams[Math.floor(Math.random() * otherTeams.length)];
        if (!randomTeam || !randomTeam.drivers || randomTeam.drivers.length === 0) return;
        
        const randomDriver = randomTeam.drivers[Math.floor(Math.random() * randomTeam.drivers.length)];
        
        const raceMessages = {
          pre_race: [
            `${randomDriver.name}: 车感很好，准备就绪`,
            `${randomTeam.name}车队: 天气状况良好，按计划执行`,
            `${randomDriver.name}: 轮胎温度正常`,
            `${randomTeam.name}车队: 燃油加载完成`
          ],
          race_start: [
            `${randomDriver.name}: 起步很好！`,
            `${randomTeam.name}车队: 保持位置，注意T1`,
            `${randomDriver.name}: 有超车机会`,
            `${randomTeam.name}车队: DRS已激活`
          ],
          mid_race: [
            `${randomDriver.name}: 轮胎开始衰退`,
            `${randomTeam.name}车队: 准备进站窗口`,
            `${randomDriver.name}: 前面的车在防守`,
            `${randomTeam.name}车队: 燃油状况良好`
          ],
          final_phase: [
            `${randomDriver.name}: 全力推进！`,
            `${randomTeam.name}车队: 最后5圈，给我全部！`,
            `${randomDriver.name}: 轮胎还能坚持`,
            `${randomTeam.name}车队: 保持专注，胜利在望`
          ]
        };
        
        const phaseMessages = raceMessages[currentPhase] || raceMessages.mid_race;
        const randomMessage = phaseMessages[Math.floor(Math.random() * phaseMessages.length)];
        
        setOtherTeamChatter(prev => {
          const newChatter = {
            id: Date.now() + Math.random(),
            team: randomTeam.name,
            driver: randomDriver.name,
            message: randomMessage,
            timestamp: new Date(),
            teamColor: randomTeam.color
          };
          return [...prev.slice(-8), newChatter]; // 保留最近8条消息
        });
      } catch (error) {
        console.error('生成车队对话时出错:', error);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isRaceActive, selectedTeam, currentPhase]);

  // LLM策略分析和无线电生成
  const callLLMForStrategy = async (context) => {
    try {
      const response = await fetch('/api/race/llm_strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          currentLap: Math.floor(raceProgress * (race.laps || 57) / 100),
          weather: weatherData,
          classification: liveClassification,
          phase: currentPhase
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('LLM调用失败:', error);
    }
    return null;
  };

  // 处理用户输入（包含恶意输入检测和真实车手反应）
  const handleUserInput = async (input) => {
    setIsAIThinking(true);
    try {
      const response = await fetch('/api/chat/driver_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          driverId: team.drivers[0].id,
          driverName: team.drivers[0].name,
          teamContext: {
            name: team.name,
            position: liveClassification.find(c => c.id.includes(team.id))?.position || 10,
            currentLap: Math.floor(raceProgress * (race.laps || 57) / 100),
            tyreCondition: 'medium',
            fuelLevel: 'normal'
          },
          raceContext: {
            phase: currentPhase,
            weather: weatherData,
            raceFlag
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const newComm = {
          id: Date.now(),
          sender: team.drivers[0].name,
          message: result.response,
          timestamp: new Date(),
          type: 'ai_response',
          mood: result.mood,
          impact: result.strategyImpact
        };
        
        setTeamCommunications(prev => [...prev, newComm]);
        
        // 如果AI回应包含策略影响，更新车手的paceK
        if (result.strategyImpact) {
          const driverCarId = `${team.id}_${team.drivers[0].id}`;
          setStrategyByCarId(prev => ({
            ...prev,
            [driverCarId]: {
              ...prev[driverCarId],
              paceK: (prev[driverCarId]?.paceK || 1.0) * result.strategyImpact.paceMultiplier
            }
          }));
        }
      }
    } catch (error) {
      console.error('车手AI回应失败:', error);
    }
    setIsAIThinking(false);
  };

  const startRace = () => {
    console.log('开始比赛:', { team: team.name, race: race.name });
    setIsRaceActive(true);
    setRaceProgress(0);
    setCurrentPhase('pre_race');
    setTrackPhase('formation');
    setTeamCommunications([{
      id: Date.now(),
      sender: '车队',
      message: `${team.drivers[0].name}，比赛即将开始！保持专注！`,
      timestamp: new Date(),
      type: 'instruction'
    }]);
  };

  const pauseRace = () => {
    console.log('暂停比赛');
    setIsRaceActive(false);
  };

  const resetRace = () => {
    console.log('重置比赛');
    setIsRaceActive(false);
    setRaceProgress(0);
    setCurrentPhase('pre_race');
    setTrackPhase('formation');
    setTeamCommunications([]);
    setOtherTeamChatter([]);
    setShowStrategyPrep(true);
    setRaceEvents([]);
    setRaceFlag('green');
  };

  // 策略准备完成回调
  const handleStrategyComplete = (prepData) => {
    setStrategyByCarId(prepData.strategies);
    setGridOrder(prepData.gridOrder);
    setWeatherData({
      condition: prepData.weatherCondition,
      trackTemp: prepData.trackTemp,
      fuelLoad: prepData.fuelLoad
    });
    setShowStrategyPrep(false);
    setTrackPhase('formation'); // 编队圈，车辆静止等待
    
    // 添加策略完成消息
    setTeamCommunications([{
      id: Date.now(),
      sender: '比赛控制',
      message: '策略设置完成，车辆已就位。等待比赛开始信号。',
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  // 开始比赛（从formation到start）
  const initiateRaceStart = () => {
    setTrackPhase('start');
    setIsRaceActive(true);
    setTeamCommunications(prev => [...prev, {
      id: Date.now(),
      sender: '比赛控制',
      message: '🚦 比赛开始！五盏红灯熄灭！',
      timestamp: new Date(),
      type: 'race_control'
    }]);
    
    // 3秒后切换到正赛阶段
    setTimeout(() => {
      setTrackPhase('race');
      setCurrentPhase('race_start');
    }, 3000);
  };

  // 定时LLM策略更新
  useEffect(() => {
    if (!isRaceActive || showStrategyPrep) return;
    
    const interval = setInterval(async () => {
      const currentLap = Math.floor(raceProgress * (race.laps || 57) / 100);
      
      // 每5圈调用LLM更新策略
      if (currentLap % 5 === 0 && currentLap > 0) {
        const context = {
          type: 'strategy_update',
          currentLap,
          totalLaps: race.laps || 57,
          classification: liveClassification,
          weather: weatherData,
          raceEvents: raceEvents.slice(-5)
        };
        
        const llmResult = await callLLMForStrategy(context);
        if (llmResult && llmResult.strategyUpdates) {
          setStrategyByCarId(prev => {
            const updated = { ...prev };
            llmResult.strategyUpdates.forEach(update => {
              if (updated[update.carId]) {
                updated[update.carId] = {
                  ...updated[update.carId],
                  ...update.changes
                };
              }
            });
            return updated;
          });
        }
        
        // 生成车队无线电对话
        if (llmResult && llmResult.teamRadio) {
          llmResult.teamRadio.forEach(radio => {
            setOtherTeamChatter(prev => [...prev.slice(-10), {
              id: Date.now() + Math.random(),
              team: radio.teamName,
              driver: radio.driverName,
              message: radio.message,
              timestamp: new Date(),
              teamColor: radio.teamColor,
              type: 'llm_generated'
            }]);
          });
        }
      }
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isRaceActive, raceProgress, liveClassification, weatherData, raceEvents, showStrategyPrep]);

  // 随机事件生成（安全车、事故等）
  useEffect(() => {
    if (!isRaceActive || showStrategyPrep) return;
    
    const eventInterval = setInterval(() => {
      const currentLap = Math.floor(raceProgress * (race.laps || 57) / 100);
      const random = Math.random();
      
      // 5%概率发生事件
      if (random < 0.05) {
        const events = [
          { type: 'yellow_flag', message: '黄旗！赛道上有碎片', flag: 'yellow', duration: 3000 },
          { type: 'safety_car', message: '安全车出动！', flag: 'safety', duration: 8000 },
          { type: 'incident', message: '发生碰撞事故！', flag: 'yellow', duration: 5000 },
          { type: 'weather_change', message: '开始下雨！', flag: 'green', duration: 0 }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        const newEvent = {
          id: Date.now(),
          lap: currentLap,
          ...event,
          timestamp: new Date()
        };
        
        setRaceEvents(prev => [...prev, newEvent]);
        setEventAlert(newEvent);
        
        if (event.flag !== 'green') {
          setRaceFlag(event.flag);
          setTimeout(() => setRaceFlag('green'), event.duration);
        }
        
        // 事件影响策略
        if (event.type === 'safety_car') {
          // 安全车期间，部分车队可能改变进站策略
          const affectedCars = Object.keys(strategyByCarId).slice(0, 6);
          const updates = {};
          affectedCars.forEach(carId => {
            updates[carId] = {
              ...strategyByCarId[carId],
              plannedPitLaps: [...(strategyByCarId[carId].plannedPitLaps || []), currentLap + 1]
            };
          });
          setStrategyByCarId(prev => ({ ...prev, ...updates }));
        }
      }
    }, 12000);
    
    return () => clearInterval(eventInterval);
  }, [isRaceActive, raceProgress, strategyByCarId, showStrategyPrep]);

  // 发送车队指令
  const sendTeamInstruction = (instruction) => {
    const newComm = {
      id: Date.now(),
      sender: '车队',
      message: instruction,
      timestamp: new Date(),
      type: 'instruction'
    };
    setTeamCommunications(prev => [...prev, newComm]);
  };

  // 模拟车手回应
  const simulateDriverResponse = (instruction) => {
    setTimeout(() => {
      const responses = {
        '进站': ['收到，准备进站', '轮胎确实需要更换了', '明白，进站'],
        '推进': ['收到，全力推进', '轮胎感觉还不错', '我会尽力的'],
        '防守': ['明白，保持位置', '我会守住内线', '收到，防守模式'],
        '超车': ['看到机会了', 'DRS已准备', '我要试试'],
        '燃油': ['收到，节省燃油', '明白，调整驾驶', '燃油模式激活']
      };
      
      const responseKey = Object.keys(responses).find(key => instruction.includes(key)) || '推进';
      const possibleResponses = responses[responseKey];
      const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
      
      const driverComm = {
        id: Date.now() + 1,
        sender: team.drivers[0].name,
        message: response,
        timestamp: new Date(),
        type: 'response'
      };
      setTeamCommunications(prev => [...prev, driverComm]);
    }, 1500);
  };

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 策略准备阶段弹窗 */}
      {showStrategyPrep && (
        <StrategyPrep
          teams={F1_TEAMS}
          selectedTeamKey={team.id}
          raceData={race}
          onStrategyComplete={handleStrategyComplete}
        />
      )}

      {/* 简化的顶部标题栏 */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 0,
          zIndex: 1000
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={onBack}
              sx={{ color: 'white' }}
            >
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${Math.floor(raceProgress * (race.laps || 57) / 100)}/${race.laps || 57} 圈`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,215,0,0.2)',
                color: '#FFD700',
                border: '1px solid rgba(255,215,0,0.4)'
              }}
            />
            <Chip
              label={currentPhase && RACE_PHASES[currentPhase].name}
              size="small"
              sx={{
                bgcolor: 'rgba(76,175,80,0.2)',
                color: '#4CAF50',
                border: '1px solid rgba(76,175,80,0.4)'
              }}
            />
          </Box>
        </Box>

        {/* 比赛进度条 */}
        <LinearProgress
          variant="determinate"
          value={raceProgress}
          sx={{
            height: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: team.color
            }
          }}
        />
      </Paper>

      {/* 左侧实时排位 */}
      {!showStrategyPrep && (
        <LiveRanking
          classification={liveClassification}
          selectedTeamKey={team.id}
          currentLap={Math.floor(raceProgress * (race.laps || 57) / 100)}
          totalLaps={race.laps || 57}
          raceEvents={raceEvents}
          onDriverSelect={(driver) => {
            // 设置选中的车手并打开实时对话
            setSelectedDriverForChat(driver);
            setShowRealTimeChat(true);
          }}
        />
      )}

      {/* 全屏赛道视图 - 主要内容 */}
      <Box sx={{ 
        position: 'absolute', 
        top: 80, 
        left: showStrategyPrep ? 0 : 360, // 为左侧排位留出空间
        right: showCommunications ? 320 : 20, // 为右侧通讯留出空间
        bottom: 120, // 为底部控制面板留出空间
        transition: 'all 0.3s ease' 
      }}>
        <PathTrack
          backgroundUrl={undefined}
          offsetX={-105}
          offsetY={-50}
          scale={1}
          rotationDeg={0}
          teams={F1_TEAMS}
          selectedTeamKey={team.id}
          gridOrder={gridOrder}
          strategyByCarId={strategyByCarId}
          phase={trackPhase}
          raceFlag={raceFlag}
          active={isRaceActive && !showStrategyPrep}
          raceStarted={isRaceActive && !showStrategyPrep && trackPhase !== 'formation'}
          currentLap={Math.floor(raceProgress * (race.laps || 57) / 100)}
          onTelemetry={(rows) => setLiveClassification(rows)}
        />
      </Box>

      {/* 实时LLM对话系统 */}
      {showRealTimeChat && selectedDriverForChat && (
        <RealTimeChat
          selectedDriver={selectedDriverForChat}
          teamData={team}
          raceContext={{
            currentPosition: liveClassification.find(c => c.id === selectedDriverForChat.id)?.position || 10,
            currentLap: Math.floor(raceProgress * (race.laps || 57) / 100),
            totalLaps: race.laps || 57,
            phase: currentPhase,
            weather: weatherData,
            raceFlag,
            gap: liveClassification.find(c => c.id === selectedDriverForChat.id)?.gapSeconds || 0,
            tyreCondition: strategyByCarId[selectedDriverForChat.id]?.currentTyre || 'medium',
            fuelLevel: 'normal',
            nearbyDrivers: liveClassification.slice(0, 5)
          }}
          onMessageSent={(message) => {
            setTeamCommunications(prev => [...prev, {
              id: Date.now(),
              sender: message.sender,
              message: message.message,
              timestamp: new Date(),
              type: message.type,
              impact: message.impact
            }]);
          }}
          onStrategyImpact={(driverId, impact) => {
            // LLM对话影响策略
            setStrategyByCarId(prev => ({
              ...prev,
              [driverId]: {
                ...prev[driverId],
                paceK: (prev[driverId]?.paceK || 1.0) * (impact.paceMultiplier || 1.0)
              }
            }));
          }}
        />
      )}

      {/* 关闭对话按钮 */}
      {showRealTimeChat && (
        <IconButton
          onClick={() => setShowRealTimeChat(false)}
          sx={{
            position: 'absolute',
            top: 90,
            right: 30,
            bgcolor: 'rgba(244,67,54,0.8)',
            color: 'white',
            zIndex: 1001,
            '&:hover': {
              bgcolor: 'rgba(244,67,54,1)'
            }
          }}
        >
          ✕
        </IconButton>
      )}

      {/* 底部快速控制面板 - 简化版 */}
      {!showStrategyPrep && (
        <Paper sx={{
          position: 'absolute',
          bottom: 20,
          left: showStrategyPrep ? 20 : 380,
          right: 20,
          height: 80,
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          transition: 'left 0.3s ease'
        }}>
          {/* 比赛状态 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              阶段: {trackPhase}
            </Typography>
            {raceFlag !== 'green' && (
              <Chip
                label={raceFlag === 'safety' ? '安全车' : '黄旗'}
                size="small"
                sx={{
                  bgcolor: raceFlag === 'safety' ? 'rgba(244,67,54,0.3)' : 'rgba(255,193,7,0.3)',
                  color: raceFlag === 'safety' ? '#F44336' : '#FFC107'
                }}
              />
            )}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

          {/* 快速指令 */}
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            {['进站', '推进', '防守', '节油'].map((instruction) => (
              <Button
                key={instruction}
                size="small"
                variant="outlined"
                onClick={() => handleUserInput(`指令: ${instruction}`)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontSize: '0.75rem',
                  minWidth: 60,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: team.color
                  }
                }}
              >
                {instruction}
              </Button>
            ))}
          </Box>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

          {/* 我的车队车手 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {team.drivers.map((driver, index) => (
              <Box
                key={driver.id}
                onClick={() => onDriverChat(driver.id)}
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
                  {driver.name.split(' ')[1]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* 浮动控制按钮 */}
      <Fab
        color="primary"
        sx={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          background: trackPhase === 'formation' 
            ? 'rgba(76,175,80,0.9)' 
            : isRaceActive 
              ? 'rgba(244,67,54,0.9)' 
              : 'rgba(76,175,80,0.9)',
          '&:hover': {
            background: trackPhase === 'formation' 
              ? 'rgba(76,175,80,1)' 
              : isRaceActive 
                ? 'rgba(244,67,54,1)' 
                : 'rgba(76,175,80,1)'
          },
          zIndex: 1001
        }}
        onClick={trackPhase === 'formation' ? initiateRaceStart : (isRaceActive ? pauseRace : startRace)}
      >
        {trackPhase === 'formation' ? <PlayArrow /> : (isRaceActive ? <Pause /> : <PlayArrow />)}
      </Fab>

      <Fab
        size="small"
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255,255,255,0.3)'
          },
          zIndex: 1001
        }}
        onClick={resetRace}
      >
        🔄
      </Fab>


      <Fab
        size="small"
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 80,
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255,255,255,0.3)'
          },
          zIndex: 1001
        }}
        onClick={() => setShowCommunications(!showCommunications)}
      >
        📡
      </Fab>


      {/* 比赛事件提醒 */}
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
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            第{eventAlert?.lap}圈: {eventAlert?.message}
          </Typography>
        </Alert>
      </Snackbar>

      {/* 赛道旗语指示器 */}
      {raceFlag !== 'green' && (
        <Box sx={{
          position: 'absolute',
          top: 100,
          right: 20,
          background: raceFlag === 'safety' ? 'rgba(244,67,54,0.9)' : 'rgba(255,193,7,0.9)',
          color: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1001,
          animation: 'pulse 1s infinite'
        }}>
          <Flag />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {raceFlag === 'safety' ? '安全车' : '黄旗'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RaceSimulation;
