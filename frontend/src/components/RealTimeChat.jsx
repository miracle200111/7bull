import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Send,
  Mic,
  VolumeUp,
  Psychology,
  Warning
} from '@mui/icons-material';

const RealTimeChat = ({ 
  selectedDriver,
  teamData,
  raceContext,
  onMessageSent,
  onStrategyImpact 
}) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [driverMood, setDriverMood] = useState('focused');
  const [conversationContext, setConversationContext] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化对话
  useEffect(() => {
    if (selectedDriver && teamData) {
      const welcomeMessage = {
        id: Date.now(),
        sender: selectedDriver.name,
        message: `${teamData.name}车队，我是${selectedDriver.name}。无线电连接正常，准备接受指令。`,
        timestamp: new Date(),
        type: 'system',
        mood: 'professional'
      };
      setMessages([welcomeMessage]);
      setConversationContext([]);
    }
  }, [selectedDriver, teamData]);

  // 真实LLM对话系统
  const handleUserMessage = async (input) => {
    if (!input.trim() || isAIThinking) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      sender: '车队指挥',
      message: input,
      timestamp: new Date(),
      type: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsAIThinking(true);

    try {
      // 构建完整的对话上下文
      const contextMessages = [
        ...conversationContext.slice(-10), // 保留最近10条对话
        { role: 'user', content: input }
      ];

      const response = await fetch('/api/chat/driver_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          driverId: selectedDriver.id,
          driverName: selectedDriver.name,
          conversationHistory: contextMessages,
          teamContext: {
            name: teamData.name,
            position: raceContext.currentPosition || 10,
            currentLap: raceContext.currentLap || 0,
            totalLaps: raceContext.totalLaps || 57,
            tyreCondition: raceContext.tyreCondition || 'medium',
            fuelLevel: raceContext.fuelLevel || 'normal',
            gap: raceContext.gap || '+0.00s'
          },
          raceContext: {
            phase: raceContext.phase || 'race',
            weather: raceContext.weather || {},
            raceFlag: raceContext.raceFlag || 'green',
            trackConditions: raceContext.trackConditions || 'dry',
            competitors: raceContext.nearbyDrivers || []
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // 添加AI回应
        const aiMessage = {
          id: Date.now() + 1,
          sender: selectedDriver.name,
          message: result.response,
          timestamp: new Date(),
          type: 'ai_response',
          mood: result.mood,
          confidence: result.confidence,
          strategyImpact: result.strategyImpact
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setDriverMood(result.mood);
        
        // 更新对话上下文
        setConversationContext(prev => [
          ...prev.slice(-8),
          { role: 'user', content: input },
          { role: 'assistant', content: result.response }
        ]);

        // 如果有策略影响，通知父组件
        if (result.strategyImpact && onStrategyImpact) {
          onStrategyImpact(selectedDriver.id, result.strategyImpact);
        }

        // 如果有无线电消息，通知父组件
        if (result.teamRadioMessage && onMessageSent) {
          onMessageSent({
            sender: selectedDriver.name,
            message: result.teamRadioMessage,
            type: 'driver_response',
            impact: result.strategyImpact
          });
        }

      } else {
        throw new Error('LLM服务响应失败');
      }
    } catch (error) {
      console.error('LLM对话失败:', error);
      
      // 降级到本地回应
      const fallbackMessage = {
        id: Date.now() + 1,
        sender: selectedDriver.name,
        message: '无线电信号不稳定，请重试指令。',
        timestamp: new Date(),
        type: 'fallback',
        mood: 'concerned'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsAIThinking(false);
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'angry': return '#F44336';
      case 'frustrated': return '#FF9800';
      case 'confident': return '#4CAF50';
      case 'concerned': return '#FFC107';
      case 'excited': return '#2196F3';
      case 'professional': return '#9C27B0';
      default: return '#ffffff';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'angry': return '😠';
      case 'frustrated': return '😤';
      case 'confident': return '😎';
      case 'concerned': return '😟';
      case 'excited': return '🔥';
      case 'professional': return '🎯';
      default: return '🏎️';
    }
  };

  return (
    <Paper sx={{
      position: 'absolute',
      top: 80,
      right: 20,
      width: 400,
      height: 'calc(100vh - 140px)',
      background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(220,20,60,0.3)',
      borderRadius: 3,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 对话头部 */}
      <Box sx={{
        p: 2,
        background: `linear-gradient(135deg, ${teamData?.color || '#DC143C'}, ${teamData?.secondaryColor || '#FF6B6B'})`,
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            width: 50,
            height: 50,
            bgcolor: 'rgba(255,255,255,0.2)',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            #{selectedDriver?.number || '?'}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              {selectedDriver?.name || 'Driver'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {teamData?.name || 'Team'} • 📡 实时无线电
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Chip
              icon={<Psychology />}
              label={`${getMoodEmoji(driverMood)} ${driverMood}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: getMoodColor(driverMood),
                fontWeight: 600
              }}
            />
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              display: 'block',
              mt: 0.5
            }}>
              P{raceContext.currentPosition || '?'} • L{raceContext.currentLap || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 对话区域 */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        background: 'rgba(0,0,0,0.3)'
      }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
              mb: 2,
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            {/* 头像 */}
            <Avatar sx={{
              width: 32,
              height: 32,
              bgcolor: msg.type === 'user' 
                ? 'rgba(33,150,243,0.8)' 
                : `${teamData?.color || '#DC143C'}CC`,
              fontSize: '0.8rem'
            }}>
              {msg.type === 'user' ? '🎮' : `#${selectedDriver?.number || '?'}`}
            </Avatar>

            {/* 消息气泡 */}
            <Box sx={{
              maxWidth: '75%',
              background: msg.type === 'user' 
                ? 'rgba(33,150,243,0.2)' 
                : msg.type === 'ai_response'
                  ? 'rgba(76,175,80,0.2)'
                  : 'rgba(255,255,255,0.1)',
              border: msg.type === 'user'
                ? '1px solid rgba(33,150,243,0.4)'
                : msg.type === 'ai_response'
                  ? '1px solid rgba(76,175,80,0.4)'
                  : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              p: 1.5
            }}>
              <Typography variant="body2" sx={{ 
                color: 'white',
                lineHeight: 1.4,
                mb: 0.5
              }}>
                {msg.message}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.7rem'
                }}>
                  {msg.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </Typography>
                
                {msg.mood && msg.type === 'ai_response' && (
                  <Chip
                    label={getMoodEmoji(msg.mood)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: getMoodColor(msg.mood),
                      height: 16,
                      fontSize: '0.6rem'
                    }}
                  />
                )}
                
                {msg.strategyImpact && (
                  <Chip
                    label="策略影响"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,165,0,0.3)',
                      color: '#FFA500',
                      height: 16,
                      fontSize: '0.6rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        ))}
        
        {/* AI思考指示器 */}
        {isAIThinking && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}>
            <Avatar sx={{
              width: 32,
              height: 32,
              bgcolor: `${teamData?.color || '#DC143C'}CC`,
              fontSize: '0.8rem'
            }}>
              #{selectedDriver?.number || '?'}
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
              <CircularProgress size={16} sx={{ color: '#4CAF50' }} />
              <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                {selectedDriver?.name} 正在思考...
              </Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* 输入区域 */}
      <Box sx={{
        p: 2,
        background: 'rgba(0,0,0,0.8)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* 快速指令按钮 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {[
            { text: '推进攻击', emoji: '🔥', color: '#F44336' },
            { text: '保持位置', emoji: '🛡️', color: '#2196F3' },
            { text: '准备进站', emoji: '🔧', color: '#FF9800' },
            { text: '节省燃油', emoji: '⛽', color: '#4CAF50' },
            { text: '轮胎状况', emoji: '🏎️', color: '#9C27B0' },
            { text: '超车机会', emoji: '⚡', color: '#FFD700' }
          ].map((cmd) => (
            <Chip
              key={cmd.text}
              label={`${cmd.emoji} ${cmd.text}`}
              size="small"
              clickable
              onClick={() => handleUserMessage(cmd.text)}
              sx={{
                bgcolor: `${cmd.color}20`,
                color: cmd.color,
                border: `1px solid ${cmd.color}40`,
                '&:hover': {
                  bgcolor: `${cmd.color}30`
                }
              }}
            />
          ))}
        </Box>

        {/* 文本输入 */}
        <TextField
          fullWidth
          size="small"
          placeholder="与车手实时对话... (支持任何内容，AI会真实反应)"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleUserMessage(userInput);
            }
          }}
          disabled={isAIThinking}
          multiline
          maxRows={3}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleUserMessage(userInput)}
                  disabled={isAIThinking || !userInput.trim()}
                  sx={{ 
                    color: userInput.trim() ? teamData?.color || '#DC143C' : 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(220,20,60,0.1)'
                    }
                  }}
                >
                  {isAIThinking ? (
                    <CircularProgress size={20} sx={{ color: '#4CAF50' }} />
                  ) : (
                    <Send />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
              '&.Mui-focused fieldset': { borderColor: teamData?.color || '#DC143C' }
            },
            '& .MuiInputBase-input::placeholder': { 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem'
            }
          }}
        />

        {/* 对话提示 */}
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.6)',
          display: 'block',
          mt: 1,
          fontSize: '0.7rem'
        }}>
          💡 提示: 车手会根据个性、比赛情况和你的话语做出真实反应。不当言论会被专业处理。
        </Typography>
      </Box>
    </Paper>
  );
};

export default RealTimeChat;
