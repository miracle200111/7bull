import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  Avatar,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Speed,
  LocalGasStation,
  Engineering,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from '@mui/icons-material';

const StrategyPrep = ({ 
  teams, 
  selectedTeamKey, 
  raceData,
  onStrategyComplete 
}) => {
  const [strategies, setStrategies] = useState({});
  const [gridOrder, setGridOrder] = useState([]);
  const [weatherCondition, setWeatherCondition] = useState('dry');
  const [trackTemp, setTrackTemp] = useState(42);
  const [fuelLoad, setFuelLoad] = useState(110);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmPredictions, setLlmPredictions] = useState({});
  const [selectedCarForEdit, setSelectedCarForEdit] = useState(null);

  // 轮胎化合物选项
  const tyreCompounds = {
    soft: { name: '软胎', color: '#FF0000', degradation: 0.8, pace: 1.05 },
    medium: { name: '中性胎', color: '#FFFF00', degradation: 1.0, pace: 1.0 },
    hard: { name: '硬胎', color: '#FFFFFF', degradation: 1.2, pace: 0.97 }
  };

  // 策略模板
  const strategyTemplates = {
    aggressive: { 
      name: '激进策略', 
      pitLaps: [12, 35], 
      tyres: ['soft', 'soft', 'medium'],
      paceK: 1.08,
      description: '早进站，软胎激进，适合超车'
    },
    conservative: { 
      name: '保守策略', 
      pitLaps: [18, 42], 
      tyres: ['medium', 'medium', 'hard'],
      paceK: 0.98,
      description: '延迟进站，保护轮胎，适合防守'
    },
    oneStop: { 
      name: '一停策略', 
      pitLaps: [28], 
      tyres: ['medium', 'hard'],
      paceK: 1.02,
      description: '单次进站，燃油/轮胎平衡'
    },
    undercut: { 
      name: 'Undercut', 
      pitLaps: [14, 32], 
      tyres: ['soft', 'medium', 'hard'],
      paceK: 1.06,
      description: '早停抢位，利用新胎优势'
    }
  };

  // 初始化策略和发车顺序
  useEffect(() => {
    if (!teams) return;
    
    // 生成发车顺序（模拟排位结果）
    const cars = [];
    Object.values(teams).forEach((team) => {
      const teamId = team.id || team.name;
      (team.drivers || []).forEach((driver, idx) => {
        const carId = `${teamId}_${driver.id || driver.number || idx}`;
        cars.push({
          id: carId,
          driverId: driver.id,
          number: driver.number,
          name: driver.name,
          teamName: team.name,
          teamColor: team.color,
          isSelectedTeam: team.id === selectedTeamKey
        });
      });
    });

    // 模拟排位结果（带随机性）
    const shuffled = cars.sort(() => Math.random() - 0.5);
    setGridOrder(shuffled);

    // 初始化默认策略
    const defaultStrategies = {};
    shuffled.forEach((car, index) => {
      const template = index < 6 ? 'aggressive' : index < 12 ? 'conservative' : 'oneStop';
      const strategy = strategyTemplates[template];
      defaultStrategies[car.id] = {
        template,
        plannedPitLaps: [...strategy.pitLaps],
        pitSeconds: 2.3 + Math.random() * 0.4,
        paceK: strategy.paceK + (Math.random() - 0.5) * 0.05,
        tyreSequence: [...strategy.tyres],
        currentTyre: strategy.tyres[0],
        fuelLoad: fuelLoad + (Math.random() - 0.5) * 5
      };
    });
    setStrategies(defaultStrategies);
  }, [teams, selectedTeamKey, fuelLoad]);

  // LLM策略分析
  const analyzeWithLLM = async () => {
    setIsAnalyzing(true);
    try {
      const analysisData = {
        weather: weatherCondition,
        trackTemp,
        raceLength: raceData?.laps || 57,
        circuit: raceData?.name || 'Bahrain GP',
        gridOrder: gridOrder.map(car => ({
          position: gridOrder.indexOf(car) + 1,
          driver: car.name,
          team: car.teamName
        })),
        currentStrategies: Object.entries(strategies).map(([carId, strat]) => ({
          carId,
          strategy: strat.template,
          pitLaps: strat.plannedPitLaps
        }))
      };

      const response = await fetch('/api/race/strategy_analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });

      if (response.ok) {
        const predictions = await response.json();
        setLlmPredictions(predictions);
      }
    } catch (error) {
      console.error('LLM策略分析失败:', error);
    }
    setIsAnalyzing(false);
  };

  // 更新单车策略
  const updateCarStrategy = (carId, updates) => {
    setStrategies(prev => ({
      ...prev,
      [carId]: { ...prev[carId], ...updates }
    }));
  };

  // 应用策略模板到所有车
  const applyTemplateToAll = (templateKey) => {
    const template = strategyTemplates[templateKey];
    const updated = {};
    Object.keys(strategies).forEach(carId => {
      updated[carId] = {
        ...strategies[carId],
        template: templateKey,
        plannedPitLaps: [...template.pitLaps],
        paceK: template.paceK + (Math.random() - 0.5) * 0.03,
        tyreSequence: [...template.tyres],
        currentTyre: template.tyres[0]
      };
    });
    setStrategies(updated);
  };

  const startRace = () => {
    const finalStrategies = {};
    Object.entries(strategies).forEach(([carId, strat]) => {
      finalStrategies[carId] = {
        plannedPitLaps: strat.plannedPitLaps,
        pitSeconds: strat.pitSeconds,
        paceK: strat.paceK,
        tyreSequence: strat.tyreSequence,
        currentTyre: strat.currentTyre,
        fuelLoad: strat.fuelLoad
      };
    });

    onStrategyComplete({
      strategies: finalStrategies,
      gridOrder: gridOrder.map(car => car.id),
      weatherCondition,
      trackTemp,
      fuelLoad
    });
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto'
    }}>
      <Paper sx={{
        width: '95%',
        maxWidth: 1400,
        height: '95%',
        background: 'rgba(20,20,20,0.98)',
        border: '2px solid rgba(220,20,60,0.5)',
        borderRadius: 3,
        p: 3,
        overflow: 'auto'
      }}>
        {/* 标题区域 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ 
            color: '#DC143C', 
            fontWeight: 700, 
            mb: 1,
            textAlign: 'center'
          }}>
            🏁 {raceData?.name || 'Bahrain Grand Prix'} - 策略准备
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            textAlign: 'center',
            mb: 2
          }}>
            📍 {raceData?.location || 'Sakhir, Bahrain'} • {raceData?.laps || 57} 圈
          </Typography>
          
          {/* 赛道条件 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'white' }}>天气条件</InputLabel>
                <Select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
                >
                  <MenuItem value="dry">晴朗干燥</MenuItem>
                  <MenuItem value="cloudy">多云</MenuItem>
                  <MenuItem value="light_rain">小雨</MenuItem>
                  <MenuItem value="heavy_rain">大雨</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                赛道温度: {trackTemp}°C
              </Typography>
              <Slider
                value={trackTemp}
                onChange={(e, v) => setTrackTemp(v)}
                min={25}
                max={55}
                sx={{ color: '#DC143C' }}
              />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                燃油负载: {fuelLoad}kg
              </Typography>
              <Slider
                value={fuelLoad}
                onChange={(e, v) => setFuelLoad(v)}
                min={100}
                max={120}
                sx={{ color: '#DC143C' }}
              />
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={analyzeWithLLM}
                disabled={isAnalyzing}
                sx={{
                  background: 'linear-gradient(135deg, #DC143C, #FF6B6B)',
                  color: 'white',
                  height: '100%'
                }}
              >
                {isAnalyzing ? '分析中...' : '🤖 AI策略分析'}
              </Button>
            </Grid>
          </Grid>

          {isAnalyzing && (
            <LinearProgress sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* 左侧：发车顺序 */}
          <Grid item xs={4}>
            <Paper sx={{
              p: 2,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: 600,
              overflow: 'auto'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                🏁 发车顺序 (模拟排位结果)
              </Typography>
              
              {gridOrder.map((car, index) => (
                <Box
                  key={car.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    mb: 1,
                    background: car.isSelectedTeam 
                      ? 'rgba(255,215,0,0.15)' 
                      : 'rgba(255,255,255,0.05)',
                    border: car.isSelectedTeam
                      ? '2px solid #FFD700'
                      : `1px solid ${car.teamColor}40`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onClick={() => setSelectedCarForEdit(car.id)}
                >
                  <Box sx={{
                    minWidth: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: index < 3 
                      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                      : `linear-gradient(135deg, ${car.teamColor}, ${car.teamColor}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {index + 1}
                  </Box>
                  
                  <Avatar sx={{ 
                    width: 35, 
                    height: 35, 
                    bgcolor: car.teamColor,
                    fontSize: '0.8rem'
                  }}>
                    #{car.number}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'white', 
                      fontWeight: car.isSelectedTeam ? 700 : 600 
                    }}>
                      {car.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: car.teamColor }}>
                      {car.teamName}
                    </Typography>
                  </Box>

                  {strategies[car.id] && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        {strategies[car.id].template}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        display: 'block'
                      }}>
                        {strategies[car.id].plannedPitLaps.join(', ')}圈
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* 中间：策略编辑 */}
          <Grid item xs={4}>
            <Paper sx={{
              p: 2,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: 600,
              overflow: 'auto'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                🔧 策略编辑
              </Typography>

              {/* 策略模板快速应用 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  快速策略模板
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(strategyTemplates).map(([key, template]) => (
                    <Grid item xs={6} key={key}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => applyTemplateToAll(key)}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {template.name}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block',
                            opacity: 0.8,
                            fontSize: '0.7rem'
                          }}>
                            {template.pitLaps.join(', ')}圈
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              {/* 单车策略编辑 */}
              {selectedCarForEdit && strategies[selectedCarForEdit] && (
                <Box>
                  <Typography variant="body1" sx={{ color: '#FFD700', mb: 2, fontWeight: 600 }}>
                    编辑: {gridOrder.find(c => c.id === selectedCarForEdit)?.name}
                  </Typography>
                  
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: 'white' }}>策略模板</InputLabel>
                    <Select
                      value={strategies[selectedCarForEdit].template}
                      onChange={(e) => {
                        const template = strategyTemplates[e.target.value];
                        updateCarStrategy(selectedCarForEdit, {
                          template: e.target.value,
                          plannedPitLaps: [...template.pitLaps],
                          paceK: template.paceK,
                          tyreSequence: [...template.tyres]
                        });
                      }}
                      sx={{ color: 'white' }}
                    >
                      {Object.entries(strategyTemplates).map(([key, template]) => (
                        <MenuItem key={key} value={key}>
                          {template.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    进站圈数: {strategies[selectedCarForEdit].plannedPitLaps.join(', ')}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    进站时长: {strategies[selectedCarForEdit].pitSeconds.toFixed(1)}s
                  </Typography>
                  <Slider
                    value={strategies[selectedCarForEdit].pitSeconds}
                    onChange={(e, v) => updateCarStrategy(selectedCarForEdit, { pitSeconds: v })}
                    min={2.0}
                    max={4.0}
                    step={0.1}
                    sx={{ color: '#DC143C', mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    节奏系数: {strategies[selectedCarForEdit].paceK.toFixed(3)}
                  </Typography>
                  <Slider
                    value={strategies[selectedCarForEdit].paceK}
                    onChange={(e, v) => updateCarStrategy(selectedCarForEdit, { paceK: v })}
                    min={0.90}
                    max={1.15}
                    step={0.005}
                    sx={{ color: '#DC143C', mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    轮胎序列
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {strategies[selectedCarForEdit].tyreSequence.map((tyre, index) => (
                      <Chip
                        key={index}
                        label={tyreCompounds[tyre].name}
                        size="small"
                        sx={{
                          bgcolor: tyreCompounds[tyre].color,
                          color: tyre === 'hard' ? 'black' : 'white',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {!selectedCarForEdit && (
                <Alert severity="info" sx={{ 
                  bgcolor: 'rgba(33,150,243,0.1)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: '#2196F3' }
                }}>
                  点击左侧车手进行单车策略编辑
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* 右侧：AI分析和预测 */}
          <Grid item xs={4}>
            <Paper sx={{
              p: 2,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: 600,
              overflow: 'auto'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                🤖 AI策略分析
              </Typography>

              {llmPredictions.analysis && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#4CAF50', 
                    mb: 1,
                    fontWeight: 600
                  }}>
                    赛道分析
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    mb: 2
                  }}>
                    {llmPredictions.analysis}
                  </Typography>
                </Box>
              )}

              {llmPredictions.recommendations && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#FF9800', 
                    mb: 1,
                    fontWeight: 600
                  }}>
                    策略建议
                  </Typography>
                  {llmPredictions.recommendations.map((rec, index) => (
                    <Box key={index} sx={{
                      p: 1.5,
                      mb: 1,
                      background: 'rgba(255,152,0,0.1)',
                      border: '1px solid rgba(255,152,0,0.3)',
                      borderRadius: 1
                    }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {rec.driver}: {rec.suggestion}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        预期效果: {rec.impact}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* 比赛预测 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: '#9C27B0', 
                  mb: 1,
                  fontWeight: 600
                }}>
                  比赛预测
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<TrendingUp />}
                    label="高温影响轮胎衰减"
                    size="small"
                    sx={{ bgcolor: 'rgba(244,67,54,0.2)', color: '#F44336' }}
                  />
                  <Chip
                    icon={<Speed />}
                    label="DRS效果显著"
                    size="small"
                    sx={{ bgcolor: 'rgba(76,175,80,0.2)', color: '#4CAF50' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.85rem'
                }}>
                  • 预计进站窗口: 12-18圈, 32-40圈{'\n'}
                  • 轮胎衰减率: 高 (赛道温度{trackTemp}°C){'\n'}
                  • Undercut优势: 约1.2秒/圈{'\n'}
                  • 安全车概率: 25% (历史数据)
                </Typography>
              </Box>

              {/* 策略风险评估 */}
              <Box>
                <Typography variant="body2" sx={{ 
                  color: '#F44336', 
                  mb: 1,
                  fontWeight: 600
                }}>
                  风险评估
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="轮胎衰减: 高"
                    size="small"
                    sx={{ bgcolor: 'rgba(244,67,54,0.2)', color: '#F44336' }}
                  />
                  <Chip
                    label="燃油消耗: 中"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#FFC107' }}
                  />
                  <Chip
                    label="超车难度: 中"
                    size="small"
                    sx={{ bgcolor: 'rgba(33,150,243,0.2)', color: '#2196F3' }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* 中间：策略概览 */}
          <Grid item xs={8}>
            <Paper sx={{
              p: 2,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              height: 600,
              overflow: 'auto'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                📊 全场策略概览
              </Typography>

              <Grid container spacing={1}>
                {gridOrder.slice(0, 20).map((car) => {
                  const strategy = strategies[car.id];
                  if (!strategy) return null;

                  return (
                    <Grid item xs={6} key={car.id}>
                      <Card
                        sx={{
                          background: car.isSelectedTeam 
                            ? 'rgba(255,215,0,0.1)' 
                            : 'rgba(255,255,255,0.03)',
                          border: car.isSelectedTeam
                            ? '1px solid #FFD700'
                            : `1px solid ${car.teamColor}30`,
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.08)'
                          }
                        }}
                        onClick={() => setSelectedCarForEdit(car.id)}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Avatar sx={{ 
                              width: 24, 
                              height: 24, 
                              bgcolor: car.teamColor,
                              fontSize: '0.7rem'
                            }}>
                              {car.number}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                fontSize: '0.8rem'
                              }}>
                                {car.name.split(' ').pop()}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: car.teamColor,
                                fontSize: '0.7rem'
                              }}>
                                P{gridOrder.indexOf(car) + 1}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                            {strategy.tyreSequence.map((tyre, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: tyreCompounds[tyre].color,
                                  border: tyre === 'hard' ? '1px solid #666' : 'none'
                                }}
                              />
                            ))}
                          </Box>

                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.7rem'
                          }}>
                            进站: {strategy.plannedPitLaps.join(', ')}圈
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.6)',
                            display: 'block',
                            fontSize: '0.7rem'
                          }}>
                            节奏: {(strategy.paceK * 100).toFixed(1)}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* 底部控制 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 3,
          pt: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={analyzeWithLLM}
              disabled={isAnalyzing}
              startIcon={<Engineering />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              重新分析策略
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                // 随机化发车顺序
                setGridOrder(prev => [...prev].sort(() => Math.random() - 0.5));
              }}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)'
              }}
            >
              🎲 随机排位
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body1" sx={{ 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CheckCircle sx={{ color: '#4CAF50' }} />
              策略准备完成
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={startRace}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                color: 'white',
                fontWeight: 700,
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049, #7CB342)'
                }
              }}
            >
              🏁 开始比赛
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StrategyPrep;
