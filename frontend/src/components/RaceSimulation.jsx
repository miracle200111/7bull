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
  Collapse
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Settings,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { F1_TEAMS, F1_RACES_2024, RACE_PHASES } from '../data/f1Data';
import BahrainTrack from './BahrainTrack.jsx';
import PathTrack from './PathTrack.jsx';
import StrategyPrep from './StrategyPrep.jsx';

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
    setTrackPhase('formation');
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
        setRaceEvents(prev => [...prev, {
          id: Date.now(),
          lap: currentLap,
          ...event,
          timestamp: new Date()
        }]);
        
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

      {/* 全屏赛道视图 - 主要内容 */}
      <Box sx={{ position: 'absolute', top: 80, left: 0, right: 0, bottom: showLeaderboard ? 300 : 60, transition: 'bottom 0.3s ease' }}>
        {/* 使用路径动画演示组件（可切换为 BahrainTrack 做更丰富模拟）*/}
        {/* 传入对齐参数：先给出保守默认，后续可在UI暴露调参 */}
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
          onTelemetry={(rows) => setLiveClassification(rows)}
        />
      </Box>

      {/* 右侧可折叠通讯面板 */}
      <Collapse in={showCommunications} orientation="horizontal">
        <Paper
          sx={{
            position: 'absolute',
            top: 80,
            right: 0,
            width: 300,
            height: showLeaderboard ? 'calc(100vh - 380px)' : 'calc(100vh - 140px)',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            zIndex: 900,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              📡 赛道通讯
            </Typography>
          </Box>

          <Box sx={{ p: 2, height: 'calc(100% - 60px)', overflow: 'auto' }}>
            {teamCommunications.map((comm) => (
              <Box
                key={comm.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: comm.type === 'instruction'
                    ? 'rgba(255,165,0,0.1)'
                    : 'rgba(76,175,80,0.1)',
                  border: comm.type === 'instruction'
                    ? '1px solid rgba(255,165,0,0.3)'
                    : '1px solid rgba(76,175,80,0.3)'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: comm.type === 'instruction' ? '#FFA500' : '#4CAF50',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {comm.sender}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'white', mb: 0.5 }}
                >
                  {comm.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {comm.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            ))}

            {otherTeamChatter.slice(-10).map((chatter) => (
              <Box
                key={chatter.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${chatter.teamColor}40`
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: chatter.teamColor,
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {chatter.team}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'white', mb: 0.5 }}
                >
                  {chatter.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {chatter.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Collapse>

      {/* 底部可折叠比赛信息面板 */}
      <Collapse in={showLeaderboard}>
        <Paper
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            height: 240,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            zIndex: 800,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              🏆 实时排位
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {team.drivers.map((driver, index) => (
                <Box
                  key={driver.id}
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
                  onClick={() => onDriverChat(driver.id)}
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
          </Box>

          <Box sx={{ p: 2, height: 'calc(100% - 60px)', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 左侧排位 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  车手排位
                </Typography>
                {teamCommunications.slice(-8).map((comm, index) => {
                  const position = index + 1;
                  const isInstruction = comm.type === 'instruction';

                  return (
                    <Box
                      key={comm.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        background: position <= 3
                          ? 'rgba(255,215,0,0.1)'
                          : 'rgba(255,255,255,0.05)',
                        border: position <= 3
                          ? '1px solid rgba(255,215,0,0.4)'
                          : `1px solid rgba(255,255,255,0.1)`
                      }}
                    >
                      <Typography
                        sx={{
                          color: position <= 3 ? '#FFD700' : 'white',
                          fontWeight: 'bold',
                          minWidth: 25
                        }}
                      >
                        P{position}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          {comm.sender}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isInstruction ? '#FFA500' : '#4CAF50',
                            fontSize: '0.75rem'
                          }}
                        >
                          {isInstruction ? '指令' : '回应'}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.6)' }}
                      >
                        {comm.timestamp.toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {/* 右侧快速指令 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                  快速指令
                </Typography>
                {['进站', '推进', '防守', '超车', '节省燃油'].map((instruction) => (
                  <Button
                    key={instruction}
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      sendTeamInstruction(`指令: ${instruction}`);
                      simulateDriverResponse(instruction);
                    }}
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      fontSize: '0.75rem',
                      py: 1,
                      mb: 0.5,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${team.color}`
                      }
                    }}
                  >
                    {instruction}
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* 浮动控制按钮 */}
      <Fab
        color="primary"
        sx={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          background: isRaceActive ? 'rgba(244,67,54,0.9)' : 'rgba(76,175,80,0.9)',
          '&:hover': {
            background: isRaceActive ? 'rgba(244,67,54,1)' : 'rgba(76,175,80,1)'
          },
          zIndex: 1001
        }}
        onClick={isRaceActive ? pauseRace : startRace}
      >
        {isRaceActive ? <Pause /> : <PlayArrow />}
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
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? <ExpandMore /> : <ExpandLess />}
      </Fab>

      <Fab
        size="small"
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 140,
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

      {/* 比赛控制面板切换按钮 */}
      <Fab
        size="small"
        sx={{
          position: 'absolute',
          top: 100,
          left: 20,
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255,255,255,0.3)'
          },
          zIndex: 1001
        }}
        onClick={() => setShowControls(!showControls)}
      >
        <Settings />
      </Fab>

      {/* 可折叠的比赛控制面板 */}
      <Collapse in={showControls}>
        <Paper
          sx={{
            position: 'absolute',
            top: 160,
            left: 20,
            width: 280,
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            zIndex: 1000,
            p: 2
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            🎮 比赛控制
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              fullWidth
              variant={isRaceActive ? 'contained' : 'outlined'}
              color={isRaceActive ? 'error' : 'success'}
              startIcon={isRaceActive ? <Pause /> : <PlayArrow />}
              onClick={isRaceActive ? pauseRace : startRace}
              sx={{ fontSize: '0.8rem' }}
            >
              {isRaceActive ? '暂停' : '开始'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetRace}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                fontSize: '0.8rem'
              }}
            >
              重置
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            比赛阶段: {currentPhase && RACE_PHASES[currentPhase].name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
            进度: {Math.floor(raceProgress)}%
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            当前圈: {Math.floor(raceProgress * (race.laps || 57) / 100)}
          </Typography>

          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            阶段控制
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['formation','start','race'].map(p => (
              <Button key={p} size="small" variant={trackPhase===p?'contained':'outlined'} onClick={() => setTrackPhase(p)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                {p}
              </Button>
            ))}
          </Box>

          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            策略模板
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => {
                setStrategyByCarId(prev => {
                  const copy = { ...prev };
                  Object.keys(copy).forEach(id => { copy[id] = { ...copy[id], plannedPitLaps: [20], pitSeconds: 2.3 }; });
                  return copy;
                });
              }}
            >一停</Button>
            <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => {
                setStrategyByCarId(prev => {
                  const copy = { ...prev };
                  Object.keys(copy).forEach(id => { copy[id] = { ...copy[id], plannedPitLaps: [15, 38], pitSeconds: 2.5 }; });
                  return copy;
                });
              }}
            >二停</Button>
            <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => {
                setStrategyByCarId(prev => {
                  const copy = { ...prev };
                  Object.keys(copy).forEach(id => { copy[id] = { ...copy[id], plannedPitLaps: [], pitSeconds: 0 }; });
                  return copy;
                });
              }}
            >不停</Button>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>模板应用至全场（演示），后续可按车定制。</Typography>

          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            车队状态
          </Typography>
          {team.drivers.map((driver, index) => (
            <Box
              key={driver.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                mb: 1,
                borderRadius: 1,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${team.color}40`,
                cursor: 'pointer',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => onDriverChat(driver.id)}
            >
              <Typography variant="body2" sx={{ color: team.color, fontWeight: 600 }}>
                #{driver.number}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', flex: 1 }}>
                {driver.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {driver.status || '正常'}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Collapse>
    </Box>
  );
};

export default RaceSimulation;
