import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Fab,
  Chip,
  Stack
} from '@mui/material';
import { 
  ArrowBack, 
  Send, 
  Mic, 
  MicOff, 
  VolumeUp, 
  VolumeOff,
  Person 
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

function Chat({ character, onBack, token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 初始化语音识别
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputMessage(finalTranscript);
          setIsListening(false);
        } else {
          setInputMessage(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('没有检测到语音，请重试');
        } else if (event.error === 'network') {
          alert('网络错误，请检查网络连接');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
    }

    // 添加欢迎消息
    setMessages([{
      role: 'assistant',
      content: `你好！我是${character.name}。${character.description}。很高兴与你对话！`,
      timestamp: new Date().toISOString()
    }]);
  }, [character]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          character_id: character.id,
          message: inputMessage,
          conversation_id: conversationId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.data.conversation_id);

      // 语音播放
      speakText(response.data.response);

    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage = {
        role: 'assistant',
        content: '抱歉，我现在无法回复。请稍后再试。',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 高级自然语音播放函数
  const speakText = async (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音合成');
      return;
    }

    // 停止当前播放
    window.speechSynthesis.cancel();
    
    // 等待语音引擎准备就绪
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise(resolve => {
        window.speechSynthesis.onvoiceschanged = resolve;
      });
    }
    
    // 智能文本预处理，让语音更自然
    let processedText = text
      // 处理标点符号，增加自然停顿
      .replace(/([。！？])/g, '$1。') // 句号后加长停顿
      .replace(/([，；：])/g, '$1，') // 逗号后加短停顿
      .replace(/([（）【】《》""''])/g, ' $1 ') // 括号前后加停顿
      .replace(/([0-9]+)/g, ' $1 ') // 数字前后加停顿
      .replace(/\s+/g, ' ') // 规范化空格
      .replace(/([a-zA-Z]+)/g, ' $1 ') // 英文单词前后加停顿
      .trim();
    
    // 如果文本太长，分段播放
    const maxLength = 200;
    if (processedText.length > maxLength) {
      const sentences = processedText.split(/([。！？])/);
      let currentText = '';
      
      for (let i = 0; i < sentences.length; i += 2) {
        const sentence = sentences[i] + (sentences[i + 1] || '');
        if (currentText.length + sentence.length > maxLength && currentText) {
          await speakSegment(currentText);
          currentText = sentence;
        } else {
          currentText += sentence;
        }
      }
      
      if (currentText) {
        await speakSegment(currentText);
      }
    } else {
      await speakSegment(processedText);
    }
  };

  // 播放单个文本段落
  const speakSegment = (text) => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cn')
      );
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 选择最佳中文语音
      if (chineseVoices.length > 0) {
        // 优先选择本地语音和更自然的语音
        const preferredVoice = chineseVoices.find(voice => 
          voice.localService && (
            voice.name.includes('Tingting') || 
            voice.name.includes('Yaoyao') ||
            voice.name.includes('Xiaoxiao') ||
            voice.name.includes('Siqi') ||
            voice.name.includes('Yunxi')
          )
        ) || chineseVoices.find(voice => voice.localService) || chineseVoices[0];
        
        utterance.voice = preferredVoice;
        console.log('使用语音:', preferredVoice.name);
      }
      
      utterance.lang = 'zh-CN';
      utterance.volume = 0.85;
      
      // 根据角色个性化语音特性 - 更自然的参数
      if (character.name.includes('维斯塔潘')) {
        utterance.rate = 0.9; // 自信流畅
        utterance.pitch = 0.8; // 低沉磁性
      } else if (character.name.includes('勒克莱尔')) {
        utterance.rate = 0.75; // 优雅缓慢
        utterance.pitch = 1.0; // 温和磁性
      } else if (character.name.includes('汉密尔顿')) {
        utterance.rate = 0.8; // 沉稳有力
        utterance.pitch = 0.85; // 低沉权威
      } else if (character.name.includes('诺里斯')) {
        utterance.rate = 1.0; // 活泼自然
        utterance.pitch = 1.1; // 年轻活力
      } else if (character.name.includes('皮亚斯特里')) {
        utterance.rate = 0.8; // 冷静清晰
        utterance.pitch = 0.95; // 理性平和
      } else if (character.name.includes('拉塞尔')) {
        utterance.rate = 0.85; // 绅士优雅
        utterance.pitch = 1.0; // 标准清晰
      } else if (character.name.includes('安东内利')) {
        utterance.rate = 0.85; // 年轻稳重
        utterance.pitch = 1.05; // 略高活力
      } else if (character.name.includes('角田裕毅')) {
        utterance.rate = 0.8; // 谦逊平和
        utterance.pitch = 0.95; // 稳重清晰
      } else if (character.name.includes('苏格拉底')) {
        utterance.rate = 0.7; // 深思哲理
        utterance.pitch = 0.85; // 智慧沉稳
      } else if (character.name.includes('哈利')) {
        utterance.rate = 0.85; // 温暖亲切
        utterance.pitch = 1.05; // 年轻友善
      } else if (character.name.includes('莎士比亚')) {
        utterance.rate = 0.75; // 诗意悠扬
        utterance.pitch = 0.95; // 文学气质
      } else {
        utterance.rate = 0.85;
        utterance.pitch = 0.95;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('语音播放错误:', event.error);
        setIsSpeaking(false);
        resolve();
      };
      
      window.speechSynthesis.speak(utterance);
    });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      width: '100vw',
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1e3a8a 100%)'
    }}>
      {/* 优化的聊天头部 */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: 'rgba(10,10,10,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Avatar 
            sx={{ 
              mr: 2,
              width: 48,
              height: 48,
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              fontSize: '1.5rem'
            }}
          >
            {character.avatar}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {character.name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {character.skills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              ))}
            </Stack>
          </Box>
          
          <IconButton 
            color="inherit" 
            onClick={() => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
              } else {
                speakText(messages[messages.length - 1]?.content || '');
              }
            }}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              animation: isSpeaking ? 'pulse 1s infinite' : 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            {isSpeaking ? 
              <VolumeOff sx={{ color: '#f44336' }} /> : 
              <VolumeUp sx={{ color: '#4caf50' }} />
            }
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start'
              }}
            >
              {message.role === 'assistant' && (
                <ListItemAvatar>
                  <Avatar>{character.avatar}</Avatar>
                </ListItemAvatar>
              )}
              
                <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'grey.100',
                  color: message.role === 'user' ? 'white' : 'text.primary',
                  ml: message.role === 'user' ? 2 : 0,
                  mr: message.role === 'assistant' ? 2 : 0,
                  position: 'relative'
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ opacity: 0.7 }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                  {message.role === 'assistant' && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (isSpeaking) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        } else {
                          speakText(message.content);
                        }
                      }}
                      sx={{ 
                        ml: 1,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 },
                        animation: isSpeaking ? 'pulse 1s infinite' : 'none'
                      }}
                    >
                      {isSpeaking ? (
                        <VolumeOff 
                          fontSize="small" 
                          sx={{ color: '#f44336' }}
                        />
                      ) : (
                        <VolumeUp 
                          fontSize="small" 
                          sx={{ color: '#4caf50' }}
                        />
                      )}
                    </IconButton>
                  )}
                </Box>
              </Paper>

              {message.role === 'user' && (
                <ListItemAvatar sx={{ ml: 1 }}>
                  <Avatar>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
              )}
            </ListItem>
          ))}
          {loading && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>{character.avatar}</Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography>正在思考中...</Typography>
                  </Paper>
                }
              />
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        {/* 语音状态指示器 */}
        {isListening && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 2,
            p: 1,
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(244, 67, 54, 0.3)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1
            }}>
              <Mic sx={{ color: '#f44336', animation: 'pulse 1s infinite' }} />
              <Typography variant="body2" sx={{ color: '#f44336' }}>
                正在听取语音输入...
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#f44336',
                      borderRadius: 2,
                      animation: `wave 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                      '@keyframes wave': {
                        '0%, 40%, 100%': { transform: 'scaleY(0.4)' },
                        '20%': { transform: 'scaleY(1)' }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder={isListening ? "正在监听语音..." : "输入消息..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || isListening}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: isListening ? '#f44336' : undefined
                }
              }
            }}
          />
          <Fab
            size="small"
            color={isListening ? "secondary" : "default"}
            onClick={toggleListening}
            sx={{ 
              mr: 1,
              animation: isListening ? 'pulse 0.8s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)' },
                '70%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
              }
            }}
          >
            {isListening ? <MicOff /> : <Mic />}
          </Fab>
          <Fab
            color="primary"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
          >
            <Send />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
